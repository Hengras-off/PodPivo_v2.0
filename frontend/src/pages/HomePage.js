import React, { useState, useEffect } from 'react';
import { Hero } from '../components/Hero';
import { MovieRow } from '../components/MovieRow';
import { LoadingSpinner, ErrorMessage } from '../components/LoadingSpinner';
import { getTrending, getMoviesByCategory, getTVByCategory } from '../services/tmdb';

export const HomePage = () => {
  const [heroMovie, setHeroMovie] = useState(null);
  const [trending, setTrending] = useState([]);
  const [popularMovies, setPopularMovies] = useState([]);
  const [topRatedMovies, setTopRatedMovies] = useState([]);
  const [popularTV, setPopularTV] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const [trendingData, popularMoviesData, topRatedData, popularTVData] = await Promise.all([
          getTrending('all', 'week'),
          getMoviesByCategory('popular'),
          getMoviesByCategory('top_rated'),
          getTVByCategory('popular'),
        ]);

        setTrending(trendingData.results || []);
        setPopularMovies(popularMoviesData.results || []);
        setTopRatedMovies(topRatedData.results || []);
        setPopularTV(popularTVData.results || []);
        
        if (trendingData.results && trendingData.results.length > 0) {
          setHeroMovie(trendingData.results[0]);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Не удалось загрузить данные');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="min-h-screen" data-testid="home-page">
      <Hero movie={heroMovie} />
      
      <div className="space-y-8 pb-16">
        <MovieRow title="Тренды недели" movies={trending} />
        <MovieRow title="Популярные фильмы" movies={popularMovies} />
        <MovieRow title="С высоким рейтингом" movies={topRatedMovies} />
        <MovieRow title="Популярные сериалы" movies={popularTV} />
      </div>
    </div>
  );
};