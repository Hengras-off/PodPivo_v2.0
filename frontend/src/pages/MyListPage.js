import React from 'react';
import { useWatchlist } from '../contexts/WatchlistContext';
import { useAuth } from '../contexts/AuthContext';
import { MovieCard } from '../components/MovieCard';
import { motion } from 'framer-motion';

export const MyListPage = () => {
  const { watchlist } = useWatchlist();
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen pt-32 px-4 md:px-8 max-w-[1600px] mx-auto" data-testid="my-list-page">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold">Войдите, чтобы просмотреть свой список</h2>
            <p className="text-muted-foreground">
              Создайте аккаунт, чтобы сохранять избранные фильмы
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 px-4 md:px-8 max-w-[1600px] mx-auto pb-16" data-testid="my-list-page">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-8">Мой список</h1>

        {watchlist.length === 0 ? (
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-semibold text-muted-foreground">
                Ваш список пуст
              </h2>
              <p className="text-muted-foreground">
                Добавьте фильмы и сериалы, чтобы посмотреть их позже
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
            {watchlist.map((movie, index) => (
              <MovieCard key={movie.id} movie={movie} index={index} />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};