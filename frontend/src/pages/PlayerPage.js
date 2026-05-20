import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, AlertCircle, RefreshCw, Search } from 'lucide-react';
import axios from 'axios';
import { getMovieDetails, getTVDetails } from '../services/tmdb';

export const PlayerPage = () => {
  const { mediaType, id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [year, setYear] = useState('');
  const [imdbId, setImdbId] = useState(null);
  const [kinopoiskId, setKinopoiskId] = useState(null);
  const [searchingKp, setSearchingKp] = useState(true);
  const [selectedSource, setSelectedSource] = useState(0);
  const [loading, setLoading] = useState(true);
  const [infoLoading, setInfoLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetch = async () => {
      try {
        const data = mediaType === 'movie'
          ? await getMovieDetails(id)
          : await getTVDetails(id);
        setTitle(data.title || data.name || '');
        setYear(new Date(data.release_date || data.first_air_date).getFullYear());
        setImdbId(data.external_ids?.imdb_id || null);
      } catch (e) {
        console.error(e);
      } finally {
        setInfoLoading(false);
      }
    };
    fetch();
  }, [id, mediaType]);

  const findKinopoiskId = useCallback(async () => {
    if (!title) return;
    setSearchingKp(true);
    try {
      if (imdbId) {
        try {
          const r = await axios.get(
            `https://kinopoiskapiunofficial.tech/api/v2.2/films?imdbId=${imdbId}`,
            { headers: { 'X-API-KEY': '8c8e1a50-6322-4135-8875-5d40a5420d86' }, timeout: 5000 }
          );
          if (r.data?.items?.[0]?.kinopoiskId) {
            setKinopoiskId(r.data.items[0].kinopoiskId.toString());
            setSearchingKp(false);
            return;
          }
        } catch (e) {}
      }
      const r = await axios.get(
        'https://kinopoiskapiunofficial.tech/api/v2.1/films/search-by-keyword',
        {
          params: { keyword: title.replace(/[^\w\sа-яА-Я]/g, '').trim(), page: 1 },
          headers: { 'X-API-KEY': '8c8e1a50-6322-4135-8875-5d40a5420d86' },
          timeout: 5000
        }
      );
      if (r.data?.films?.length > 0) {
        const films = r.data.films;
        const typeFilter = mediaType === 'movie'
          ? f => f.type === 'FILM' || !f.type
          : f => ['TV_SERIES','TV_SHOW','MINI_SERIES'].includes(f.type);
        const match = films.find(f => (f.year === year || f.year === String(year)) && typeFilter(f))
          || films.find(typeFilter) || films[0];
        if (match?.filmId) setKinopoiskId(match.filmId.toString());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSearchingKp(false);
    }
  }, [imdbId, title, year, mediaType]);

  useEffect(() => {
    if (!infoLoading && title) findKinopoiskId();
  }, [infoLoading, title, findKinopoiskId]);

  const sources = [
    {
      name: 'Collaps', icon: '🎬', label: 'Русская озвучка', quality: 'HD/Full HD',
      getUrl: () => {
        if (kinopoiskId) return `//api.delivembd.ws/embed/kp/${kinopoiskId}`;
        if (imdbId) return `//api.delivembd.ws/embed/imdb/${imdbId}`;
        return null;
      }
    },
    {
      name: '2Embed', icon: '🌍', label: 'Субтитры / Озвучка', quality: 'HD',
      getUrl: () => {
        if (imdbId) return `https://www.2embed.cc/embed/${imdbId}`;
        return `https://www.2embed.cc/embed/${mediaType === 'movie' ? 'movie' : 'tv'}/${id}`;
      }
    },
    {
      name: 'VidSrc', icon: '🔥', label: 'Субтитры EN', quality: 'HD/Full HD',
      getUrl: () => {
        const type = mediaType === 'movie' ? 'movie' : 'tv';
        if (imdbId) return `https://vidsrc-embed.ru/embed/${type}?imdb=${imdbId}`;
        return `https://vidsrc-embed.ru/embed/${type}?tmdb=${id}`;
      }
    },
  ];

  const available = sources.filter(s => s.getUrl() !== null);
  const current = available[selectedSource] || available[0];
  const embedUrl = current?.getUrl();
  const isReady = !infoLoading && !searchingKp && embedUrl;

  return (
    <div style={{ minHeight: '100vh', background: '#000', display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 16,
        padding: '10px 20px',
        background: 'rgba(0,0,0,0.9)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        flexWrap: 'wrap', flexShrink: 0
      }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'rgba(255,255,255,0.1)', border: 'none',
            borderRadius: 8, padding: '6px 14px', color: '#fff',
            cursor: 'pointer', fontSize: 13, flexShrink: 0
          }}
        >
          <ArrowLeft size={15} /> Назад
        </button>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ color: '#fff', fontWeight: 600, fontSize: 15, margin: 0, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {title || 'Загрузка...'}
          </p>
          {year && <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, margin: 0 }}>{year}</p>}
        </div>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {available.map((s, i) => (
            <button key={i}
              onClick={() => { setSelectedSource(i); setLoading(true); }}
              style={{
                padding: '5px 14px', borderRadius: 8, fontSize: 12, fontWeight: 500,
                cursor: 'pointer', border: 'none', transition: 'all 0.15s',
                background: selectedSource === i ? '#e03030' : 'rgba(255,255,255,0.1)',
                color: '#fff',
                boxShadow: selectedSource === i ? '0 0 14px rgba(224,48,48,0.5)' : 'none'
              }}
            >
              {s.icon} {s.name}
            </button>
          ))}
        </div>
      </div>

      {/* Player area */}
      <div style={{ flex: 1, position: 'relative', minHeight: 'calc(100vh - 57px)' }}>

        {(infoLoading || (searchingKp && !imdbId)) && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, background: '#111' }}>
            <Search size={32} color="rgba(255,255,255,0.25)" />
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 14, margin: 0 }}>
              {infoLoading ? 'Загружаем информацию...' : 'Ищем источники...'}
            </p>
          </div>
        )}

        {isReady && loading && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, background: '#111', zIndex: 5 }}>
            <Loader2 size={40} color="#e03030" style={{ animation: 'spin 1s linear infinite' }} />
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, margin: 0 }}>{current?.name} · {current?.label}</p>
          </div>
        )}

        {!isReady && !infoLoading && !searchingKp && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <AlertCircle size={40} color="#f87171" />
            <p style={{ color: '#f87171', fontSize: 15, margin: 0 }}>Источники не найдены</p>
            <button onClick={findKinopoiskId}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 13 }}>
              <RefreshCw size={14} /> Повторить поиск
            </button>
          </div>
        )}

        {isReady && embedUrl && (
          <iframe
            key={`${selectedSource}-${embedUrl}`}
            src={embedUrl}
            style={{ width: '100%', height: '100%', border: 'none', display: 'block', minHeight: 'calc(100vh - 57px)' }}
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            onLoad={() => setLoading(false)}
          />
        )}
      </div>

      {(kinopoiskId || imdbId) && (
        <div style={{ padding: '6px 20px', background: 'rgba(0,0,0,0.7)', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: 16, fontSize: 11, color: 'rgba(255,255,255,0.2)', flexShrink: 0 }}>
          {kinopoiskId && <span>KP: {kinopoiskId}</span>}
          {imdbId && <span>IMDB: {imdbId}</span>}
          <span>TMDB: {id}</span>
          <span style={{ marginLeft: 'auto' }}>Лагает? Смените источник вверху</span>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};
