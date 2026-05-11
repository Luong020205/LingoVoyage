import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { SocketProvider } from './context/SocketContext'; // Thêm SocketProvider

// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import UserLayout from './layouts/UserLayout';
import AdminLayout from './layouts/AdminLayout';

// Components
import ProtectedRoute from './components/auth/ProtectedRoute';

// Public Pages
import HomePage from './pages/HomePage';
import ProvincePage from './pages/ProvincePage';
import ProvincesPage from './pages/ProvincesPage';
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
import FriendsPage from './pages/user/FriendsPage';
import SettingsPage from './pages/user/SettingsPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProvincesPage from './pages/admin/AdminProvincesPage';
import AdminLandmarksPage from './pages/admin/AdminLandmarksPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LanguageProvider>
          <SocketProvider>
            <ToastProvider>
              <Routes>
              
              {/* Auth Routes */}
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              </Route>

              {/* User Routes (Dashboard) */}
              <Route path="/user" element={<ProtectedRoute><UserLayout /></ProtectedRoute>}>
                <Route index element={<Navigate to="/user/notebook" replace />} />
                <Route path="notebook" element={<NotebookPage />} />
                <Route path="learning" element={<LearningPage />} />
                <Route path="flashcard" element={<FlashcardGame />} />
                <Route path="quiz" element={<QuizGame />} />
                <Route path="match" element={<MatchGame />} />
                <Route path="friends" element={<FriendsPage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>

              {/* Admin Routes */}
              <Route path="/admin" element={<ProtectedRoute role="admin"><AdminLayout /></ProtectedRoute>}>
                <Route index element={<AdminDashboard />} />
                <Route path="provinces" element={<AdminProvincesPage />} />
                <Route path="landmarks" element={<AdminLandmarksPage />} />
                <Route path="users" element={<AdminUsersPage />} />
              </Route>

              {/* Public Routes with MainLayout */}
              <Route element={<MainLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/province/:slug" element={<ProvincePage />} />
                <Route path="/province/:provinceSlug/:landmarkSlug" element={<LandmarkPage />} />
                <Route path="/provinces" element={<ProvincesPage />} />
              </Route>

              </Routes>
            </ToastProvider>
          </SocketProvider>
        </LanguageProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;