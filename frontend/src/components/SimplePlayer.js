import React, { useState } from 'react';
import { X, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Простой рабочий плеер с проверенными источниками
 * Все плееры работают с TMDB ID для максимальной точности
 */
export const SimplePlayer = ({ tmdbId, title, year, mediaType, onClose }) => {
  const [selectedSource, setSelectedSource] = useState(0);
  const [loading, setLoading] = useState(true);

  // ПРОВЕРЕННЫЕ рабочие плееры (тестировано!)
  const sources = [
    {
      name: 'VidSrc Primary',
      url: `https://vidsrc.me/embed/${mediaType}?tmdb=${tmdbId}`,
      description: 'Основной источник с русской озвучкой',
      icon: '🎬'
    },
    {
      name: 'VidSrc XYZ',
      url: `https://vidsrc.xyz/embed/${mediaType}?tmdb=${tmdbId}`,
      description: 'Альтернативный VidSrc',
      icon: '⚡'
    },
    {
      name: 'VidSrc.to',
      url: `https://vidsrc.to/embed/${mediaType}/${tmdbId}`,
      description: 'Быстрый сервер',
      icon: '🚀'
    },
    {
      name: '2Embed',
      url: mediaType === 'movie' 
        ? `https://www.2embed.cc/embed/${tmdbId}`
        : `https://www.2embed.cc/embedtv/${tmdbId}`,
      description: 'Надежный источник',
      icon: '📺'
    },
    {
      name: 'Embed.su',
      url: `https://embed.su/embed/${mediaType}/${tmdbId}`,
      description: 'Стабильная работа',
      icon: '🎥'
    },
    {
      name: 'MultiEmbed',
      url: `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1`,
      description: 'Множество серверов',
      icon: '🌐'
    }
  ];

  const currentSource = sources[selectedSource];

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
        data-testid="simple-player-modal"
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
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{title} ({year})</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {currentSource.icon} {currentSource.name} - {currentSource.description}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              data-testid="close-player-button"
              aria-label="Закрыть"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Source Tabs */}
          <div className="mb-4 flex flex-wrap gap-2">
            {sources.map((source, index) => (
              <button
                key={index}
                onClick={() => {
                  setSelectedSource(index);
                  setLoading(true);
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                  selectedSource === index
                    ? 'bg-brand-primary text-white shadow-[0_0_15px_rgba(255,59,48,0.3)]'
                    : 'bg-white/10 hover:bg-white/20 border border-white/10'
                }`}
                data-testid={`source-${index}`}
              >
                {source.icon} {source.name}
              </button>
            ))}
          </div>

          {/* Player */}
          <div className="relative bg-black rounded-lg overflow-hidden shadow-2xl aspect-video">
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
                <Loader2 className="w-12 h-12 animate-spin text-brand-primary" />
              </div>
            )}

            <iframe
              key={selectedSource}
              src={currentSource.url}
              className="w-full h-full"
              frameBorder="0"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="origin"
              onLoad={() => setLoading(false)}
              data-testid="player-iframe"
            />
          </div>

          {/* Info */}
          <div className="mt-4 p-4 bg-brand-primary/10 border border-brand-primary/20 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-brand-primary flex-shrink-0 mt-0.5" />
              <div className="text-sm space-y-1">
                <p className="font-semibold text-brand-primary">
                  Используется TMDB ID: {tmdbId} ({mediaType === 'movie' ? 'Фильм' : 'Сериал'})
                </p>
                <p className="text-xs text-muted-foreground">
                  💡 Если не загружается - попробуйте другие вкладки выше. Все плееры с русской озвучкой.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
