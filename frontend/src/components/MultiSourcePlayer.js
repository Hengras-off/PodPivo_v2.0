import React, { useState } from 'react';
import { X, Play, Loader2, AlertCircle, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Универсальный плеер с несколькими источниками
 * Поддерживает: фильмы, сериалы, аниме
 */
export const MultiSourcePlayer = ({ imdbId, tmdbId, title, year, mediaType, onClose }) => {
  const [selectedSource, setSelectedSource] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Список доступных источников для встраивания
  const sources = [
    {
      name: 'VidSrc',
      getUrl: () => {
        if (imdbId) {
          return `https://vidsrc.xyz/embed/${mediaType}/${imdbId}`;
        } else if (tmdbId) {
          return `https://vidsrc.xyz/embed/${mediaType}?tmdb=${tmdbId}`;
        }
        return null;
      },
      description: 'Большая база фильмов и сериалов',
      icon: '🎬'
    },
    {
      name: 'VidSrc.to',
      getUrl: () => {
        if (imdbId) {
          return `https://vidsrc.to/embed/${mediaType}/${imdbId}`;
        } else if (tmdbId) {
          return `https://vidsrc.to/embed/${mediaType}/${tmdbId}`;
        }
        return null;
      },
      description: 'HD качество, быстрая загрузка',
      icon: '⚡'
    },
    {
      name: '2Embed',
      getUrl: () => {
        if (imdbId) {
          return `https://www.2embed.cc/embed/${imdbId}`;
        } else if (tmdbId) {
          return `https://www.2embed.cc/embedtv/${tmdbId}`;
        }
        return null;
      },
      description: 'Надёжный источник',
      icon: '🎥'
    },
    {
      name: 'SuperEmbed',
      getUrl: () => {
        if (imdbId) {
          const type = mediaType === 'tv' ? 'tv' : 'movie';
          return `https://multiembed.mov/?video_id=${imdbId}&tmdb=1&${type}=1`;
        } else if (tmdbId) {
          return `https://multiembed.mov/directstream.php?video_id=${tmdbId}&tmdb=1`;
        }
        return null;
      },
      description: 'Множество серверов',
      icon: '🌐'
    },
    {
      name: 'Embedder',
      getUrl: () => {
        if (imdbId) {
          return `https://embedder.net/e/${imdbId}`;
        }
        return null;
      },
      description: 'Классический плеер',
      icon: '📺'
    },
    {
      name: 'NontonGo',
      getUrl: () => {
        if (imdbId) {
          return `https://www.NontonGo.win/embed/imdb/${imdbId}`;
        } else if (tmdbId) {
          return `https://www.NontonGo.win/embed/tmdb/${mediaType}/${tmdbId}`;
        }
        return null;
      },
      description: 'Азиатский контент, аниме',
      icon: '🎌'
    }
  ];

  // Фильтруем источники, для которых можем сгенерировать URL
  const availableSources = sources.filter(source => source.getUrl() !== null);

  if (availableSources.length === 0) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border rounded-lg p-8 max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-yellow-500/20 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-yellow-500" />
              </div>
              <h3 className="text-xl font-bold">Плееры недоступны</h3>
              <p className="text-muted-foreground">
                Для этого контента отсутствуют необходимые идентификаторы (IMDB или TMDB).
              </p>
              <button
                onClick={onClose}
                className="mt-4 px-6 py-2 bg-brand-primary hover:bg-brand-hover rounded-md transition-colors"
              >
                Закрыть
              </button>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  const currentSource = availableSources[selectedSource];
  const embedUrl = currentSource.getUrl();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4"
        data-testid="multi-source-player-modal"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-7xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="mb-4 flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-2xl font-bold">{title}</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {currentSource.icon} {currentSource.name} - {currentSource.description}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              data-testid="close-player-button"
              aria-label="Закрыть плеер"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Source Selector */}
          <div className="mb-4 flex flex-wrap gap-2">
            {availableSources.map((source, index) => (
              <button
                key={index}
                onClick={() => {
                  setSelectedSource(index);
                  setLoading(true);
                  setError(false);
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedSource === index
                    ? 'bg-brand-primary text-white shadow-[0_0_15px_rgba(255,59,48,0.3)]'
                    : 'bg-white/10 hover:bg-white/20 border border-white/10'
                }`}
                data-testid={`source-button-${index}`}
              >
                <span className="mr-2">{source.icon}</span>
                {source.name}
              </button>
            ))}
          </div>

          {/* Player Container */}
          <div className="relative bg-black rounded-lg overflow-hidden shadow-2xl aspect-video">
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
                <div className="text-center space-y-4">
                  <Loader2 className="w-12 h-12 animate-spin mx-auto text-brand-primary" />
                  <p className="text-muted-foreground">Загрузка плеера...</p>
                </div>
              </div>
            )}

            {error && (
              <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
                <div className="text-center space-y-4 p-8">
                  <AlertCircle className="w-12 h-12 mx-auto text-yellow-500" />
                  <h3 className="text-lg font-semibold">Источник недоступен</h3>
                  <p className="text-sm text-muted-foreground">
                    Попробуйте другой источник выше
                  </p>
                </div>
              </div>
            )}

            {/* Iframe Player */}
            {embedUrl && (
              <iframe
                src={embedUrl}
                className="w-full h-full"
                frameBorder="0"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                onLoad={() => setLoading(false)}
                onError={() => {
                  setLoading(false);
                  setError(true);
                }}
                data-testid="player-iframe"
              />
            )}
          </div>

          {/* Info */}
          <div className="mt-4 text-sm text-muted-foreground">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <p>
                💡 Если плеер не работает, попробуйте другой источник выше
              </p>
              {imdbId && (
                <a
                  href={`https://www.imdb.com/title/${imdbId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 text-brand-primary hover:underline"
                >
                  <span>IMDB</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
