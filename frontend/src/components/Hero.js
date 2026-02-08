import React from 'react';
import { motion } from 'framer-motion';
import { Play, Info, Plus, Check } from 'lucide-react';
import { getImageUrl } from '../services/tmdb';
import { useWatchlist } from '../contexts/WatchlistContext';
import { useNavigate } from 'react-router-dom';

export const Hero = ({ movie }) => {
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();
  const navigate = useNavigate();

  if (!movie) return null;

  const inWatchlist = isInWatchlist(movie.id);

  const handleWatchlistToggle = () => {
    if (inWatchlist) {
      removeFromWatchlist(movie.id);
    } else {
      addToWatchlist(movie);
    }
  };

  const handleMoreInfo = () => {
    const mediaType = movie.title ? 'movie' : 'tv';
    navigate(`/detail/${mediaType}/${movie.id}`);
  };

  return (
    <div className="relative h-[70vh] md:h-[85vh] w-full overflow-hidden" data-testid="hero-section">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={getImageUrl(movie.backdrop_path, 'original')}
          alt={movie.title || movie.name}
          className="w-full h-full object-cover"
        />
        {/* Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative h-full max-w-[1600px] mx-auto px-4 md:px-8 flex items-end md:items-center pb-16 md:pb-24">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl space-y-4 md:space-y-6"
          data-testid="hero-content"
        >
          <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight leading-[0.9]">
            {movie.title || movie.name}
          </h1>
          
          <div className="flex items-center space-x-4 text-sm md:text-base">
            <span className="text-brand-primary font-bold">
              {movie.vote_average?.toFixed(1)} / 10
            </span>
            <span className="text-muted-foreground">
              {new Date(movie.release_date || movie.first_air_date).getFullYear()}
            </span>
            {movie.adult && (
              <span className="px-2 py-1 bg-white/10 border border-white/20 rounded text-xs">
                18+
              </span>
            )}
          </div>

          <p className="text-base md:text-lg leading-relaxed text-muted-foreground line-clamp-3">
            {movie.overview}
          </p>

          <div className="flex items-center space-x-4 pt-4">
            <button
              onClick={handleMoreInfo}
              className="bg-brand-primary hover:bg-brand-hover text-white rounded-md px-8 py-3 font-bold transition-transform hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,59,48,0.3)] flex items-center space-x-2"
              data-testid="hero-play-button"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Смотреть</span>
            </button>

            <button
              onClick={handleMoreInfo}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-md px-6 py-3 font-medium transition-colors border border-white/10 flex items-center space-x-2"
              data-testid="hero-info-button"
            >
              <Info className="w-5 h-5" />
              <span>Подробнее</span>
            </button>

            <button
              onClick={handleWatchlistToggle}
              className="p-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-md transition-colors"
              data-testid="hero-watchlist-button"
              aria-label={inWatchlist ? 'Удалить из списка' : 'Добавить в список'}
            >
              {inWatchlist ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};