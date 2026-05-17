import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { X, Loader2, AlertCircle, Languages, RefreshCw, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { usePlayer } from '../contexts/PlayerContext';

/**
 * Collaps плеер с русской озвучкой
 */
export const RussianVoicePlayer = ({ tmdbId, imdbId, title, year, mediaType, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [kinopoiskId, setKinopoiskId] = useState(null);
  const [searchingKp, setSearchingKp] = useState(true);
  const { setPlayerOpen } = usePlayer();

  // Сообщаем App что плеер открыт — останавливаем Lenis
  useEffect(() => {
    setPlayerOpen(true);
    return () => setPlayerOpen(false);
  }, [setPlayerOpen]);

  // Поиск Kinopoisk ID через различные методы
  const findKinopoiskId = useCallback(async () => {
    setSearchingKp(true);
    
    try {
      // Метод 1: Поиск через Kinopoisk Unofficial API по IMDB ID
      if (imdbId) {
        try {
          const response = await axios.get(
            `https://kinopoiskapiunofficial.tech/api/v2.2/films?imdbId=${imdbId}`,
            {
              headers: { 'X-API-KEY': '8c8e1a50-6322-4135-8875-5d40a5420d86' },
              timeout: 5000
            }
          );
          if (response.data?.items?.[0]?.kinopoiskId) {
            const kpId = response.data.items[0].kinopoiskId.toString();
            setKinopoiskId(kpId);
            setSearchingKp(false);
            return kpId;
          }
        } catch (e) {
          console.log('KP API by IMDB failed:', e.message);
        }
      }

      // Метод 2: Поиск по названию и году с учетом типа контента
      try {
        const searchTitle = title.replace(/[^\w\sа-яА-Я]/g, '').trim();
        const response = await axios.get(
          `https://kinopoiskapiunofficial.tech/api/v2.1/films/search-by-keyword`,
          {
            params: { keyword: searchTitle, page: 1 },
            headers: { 'X-API-KEY': '8c8e1a50-6322-4135-8875-5d40a5420d86' },
            timeout: 5000
          }
        );
        
        if (response.data?.films?.length > 0) {
          const films = response.data.films;
          
          // Фильтруем по типу: для movie ищем только фильмы, для tv - сериалы
          const typeFilter = mediaType === 'movie' 
            ? f => f.type === 'FILM' || !f.type
            : f => f.type === 'TV_SERIES' || f.type === 'TV_SHOW' || f.type === 'MINI_SERIES';
          
          // Приоритет: точное совпадение по году + типу
          let match = films.find(f => 
            (f.year === year || f.year === String(year)) && typeFilter(f)
          );
          
          // Если не нашли, ищем только по типу
          if (!match) {
            match = films.find(typeFilter);
          }
          
          // Если все еще не нашли, берем первое совпадение по году
          if (!match) {
            match = films.find(f => f.year === year || f.year === String(year));
          }
          
          // Последняя попытка - первый результат
          if (!match) {
            match = films[0];
          }
          
          if (match?.filmId) {
            const kpId = match.filmId.toString();
            console.log(`Found KP ID ${kpId} for "${title}" (${year}) - type: ${match.type}`);
            setKinopoiskId(kpId);
            setSearchingKp(false);
            return kpId;
          }
        }
      } catch (e) {
        console.log('KP API by title failed:', e.message);
      }

      setSearchingKp(false);
      return null;
    } catch (e) {
      console.error('KP search error:', e);
      setSearchingKp(false);
      return null;
    }
    }, [imdbId, title, year, mediaType]);

  // При монтировании ищем Kinopoisk ID
  useEffect(() => {
    findKinopoiskId();
  }, [findKinopoiskId]);

  const [selectedSource, setSelectedSource] = useState(0);

  // Источники — только проверенные рабочие
  const sources = [
    {
      name: 'Collaps',
      getUrl: () => {
        if (kinopoiskId) return `//api.delivembd.ws/embed/kp/${kinopoiskId}`;
        if (imdbId) return `//api.delivembd.ws/embed/imdb/${imdbId}`;
        return null;
      },
      description: 'Русская озвучка',
      icon: '🎬',
      quality: 'HD/Full HD',
      voiceovers: 'Русская озвучка'
    },
    {
      name: '2Embed',
      getUrl: () => {
        if (imdbId) return `https://www.2embed.cc/embed/${imdbId}`;
        if (tmdbId) return `https://www.2embed.cc/embed/${mediaType === 'movie' ? 'movie' : 'tv'}/${tmdbId}`;
        return null;
      },
      description: 'Субтитры / Озвучка',
      icon: '🎭',
      quality: 'HD',
      voiceovers: 'Субтитры / Озвучка'
    },
    {
      name: 'VidSrc',
      getUrl: () => {
        const type = mediaType === 'movie' ? 'movie' : 'tv';
        if (imdbId) return `https://vidsrc-embed.ru/embed/${type}?imdb=${imdbId}`;
        if (tmdbId) return `https://vidsrc-embed.ru/embed/${type}?tmdb=${tmdbId}`;
        return null;
      },
      description: 'Субтитры EN',
      icon: '🌍',
      quality: 'HD/Full HD',
      voiceovers: 'Субтитры EN'
    },
  ];

  const availableSources = sources.filter(s => s.getUrl() !== null);
  const currentSource = availableSources[selectedSource] || availableSources[0];
  const embedUrl = currentSource?.getUrl();

  // Если все еще ищем KP ID и нет IMDB ID - показываем загрузку
  if (searchingKp && !imdbId) {
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
            <Search className="w-16 h-16 mx-auto text-brand-primary animate-pulse" />
            <h3 className="text-xl font-bold">Поиск источников...</h3>
            <p className="text-muted-foreground">
              Ищем фильм в базе русских озвучек
            </p>
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Поиск Kinopoisk ID...</span>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  if (!embedUrl) {
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
            <h3 className="text-xl font-bold">Плеер недоступен</h3>
            <p className="text-muted-foreground">
              Для этого фильма не найдены источники с русской озвучкой
            </p>
            <div className="text-xs text-muted-foreground bg-muted/20 p-3 rounded">
              <p>TMDB: {tmdbId}</p>
              {imdbId && <p>IMDB: {imdbId}</p>}
              {kinopoiskId && <p>Kinopoisk: {kinopoiskId}</p>}
            </div>
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

  const content = (
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
                  {currentSource?.icon} {currentSource?.name}
                </span>
                <span className="text-brand-primary">•</span>
                <span className="text-muted-foreground">{currentSource?.quality}</span>
                <span className="text-brand-primary">•</span>
                <span className="text-green-400">{currentSource?.voiceovers}</span>
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
            <div className="flex flex-col gap-3">
              {/* Русская озвучка */}
              <div>
                <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">🇷🇺 Русская озвучка</p>
                <div className="flex flex-wrap gap-2">
                  {availableSources.filter(s => s.voiceovers === 'Русская озвучка').map((source, _) => {
                    const index = availableSources.indexOf(source);
                    return (
                      <button
                        key={index}
                        onClick={() => { setSelectedSource(index); setLoading(true); }}
                        className={`px-4 py-2 rounded-lg font-semibold transition-all text-sm ${
                          selectedSource === index
                            ? 'bg-brand-primary text-white shadow-[0_0_20px_rgba(255,59,48,0.4)] scale-105'
                            : 'bg-white/10 hover:bg-white/15 border border-white/20'
                        }`}
                        data-testid={`source-${index}`}
                        title={source.description}
                      >
                        <div className="flex items-center gap-2">
                          <span>{source.icon}</span>
                          <span>{source.name}</span>
                          <span className="text-xs opacity-60">{source.quality}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
              {/* Субтитры / Другое */}
              <div>
                <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">🌍 Субтитры / Другие</p>
                <div className="flex flex-wrap gap-2">
                  {availableSources.filter(s => s.voiceovers !== 'Русская озвучка').map((source, _) => {
                    const index = availableSources.indexOf(source);
                    return (
                      <button
                        key={index}
                        onClick={() => { setSelectedSource(index); setLoading(true); }}
                        className={`px-4 py-2 rounded-lg font-semibold transition-all text-sm ${
                          selectedSource === index
                            ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(59,130,246,0.4)] scale-105'
                            : 'bg-white/10 hover:bg-white/15 border border-white/20'
                        }`}
                        data-testid={`source-${index}`}
                        title={source.description}
                      >
                        <div className="flex items-center gap-2">
                          <span>{source.icon}</span>
                          <span>{source.name}</span>
                          <span className="text-xs opacity-60">{source.quality}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Player Container */}
          <div className="relative bg-black rounded-xl overflow-hidden shadow-2xl" style={{ height: '65vh' }}>
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
                <div className="text-center space-y-4">
                  <Loader2 className="w-16 h-16 animate-spin text-brand-primary mx-auto" />
                  <div>
                    <p className="text-lg font-semibold">Загрузка...</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      {currentSource?.name} • {currentSource?.voiceovers}
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
              onLoad={() => setLoading(false)}
              data-testid="voice-player-iframe"
            />
          </div>

          {/* Info Panel */}
          <div className="mt-4 space-y-3">
            {kinopoiskId && (
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Languages className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-1">
                    <p className="font-bold text-green-400 text-sm">
                      Kinopoisk ID: {kinopoiskId}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Выбирайте озвучку внутри плеера если доступно несколько вариантов.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {!kinopoiskId && imdbId && (
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Languages className="w-6 h-6 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-1">
                    <p className="font-bold text-blue-400 text-sm">
                      IMDB ID: {imdbId}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Используется IMDB ID для поиска озвучки.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {!kinopoiskId && !imdbId && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-1">
                    <p className="font-bold text-yellow-400 text-sm">
                      ID не найден
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Русская озвучка может быть недоступна.
                    </p>
                    <button
                      onClick={findKinopoiskId}
                      className="mt-2 flex items-center gap-2 px-3 py-1.5 bg-yellow-500/20 hover:bg-yellow-500/30 rounded text-xs font-medium"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Повторить поиск
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-muted-foreground bg-white/5 rounded-lg p-3">
              <div className="space-y-1">
                <p>TMDB: <span className="font-semibold">{tmdbId}</span></p>
                {imdbId && <p>IMDB: <span className="font-semibold">{imdbId}</span></p>}
                {kinopoiskId && <p>KP: <span className="font-semibold text-green-400">{kinopoiskId}</span></p>}
              </div>
              <div className="text-right space-y-1">
                <p className="font-semibold text-brand-primary">{mediaType === 'movie' ? 'Фильм' : 'Сериал'}</p>
                <p>Если не работает - смените источник</p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );

  return ReactDOM.createPortal(content, document.body);
};
