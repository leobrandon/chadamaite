import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  Camera,
  Check,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Images,
  ImagePlus,
  LoaderCircle,
  RefreshCw,
  RotateCcw,
  Send,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import ConfirmModal from '../ConfirmModal';
import { albumService } from '../../services/albumService';

const SECTIONS = [
  { id: 'drafts', label: 'Rascunhos' },
  { id: 'published', label: 'Publicadas' },
  { id: 'trash', label: 'Lixeira' },
];

const ORDER_OPTIONS = [
  { id: 'recent', label: 'Mais recentes primeiro' },
  { id: 'oldest', label: 'Mais antigas primeiro' },
  { id: 'random', label: 'Ordem aleatória' },
];

const ACCEPTED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

function getErrorMessage(error, fallback) {
  if (typeof error === 'string' && error.trim()) return error.trim();
  return typeof error?.message === 'string' && error.message.trim()
    ? error.message.trim()
    : fallback;
}

function formatDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function getPlural(count, singular, plural = `${singular}s`) {
  return count === 1 ? singular : plural;
}

export default function AdminPhotosTab() {
  const [section, setSection] = useState('drafts');
  const [photos, setPhotos] = useState([]);
  const [order, setOrder] = useState('recent');
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [busy, setBusy] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [localFileErrors, setLocalFileErrors] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const sectionRef = useRef('drafts');
  const requestEpochRef = useRef(0);
  const orderVersionRef = useRef(0);
  const busyRef = useRef('');
  const pendingDeleteIdsRef = useRef([]);
  const fileInputRef = useRef(null);
  const objectUrlsRef = useRef(new Set());

  const loadAdminPhotos = useCallback(async (requestedSection = sectionRef.current) => {
    const epoch = ++requestEpochRef.current;
    const orderVersion = orderVersionRef.current;
    setIsLoading(true);
    setLoadError('');

    try {
      const result = await albumService.listAdmin(requestedSection);
      if (epoch !== requestEpochRef.current || sectionRef.current !== requestedSection) return;
      if (!Array.isArray(result?.photos)) throw new Error('A resposta do álbum está incompleta.');

      setPhotos(result.photos);
      const currentPhotoIds = new Set(result.photos.map((photo) => photo.id));
      setSelectedIds((current) => new Set([...current].filter((id) => currentPhotoIds.has(id))));
      if (orderVersion === orderVersionRef.current && ORDER_OPTIONS.some((option) => option.id === result.order)) {
        setOrder(result.order);
      }
    } catch (error) {
      if (epoch === requestEpochRef.current && sectionRef.current === requestedSection) {
        setPhotos([]);
        setSelectedIds(new Set());
        setLoadError(getErrorMessage(error, 'Não foi possível carregar as fotos. Verifique sua conexão e tente novamente.'));
      }
    } finally {
      if (epoch === requestEpochRef.current && sectionRef.current === requestedSection) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAdminPhotos(section);
    return () => {
      requestEpochRef.current += 1;
    };
  }, [loadAdminPhotos, section]);

  useEffect(() => () => {
    objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    objectUrlsRef.current.clear();
  }, []);

  useEffect(() => {
    if (lightboxIndex === null) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setLightboxIndex(null);
      if (event.key === 'ArrowLeft' && photos.length > 1) {
        setLightboxIndex((current) => (current - 1 + photos.length) % photos.length);
      }
      if (event.key === 'ArrowRight' && photos.length > 1) {
        setLightboxIndex((current) => (current + 1) % photos.length);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, photos.length]);

  const beginBusy = (action) => {
    if (busyRef.current) return false;
    busyRef.current = action;
    setBusy(action);
    setFeedback(null);
    return true;
  };

  const finishBusy = () => {
    busyRef.current = '';
    setBusy('');
  };

  const switchSection = (nextSection) => {
    if (nextSection === sectionRef.current || busyRef.current) return;
    sectionRef.current = nextSection;
    setSection(nextSection);
    setPhotos([]);
    setSelectedIds(new Set());
    setFeedback(null);
    setLightboxIndex(null);
  };

  const refresh = () => loadAdminPhotos(sectionRef.current);

  const visibleIds = photos.map((photo) => photo.id);
  const selectedCount = selectedIds.size;
  const areAllSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.has(id));
  const canActOnSelection = selectedCount > 0 && !busy && !isLoading && !loadError;
  const lightboxPhoto = lightboxIndex === null ? null : photos[lightboxIndex];

  const togglePhoto = (id) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    setSelectedIds((current) => {
      if (areAllSelected) {
        const next = new Set(current);
        visibleIds.forEach((id) => next.delete(id));
        return next;
      }
      return new Set([...current, ...visibleIds]);
    });
  };

  const removeSelection = (ids) => {
    const succeeded = new Set(ids);
    setSelectedIds((current) => new Set([...current].filter((id) => !succeeded.has(id))));
  };

  const describeActionResult = (verb, pluralVerb, result) => {
    const succeeded = Array.isArray(result?.succeeded) ? result.succeeded : [];
    const failed = Array.isArray(result?.failed) ? result.failed : [];
    removeSelection(succeeded);

    let message;
    if (succeeded.length && failed.length) {
      const successVerb = succeeded.length === 1 ? verb : pluralVerb;
      message = `${succeeded.length} ${getPlural(succeeded.length, 'foto')} ${successVerb}; ${failed.length} ${getPlural(failed.length, 'foto')} ${failed.length === 1 ? 'não foi' : 'não foram'} concluídas.`;
    } else if (succeeded.length) {
      const successVerb = succeeded.length === 1 ? verb : pluralVerb;
      message = `${succeeded.length} ${getPlural(succeeded.length, 'foto')} ${successVerb} com sucesso.`;
    } else if (failed.length) {
      message = `Não foi possível concluir a ação para ${failed.length} ${getPlural(failed.length, 'foto')}.`;
    } else {
      message = 'Nenhuma foto foi alterada.';
    }

    setFeedback({
      type: failed.length ? 'error' : succeeded.length ? 'success' : 'info',
      message,
      errors: failed.map((item, index) => {
        const photoIndex = photos.findIndex((photo) => photo.id === item?.id);
        const photoLabel = photoIndex >= 0 ? `Foto ${photoIndex + 1}: ` : 'Foto selecionada: ';
        return {
          key: `${item?.id || 'foto'}-${index}`,
          message: `${photoLabel}${getErrorMessage(item?.error, 'Não foi possível concluir esta ação.')}`,
        };
      }),
    });
    return { succeeded, failed };
  };

  const runPhotoAction = async (action, verb, pluralVerb, ids = [...selectedIds]) => {
    if (!ids.length || isLoading || loadError || !beginBusy(action)) return;

    try {
      const result = await albumService[action](ids);
      describeActionResult(verb, pluralVerb, result);
      await loadAdminPhotos(sectionRef.current);
    } catch (error) {
      setFeedback({
        type: 'error',
        message: getErrorMessage(error, 'A ação não foi concluída. Tente novamente.'),
        errors: [],
      });
    } finally {
      finishBusy();
    }
  };

  const requestPermanentDelete = () => {
    if (!canActOnSelection || section !== 'trash') return;
    pendingDeleteIdsRef.current = [...selectedIds];
    setConfirmDeleteOpen(true);
  };

  const confirmPermanentDelete = async () => {
    const ids = pendingDeleteIdsRef.current;
    if (!ids.length || isLoading || loadError || !beginBusy('delete')) return;

    try {
      const result = await albumService.deletePermanently(ids);
      describeActionResult('excluída permanentemente', 'excluídas permanentemente', result);
      await loadAdminPhotos(sectionRef.current);
    } catch (error) {
      setFeedback({
        type: 'error',
        message: getErrorMessage(error, 'Não foi possível excluir as fotos. Tente novamente.'),
        errors: [],
      });
    } finally {
      pendingDeleteIdsRef.current = [];
      setConfirmDeleteOpen(false);
      finishBusy();
    }
  };

  const handleOrderChange = async (event) => {
    const nextOrder = event.target.value;
    if (nextOrder === order || !beginBusy('order')) return;
    const previousOrder = order;
    const orderVersion = ++orderVersionRef.current;

    try {
      await albumService.setOrder(nextOrder);
      setOrder(nextOrder);
      setFeedback({ type: 'success', message: 'Ordenação salva no álbum.' });
      await loadAdminPhotos(sectionRef.current);
    } catch (error) {
      if (orderVersion === orderVersionRef.current) setOrder(previousOrder);
      setFeedback({
        type: 'error',
        message: `Não foi possível salvar a ordenação. ${getErrorMessage(error, 'Tente novamente.')}`,
        errors: [],
      });
    } finally {
      finishBusy();
    }
  };

  const handleFileSelection = (event) => {
    const incoming = Array.from(event.target.files || []);
    event.target.value = '';
    if (!incoming.length) return;

    const accepted = [];
    const rejected = [];
    incoming.forEach((file, index) => {
      if (!ACCEPTED_TYPES.has(file.type)) {
        rejected.push({
          key: `${file.name}-${file.size}-${file.lastModified}-${index}`,
          name: file.name,
          error: 'Formato não permitido. Envie uma imagem JPEG, PNG ou WebP.',
        });
        return;
      }

      const duplicate = selectedFiles.some((entry) => (
        entry.file.name === file.name && entry.file.size === file.size && entry.file.lastModified === file.lastModified
      ));
      if (duplicate) return;

      const previewUrl = URL.createObjectURL(file);
      objectUrlsRef.current.add(previewUrl);
      accepted.push({
        key: `${Date.now()}-${index}-${file.name}`,
        file,
        previewUrl,
        error: '',
      });
    });

    if (accepted.length) {
      setSelectedFiles((current) => [...current, ...accepted]);
      if (!rejected.length) setFeedback(null);
    }
    if (rejected.length) {
      setLocalFileErrors((current) => [...current, ...rejected]);
      setFeedback({ type: 'error', message: 'Alguns arquivos não podem ser enviados.', errors: [] });
    }
  };

  const removeQueuedFile = (key) => {
    const fileEntry = selectedFiles.find((entry) => entry.key === key);
    if (fileEntry) {
      URL.revokeObjectURL(fileEntry.previewUrl);
      objectUrlsRef.current.delete(fileEntry.previewUrl);
      setSelectedFiles((current) => current.filter((entry) => entry.key !== key));
    }
    setLocalFileErrors((current) => current.filter((entry) => entry.key !== key));
  };

  const handleUpload = async () => {
    if (!selectedFiles.length || !beginBusy('upload')) return;
    const queue = [...selectedFiles];
    setUploadProgress({ completed: 0, total: queue.length, currentName: '' });

    try {
      const result = await albumService.uploadFiles(
        queue.map((entry) => entry.file),
        (progress) => setUploadProgress({
          completed: Number(progress?.completed) || 0,
          total: Number(progress?.total) || queue.length,
          currentName: progress?.currentName || '',
        }),
      );

      const uploaded = Number(result?.uploaded) || 0;
      const failed = Array.isArray(result?.failed) ? result.failed : [];
      const failuresByIndex = new Map();
      failed.forEach((item) => {
        failuresByIndex.set(item.index, getErrorMessage(item?.error, 'Não foi possível enviar este arquivo.'));
      });

      const retained = [];
      queue.forEach((entry, index) => {
        const failure = failuresByIndex.get(index);
        if (failure) {
          retained.push({ ...entry, error: failure });
        } else {
          URL.revokeObjectURL(entry.previewUrl);
          objectUrlsRef.current.delete(entry.previewUrl);
        }
      });
      setSelectedFiles(retained);
      const summary = [];
      if (uploaded > 0) summary.push(`${uploaded} ${getPlural(uploaded, 'foto')} ${uploaded === 1 ? 'salva' : 'salvas'} em rascunhos`);
      if (failed.length > 0) summary.push(`${failed.length} ${getPlural(failed.length, 'arquivo')} com falha; os arquivos continuam selecionados para reenvio`);
      if (!uploaded && !failed.length) summary.push('Nenhuma foto foi enviada. Confira os arquivos e tente novamente.');
      setFeedback({
        type: failed.length ? 'error' : uploaded ? 'success' : 'info',
        message: `${summary.join('. ')}${summary.length ? '.' : ''}`,
        errors: failed.map((item, index) => ({
          key: `${item?.name || 'arquivo'}-${index}`,
          message: `${item?.name || 'Arquivo'}: ${getErrorMessage(item?.error, 'Não foi possível enviar este arquivo.')}`,
        })),
      });
    } catch (error) {
      const message = getErrorMessage(error, 'Não foi possível enviar as fotos. Tente novamente.');
      setSelectedFiles((current) => current.map((entry) => ({ ...entry, error: message })));
      setFeedback({ type: 'error', message, errors: [] });
    } finally {
      setUploadProgress(null);
      finishBusy();
      if (sectionRef.current !== 'drafts') {
        sectionRef.current = 'drafts';
        setSection('drafts');
        setPhotos([]);
        setSelectedIds(new Set());
      } else {
        await loadAdminPhotos('drafts');
      }
    }
  };

  const orderDescription = ORDER_OPTIONS.find((option) => option.id === order)?.label || '';
  const busyMessage = busy === 'upload'
    ? 'Enviando fotos…'
    : busy === 'delete'
      ? 'Excluindo fotos…'
      : busy === 'order'
        ? 'Salvando ordenação…'
        : busy
          ? 'Atualizando fotos…'
          : '';

  return (
    <section className="space-y-5" aria-busy={Boolean(busy) || isLoading}>
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-blush-600 dark:text-blush-300">
            <Camera className="w-5 h-5" aria-hidden="true" />
            <span className="text-[11px] font-bold uppercase tracking-[0.18em]">Álbum do chá</span>
          </div>
          <h2 className="mt-1 font-serif text-2xl font-bold text-slate-800 dark:text-white">Fotos do chá</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Envie as fotos, revise os rascunhos e escolha quais ficam visíveis no álbum.</p>
        </div>

        <button
          type="button"
          onClick={() => void refresh()}
          disabled={Boolean(busy) || isLoading}
          className="inline-flex min-h-10 items-center justify-center gap-2 self-start rounded-2xl border border-slate-200 bg-white/80 px-4 text-xs font-bold text-slate-600 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300 dark:hover:bg-slate-800 sm:self-auto"
        >
          {isLoading ? <LoaderCircle className="w-4 h-4 animate-spin" aria-hidden="true" /> : <RefreshCw className="w-4 h-4" aria-hidden="true" />}
          Atualizar lista
        </button>
      </header>

      <nav className="flex gap-2 overflow-x-auto pb-1" aria-label="Seções do álbum">
        {SECTIONS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => switchSection(item.id)}
            disabled={Boolean(busy)}
            aria-current={section === item.id ? 'page' : undefined}
            className={`min-h-10 shrink-0 rounded-2xl px-4 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-60 ${section === item.id
              ? 'bg-slate-900 text-white shadow-sm dark:bg-slate-700'
              : 'border border-slate-200 bg-white/70 text-slate-600 hover:bg-white dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300 dark:hover:bg-slate-800'}`}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {section === 'drafts' && (
        <div className="glass-card rounded-3xl border-blush-100 p-4 sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blush-100 text-blush-600 dark:bg-slate-800 dark:text-blush-300">
                <ImagePlus className="w-5 h-5" aria-hidden="true" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-slate-800 dark:text-white">Adicionar fotos</h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">JPEG, PNG ou WebP. Os envios ficam como rascunho até serem publicados.</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={handleFileSelection}
                disabled={Boolean(busy)}
                className="sr-only"
                aria-label="Selecionar fotos para enviar"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={Boolean(busy)}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-2xl border border-blush-200 bg-white px-4 text-xs font-bold text-blush-700 transition hover:bg-blush-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-blush-300 dark:hover:bg-slate-800"
              >
                <Upload className="w-4 h-4" aria-hidden="true" />
                Selecionar fotos
              </button>
              <button
                type="button"
                onClick={() => void handleUpload()}
                disabled={!selectedFiles.length || Boolean(busy)}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-2xl bg-blush-600 px-4 text-xs font-bold text-white shadow-sm transition hover:bg-blush-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blush-600 dark:hover:bg-blush-500"
              >
                {busy === 'upload' ? <LoaderCircle className="w-4 h-4 animate-spin" aria-hidden="true" /> : <Send className="w-4 h-4" aria-hidden="true" />}
                {busy === 'upload' ? 'Enviando…' : 'Salvar em rascunhos'}
              </button>
            </div>
          </div>

          {uploadProgress && (
            <div className="mt-4 rounded-2xl bg-blush-50 p-3 dark:bg-slate-800/80" role="status" aria-live="polite">
              <div className="flex items-center justify-between gap-3 text-xs font-semibold text-slate-700 dark:text-slate-200">
                <span>{busyMessage}</span>
                <span>{uploadProgress.completed} de {uploadProgress.total}</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-blush-100 dark:bg-slate-700">
                <div
                  className="h-full rounded-full bg-blush-500 transition-all"
                  style={{ width: `${uploadProgress.total ? Math.min(100, (uploadProgress.completed / uploadProgress.total) * 100) : 0}%` }}
                />
              </div>
              {uploadProgress.currentName && <p className="mt-2 truncate text-[11px] text-slate-500 dark:text-slate-400">{uploadProgress.currentName}</p>}
            </div>
          )}

          {selectedFiles.length > 0 && (
            <div className="mt-5 border-t border-blush-100 pt-4 dark:border-slate-700">
              <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200">Prontas para enviar ({selectedFiles.length})</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Revise as miniaturas; fotos com falha permanecem aqui para reenvio.</p>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {selectedFiles.map((entry) => (
                  <article key={entry.key} className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
                    <img src={entry.previewUrl} alt={`Prévia de ${entry.file.name}`} className="aspect-[4/3] w-full object-cover" />
                    <div className="flex items-center justify-between gap-2 p-2.5">
                      <span className="min-w-0 truncate text-[11px] font-medium text-slate-600 dark:text-slate-300" title={entry.file.name}>{entry.file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeQueuedFile(entry.key)}
                        disabled={Boolean(busy)}
                        aria-label={`Remover ${entry.file.name} da seleção`}
                        className="shrink-0 rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50 dark:hover:bg-rose-950/40 dark:hover:text-rose-300"
                      >
                        <X className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </div>
                    {entry.error && <p className="border-t border-rose-100 bg-rose-50 px-2.5 py-2 text-[11px] text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300" role="alert">{entry.error}</p>}
                  </article>
                ))}
              </div>
            </div>
          )}

          {localFileErrors.length > 0 && (
            <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300" role="alert">
              <p className="font-bold">Arquivos não adicionados</p>
              {localFileErrors.map((item) => (
                <div key={item.key} className="mt-2 flex items-start justify-between gap-3">
                  <p><span className="font-semibold">{item.name}:</span> {item.error}</p>
                  <button type="button" onClick={() => removeQueuedFile(item.key)} className="shrink-0 underline">Dispensar</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {feedback && (
        <div
          className={`rounded-2xl border p-3 text-xs ${feedback.type === 'error'
            ? 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300'
            : feedback.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300'
              : 'border-blush-200 bg-blush-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}
          role={feedback.type === 'error' ? 'alert' : 'status'}
        >
          <p className="flex items-start gap-2 font-semibold">
            {feedback.type === 'success' ? <Check className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /> : feedback.type === 'error' ? <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /> : null}
            <span>{feedback.message}</span>
          </p>
          {feedback.errors?.length > 0 && (
            <ul className="mt-2 space-y-1 pl-6 text-[11px]">
              {feedback.errors.map((item) => <li key={item.key}>{item.message}</li>)}
            </ul>
          )}
        </div>
      )}

      <div className="glass-card rounded-3xl border-blush-100 p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={toggleAll}
              disabled={!photos.length || isLoading || Boolean(busy)}
              className="inline-flex min-h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-[11px] font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <CheckSquare className="w-4 h-4" aria-hidden="true" />
              {areAllSelected ? 'Desmarcar todas' : 'Selecionar todas'}
            </button>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400" aria-live="polite">{selectedCount} {getPlural(selectedCount, 'foto')} {selectedCount === 1 ? 'selecionada' : 'selecionadas'}</span>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <label className="flex items-center gap-2 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              <Clock3 className="w-4 h-4" aria-hidden="true" />
              <span className="sr-only">Ordenação do álbum</span>
              <select
                value={order}
                onChange={handleOrderChange}
                disabled={Boolean(busy)}
                className="min-h-9 max-w-full rounded-xl border border-slate-200 bg-white px-3 text-[11px] font-semibold text-slate-700 outline-none transition focus:border-blush-400 focus:ring-2 focus:ring-blush-100 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:ring-slate-700"
                aria-label="Ordenação do álbum"
              >
                {ORDER_OPTIONS.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
              </select>
            </label>
          </div>
        </div>

        {selectedCount > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-blush-100 pt-4 dark:border-slate-700">
            {section === 'drafts' && (
              <button
                type="button"
                onClick={() => void runPhotoAction('publish', 'publicada', 'publicadas')}
                disabled={!canActOnSelection}
                className="inline-flex min-h-9 items-center gap-2 rounded-xl bg-emerald-600 px-3 text-[11px] font-bold text-white transition hover:bg-emerald-700 disabled:opacity-50"
              >
                {busy === 'publish' ? <LoaderCircle className="w-4 h-4 animate-spin" aria-hidden="true" /> : <Check className="w-4 h-4" aria-hidden="true" />}
                Publicar selecionadas
              </button>
            )}
            {(section === 'drafts' || section === 'published') && (
              <button
                type="button"
                onClick={() => void runPhotoAction('trash', 'movida para a lixeira', 'movidas para a lixeira')}
                disabled={!canActOnSelection}
                className="inline-flex min-h-9 items-center gap-2 rounded-xl border border-rose-200 bg-white px-3 text-[11px] font-bold text-rose-700 transition hover:bg-rose-50 disabled:opacity-50 dark:border-rose-900/60 dark:bg-slate-900 dark:text-rose-300 dark:hover:bg-rose-950/30"
              >
                {busy === 'trash' ? <LoaderCircle className="w-4 h-4 animate-spin" aria-hidden="true" /> : <Trash2 className="w-4 h-4" aria-hidden="true" />}
                Mover para a lixeira
              </button>
            )}
            {section === 'trash' && (
              <>
                <button
                  type="button"
                  onClick={() => void runPhotoAction('restore', 'restaurada', 'restauradas')}
                  disabled={!canActOnSelection}
                  className="inline-flex min-h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-[11px] font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  {busy === 'restore' ? <LoaderCircle className="w-4 h-4 animate-spin" aria-hidden="true" /> : <RotateCcw className="w-4 h-4" aria-hidden="true" />}
                  Restaurar selecionadas
                </button>
                <button
                  type="button"
                  onClick={requestPermanentDelete}
                  disabled={!canActOnSelection}
                  className="inline-flex min-h-9 items-center gap-2 rounded-xl bg-rose-600 px-3 text-[11px] font-bold text-white transition hover:bg-rose-700 disabled:opacity-50"
                >
                  {busy === 'delete' ? <LoaderCircle className="w-4 h-4 animate-spin" aria-hidden="true" /> : <Trash2 className="w-4 h-4" aria-hidden="true" />}
                  Excluir permanentemente
                </button>
              </>
            )}
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-blush-100 pt-3 text-[11px] text-slate-500 dark:border-slate-700 dark:text-slate-400">
          <span>{photos.length} {getPlural(photos.length, 'foto')} nesta seção{orderDescription ? ` • ${orderDescription.toLowerCase()}` : ''}</span>
          {busyMessage && <span role="status" aria-live="polite">{busyMessage}</span>}
        </div>

        {isLoading ? (
          <div className="flex min-h-48 flex-col items-center justify-center gap-3 text-sm text-slate-500 dark:text-slate-400" role="status" aria-live="polite">
            <LoaderCircle className="w-6 h-6 animate-spin text-blush-500" aria-hidden="true" />
            Carregando fotos…
          </div>
        ) : loadError ? (
          <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center dark:border-rose-900/50 dark:bg-rose-950/25" role="alert">
            <AlertCircle className="mx-auto h-8 w-8 text-rose-500" aria-hidden="true" />
            <p className="mt-3 text-sm text-rose-800 dark:text-rose-200">{loadError}</p>
            <button
              type="button"
              onClick={() => void refresh()}
              disabled={Boolean(busy)}
              className="mt-4 inline-flex min-h-9 items-center gap-2 rounded-xl bg-slate-900 px-4 text-xs font-bold text-white transition hover:bg-slate-800 disabled:opacity-50 dark:bg-slate-700 dark:hover:bg-slate-600"
            >
              <RefreshCw className="w-4 h-4" aria-hidden="true" />
              Tentar novamente
            </button>
          </div>
        ) : photos.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-blush-200 bg-white/50 px-6 py-12 text-center dark:border-slate-700 dark:bg-slate-900/40">
            <Images className="mx-auto h-9 w-9 text-blush-400 dark:text-blush-300" aria-hidden="true" />
            <h3 className="mt-3 font-serif text-lg font-bold text-slate-800 dark:text-slate-100">
              {section === 'drafts' ? 'Nenhum rascunho por enquanto' : section === 'published' ? 'Ainda não há fotos publicadas' : 'A lixeira está vazia'}
            </h3>
            <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              {section === 'drafts' ? 'As fotos enviadas aparecerão aqui para revisão antes da publicação.' : section === 'published' ? 'Publique fotos a partir dos rascunhos para exibi-las no álbum.' : 'Fotos movidas para a lixeira poderão ser restauradas ou excluídas permanentemente.'}
            </p>
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {photos.map((photo, index) => {
              const date = formatDate(section === 'published' ? photo.publishedAt || photo.createdAt : photo.createdAt);
              const isSelected = selectedIds.has(photo.id);
              return (
                <article
                  key={photo.id}
                  className={`group relative overflow-hidden rounded-2xl border bg-white shadow-sm transition dark:bg-slate-900 ${isSelected ? 'border-blush-400 ring-2 ring-blush-300/70 dark:border-blush-400' : 'border-slate-200 dark:border-slate-700'}`}
                >
                  <button
                    type="button"
                    onClick={() => setLightboxIndex(index)}
                    className="relative block aspect-[4/3] w-full overflow-hidden bg-blush-50 text-left focus:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-blush-400 dark:bg-slate-800"
                    aria-label={`Ampliar foto ${index + 1}`}
                  >
                    <img
                      src={photo.url}
                      alt={`Foto ${index + 1} do chá da Maitê`}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                    <span className="absolute inset-0 bg-slate-950/0 transition-colors group-hover:bg-slate-950/10" aria-hidden="true" />
                  </button>
                  <label className="flex cursor-pointer items-center gap-2 p-2.5 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => togglePhoto(photo.id)}
                      disabled={Boolean(busy)}
                      className="h-4 w-4 rounded border-slate-300 text-blush-600 focus:ring-blush-500 disabled:opacity-50 dark:border-slate-600"
                      aria-label={`Selecionar foto ${index + 1}`}
                    />
                    <span className="min-w-0 flex-1 truncate">Selecionar foto {index + 1}</span>
                    {date && <time className="shrink-0 text-[10px] font-medium text-slate-400 dark:text-slate-500">{date}</time>}
                  </label>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {lightboxPhoto && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Prévia da foto selecionada"
          className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/95 p-4 sm:p-8"
          onClick={(event) => {
            if (event.target === event.currentTarget) setLightboxIndex(null);
          }}
        >
          <button type="button" onClick={() => setLightboxIndex(null)} aria-label="Fechar prévia" className="absolute right-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20">
            <X className="w-6 h-6" aria-hidden="true" />
          </button>
          {photos.length > 1 && (
            <>
              <button type="button" onClick={() => setLightboxIndex((lightboxIndex - 1 + photos.length) % photos.length)} aria-label="Foto anterior" className="absolute left-2 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:left-5">
                <ChevronLeft className="w-7 h-7" aria-hidden="true" />
              </button>
              <button type="button" onClick={() => setLightboxIndex((lightboxIndex + 1) % photos.length)} aria-label="Próxima foto" className="absolute right-2 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:right-5">
                <ChevronRight className="w-7 h-7" aria-hidden="true" />
              </button>
            </>
          )}
          <div className="flex max-h-full max-w-full flex-col items-center justify-center gap-3 px-8 sm:px-16">
            <img src={lightboxPhoto.url} alt={`Foto ${lightboxIndex + 1} do chá da Maitê`} className="max-h-[calc(100dvh-7rem)] max-w-full object-contain" />
            <p className="text-xs text-white/75" aria-live="polite">{lightboxIndex + 1} de {photos.length}</p>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmDeleteOpen}
        title="Excluir fotos permanentemente?"
        message={`Excluir permanentemente ${pendingDeleteIdsRef.current.length} ${getPlural(pendingDeleteIdsRef.current.length, 'foto')}? Esta ação é definitiva e não poderá ser desfeita.`}
        confirmText={busy === 'delete' ? 'Excluindo…' : 'Excluir permanentemente'}
        cancelText="Cancelar"
        isDestructive
        onConfirm={confirmPermanentDelete}
        onCancel={() => {
          if (busyRef.current !== 'delete') {
            pendingDeleteIdsRef.current = [];
            setConfirmDeleteOpen(false);
          }
        }}
      />
    </section>
  );
}
