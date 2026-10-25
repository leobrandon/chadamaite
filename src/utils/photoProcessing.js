const MAX_INPUT_BYTES = 30 * 1024 * 1024;
const MAX_OUTPUT_BYTES = 5 * 1024 * 1024;
const MAX_DIMENSION = 2200;
const JPEG_QUALITIES = [0.82, 0.7, 0.6];
const SUPPORTED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

const INVALID_FORMAT_MESSAGE = 'Formato não suportado. Converta a foto para JPEG, PNG ou WEBP antes de enviar.';

export function validatePhotoFile(file) {
  if (!file || typeof file !== 'object' || !Number.isFinite(file.size) || file.size < 0) {
    return 'Não foi possível validar este arquivo. Selecione uma foto JPEG, PNG ou WEBP.';
  }

  if (file.size > MAX_INPUT_BYTES) {
    return 'Cada foto deve ter no máximo 30 MB.';
  }

  const contentType = typeof file.type === 'string' ? file.type.toLowerCase() : '';
  if (contentType.startsWith('video/')) {
    return 'Vídeos não são aceitos. Envie uma foto JPEG, PNG ou WEBP.';
  }

  if (!SUPPORTED_TYPES.has(contentType)) {
    return INVALID_FORMAT_MESSAGE;
  }

  return null;
}

export function calculatePhotoDimensions(width, height) {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    throw new Error('A imagem possui dimensões inválidas.');
  }

  const scale = Math.min(1, MAX_DIMENSION / Math.max(width, height));
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

function loadImageElement(file) {
  if (typeof Image === 'undefined' || typeof URL === 'undefined' || typeof URL.createObjectURL !== 'function') {
    throw new Error('Este navegador não consegue abrir a foto. Atualize o navegador ou converta a imagem para JPEG.');
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const image = new Image();
    const loaded = new Promise((resolve, reject) => {
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('Não foi possível abrir a foto. Converta a imagem para JPEG e tente novamente.'));
    });

    image.src = objectUrl;
    return loaded.then((loadedImage) => ({
      source: loadedImage,
      width: loadedImage.naturalWidth,
      height: loadedImage.naturalHeight,
      release: () => URL.revokeObjectURL(objectUrl),
    }), (error) => {
      URL.revokeObjectURL(objectUrl);
      throw error;
    });
  } catch (error) {
    URL.revokeObjectURL(objectUrl);
    throw error;
  }
}

async function decodePhoto(file) {
  if (typeof createImageBitmap === 'function') {
    try {
      // The browser default applies EXIF orientation when decoding the source image.
      const bitmap = await createImageBitmap(file);
      return {
        source: bitmap,
        width: bitmap.width,
        height: bitmap.height,
        release: () => bitmap.close?.(),
      };
    } catch {
      // Use the Image/object URL path on browsers that expose but cannot decode with ImageBitmap.
    }
  }

  return loadImageElement(file);
}

function encodeJpeg(canvas, quality) {
  return new Promise((resolve) => {
    canvas.toBlob(resolve, 'image/jpeg', quality);
  });
}

function reduceDimensions(width, height, currentBytes) {
  const factor = Math.min(0.9, Math.sqrt(MAX_OUTPUT_BYTES / currentBytes) * 0.95);
  const nextWidth = Math.max(1, Math.floor(width * factor));
  const nextHeight = Math.max(1, Math.floor(height * factor));

  if (nextWidth === width && nextHeight === height) {
    if (width >= height && width > 1) return { width: width - 1, height };
    if (height > 1) return { width, height: height - 1 };
  }

  return { width: nextWidth, height: nextHeight };
}

export async function processPhotoFile(file) {
  const validationError = validatePhotoFile(file);
  if (validationError) throw new Error(validationError);

  if (typeof document === 'undefined') {
    throw new Error('A compressão de fotos está disponível somente no navegador.');
  }

  const decoded = await decodePhoto(file);
  try {
    let { width, height } = calculatePhotoDimensions(decoded.width, decoded.height);
    const canvas = document.createElement('canvas');
    if (!canvas || typeof canvas.getContext !== 'function' || typeof canvas.toBlob !== 'function') {
      throw new Error('O navegador não conseguiu preparar a foto para envio.');
    }
    let context = canvas.getContext('2d');
    if (!context) throw new Error('Não foi possível preparar a foto para envio.');

    while (true) {
      canvas.width = width;
      canvas.height = height;
      if (canvas.width !== width || canvas.height !== height) {
        throw new Error('Não foi possível ajustar as dimensões da foto.');
      }

      context = canvas.getContext('2d');
      if (!context) throw new Error('Não foi possível preparar a foto para envio.');
      context.fillStyle = '#fff';
      context.fillRect(0, 0, width, height);
      context.drawImage(decoded.source, 0, 0, width, height);

      let lastBlob = null;
      for (const quality of JPEG_QUALITIES) {
        const blob = await encodeJpeg(canvas, quality);
        if (!blob) throw new Error('O navegador não conseguiu comprimir a foto. Converta-a para JPEG e tente novamente.');
        if (canvas.width !== width || canvas.height !== height) {
          throw new Error('A foto foi redimensionada incorretamente durante a compressão.');
        }
        if (typeof blob.type !== 'string' || blob.type.toLowerCase() !== 'image/jpeg') {
          throw new Error('O navegador não conseguiu gerar uma foto JPEG. Tente converter a imagem para JPEG.');
        }
        if (!Number.isFinite(blob.size) || blob.size <= 0) {
          throw new Error('O navegador gerou uma foto vazia. Selecione outra imagem.');
        }
        if (blob.size <= MAX_OUTPUT_BYTES) return blob;
        lastBlob = blob;
      }

      if (!lastBlob || (width <= 1 && height <= 1)) {
        throw new Error('A foto não pôde ser reduzida para menos de 5 MB. Escolha uma imagem menor.');
      }

      ({ width, height } = reduceDimensions(width, height, lastBlob.size));
    }
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error('Não foi possível preparar a foto para envio.');
  } finally {
    decoded.release();
  }
}
