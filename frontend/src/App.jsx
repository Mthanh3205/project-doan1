import { useEffect } from 'react';
import { Toaster } from 'sonner';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

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
import FavoritesPage from './pages/FavoritesPage';
import StudyFavoriteFlashcard from './pages/StudyFavoriteFlashcard';
import ProgressPage from './pages/ProgressPage';
// import AdminPage from './pages/AdminPage';

import { DeckProvider } from './context/DeckContext';
//import admin
import AdminLayout from './components/admin/AdminLayout';
import DashboardOverview from './pages/admin/DashboardOverview';
import ManageUsers from './pages/admin/ManageUsers';
import ManageTopics from './pages/admin/ManageTopics';
import AdminSettings from './pages/admin/AdminSettings';
import ManageWords from './pages/admin/ManageWords';
import AiRoleplayPage from './pages/AiRoleplayPage';
//Login thì mới cho sử dụng chức năng trong web
import ProtectedRoute from './components/ProtectedRoute';
//Route bảo vệ admin
import AdminProtectedRoute from './components/AdminProtectedRoute';

//Cuộn mượt
import SmoothScroll from './components/SmoothScroll';
import ReviewsManager from './pages/admin/ReviewsManager';
function AppContent() {
  return (
    <AuthProvider>
      <DeckProvider>
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
                  <FavoritesPage />
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
            <Route
              path="/study/:deckId/roleplay"
              element={
                <ProtectedRoute>
                  <AiRoleplayPage />
                </ProtectedRoute>
              }
            />

            {/* admin */}
            <Route element={<AdminProtectedRoute />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<DashboardOverview />} />
                <Route path="users" element={<ManageUsers />} />
                <Route path="topics" element={<ManageTopics />} />
                <Route path="words" element={<ManageWords />} />
                <Route path="settings" element={<AdminSettings />} />
                <Route path="reviews" element={<ReviewsManager />} />
              </Route>
            </Route>
          </Routes>
        </div>
      </DeckProvider>
    </AuthProvider>
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
