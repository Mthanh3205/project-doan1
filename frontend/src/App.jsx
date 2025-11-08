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
import ProgressPage from './pages/ProgressPage';
import AdminUserList from './pages/AdminUserList';
import AdminProtectedRoute from './components/AdminProtectedRoute';
import AdminPage from './pages/AdminPage';

//Login thì mới cho sử dụng chức năng trong web
import ProtectedRoute from './components/ProtectedRoute';
//Cuộn mượt
import SmoothScroll from './components/SmoothScroll';
function AppContent() {
  return (
    <div className="min-h-screen bg-transparent text-white transition-colors duration-300">
      <SmoothScroll />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/study/:deckId/:mode" element={<Studyflashcard />} />
        <Route path="/account" element={<Account />} />
        <Route
          path="/topics"
          element={
            <ProtectedRoute>
              <TopicsPage />
            </ProtectedRoute>
          }
        />
        <Route path="/vocabulary/:deckId" element={<VocabularyPage />} />
        <Route
          path="/test"
          element={
            <ProtectedRoute>
              <Test />
            </ProtectedRoute>
          }
        />
        <Route
          path="/CreateVocabulary"
          element={
            <ProtectedRoute>
              <CreateVocabulary />
            </ProtectedRoute>
          }
        />
        <Route
          path="/favorites"
          element={
            <ProtectedRoute>
              <FavoritePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/study-favorites/:deckId"
          element={
            <ProtectedRoute>
              <StudyFavoriteFlashcard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/progress"
          element={
            <ProtectedRoute>
              <ProgressPage />
            </ProtectedRoute>
          }
        />

        {/* admin */}
        <Route
          path="/admin"
          element={
            <AdminProtectedRoute>
              <AdminPage />
            </AdminProtectedRoute>
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
      <AppContent />
    </>
  );
}

export default App;
