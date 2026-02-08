import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MovieCard } from './MovieCard';

export const MovieRow = ({ title, movies }) => {
  const rowRef = useRef(null);

  const scroll = (direction) => {
    if (rowRef.current) {
      const scrollAmount = direction === 'left' ? -800 : 800;
      rowRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (!movies || movies.length === 0) return null;

  return (
    <div className="space-y-4 py-8" data-testid={`movie-row-${title}`}>
      <h2 className="text-2xl md:text-3xl font-bold tracking-tighter px-4 md:px-8">
        {title}
      </h2>

      <div className="relative group">
        {/* Left Arrow */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-0 bottom-0 z-10 w-12 md:w-16 bg-gradient-to-r from-background to-transparent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          data-testid={`scroll-left-${title}`}
          aria-label="Прокрутить налево"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>

        {/* Movies */}
        <div
          ref={rowRef}
          className="flex space-x-4 overflow-x-auto scrollbar-hide px-4 md:px-8"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {movies.map((movie, index) => (
            <div key={movie.id} className="flex-shrink-0 w-40 md:w-52">
              <MovieCard movie={movie} index={index} />
            </div>
          ))}
        </div>

        {/* Right Arrow */}
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-0 bottom-0 z-10 w-12 md:w-16 bg-gradient-to-l from-background to-transparent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          data-testid={`scroll-right-${title}`}
          aria-label="Прокрутить направо"
        >
          <ChevronRight className="w-8 h-8" />
        </button>
      </div>
    </div>
  );
};