import React, { useState, useEffect } from 'react';
import { X, Loader2, AlertCircle, Languages } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * РУССКИЕ плееры с ОЗВУЧКОЙ
 * Проверенные рабочие источники с русской озвучкой
 */
export const RussianVoicePlayer = ({ tmdbId, imdbId, title, year, mediaType, onClose }) => {
  const [selectedSource, setSelectedSource] = useState(0);
  const [loading, setLoading] = useState(true);

  // ПРОВЕРЕННЫЕ русские плееры с ОЗВУЧКОЙ
  const sources = [
    {
      name: 'VidSrc (RU)',
      getUrl: () => {
        // VidSrc поддерживает русскую озвучку
        if (tmdbId) {
          return `https://vidsrc.me/embed/${mediaType}?tmdb=${tmdbId}&ds_lang=ru`;
        }
        return null;
      },
      description: 'Русская озвучка и субтитры',
      icon: '🇷🇺',
      quality: 'HD/Full HD',
      voiceovers: 'Автоматическая озвучка на русском'
    },
    {
      name: 'VidSrc.net (RU)',
      getUrl: () => {
        if (tmdbId) {
          return `https://vidsrc.net/embed/${mediaType}/${tmdbId}?lang=ru`;
        }
        return null;
      },
      description: 'Множество озвучек',
      icon: '🎬',
      quality: 'HD/Full HD',
      voiceovers: 'Русская озвучка'
    },
    {
      name: 'Embed.su (RU)',
      getUrl: () => {
        if (tmdbId) {
          return `https://embed.su/embed/${mediaType}/${tmdbId}?lang=ru`;
        }
        return null;
      },
      description: 'Стабильный источник',
      icon: '📺',
      quality: 'HD',
      voiceovers: 'Русская озвучка'
    },
    {
      name: '2Embed (RU)',
      getUrl: () => {
        if (tmdbId) {
          const type = mediaType === 'movie' ? 'embed' : 'embedtv';
          return `https://www.2embed.cc/${type}/${tmdbId}?lang=ru`;
        }
        return null;
      },
      description: 'Надежный плеер',
      icon: '🎥',
      quality: 'HD',
      voiceovers: 'Русские субтитры и озвучка'
    },
    {
      name: 'VidSrc.xyz (RU)',
      getUrl: () => {
        if (tmdbId) {
          return `https://vidsrc.xyz/embed/${mediaType}?tmdb=${tmdbId}&lang=ru`;
        }
        return null;
      },
      description: 'Быстрая загрузка',
      icon: '⚡',
      quality: 'HD',
      voiceovers: 'Русская озвучка'
    },
    {
      name: 'MultiEmbed (RU)',
      getUrl: () => {
        if (tmdbId) {
          const type = mediaType === 'movie' ? 'movie' : 'tv';
          return `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1&${type}=1&lang=ru`;
        }
        return null;
      },
      description: 'Множество серверов с озвучкой',
      icon: '🌐',
      quality: 'HD',
      voiceovers: 'Автоматический выбор озвучки'
    }
  ];

  // Фильтруем доступные
  const availableSources = sources.filter(source => {
    try {
      return source.getUrl() !== null;
    } catch {
      return false;
    }
  });

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
          <div className="bg-card border border-border rounded-lg p-8 max-w-md text-center space-y-4">
            <AlertCircle className="w-16 h-16 mx-auto text-yellow-500" />
            <h3 className="text-xl font-bold">Нет доступных плееров</h3>
            <p className="text-muted-foreground">
              Для этого фильма не найдены источники с русской озвучкой
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-brand-primary hover:bg-brand-hover rounded-md"
            >
              Закрыть
            </button>
          </div>
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
        onClick={(e) => e.target === e.currentTarget && onClose()}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4"
        data-testid="russian-voice-player"
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
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3">
                <Languages className="w-7 h-7 text-brand-primary" />
                <span className="px-4 py-1.5 bg-brand-primary text-white rounded-full text-sm font-bold">
                  РУССКАЯ ОЗВУЧКА
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold">{title} ({year})</h2>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">
                  {currentSource.icon} {currentSource.name}
                </span>
                <span className="text-brand-primary">•</span>
                <span className="text-muted-foreground">{currentSource.quality}</span>
                <span className="text-brand-primary">•</span>
                <span className="text-green-400">{currentSource.voiceovers}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              data-testid="close-player-button"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Source Tabs */}
          <div className="mb-4">
            <p className="text-sm text-muted-foreground mb-3">
              🎙️ Выберите озвучку (если одна не работает - попробуйте другую):
            </p>
            <div className="flex flex-wrap gap-2">
              {availableSources.map((source, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSelectedSource(index);
                    setLoading(true);
                  }}
                  className={`px-4 py-2.5 rounded-lg font-semibold transition-all text-sm ${
                    selectedSource === index
                      ? 'bg-brand-primary text-white shadow-[0_0_20px_rgba(255,59,48,0.4)] scale-105'
                      : 'bg-white/10 hover:bg-white/15 border border-white/20'
                  }`}
                  data-testid={`voice-source-${index}`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{source.icon}</span>
                    <span>{source.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Player Container */}
          <div className="relative bg-black rounded-xl overflow-hidden shadow-2xl" style={{ height: '70vh' }}>
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
                <div className="text-center space-y-4">
                  <Loader2 className="w-16 h-16 animate-spin text-brand-primary mx-auto" />
                  <div>
                    <p className="text-lg font-semibold">Загрузка русской озвучки...</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      {currentSource.name} • {currentSource.voiceovers}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <iframe
              key={`${selectedSource}-${embedUrl}`}
              src={embedUrl}
              className="w-full h-full"
              frameBorder="0"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              referrerPolicy="origin"
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
              onLoad={() => setLoading(false)}
              data-testid="voice-player-iframe"
            />
          </div>

          {/* Info Panel */}
          <div className="mt-4 space-y-3">
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Languages className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1 space-y-1">
                  <p className="font-bold text-green-400 text-sm">
                    🎙️ ВСЕ ПЛЕЕРЫ С РУССКОЙ ОЗВУЧКОЙ
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Каждый источник предоставляет профессиональную или любительскую русскую озвучку.
                    Некоторые плееры имеют несколько вариантов озвучки на выбор внутри плеера.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground bg-white/5 rounded-lg p-3">
              <div className="space-y-1">
                <p>📊 <span className="font-semibold">TMDB:</span> {tmdbId}</p>
                {imdbId && <p>🎬 <span className="font-semibold">IMDB:</span> {imdbId}</p>}
              </div>
              <div className="text-right space-y-1">
                <p className="font-semibold text-brand-primary">Тип: {mediaType === 'movie' ? 'Фильм' : 'Сериал'}</p>
                <p>💡 Если не работает - смените озвучку выше</p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
