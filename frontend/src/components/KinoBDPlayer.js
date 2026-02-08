import React, { useEffect, useRef, useState } from 'react';
import { X, Play, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const KinoBDPlayer = ({ kinopoiskId, imdbId, title, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const playerRef = useRef(null);

  useEffect(() => {
    // Проверяем есть ли Kinopoisk ID
    if (!kinopoiskId && !imdbId) {
      setError(true);
      setLoading(false);
      return;
    }

    // Загружаем скрипт KinoBD если его еще нет
    const scriptId = 'kinobd-player-script';
    let script = document.getElementById(scriptId);
    
    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://kinobd.net/js/player_.js';
      script.async = true;
      script.onload = () => {
        setLoading(false);
      };
      script.onerror = () => {
        setError(true);
        setLoading(false);
      };
      document.body.appendChild(script);
    } else {
      setLoading(false);
    }

    return () => {
      // Очистка при размонтировании
      if (playerRef.current) {
        playerRef.current.innerHTML = '';
      }
    };
  }, [kinopoiskId, imdbId]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleBackdropClick}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4"
        data-testid="kinobd-player-modal"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-7xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              data-testid="close-player-button"
              aria-label="Закрыть плеер"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Player Container */}
          <div className="relative bg-black rounded-lg overflow-hidden shadow-2xl aspect-video">
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black">
                <div className="text-center space-y-4">
                  <Loader2 className="w-12 h-12 animate-spin mx-auto text-brand-primary" />
                  <p className="text-muted-foreground">Загрузка плеера...</p>
                </div>
              </div>
            )}

            {error && (
              <div className="absolute inset-0 flex items-center justify-center bg-black">
                <div className="text-center space-y-4 p-8">
                  <div className="w-16 h-16 mx-auto bg-red-500/20 rounded-full flex items-center justify-center">
                    <X className="w-8 h-8 text-red-500" />
                  </div>
                  <h3 className="text-xl font-bold">Плеер недоступен</h3>
                  <p className="text-muted-foreground max-w-md">
                    К сожалению, для этого фильма не найдены источники для просмотра.
                    {!kinopoiskId && <span className="block mt-2">ID Кинопоиска отсутствует.</span>}
                  </p>
                  <button
                    onClick={onClose}
                    className="mt-4 px-6 py-2 bg-brand-primary hover:bg-brand-hover rounded-md transition-colors"
                  >
                    Закрыть
                  </button>
                </div>
              </div>
            )}

            {/* KinoBD Player */}
            {kinopoiskId && (
              <div
                ref={playerRef}
                data-kinopoisk={kinopoiskId}
                id="kinobd"
                className="w-full h-full"
                data-testid="kinobd-player"
              />
            )}
          </div>

          {/* Info */}
          <div className="mt-4 text-sm text-muted-foreground text-center">
            <p>
              Плеер предоставлен{' '}
              <a
                href="https://kinobd.net"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-primary hover:underline"
              >
                KinoBD
              </a>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
