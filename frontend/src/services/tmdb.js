import axios from 'axios';

const API_KEY = process.env.REACT_APP_TMDB_API_KEY;
const BASE_URL = process.env.REACT_APP_TMDB_BASE_URL;
const IMAGE_BASE_URL = process.env.REACT_APP_TMDB_IMAGE_BASE_URL;

const tmdbApi = axios.create({
  baseURL: BASE_URL,
  params: {
    api_key: API_KEY,
    language: 'ru-RU',
  },
});

export const getImageUrl = (path, size = 'w500') => {
  if (!path) return 'https://via.placeholder.com/500x750/1a1a1a/ffffff?text=No+Poster';
  return `${IMAGE_BASE_URL}/${size}${path}`;
};

export const getTrending = async (mediaType = 'all', timeWindow = 'week') => {
  const response = await tmdbApi.get(`/trending/${mediaType}/${timeWindow}`);
  return response.data;
};

export const getMoviesByCategory = async (category, page = 1) => {
  const response = await tmdbApi.get(`/movie/${category}`, { params: { page } });
  return response.data;
};

export const getTVByCategory = async (category, page = 1) => {
  const response = await tmdbApi.get(`/tv/${category}`, { params: { page } });
  return response.data;
};

export const searchMulti = async (query, page = 1) => {
  const response = await tmdbApi.get('/search/multi', {
    params: { query, page },
  });
  return response.data;
};

export const getMovieDetails = async (movieId) => {
  const response = await tmdbApi.get(`/movie/${movieId}`, {
    params: {
      append_to_response: 'videos,credits,similar,recommendations,external_ids',
    },
  });
  return response.data;
};

export const getTVDetails = async (tvId) => {
  const response = await tmdbApi.get(`/tv/${tvId}`, {
    params: {
      append_to_response: 'videos,credits,similar,recommendations',
    },
  });
  return response.data;
};

export const getGenres = async (mediaType = 'movie') => {
  const response = await tmdbApi.get(`/genre/${mediaType}/list`);
  return response.data.genres;
};

export const discoverMovies = async (filters = {}, page = 1) => {
  const response = await tmdbApi.get('/discover/movie', {
    params: {
      page,
      sort_by: filters.sort_by || 'popularity.desc',
      with_genres: filters.genre_ids,
      year: filters.year,
      'vote_average.gte': filters.min_rating,
    },
  });
  return response.data;
};

export const discoverTV = async (filters = {}, page = 1) => {
  const response = await tmdbApi.get('/discover/tv', {
    params: {
      page,
      sort_by: filters.sort_by || 'popularity.desc',
      with_genres: filters.genre_ids,
      year: filters.year,
      'vote_average.gte': filters.min_rating,
    },
  });
  return response.data;
};

export const getTrailerUrl = (videos) => {
  if (!videos || !videos.results || videos.results.length === 0) return null;
  
  const trailer = videos.results.find(
    v => v.type === 'Trailer' && v.site === 'YouTube' && v.official
  ) || videos.results.find(
    v => v.type === 'Trailer' && v.site === 'YouTube'
  ) || videos.results.find(
    v => v.type === 'Teaser' && v.site === 'YouTube'
  );

  return trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null;
};

export const getTitle = (item) => {
  return item.title || item.name || 'Без названия';
};

export const getReleaseYear = (item) => {
  const date = item.release_date || item.first_air_date;
  return date ? new Date(date).getFullYear() : null;
};