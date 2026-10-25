import test from 'node:test';
import assert from 'node:assert/strict';

const { validatePhotoFile, calculatePhotoDimensions, processPhotoFile } = await import('../src/utils/photoProcessing.js');

function replaceGlobal(name, value) {
  const previous = Object.getOwnPropertyDescriptor(globalThis, name);
  Object.defineProperty(globalThis, name, { configurable: true, writable: true, value });
  return () => {
    if (previous) Object.defineProperty(globalThis, name, previous);
    else delete globalThis[name];
  };
}

test('aceita JPEG, PNG e WEBP até 30 MB', () => {
  for (const [name, type] of [
    ['foto.jpg', 'image/jpeg'],
    ['foto.png', 'image/png'],
    ['foto.webp', 'image/webp'],
  ]) {
    assert.equal(validatePhotoFile({ name, type, size: 30 * 1024 * 1024 }), null);
  }
});

test('rejeita arquivos acima de 30 MB com orientação em português', () => {
  const error = validatePhotoFile({
    name: 'foto.jpg',
    type: 'image/jpeg',
    size: 30 * 1024 * 1024 + 1,
  });

  assert.match(error, /30 MB/);
});

test('rejeita SVG, GIF, HEIC e vídeos com instrução para conversão', () => {
  for (const [name, type] of [
    ['desenho.svg', 'image/svg+xml'],
    ['animacao.gif', 'image/gif'],
    ['foto.heic', 'image/heic'],
    ['video.mp4', 'video/mp4'],
  ]) {
    assert.match(validatePhotoFile({ name, type, size: 1024 }), /JPEG|JPG/i, name);
  }
});

test('rejeita MIME não suportado mesmo com extensão permitida', () => {
  assert.match(validatePhotoFile({ name: 'foto.jpg', type: 'application/octet-stream', size: 1024 }), /JPEG|JPG/i);
});

test('reduz a maior dimensão para 2200 px e preserva a proporção', () => {
  assert.deepEqual(calculatePhotoDimensions(4400, 2200), { width: 2200, height: 1100 });
  assert.deepEqual(calculatePhotoDimensions(1600, 1200), { width: 1600, height: 1200 });
});

test('rejeita dimensões inválidas antes de criar o canvas', () => {
  assert.throws(() => calculatePhotoDimensions(0, 200), /dimensões|imagem/i);
  assert.throws(() => calculatePhotoDimensions(100, Number.NaN), /dimensões|imagem/i);
});

test('processPhotoFile gera JPEG sobre fundo branco, tenta qualidades menores e libera o bitmap', async () => {
  const calls = [];
  const qualities = [];
  let bitmapClosed = false;
  const bitmap = { width: 4000, height: 3000, close: () => { bitmapClosed = true; } };
  const context = {
    fillStyle: '',
    fillRect: (...args) => calls.push(['fillRect', ...args]),
    drawImage: (...args) => calls.push(['drawImage', ...args]),
  };
  const canvas = {
    width: 0,
    height: 0,
    getContext: () => context,
    toBlob: (callback, type, quality) => {
      qualities.push(quality);
      calls.push(['toBlob', type, quality, canvas.width, canvas.height]);
      const size = quality === 0.6 ? 4 * 1024 * 1024 : 6 * 1024 * 1024;
      callback({ type, size });
    },
  };
  const restoreBitmap = replaceGlobal('createImageBitmap', async () => bitmap);
  const restoreDocument = replaceGlobal('document', { createElement: () => canvas });

  try {
    const result = await processPhotoFile({ name: 'foto.png', type: 'image/png', size: 1024 });

    assert.equal(result.type, 'image/jpeg');
    assert.deepEqual(qualities, [0.82, 0.7, 0.6]);
    assert.deepEqual(calls[0], ['fillRect', 0, 0, 2200, 1650]);
    assert.deepEqual(calls[1], ['drawImage', bitmap, 0, 0, 2200, 1650]);
    assert.equal(context.fillStyle, '#fff');
    assert.equal(bitmapClosed, true);
  } finally {
    restoreBitmap();
    restoreDocument();
  }
});

test('processPhotoFile reduz as dimensões novamente se JPEG de qualidade 0.6 excede 5 MB', async () => {
  const dimensions = [];
  const bitmap = { width: 4000, height: 2000, close() {} };
  const canvas = {
    width: 0,
    height: 0,
    getContext: () => ({ fillRect() {}, drawImage() {} }),
    toBlob(callback, type) {
      dimensions.push([canvas.width, canvas.height]);
      const size = dimensions.length <= 3 ? 6 * 1024 * 1024 : 4 * 1024 * 1024;
      callback({ type, size });
    },
  };
  const restoreBitmap = replaceGlobal('createImageBitmap', async () => bitmap);
  const restoreDocument = replaceGlobal('document', { createElement: () => canvas });

  try {
    await processPhotoFile({ name: 'foto.jpg', type: 'image/jpeg', size: 1024 });
    assert.deepEqual(dimensions.slice(0, 3), [[2200, 1100], [2200, 1100], [2200, 1100]]);
    assert.ok(dimensions[3][0] < 2200 && dimensions[3][1] < 1100);
  } finally {
    restoreBitmap();
    restoreDocument();
  }
});

test('processPhotoFile reporta toBlob nulo e ainda libera o bitmap', async () => {
  let bitmapClosed = false;
  const bitmap = { width: 800, height: 600, close: () => { bitmapClosed = true; } };
  const canvas = {
    width: 0,
    height: 0,
    getContext: () => ({ fillRect() {}, drawImage() {} }),
    toBlob(callback) { callback(null); },
  };
  const restoreBitmap = replaceGlobal('createImageBitmap', async () => bitmap);
  const restoreDocument = replaceGlobal('document', { createElement: () => canvas });

  try {
    await assert.rejects(
      processPhotoFile({ name: 'foto.webp', type: 'image/webp', size: 1024 }),
      /navegador|comprimir|JPEG/i,
    );
    assert.equal(bitmapClosed, true);
  } finally {
    restoreBitmap();
    restoreDocument();
  }
});

test('processPhotoFile usa fallback Image com object URL e revoga a URL após a compressão', async () => {
  const originalCreate = URL.createObjectURL;
  const originalRevoke = URL.revokeObjectURL;
  const originalImage = Object.getOwnPropertyDescriptor(globalThis, 'Image');
  let revokedUrl = null;
  let decodedFile = null;
  class ImageStub {
    naturalWidth = 640;
    naturalHeight = 480;
    set src(value) {
      this._src = value;
      queueMicrotask(() => this.onload());
    }
  }
  URL.createObjectURL = (file) => {
    decodedFile = file;
    return 'blob:test-photo';
  };
  URL.revokeObjectURL = (url) => { revokedUrl = url; };
  const restoreBitmap = replaceGlobal('createImageBitmap', undefined);
  const restoreImage = replaceGlobal('Image', ImageStub);
  const canvas = {
    width: 0,
    height: 0,
    getContext: () => ({ fillRect() {}, drawImage() {} }),
    toBlob(callback, type) { callback({ type, size: 512 }); },
  };
  const restoreDocument = replaceGlobal('document', { createElement: () => canvas });
  const file = { name: 'fallback.png', type: 'image/png', size: 512 };

  try {
    await processPhotoFile(file);
    assert.equal(decodedFile, file);
    assert.equal(revokedUrl, 'blob:test-photo');
  } finally {
    restoreBitmap();
    restoreImage();
    restoreDocument();
    URL.createObjectURL = originalCreate;
    URL.revokeObjectURL = originalRevoke;
    if (originalImage) Object.defineProperty(globalThis, 'Image', originalImage);
  }
});
