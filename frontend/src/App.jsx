import { useEffect } from 'react';
import Lenis from '@studio-freight/lenis';
import { Toaster } from 'sonner';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';

// Import pages
import HomePage from './pages/HomePage';
import NotFound from './pages/NotFound';
import Auth from './pages/Auth';
import Studyflashcard from './pages/Studyflashcard';
import Account from './pages/Account';
import TopicsPage from './pages/TopicsPage';
import VocabularyPage from './pages/VocabularyPage';
import Test from './pages/test';
import CreateVocabulary from './pages/CreateVocabulary';
import FavoritePage from './pages/FavoritePage';
import StudyFavoriteFlashcard from './pages/StudyFavoriteFlashcard';

function AppContent() {
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === '/CreateVocabulary') {
      if (window.lenisInstance) {
        window.lenisInstance.destroy();
        window.lenisInstance = null;
      }
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';

      return;
    }

    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';

    const lenis = new Lenis({
      lerp: 0.03,
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      smoothTouch: false,
    });

    window.lenisInstance = lenis;

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      if (lenis) {
        lenis.destroy();
        window.lenisInstance = null;
      }
    };
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-black text-white transition-colors duration-300 dark:bg-stone-100">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/study/:deckId" element={<Studyflashcard />} />
        <Route path="/account" element={<Account />} />
        <Route
          path="/topics"
          element={
            // <ProtectedRoute>
            <TopicsPage />
            // </ProtectedRoute>
          }
        />
        <Route path="/vocabulary/:deckId" element={<VocabularyPage />} />
        <Route
          path="/test"
          element={
            // <ProtectedRoute>
            <Test />
            // </ProtectedRoute>
          }
        />
        <Route
          path="/CreateVocabulary"
          element={
            // <ProtectedRoute>
            <CreateVocabulary />
            // </ProtectedRoute>
          }
        />
        <Route
          path="/favorites"
          element={
            // <ProtectedRoute>
            <FavoritePage />
            // </ProtectedRoute>
          }
        />
        <Route
          path="/study-favorites/:deckId"
          element={
            // <ProtectedRoute>
            <StudyFavoriteFlashcard />
            // </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <>
      <Toaster />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </>
  );
}

export default App;
