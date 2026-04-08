import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';

// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import UserLayout from './layouts/UserLayout';

// Public Pages
import HomePage from './pages/HomePage';
import ProvincePage from './pages/ProvincePage';
import LandmarkPage from './pages/LandmarkPage';

// Auth Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';

// User Pages
import NotebookPage from './pages/user/NotebookPage';
import LearningPage from './pages/user/LearningPage';
import FlashcardGame from './pages/user/FlashcardGame';
import QuizGame from './pages/user/QuizGame';
import MatchGame from './pages/user/MatchGame';
import SettingsPage from './pages/user/SettingsPage';

function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <ToastProvider>
            <Routes>
              
              {/* Auth Routes */}
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              </Route>

              {/* User Routes (Dashboard) */}
              <Route path="/user" element={<UserLayout />}>
                <Route index element={<Navigate to="/user/notebook" replace />} />
                <Route path="notebook" element={<NotebookPage />} />
                <Route path="learning" element={<LearningPage />} />
                <Route path="flashcard" element={<FlashcardGame />} />
                <Route path="quiz" element={<QuizGame />} />
                <Route path="match" element={<MatchGame />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>

              {/* Public Routes with MainLayout */}
              <Route element={<MainLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/province/:slug" element={<ProvincePage />} />
                <Route path="/province/:provinceSlug/:landmarkSlug" element={<LandmarkPage />} />
                <Route path="/provinces" element={<div className="p-20 text-center text-2xl font-bold">Danh sách tất cả tỉnh (Coming soon)</div>} />
              </Route>

            </Routes>
          </ToastProvider>
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}

export default App;