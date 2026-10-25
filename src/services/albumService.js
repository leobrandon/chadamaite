import { supabase } from './supabaseClient.js';
import { storageService } from './storageService.js';
import { processPhotoFile } from '../utils/photoProcessing.js';

const STORAGE_BUCKET = 'maite-event-photos';
const MAX_MUTATION_BATCH_SIZE = 100;
const ADMIN_STATES = new Set(['drafts', 'published', 'trash']);
const PHOTO_ORDERS = new Set(['recent', 'oldest', 'random']);

const ERROR_MESSAGES = {
  publicList: 'Não foi possível carregar as fotos do álbum.',
  adminList: 'Não foi possível carregar o álbum administrativo.',
  prepareUpload: 'Não foi possível autorizar o envio desta foto.',
  upload: 'Não foi possível enviar esta foto ao armazenamento.',
  mutation: 'Não foi possível concluir a alteração no álbum.',
  invalidResponse: 'O serviço do álbum retornou uma resposta inválida.',
};

function extractErrorMessage(error) {
  if (typeof error === 'string') return error.trim();
  if (!error || typeof error !== 'object') return '';

  const candidates = [error.message, error.error_description, error.error, error.details];
  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim()) return candidate.trim();
  }
  return '';
}

function isPortugueseMessage(message) {
  return /\b(n[aã]o|falha|erro|inv[aá]lido|limite|sem|permiss[aã]o|expirad[oa]|foto|imagem|[áàâãéêíóôõúç]|[a-z]+mento)\b/i.test(message);
}

function toPortugueseError(error, fallback) {
  const message = extractErrorMessage(error);
  if (message && isPortugueseMessage(message)) return message;

  const status = Number(error?.status ?? error?.context?.status);
  if (status === 401 || status === 403) return 'Sua sessão não tem autorização para esta ação. Entre novamente e tente de novo.';
  if (status === 413) return 'A foto excede o limite permitido. Escolha uma imagem menor.';
  if (status === 429) return 'Muitas solicitações ao álbum. Aguarde um pouco e tente novamente.';
  if (status >= 500) return 'O serviço do álbum está temporariamente indisponível. Tente novamente em instantes.';
  if (/network|fetch|connection|timeout/i.test(message)) {
    return 'Não foi possível conectar ao serviço do álbum. Verifique a conexão e tente novamente.';
  }
  return fallback;
}

function unwrapResponse(response, fallback) {
  if (!response || typeof response !== 'object') throw new Error(ERROR_MESSAGES.invalidResponse);
  if (response.error) throw new Error(toPortugueseError(response.error, fallback));

  const data = Object.prototype.hasOwnProperty.call(response, 'data') ? response.data : response;
  if (!data || typeof data !== 'object' || data.error) {
    throw new Error(toPortugueseError(data?.error, fallback));
  }
  return data;
}

function dispatchAlbumUpdated() {
  if (typeof window === 'undefined' || typeof window.dispatchEvent !== 'function') return;
  if (typeof CustomEvent === 'function') {
    window.dispatchEvent(new CustomEvent('album_updated'));
  } else if (typeof Event === 'function') {
    window.dispatchEvent(new Event('album_updated'));
  }
}

function reportProgress(onProgress, progress) {
  if (typeof onProgress !== 'function') return;
  try {
    onProgress(progress);
  } catch {
    // A view callback must not interrupt a photo upload.
  }
}

function validateMutationResult(result, fallback = ERROR_MESSAGES.mutation) {
  const data = unwrapResponse(result, fallback);
  if (!Array.isArray(data.succeeded) || !Array.isArray(data.failed)) {
    throw new Error(ERROR_MESSAGES.invalidResponse);
  }

  return {
    succeeded: data.succeeded,
    failed: data.failed.map((failure) => ({
      id: failure?.id,
      error: toPortugueseError(failure?.error, 'Não foi possível alterar esta foto do álbum.'),
    })),
  };
}

async function runMutation(action, ids) {
  if (!Array.isArray(ids)) throw new Error('Seleção de fotos inválida.');

  const succeeded = [];
  const failed = [];
  for (let start = 0; start < ids.length; start += MAX_MUTATION_BATCH_SIZE) {
    const batch = ids.slice(start, start + MAX_MUTATION_BATCH_SIZE);
    let batchResult;

    try {
      const response = await storageService.invokeAlbumAdmin(action, { ids: batch });
      batchResult = validateMutationResult(response);
    } catch (error) {
      const message = toPortugueseError(error, ERROR_MESSAGES.mutation);
      failed.push(...batch.map((id) => ({ id, error: message })));
      continue;
    }

    const batchIds = new Set(batch);
    const failuresById = new Map();
    for (const item of batchResult.failed) {
      if (batchIds.has(item.id)) failuresById.set(item.id, item);
    }
    const succeededIds = new Set(batchResult.succeeded.filter((id) => batchIds.has(id)));

    for (const id of batch) {
      const itemFailure = failuresById.get(id);
      if (itemFailure) {
        failed.push(itemFailure);
      } else if (succeededIds.has(id)) {
        succeeded.push(id);
      } else {
        failed.push({ id, error: 'O serviço do álbum não confirmou a alteração desta foto.' });
      }
    }
  }

  if (succeeded.length > 0) dispatchAlbumUpdated();
  return { succeeded, failed };
}

export async function listPublic({ offset = 0, limit = 24, seed } = {}) {
  if (!supabase?.functions?.invoke) throw new Error(ERROR_MESSAGES.publicList);

  let response;
  try {
    response = await supabase.functions.invoke('album-api', {
      body: { action: 'public-list', offset, limit, seed },
    });
  } catch (error) {
    throw new Error(toPortugueseError(error, ERROR_MESSAGES.publicList));
  }

  const data = unwrapResponse(response, ERROR_MESSAGES.publicList);
  if (!Array.isArray(data.photos) || !Number.isSafeInteger(data.total) || data.total < 0 || typeof data.hasMore !== 'boolean' || !PHOTO_ORDERS.has(data.order)) {
    throw new Error(ERROR_MESSAGES.invalidResponse);
  }

  return {
    photos: data.photos.map((photo) => {
      if (!photo || typeof photo !== 'object' || typeof photo.id !== 'string' || typeof photo.url !== 'string' || typeof photo.createdAt !== 'string' || !(typeof photo.publishedAt === 'string' || photo.publishedAt === null)) {
        throw new Error(ERROR_MESSAGES.invalidResponse);
      }
      return { id: photo.id, url: photo.url, createdAt: photo.createdAt, publishedAt: photo.publishedAt };
    }),
    hasMore: data.hasMore,
    total: data.total,
    order: data.order,
  };
}

export async function listAdmin(state) {
  if (!ADMIN_STATES.has(state)) throw new Error('Estado do álbum administrativo inválido.');

  let response;
  try {
    response = await storageService.invokeAlbumAdmin('admin-list', { state });
  } catch (error) {
    throw new Error(toPortugueseError(error, ERROR_MESSAGES.adminList));
  }

  const data = unwrapResponse(response, ERROR_MESSAGES.adminList);
  if (!Array.isArray(data.photos)) throw new Error(ERROR_MESSAGES.invalidResponse);
  if (!PHOTO_ORDERS.has(data.order)) throw new Error(ERROR_MESSAGES.invalidResponse);
  return { photos: data.photos, order: data.order };
}

export async function uploadFiles(files, onProgress) {
  const queue = Array.from(files ?? []);
  const failed = [];
  let uploaded = 0;

  for (let index = 0; index < queue.length; index += 1) {
    const file = queue[index];
    const name = typeof file?.name === 'string' && file.name.trim() ? file.name : `Foto ${index + 1}`;
    reportProgress(onProgress, { completed: index, total: queue.length, currentName: name });

    try {
      const blob = await processPhotoFile(file);
      const preparationResponse = await storageService.invokeAlbumAdmin('admin-prepare-upload', {
        contentType: 'image/jpeg',
        size: blob.size,
      });
      const preparation = unwrapResponse(preparationResponse, ERROR_MESSAGES.prepareUpload);
      if (typeof preparation.path !== 'string' || !preparation.path || typeof preparation.token !== 'string' || !preparation.token) {
        throw new Error(ERROR_MESSAGES.invalidResponse);
      }

      if (!supabase?.storage?.from) throw new Error(ERROR_MESSAGES.upload);
      const uploadResponse = await supabase.storage
        .from(STORAGE_BUCKET)
        .uploadToSignedUrl(preparation.path, preparation.token, blob, {
          contentType: 'image/jpeg',
          cacheControl: '60',
        });
      if (uploadResponse?.error) throw new Error(toPortugueseError(uploadResponse.error, ERROR_MESSAGES.upload));
      if (
        typeof uploadResponse?.data?.path !== 'string' || !uploadResponse.data.path ||
        typeof uploadResponse.data.fullPath !== 'string' || !uploadResponse.data.fullPath
      ) {
        throw new Error(ERROR_MESSAGES.upload);
      }
      uploaded += 1;
    } catch (error) {
      failed.push({ name, index, error: toPortugueseError(error, ERROR_MESSAGES.upload) });
    }

    reportProgress(onProgress, { completed: index + 1, total: queue.length, currentName: name });
  }

  if (uploaded > 0) dispatchAlbumUpdated();
  return { uploaded, failed };
}

export function publish(ids) {
  return runMutation('admin-publish', ids);
}

export function trash(ids) {
  return runMutation('admin-trash', ids);
}

export function restore(ids) {
  return runMutation('admin-restore', ids);
}

export function deletePermanently(ids) {
  return runMutation('admin-delete', ids);
}

export async function setOrder(order) {
  if (!PHOTO_ORDERS.has(order)) throw new Error('Ordenação do álbum inválida.');

  let response;
  try {
    response = await storageService.invokeAlbumAdmin('admin-set-order', { order });
  } catch (error) {
    throw new Error(toPortugueseError(error, ERROR_MESSAGES.mutation));
  }

  const data = unwrapResponse(response, ERROR_MESSAGES.mutation);
  dispatchAlbumUpdated();
  return data;
}

export const albumService = {
  listPublic,
  listAdmin,
  uploadFiles,
  publish,
  trash,
  restore,
  deletePermanently,
  setOrder,
};
