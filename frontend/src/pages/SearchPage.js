import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchMulti } from '../services/tmdb';
import { MovieCard } from '../components/MovieCard';
import { LoadingSpinner, ErrorMessage } from '../components/LoadingSpinner';

export const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await searchMulti(query);
        setResults(data.results || []);
      } catch (err) {
        console.error('Error searching:', err);
        setError('Ошибка поиска');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="min-h-screen pt-32 px-4 md:px-8 max-w-[1600px] mx-auto" data-testid="search-page">
      <h1 className="text-4xl font-bold mb-8">
        Результаты поиска: <span className="text-brand-primary">{query}</span>
      </h1>

      {results.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-xl text-muted-foreground">
            Ничего не найдено
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
          {results.map((item, index) => (
            <MovieCard key={item.id} movie={item} index={index} />
          ))}
        </div>
      )}
    </div>
  );
};