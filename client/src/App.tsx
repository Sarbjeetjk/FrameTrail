import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { MediaProvider } from './context/MediaContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { IntroLoader } from './components/IntroLoader';
import { PhotosPage } from './pages/PhotosPage';
import { VideosPage } from './pages/VideosPage';
import { MoviesPage } from './pages/MoviesPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { MediaDetailPage } from './pages/MediaDetailPage';
import { ContactUsPage } from './pages/ContactUsPage';
import { ProfilePage } from './pages/ProfilePage';
import { MySpacePage } from './pages/MySpacePage';
import { WelcomeModal } from './components/WelcomeModal';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <MediaProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <IntroLoader />
          <div className="flex flex-col min-h-screen bg-[#090d16] text-slate-100 selection:bg-indigo-500 selection:text-white">
            <WelcomeModal />
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<PhotosPage />} />
                <Route path="/photos" element={<PhotosPage />} />
                <Route path="/videos" element={<VideosPage />} />
                <Route path="/movies" element={<MoviesPage />} />
                <Route path="/contact" element={<ContactUsPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/my-space" element={<MySpacePage />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin-login" element={<AdminLoginPage />} />
                <Route path="/user-login" element={<LoginPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/media/:id" element={<MediaDetailPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </MediaProvider>
    </AuthProvider>
  );
};

export default App;
