import React, { useState, useEffect, useRef } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { WatchlistProvider } from './contexts/WatchlistContext';
import { PlayerProvider, usePlayer } from './contexts/PlayerContext';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { SearchModal } from './components/SearchModal';
import { HomePage } from './pages/HomePage';
import { BrowsePage } from './pages/BrowsePage';
import { SearchPage } from './pages/SearchPage';
import { MyListPage } from './pages/MyListPage';
import { MovieDetailPage } from './pages/MovieDetailPage';
import { PlayerPage } from './pages/PlayerPage';
import Lenis from '@studio-freight/lenis';
import './App.css';

// Скролл в начало при каждом переходе
function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    // Останавливаем Lenis и сбрасываем скролл напрямую через DOM
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname, hash]);
  return null;
}

function AppInner() {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const { isPlayerOpen } = usePlayer();
  const lenisRef = useRef(null);
  const rafIdRef = useRef(null);
  const location = useLocation();

  const isPlayerPage = location.pathname.startsWith('/player/');

  // Сбрасываем позицию Lenis при каждом переходе
  useEffect(() => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true });
    }
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [location.pathname, location.hash]);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smooth: true,
    });
    lenisRef.current = lenis;

    function raf(time) {
      lenis.raf(time);
      rafIdRef.current = requestAnimationFrame(raf);
    }
    rafIdRef.current = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafIdRef.current);
      lenis.destroy();
    };
  }, []);

  useEffect(() => {
    if (!lenisRef.current) return;
    if (isPlayerOpen || isPlayerPage) {
      lenisRef.current.stop();
      cancelAnimationFrame(rafIdRef.current);
    } else {
      lenisRef.current.start();
      function raf(time) {
        lenisRef.current.raf(time);
        rafIdRef.current = requestAnimationFrame(raf);
      }
      rafIdRef.current = requestAnimationFrame(raf);
    }
  }, [isPlayerOpen, isPlayerPage]);

  return (
    <div className="App min-h-screen">
      <ScrollToTop />

      {/* Navbar скрыт на странице плеера */}
      {!isPlayerPage && (
        <Navbar
          onSearchClick={() => setSearchModalOpen(true)}
          onAuthClick={() => setAuthModalOpen(true)}
        />
      )}

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/browse" element={<BrowsePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/my-list" element={<MyListPage />} />
        <Route path="/detail/:mediaType/:id" element={<MovieDetailPage />} />
        <Route path="/player/:mediaType/:id" element={<PlayerPage />} />
      </Routes>

      {!isPlayerPage && (
        <>
          <AuthModal
            isOpen={authModalOpen}
            onClose={() => setAuthModalOpen(false)}
          />
          <SearchModal
            isOpen={searchModalOpen}
            onClose={() => setSearchModalOpen(false)}
          />
        </>
      )}
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <WatchlistProvider>
          <PlayerProvider>
            <HashRouter>
              <AppInner />
            </HashRouter>
          </PlayerProvider>
        </WatchlistProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
