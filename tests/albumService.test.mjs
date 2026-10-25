import test, { beforeEach, mock } from 'node:test';
import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const calls = [];
let invokePublic;
let invokeAdmin;
let processPhoto;
let uploadSigned;

const supabase = {
  functions: {
    invoke: (...args) => invokePublic(...args),
  },
  storage: {
    from: (bucket) => ({
      uploadToSignedUrl: (...args) => uploadSigned(bucket, ...args),
    }),
  },
};

const servicePath = (path) => pathToFileURL(resolve(path)).href;

mock.module(servicePath('src/services/supabaseClient.js'), {
  exports: { supabase },
});
mock.module(servicePath('src/services/storageService.js'), {
  exports: {
    storageService: {
      invokeAlbumAdmin: (...args) => invokeAdmin(...args),
    },
  },
});
mock.module(servicePath('src/utils/photoProcessing.js'), {
  exports: {
    processPhotoFile: (...args) => processPhoto(...args),
  },
});

const {
  listPublic,
  listAdmin,
  uploadFiles,
  publish,
  trash,
  restore,
  deletePermanently,
  setOrder,
  albumService,
} = await import('../src/services/albumService.js');

beforeEach(() => {
  calls.length = 0;
  invokePublic = async (...args) => {
    calls.push(['public', ...args]);
    return {
      data: {
        photos: [{ id: 'p1', url: 'https://example.test/p1', createdAt: 'c1', publishedAt: 'p1' }],
        hasMore: true,
        total: 25,
        order: 'recent',
      },
      error: null,
    };
  };
  invokeAdmin = async (...args) => {
    calls.push(['admin', ...args]);
    return { photos: [], order: 'recent' };
  };
  processPhoto = async (file) => {
    calls.push(['compress', file.name]);
    return new Blob([file.name], { type: 'image/jpeg' });
  };
  uploadSigned = async (...args) => {
    calls.push(['signed-upload', ...args]);
    return { data: { path: args[1], fullPath: `maite-event-photos/${args[1]}` }, error: null };
  };
  delete globalThis.window;
});

test('listPublic usa defaults e retorna somente os campos públicos do contrato', async () => {
  const result = await listPublic();

  assert.deepEqual(calls[0], ['public', 'album-api', {
    body: { action: 'public-list', offset: 0, limit: 24, seed: undefined },
  }]);
  assert.deepEqual(result, {
    photos: [{ id: 'p1', url: 'https://example.test/p1', createdAt: 'c1', publishedAt: 'p1' }],
    hasMore: true,
    total: 25,
    order: 'recent',
  });
});

test('listPublic encaminha paginação e seed', async () => {
  await listPublic({ offset: 24, limit: 12, seed: 'visita-1' });

  assert.deepEqual(calls[0][2], {
    body: { action: 'public-list', offset: 24, limit: 12, seed: 'visita-1' },
  });
});

test('listPublic propaga falhas do endpoint com mensagem em português', async () => {
  invokePublic = async () => ({ data: null, error: new Error('network down') });

  await assert.rejects(listPublic(), /álbum|fotos/i);
});

test('listAdmin encaminha o estado escolhido à ponte administrativa', async () => {
  invokeAdmin = async (...args) => {
    calls.push(['admin', ...args]);
    return { photos: [{ id: 'd1' }], order: 'oldest' };
  };

  assert.deepEqual(await listAdmin('drafts'), { photos: [{ id: 'd1' }], order: 'oldest' });
  assert.deepEqual(calls[0], ['admin', 'admin-list', { state: 'drafts' }]);
});

test('uploadFiles comprime e envia cada foto em sequência usando apenas a URL assinada', async () => {
  const progress = [];
  const files = [{ name: 'um.png' }, { name: 'dois.webp' }];
  invokeAdmin = async (action, payload) => {
    calls.push(['admin', action, payload]);
    return { path: `draft/${payload.size}`, token: 'token-em-memoria' };
  };

  const result = await uploadFiles(files, (value) => progress.push(value));

  assert.deepEqual(calls.map((call) => call[0]), [
    'compress', 'admin', 'signed-upload',
    'compress', 'admin', 'signed-upload',
  ]);
  assert.deepEqual(calls[1], ['admin', 'admin-prepare-upload', { contentType: 'image/jpeg', size: 6 }]);
  assert.deepEqual(calls[2], ['signed-upload', 'maite-event-photos', 'draft/6', 'token-em-memoria', calls[2][4], {
    contentType: 'image/jpeg', cacheControl: '60',
  }]);
  assert.equal(calls[2][4].type, 'image/jpeg');
  assert.equal(result.uploaded, 2);
  assert.deepEqual(result.failed, []);
  assert.deepEqual(progress, [
    { completed: 0, total: 2, currentName: 'um.png' },
    { completed: 1, total: 2, currentName: 'um.png' },
    { completed: 1, total: 2, currentName: 'dois.webp' },
    { completed: 2, total: 2, currentName: 'dois.webp' },
  ]);
});

test('uploadFiles mantém falhas individuais e continua os demais arquivos', async () => {
  const files = [{ name: 'falha.jpg' }, { name: 'ok.jpg' }];
  processPhoto = async (file) => {
    calls.push(['compress', file.name]);
    return new Blob([file.name], { type: 'image/jpeg' });
  };
  // O nome original não é enviado ao servidor; a primeira preparação falha por tamanho.
  invokeAdmin = async (action, payload) => {
    calls.push(['admin', action, payload]);
    if (payload.size === 9) throw new Error('Falha ao reservar espaço.');
    return { path: 'draft/ok', token: 't2' };
  };
  uploadSigned = async (...args) => {
    calls.push(['signed-upload', ...args]);
    return { data: { path: args[1], fullPath: `maite-event-photos/${args[1]}` }, error: null };
  };

  const result = await uploadFiles(files);

  assert.equal(result.uploaded, 1);
  assert.equal(result.failed.length, 1);
  assert.equal(result.failed[0].name, 'falha.jpg');
  assert.match(result.failed[0].error, /falha|reservar/i);
  assert.ok(calls.some((call) => call[0] === 'signed-upload' && call[2] === 'draft/ok'));
});

test('mutações enviam a ação, preservam falhas parciais e publicam evento quando pelo menos um item muda', async () => {
  const dispatched = [];
  globalThis.window = { dispatchEvent: (event) => dispatched.push(event.type) };
  globalThis.CustomEvent ??= class CustomEvent {
    constructor(type) { this.type = type; }
  };

  for (const [operation, action] of [
    [publish, 'admin-publish'],
    [trash, 'admin-trash'],
    [restore, 'admin-restore'],
    [deletePermanently, 'admin-delete'],
  ]) {
    invokeAdmin = async (...args) => {
      calls.push(['admin', ...args]);
      return { succeeded: ['p1'], failed: [{ id: 'p2', error: 'Falha individual.' }] };
    };
    assert.deepEqual(await operation(['p1', 'p2']), {
      succeeded: ['p1'],
      failed: [{ id: 'p2', error: 'Falha individual.' }],
    });
    assert.deepEqual(calls.at(-1), ['admin', action, { ids: ['p1', 'p2'] }]);
  }

  assert.deepEqual(dispatched, ['album_updated', 'album_updated', 'album_updated', 'album_updated']);
});

test('mutações dividem mais de 100 IDs em chamadas e agregam os sucessos', async () => {
  const ids = Array.from({ length: 101 }, (_, index) => `photo-${index}`);
  invokeAdmin = async (action, payload) => {
    calls.push(['admin', action, payload]);
    return { succeeded: payload.ids, failed: [] };
  };

  const result = await publish(ids);

  assert.equal(calls.length, 2);
  assert.equal(calls[0][2].ids.length, 100);
  assert.deepEqual(calls[1][2].ids, ['photo-100']);
  assert.deepEqual(result, { succeeded: ids, failed: [] });
});

test('mutações reportam todos os IDs de um lote com erro e seguem para o lote seguinte', async () => {
  const ids = Array.from({ length: 101 }, (_, index) => `photo-${index}`);
  invokeAdmin = async (action, payload) => {
    calls.push(['admin', action, payload]);
    if (calls.length === 1) throw new Error('network timeout');
    return { succeeded: payload.ids, failed: [] };
  };

  const result = await trash(ids);

  assert.equal(calls.length, 2);
  assert.equal(result.succeeded.length, 1);
  assert.deepEqual(result.succeeded, ['photo-100']);
  assert.equal(result.failed.length, 100);
  assert.deepEqual(result.failed[0], {
    id: 'photo-0',
    error: 'Não foi possível conectar ao serviço do álbum. Verifique a conexão e tente novamente.',
  });
  assert.equal(result.failed[99].id, 'photo-99');
});

test('mutações mantêm selecionado qualquer ID que o backend não confirmou', async () => {
  invokeAdmin = async () => ({ succeeded: ['p1'], failed: [] });

  const result = await publish(['p1', 'p2']);

  assert.deepEqual(result, {
    succeeded: ['p1'],
    failed: [{ id: 'p2', error: 'O serviço do álbum não confirmou a alteração desta foto.' }],
  });
});

test('setOrder aceita somente as três ordenações e encaminha o valor válido', async () => {
  await setOrder('random');

  assert.deepEqual(calls[0], ['admin', 'admin-set-order', { order: 'random' }]);
  await assert.rejects(setOrder('newest'), /ordena|álbum/i);
  assert.equal(calls.length, 1);
});

test('setOrder notifica a interface depois de salvar a ordenação', async () => {
  const dispatched = [];
  globalThis.window = { dispatchEvent: (event) => dispatched.push(event.type) };
  globalThis.CustomEvent ??= class CustomEvent {
    constructor(type) { this.type = type; }
  };

  invokeAdmin = async () => ({ order: 'oldest' });
  assert.deepEqual(await setOrder('oldest'), { order: 'oldest' });
  assert.deepEqual(dispatched, ['album_updated']);
});

test('albumService expõe o objeto nomeado sem remover as funções exportadas', () => {
  assert.equal(albumService.listPublic, listPublic);
  assert.equal(albumService.setOrder, setOrder);
  assert.deepEqual(Object.keys(albumService), [
    'listPublic', 'listAdmin', 'uploadFiles', 'publish', 'trash', 'restore', 'deletePermanently', 'setOrder',
  ]);
});

test('uploadFiles não conta resposta sem data de arquivo como sucesso', async () => {
  invokeAdmin = async () => ({ path: 'draft/sem-resposta', token: 'token' });
  uploadSigned = async (...args) => {
    calls.push(['signed-upload', ...args]);
    return undefined;
  };

  const result = await uploadFiles([{ name: 'resposta-ausente.jpg' }]);

  assert.equal(result.uploaded, 0);
  assert.equal(result.failed.length, 1);
  assert.equal(result.failed[0].name, 'resposta-ausente.jpg');
  assert.match(result.failed[0].error, /enviar|armazenamento/i);
});

test('uploadFiles identifica pelo índice a foto que falhou entre nomes duplicados', async () => {
  const files = [{ name: 'IMG_0001.jpg' }, { name: 'IMG_0001.jpg' }];
  let uploadCount = 0;
  invokeAdmin = async () => ({ path: 'draft/photo', token: 'token' });
  uploadSigned = async (...args) => {
    calls.push(['signed-upload', ...args]);
    uploadCount += 1;
    if (uploadCount === 2) return { data: null, error: new Error('Falha ao enviar a foto.') };
    return {
      data: { path: args[1], fullPath: `maite-event-photos/${args[1]}` },
      error: null,
    };
  };

  const result = await uploadFiles(files);

  assert.equal(result.uploaded, 1);
  assert.deepEqual(result.failed, [{
    name: 'IMG_0001.jpg',
    index: 1,
    error: 'Falha ao enviar a foto.',
  }]);
});
