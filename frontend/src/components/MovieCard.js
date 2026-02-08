import React from 'react';
import { motion } from 'framer-motion';
import { getImageUrl, getTitle, getReleaseYear } from '../services/tmdb';
import { useNavigate } from 'react-router-dom';
import { Plus, Check, Play } from 'lucide-react';
import { useWatchlist } from '../contexts/WatchlistContext';

export const MovieCard = ({ movie, index = 0 }) => {
  const navigate = useNavigate();
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();

  const mediaType = movie.media_type || (movie.title ? 'movie' : 'tv');
  const inWatchlist = isInWatchlist(movie.id);

  const handleClick = () => {
    navigate(`/detail/${mediaType}/${movie.id}`);
  };

  const handleWatchlistToggle = (e) => {
    e.stopPropagation();
    if (inWatchlist) {
      removeFromWatchlist(movie.id);
    } else {
      addToWatchlist({ ...movie, media_type: mediaType });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      onClick={handleClick}
      className="relative aspect-[2/3] rounded-lg overflow-hidden group cursor-pointer transition-all duration-300 hover:z-10 hover:scale-105 hover:shadow-2xl hover:shadow-black/50 border border-white/5"
      data-testid={`movie-card-${movie.id}`}
    >
      <img
        src={getImageUrl(movie.poster_path, 'w500')}
        alt={getTitle(movie)}
        className="w-full h-full object-cover"
        loading="lazy"
      />

      {/* Overlay on hover */}
      <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4 space-y-2">
        <h3 className="text-lg font-bold line-clamp-2">{getTitle(movie)}</h3>
        
        <div className="flex items-center space-x-2 text-sm">
          {movie.vote_average > 0 && (
            <span className="text-brand-primary font-bold">
              {movie.vote_average.toFixed(1)}
            </span>
          )}
          {getReleaseYear(movie) && (
            <span className="text-muted-foreground">{getReleaseYear(movie)}</span>
          )}
        </div>

        <div className="flex items-center space-x-2 pt-2">
          <button
            onClick={handleClick}
            className="flex-1 bg-white/90 hover:bg-white text-black font-semibold py-2 rounded-md flex items-center justify-center space-x-1 transition-colors"
            data-testid={`play-button-${movie.id}`}
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Смотреть</span>
          </button>
          <button
            onClick={handleWatchlistToggle}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-md border border-white/20 transition-colors"
            data-testid={`watchlist-button-${movie.id}`}
            aria-label={inWatchlist ? 'Удалить' : 'Добавить'}
          >
            {inWatchlist ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Rating badge */}
      {movie.vote_average > 0 && (
        <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-bold">
          {movie.vote_average.toFixed(1)}
        </div>
      )}
    </motion.div>
  );
};