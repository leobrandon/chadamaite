import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Camera,
  ChevronLeft,
  ChevronRight,
  Heart,
  ImageOff,
  LoaderCircle,
  RefreshCw,
  X,
} from 'lucide-react';
import { motion } from 'motion/react';
import { albumService } from '../services/albumService.js';
import CloudHeadingReveal from './ui/CloudHeadingReveal';

const PAGE_SIZE = 24;
const SWIPE_THRESHOLD = 50;

function createSessionSeed() {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }

  if (typeof globalThis.crypto?.getRandomValues === 'function') {
    return Array.from(globalThis.crypto.getRandomValues(new Uint32Array(4)), (value) => value.toString(16)).join('-');
  }

  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

function uniquePhotos(existing, incoming) {
  const seen = new Set(existing.map((photo) => photo.id));
  return [
    ...existing,
    ...incoming.filter((photo) => {
      if (!photo?.id || seen.has(photo.id)) return false;
      seen.add(photo.id);
      return true;
    }),
  ];
}

function getErrorMessage(error) {
  const detail = typeof error?.message === 'string' ? error.message.trim() : '';
  if (/^não foi possível/i.test(detail)) return detail;
  return detail
    ? `Não foi possível carregar o álbum. ${detail}`
    : 'Não foi possível carregar o álbum agora. Verifique sua conexão e tente novamente.';
}

function AlbumSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4" aria-hidden="true">
      {Array.from({ length: 8 }, (_, index) => (
        <div
          key={index}
          className="aspect-[4/3] rounded-2xl bg-blush-100/80 dark:bg-slate-800 animate-pulse"
        />
      ))}
    </div>
  );
}

export default function PhotoAlbum() {
  const [seed] = useState(createSessionSeed);
  const [photos, setPhotos] = useState([]);
  const [total, setTotal] = useState(0);
  const [order, setOrder] = useState('');
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [loadMoreError, setLoadMoreError] = useState('');
  const [openPhotoId, setOpenPhotoId] = useState(null);

  const requestEpochRef = useRef(0);
  const loadingMoreRef = useRef(false);
  const photosRef = useRef(photos);
  const modalRef = useRef(null);
  const openerRef = useRef(null);
  const touchStartRef = useRef(null);
  const openIndex = photos.findIndex((photo) => photo.id === openPhotoId);
  const openPhoto = openIndex >= 0 ? photos[openIndex] : null;
  const isLightboxOpen = Boolean(openPhoto);

  photosRef.current = photos;

  const reload = useCallback(async () => {
    const epoch = ++requestEpochRef.current;
    loadingMoreRef.current = false;
    setIsLoading(true);
    setIsLoadingMore(false);
    setError('');
    setLoadMoreError('');

    try {
      const result = await albumService.listPublic({ offset: 0, limit: PAGE_SIZE, seed });
      if (requestEpochRef.current !== epoch) return;
      if (!Array.isArray(result?.photos)) throw new Error('A resposta do álbum está incompleta.');

      setPhotos(uniquePhotos([], result.photos));
      setTotal(Number.isFinite(Number(result.total)) ? Number(result.total) : result.photos.length);
      setHasMore(Boolean(result.hasMore));
      setOrder(typeof result.order === 'string' ? result.order : '');
    } catch (loadError) {
      if (requestEpochRef.current === epoch) setError(getErrorMessage(loadError));
    } finally {
      if (requestEpochRef.current === epoch) setIsLoading(false);
    }
  }, [seed]);

  useEffect(() => {
    const handleAlbumUpdate = () => {
      void reload();
    };

    window.addEventListener('album_updated', handleAlbumUpdate);
    void reload();

    return () => {
      window.removeEventListener('album_updated', handleAlbumUpdate);
      requestEpochRef.current += 1;
      loadingMoreRef.current = false;
    };
  }, [reload]);

  const loadMore = useCallback(async () => {
    if (loadingMoreRef.current || !hasMore) return;

    loadingMoreRef.current = true;
    const epoch = requestEpochRef.current;
    setIsLoadingMore(true);
    setLoadMoreError('');

    try {
      const result = await albumService.listPublic({
        offset: photosRef.current.length,
        limit: PAGE_SIZE,
        seed,
      });
      if (requestEpochRef.current !== epoch) return;
      if (!Array.isArray(result?.photos)) throw new Error('A resposta do álbum está incompleta.');

      setPhotos((current) => uniquePhotos(current, result.photos));
      setTotal(Number.isFinite(Number(result.total)) ? Number(result.total) : photosRef.current.length + result.photos.length);
      setHasMore(Boolean(result.hasMore));
      setOrder(typeof result.order === 'string' ? result.order : '');
    } catch (loadError) {
      if (requestEpochRef.current === epoch) setLoadMoreError(getErrorMessage(loadError));
    } finally {
      if (requestEpochRef.current === epoch) {
        loadingMoreRef.current = false;
        setIsLoadingMore(false);
      }
    }
  }, [hasMore, seed]);

  const closeLightbox = useCallback(() => setOpenPhotoId(null), []);

  const moveLightbox = useCallback((direction) => {
    const currentPhotos = photosRef.current;
    if (currentPhotos.length < 2) return;

    setOpenPhotoId((currentId) => {
      const currentIndex = currentPhotos.findIndex((photo) => photo.id === currentId);
      if (currentIndex < 0) return currentId;
      const nextIndex = (currentIndex + direction + currentPhotos.length) % currentPhotos.length;
      return currentPhotos[nextIndex].id;
    });
  }, []);

  useEffect(() => {
    if (openPhotoId && openIndex < 0) setOpenPhotoId(null);
  }, [openIndex, openPhotoId]);

  useEffect(() => {
    if (!isLightboxOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    modalRef.current?.focus({ preventScroll: true });

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeLightbox();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        moveLightbox(1);
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        moveLightbox(-1);
      } else if (event.key === 'Tab') {
        const focusable = modalRef.current?.querySelectorAll('button:not([disabled])');
        if (!focusable?.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && (document.activeElement === first || document.activeElement === modalRef.current)) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      if (openerRef.current?.isConnected) openerRef.current.focus({ preventScroll: true });
    };
  }, [closeLightbox, isLightboxOpen, moveLightbox]);

  const handleTouchStart = (event) => {
    const touch = event.touches[0];
    touchStartRef.current = event.touches.length === 1 ? { x: touch.clientX, y: touch.clientY } : null;
  };

  const handleTouchEnd = (event) => {
    const start = touchStartRef.current;
    touchStartRef.current = null;
    if (!start) return;

    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - start.x;
    const deltaY = touch.clientY - start.y;
    if (Math.abs(deltaX) < SWIPE_THRESHOLD || Math.abs(deltaX) < Math.abs(deltaY) * 1.5) return;

    moveLightbox(deltaX < 0 ? 1 : -1);
  };

  const openLightbox = (event, photoId) => {
    openerRef.current = event.currentTarget;
    setOpenPhotoId(photoId);
  };

  const orderDescription = order === 'random' ? 'Ordem aleatória nesta visita' : '';

  return (
    <>
      <section id="fotos" className="py-16 md:py-20 bg-white/50 dark:bg-slate-900/50 border-t border-blush-100 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <CloudHeadingReveal
            badge="Recordações"
            badgeIcon={Camera}
            title="Fotos do chá"
            highlight="da Maitê"
            subtitle="Momentos especiais de um dia cheio de carinho."
            className="text-center max-w-2xl mx-auto mb-10"
          />

          {!isLoading && !error && photos.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-2 mb-5 text-xs text-slate-500 dark:text-slate-400">
              <span>{total} {total === 1 ? 'foto' : 'fotos'} no álbum</span>
              {orderDescription && <span>{orderDescription}</span>}
            </div>
          )}

          {isLoading ? (
            <>
              <p className="sr-only" role="status">Carregando as fotos do álbum...</p>
              <AlbumSkeleton />
            </>
          ) : error ? (
            <div className="glass-card rounded-3xl border border-blush-200 dark:border-slate-700 p-8 text-center" role="alert">
              <ImageOff className="w-9 h-9 mx-auto mb-3 text-blush-400" aria-hidden="true" />
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">{error}</p>
              <button
                type="button"
                onClick={() => void reload()}
                className="inline-flex items-center justify-center gap-2 min-h-[44px] rounded-full bg-blush-600 hover:bg-blush-700 text-white font-semibold text-sm px-5 py-2.5 transition"
              >
                <RefreshCw className="w-4 h-4" aria-hidden="true" />
                Tentar novamente
              </button>
            </div>
          ) : photos.length === 0 ? (
            <div className="glass-card rounded-3xl border border-blush-100 dark:border-slate-700 p-9 sm:p-12 text-center">
              <div className="w-14 h-14 rounded-2xl bg-blush-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4 text-blush-500 dark:text-blush-300">
                <Heart className="w-7 h-7" aria-hidden="true" />
              </div>
              <h3 className="font-serif text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Em breve, mais lembranças por aqui</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">Estamos preparando este cantinho para guardar as fotos do nosso chá com todo carinho.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
                {photos.map((photo, index) => (
                  <motion.button
                    key={photo.id}
                    type="button"
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.1 }}
                    transition={{ duration: 0.3, delay: Math.min(index % 4, 3) * 0.04 }}
                    onClick={(event) => openLightbox(event, photo.id)}
                    className={`group relative aspect-[4/3] overflow-hidden rounded-2xl bg-blush-50 dark:bg-slate-800 shadow-sm ring-1 ring-blush-100 dark:ring-slate-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-blush-400`}
                    aria-label={`Ampliar foto ${index + 1} do álbum`}
                  >
                    <img
                      src={photo.url}
                      alt="Recordação do chá de bebê da Maitê"
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    />
                    <span className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/10 transition-colors" aria-hidden="true" />
                  </motion.button>
                ))}
              </div>

              {loadMoreError && (
                <div className="mt-5 text-center" role="alert">
                  <p className="text-sm text-rose-600 dark:text-rose-300 mb-3">{loadMoreError}</p>
                  <button
                    type="button"
                    onClick={() => void loadMore()}
                    disabled={isLoadingMore}
                    className="inline-flex items-center justify-center gap-2 min-h-[44px] rounded-full border border-blush-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-blush-700 dark:text-blush-300 font-semibold text-sm px-5 py-2.5 hover:bg-blush-50 dark:hover:bg-slate-700 disabled:opacity-60 transition"
                  >
                    {isLoadingMore ? <LoaderCircle className="w-4 h-4 animate-spin" aria-hidden="true" /> : <RefreshCw className="w-4 h-4" aria-hidden="true" />}
                    Tentar novamente
                  </button>
                </div>
              )}

              {hasMore && !loadMoreError && (
                <div className="mt-8 text-center">
                  <button
                    type="button"
                    onClick={() => void loadMore()}
                    disabled={isLoadingMore}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-white dark:bg-slate-800 border border-blush-200 dark:border-slate-700 text-blush-700 dark:text-blush-300 font-semibold text-sm px-6 py-3 shadow-sm hover:bg-blush-50 dark:hover:bg-slate-700 disabled:opacity-60 transition"
                  >
                    {isLoadingMore ? <LoaderCircle className="w-4 h-4 animate-spin" aria-hidden="true" /> : <ChevronRight className="w-4 h-4" aria-hidden="true" />}
                    {isLoadingMore ? 'Carregando...' : 'Ver mais fotos'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {openPhoto && typeof document !== 'undefined' && createPortal(
        <div
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-label="Visualização de foto do álbum"
          tabIndex={-1}
          onClick={(event) => {
            if (event.target === event.currentTarget) closeLightbox();
          }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={() => { touchStartRef.current = null; }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/95 p-3 sm:p-6 focus:outline-none touch-pan-y"
        >
          <button
            type="button"
            onClick={closeLightbox}
            aria-label="Fechar visualização"
            className="absolute right-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <X className="w-6 h-6" aria-hidden="true" />
          </button>

          {photos.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => moveLightbox(-1)}
                aria-label="Foto anterior"
                className="absolute left-2 sm:left-5 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <ChevronLeft className="w-7 h-7" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => moveLightbox(1)}
                aria-label="Próxima foto"
                className="absolute right-2 sm:right-5 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <ChevronRight className="w-7 h-7" aria-hidden="true" />
              </button>
            </>
          )}

          <div
            onClick={(event) => {
              if (event.target === event.currentTarget) closeLightbox();
            }}
            className="flex h-full w-full flex-col items-center justify-center gap-3 px-10 sm:px-16"
          >
            <img
              src={openPhoto.url}
              alt="Recordação do chá de bebê da Maitê"
              className="max-h-[calc(100vh-6rem)] max-w-full object-contain"
              decoding="async"
            />
            <p className="text-xs text-white/75" aria-live="polite">{openIndex + 1} de {photos.length}</p>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
