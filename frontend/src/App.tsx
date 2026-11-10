import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { queryClient } from '@/lib/queryClient';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ProtectedRoute, PublicOnlyRoute } from '@/components/ProtectedRoute';
import { MainLayout } from '@/layouts/MainLayout';

import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/ResetPasswordPage';
import HomePage from '@/pages/HomePage';
import SearchPage from '@/pages/SearchPage';
import LibraryPage from '@/pages/LibraryPage';
import FavoritesPage from '@/pages/FavoritesPage';
import HistoryPage from '@/pages/HistoryPage';
import ArtistPage from '@/pages/ArtistPage';
import AlbumPage from '@/pages/AlbumPage';
import PlaylistPage from '@/pages/PlaylistPage';
import ProfilePage from '@/pages/ProfilePage';
import StudioPage from '@/pages/StudioPage';
import NotFoundPage from '@/pages/NotFoundPage';

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <BrowserRouter>
            <Toaster
              position="top-center"
              toastOptions={{
                style: {
                  background: 'rgb(var(--c-surface))',
                  color: 'rgb(var(--c-fg))',
                  border: '1px solid rgb(var(--c-fg) / 0.1)',
                },
              }}
            />
            <Routes>
              {/* Públicas (quem já está logado é redirecionado para o início) */}
              <Route element={<PublicOnlyRoute />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
              </Route>
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />

              {/* Protegidas — exigem sessão ativa */}
              <Route element={<ProtectedRoute />}>
                <Route element={<MainLayout />}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/search" element={<SearchPage />} />
                  <Route path="/library" element={<LibraryPage />} />
                  <Route path="/favorites" element={<FavoritesPage />} />
                  <Route path="/history" element={<HistoryPage />} />
                  <Route path="/artists/:id" element={<ArtistPage />} />
                  <Route path="/albums/:id" element={<AlbumPage />} />
                  <Route path="/playlists/:id" element={<PlaylistPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/studio" element={<StudioPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Route>
              </Route>
            </Routes>
          </BrowserRouter>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
