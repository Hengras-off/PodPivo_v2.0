import React, { useState, useEffect } from 'react';
import { getGenres, discoverMovies, discoverTV } from '../services/tmdb';
import { MovieCard } from '../components/MovieCard';
import { LoadingSpinner, ErrorMessage } from '../components/LoadingSpinner';

export const BrowsePage = () => {
  const [mediaType, setMediaType] = useState('movie');
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const data = await getGenres(mediaType);
        setGenres(data || []);
      } catch (err) {
        console.error('Error fetching genres:', err);
      }
    };

    fetchGenres();
  }, [mediaType]);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        const filters = selectedGenre ? { genre_ids: selectedGenre } : {};
        const data = mediaType === 'movie'
          ? await discoverMovies(filters)
          : await discoverTV(filters);
        setMovies(data.results || []);
      } catch (err) {
        console.error('Error fetching movies:', err);
        setError('Ошибка загрузки');
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [mediaType, selectedGenre]);

  return (
    <div className="min-h-screen pt-32 px-4 md:px-8 max-w-[1600px] mx-auto pb-16" data-testid="browse-page">
      <h1 className="text-4xl md:text-5xl font-bold mb-8">Каталог</h1>

      {/* Media Type Toggle */}
      <div className="flex items-center space-x-4 mb-6">
        <button
          onClick={() => setMediaType('movie')}
          className={`px-6 py-2 rounded-full font-semibold transition-all ${
            mediaType === 'movie'
              ? 'bg-brand-primary text-white'
              : 'bg-white/10 hover:bg-white/20'
          }`}
          data-testid="media-type-movie"
        >
          Фильмы
        </button>
        <button
          onClick={() => setMediaType('tv')}
          className={`px-6 py-2 rounded-full font-semibold transition-all ${
            mediaType === 'tv'
              ? 'bg-brand-primary text-white'
              : 'bg-white/10 hover:bg-white/20'
          }`}
          data-testid="media-type-tv"
        >
          Сериалы
        </button>
      </div>

      {/* Genre Filter */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Жанры</h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedGenre(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              selectedGenre === null
                ? 'bg-brand-primary text-white'
                : 'bg-white/10 hover:bg-white/20'
            }`}
            data-testid="genre-all"
          >
            Все
          </button>
          {genres.map((genre) => (
            <button
              key={genre.id}
              onClick={() => setSelectedGenre(genre.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedGenre === genre.id
                  ? 'bg-brand-primary text-white'
                  : 'bg-white/10 hover:bg-white/20'
              }`}
              data-testid={`genre-${genre.id}`}
            >
              {genre.name}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <ErrorMessage message={error} />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
          {movies.map((movie, index) => (
            <MovieCard key={movie.id} movie={movie} index={index} />
          ))}
        </div>
      )}
    </div>
  );
};