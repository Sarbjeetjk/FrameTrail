import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useMedia } from '../hooks/useMedia';
import {
  Camera,
  Film,
  Video,
  LayoutDashboard,
  LogOut,
  LogIn,
  UserPlus,
  UploadCloud,
  Search,
  Menu,
  X,
  MessageSquare,
  User,
} from 'lucide-react';
import { UploadModal } from './UploadModal';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { searchQuery, setSearchQuery, fetchMedia } = useMedia();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [navVisible, setNavVisible] = useState(true);
  const lastScrollY = useRef(0);
  const location = useLocation();

  // Auto hide navbar on scroll down, show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY <= 15) {
        setNavVisible(true);
      } else if (currentScrollY > lastScrollY.current + 8) {
        // Scrolling down -> auto hide navbar
        setNavVisible(false);
      } else if (currentScrollY < lastScrollY.current - 8) {
        // Scrolling up -> reveal navbar
        setNavVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMedia({ search: searchQuery });
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <header
        className={`sticky top-0 z-40 glass-nav shadow-sm transition-all duration-350 ease-in-out transform ${
          navVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Centered Brand Logo */}
          <div className="flex items-center justify-center">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 border-2 border-indigo-200 shadow-md shadow-indigo-500/20 overflow-hidden group-hover:scale-105 transition-transform">
                <img
                  src="/IMG_20240423_000718.png"
                  alt="FrameTrail Logo"
                  className="w-full h-full object-cover object-center"
                />
              </div>
              <span className="font-display font-black text-2xl text-slate-900 tracking-tight">
                Frame<span className="text-indigo-600">Trail</span>
              </span>
            </Link>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md relative mx-auto">
            <input
              type="text"
              placeholder="Search 500+ photos, videos & movies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100/90 border border-slate-200 rounded-full py-2 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-inner"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          </form>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 font-medium text-sm">
            {!isAdmin && (
              <Link
                to="/contact"
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all ${
                  isActive('/contact')
                    ? 'bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <MessageSquare className="w-4 h-4 text-indigo-600" />
                <span>Contact Us</span>
              </Link>
            )}

            {isAdmin && (
              <Link
                to="/admin"
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all ${
                  isActive('/admin')
                    ? 'bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-indigo-600" />
                <span>Admin Panel</span>
              </Link>
            )}
          </nav>

          {/* User Controls */}
          <div className="hidden lg:flex items-center gap-3">
            {isAdmin && (
              <button
                onClick={() => setUploadModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold text-xs shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30 hover:opacity-95 transition-all"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Upload Asset</span>
              </button>
            )}

            {isAuthenticated ? (
              <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
                <Link to="/profile" className="flex items-center gap-2 group cursor-pointer hover:opacity-90 transition-opacity" title="View & Edit Profile">
                  <img
                    src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                    alt={user?.name}
                    className="w-8 h-8 rounded-full border border-indigo-300 object-cover shadow-sm flex-shrink-0 group-hover:scale-105 transition-transform"
                  />
                  <div className="text-xs">
                    <div className="font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors whitespace-nowrap">{user?.name}</div>
                    <div className="text-indigo-600 font-medium capitalize text-[10px]">{user?.role}</div>
                  </div>
                </Link>
                <button
                  onClick={logout}
                  title="Logout"
                  className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="flex items-center gap-1 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-indigo-600 transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Login</span>
                </Link>
                <Link
                  to="/register"
                  className="flex items-center gap-1 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-sm"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Register</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-700 hover:text-indigo-600"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-3 shadow-lg">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search gallery..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-100 border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-sm text-slate-800"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </form>

            <nav className="flex flex-col space-y-1 pt-2">
              {!isAdmin && (
                <Link
                  to="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 hover:bg-indigo-50 hover:text-indigo-600"
                >
                  <MessageSquare className="w-4 h-4 text-indigo-600" />
                  <span>Contact Us</span>
                </Link>
              )}
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 hover:bg-indigo-50 hover:text-indigo-600"
                >
                  <LayoutDashboard className="w-4 h-4 text-indigo-600" />
                  <span>Admin Panel</span>
                </Link>
              )}
            </nav>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
              {isAuthenticated ? (
                <div className="flex items-center justify-between w-full">
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 p-1 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                    title="Open Profile Settings"
                  >
                    <img
                      src={user?.avatar}
                      alt={user?.name}
                      className="w-9 h-9 rounded-full border border-indigo-400 object-cover"
                    />
                    <div>
                      <div className="text-xs font-extrabold text-slate-800 flex items-center gap-1">
                        <span>{user?.name}</span>
                        <User className="w-3 h-3 text-indigo-600" />
                      </div>
                      <div className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider">
                        Edit Profile ({user?.role})
                      </div>
                    </div>
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 rounded-lg"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3 w-full">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 text-center py-2 text-xs font-semibold bg-slate-100 text-slate-700 rounded-xl"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 text-center py-2 text-xs font-semibold bg-indigo-600 text-white rounded-xl"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {isAdmin && uploadModalOpen && (
        <UploadModal isOpen={uploadModalOpen} onClose={() => setUploadModalOpen(false)} />
      )}
    </>
  );
};
