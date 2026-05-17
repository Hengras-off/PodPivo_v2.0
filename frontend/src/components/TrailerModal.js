import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, ChevronLeft, ChevronRight, PlayCircle, Film } from 'lucide-react';

export const getAllTrailers = (videos) => {
  if (!videos?.results?.length) return [];
  const order = ['Trailer', 'Teaser', 'Clip', 'Featurette'];
  return videos.results
    .filter((v) => v.site === 'YouTube')
    .sort((a, b) => {
      const ai = order.indexOf(a.type);
      const bi = order.indexOf(b.type);
      if (ai !== bi) return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
      return (b.official ? 1 : 0) - (a.official ? 1 : 0);
    });
};

export const TrailerModal = ({ videos, title, onClose }) => {
  const trailers = getAllTrailers(videos);
  const [current, setCurrent] = useState(0);
  const [loaded, setLoaded] = useState(false);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % trailers.length);
  }, [trailers.length]);

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + trailers.length) % trailers.length);
  }, [trailers.length]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose, next, prev]);

  useEffect(() => {
    setLoaded(false);
  }, [current]);

  if (!trailers.length) return null;

  const trailer = trailers[current];
  const embedUrl = `https://www.youtube.com/embed/${trailer.key}?autoplay=1&rel=0&modestbranding=1`;

  const typeLabel = {
    Trailer: 'Трейлер',
    Teaser: 'Тизер',
    Clip: 'Клип',
    Featurette: 'Фичуретта',
    'Behind the Scenes': 'За кадром',
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="fixed inset-0 z-[70] flex items-center justify-center bg-black/95"
        onClick={onClose}
        data-testid="trailer-modal"
      >
        <motion.div
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.92, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="relative w-full max-w-5xl mx-4 flex flex-col gap-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-3">
              <PlayCircle className="w-6 h-6 text-red-500" />
              <div>
                <p className="text-white font-bold text-lg leading-tight line-clamp-1">{title}</p>
                <p className="text-white/50 text-sm">
                  {typeLabel[trailer.type] || trailer.type}
                  {trailer.name && ` — ${trailer.name}`}
                  {trailers.length > 1 && (
                    <span className="ml-2 text-white/30">{current + 1} / {trailers.length}</span>
                  )}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              aria-label="Закрыть"
              data-testid="close-trailer-button"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black shadow-2xl shadow-black/80">
            {!loaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
                <div className="flex flex-col items-center gap-3">
                  <Film className="w-10 h-10 text-white/30 animate-pulse" />
                  <p className="text-white/40 text-sm">Загрузка трейлера...</p>
                </div>
              </div>
            )}
            <iframe
              key={trailer.key}
              src={embedUrl}
              title={trailer.name || title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
              onLoad={() => setLoaded(true)}
            />
            {trailers.length > 1 && (
              <>
                <button
                  onClick={prev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-black/60 hover:bg-black/80 rounded-full transition-colors z-20"
                  aria-label="Предыдущий"
                >
                  <ChevronLeft className="w-6 h-6 text-white" />
                </button>
                <button
                  onClick={next}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-black/60 hover:bg-black/80 rounded-full transition-colors z-20"
                  aria-label="Следующий"
                >
                  <ChevronRight className="w-6 h-6 text-white" />
                </button>
              </>
            )}
          </div>

          {trailers.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {trailers.map((t, i) => (
                <button
                  key={t.key}
                  onClick={() => setCurrent(i)}
                  className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    i === current
                      ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/30'
                      : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                  }`}
                >
                  <Play className={`w-3.5 h-3.5 ${i === current ? 'fill-white' : ''}`} />
                  {typeLabel[t.type] || t.type}
                  {t.name && (
                    <span className="text-xs opacity-60 hidden sm:inline max-w-[120px] truncate">
                      {t.name}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
