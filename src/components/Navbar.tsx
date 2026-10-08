import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  GraduationCap,
  LayoutDashboard,
  BookOpen,
  PlusCircle,
  Settings,
  Sun,
  Moon,
  Menu,
  X,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      const stored = localStorage.getItem('stajlog_theme');
      if (stored) {
        return stored === 'dark';
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      try {
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
      } catch {
        return false;
      }
    }
  });

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Sync theme class on mount and when state changes
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem('stajlog_theme', isDarkMode ? 'dark' : 'light');
    } catch {
      // Silently fall back to current DOM theme if storage quota or permissions deny access
    }
  }, [isDarkMode]);

  const navLinks = [
    { to: '/', label: 'Gösterge Paneli', icon: LayoutDashboard, end: true },
    { to: '/entries', label: 'Günlükler', icon: BookOpen, end: true },
    { to: '/entries/new', label: 'Yeni Günlük', icon: PlusCircle, end: true },
    { to: '/settings', label: 'Ayarlar & Yedek', icon: Settings, end: true },
  ];

  const getLinkClasses = ({ isActive }: { isActive: boolean }) => {
    return `flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'bg-blue-600 text-white shadow-sm dark:bg-blue-500'
        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800'
    }`;
  };

  const getMobileLinkClasses = ({ isActive }: { isActive: boolean }) => {
    return `flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-colors ${
      isActive
        ? 'bg-blue-600 text-white dark:bg-blue-500'
        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800'
    }`;
  };

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/95 backdrop-blur-md dark:border-gray-800 dark:bg-gray-900/95 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & App Brand */}
          <Link
            to="/"
            className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg p-1"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-300">
                StajLog
              </span>
              <span className="text-[11px] font-medium text-gray-400 dark:text-gray-400 -mt-1 tracking-wide">
                Staj Takip ve Günlüğü
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1.5">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={getLinkClasses}
                  end={link.end}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </NavLink>
              );
            })}
          </div>

          {/* Right actions: Dark Mode Toggle & Mobile Menu Button */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsDarkMode((prev) => !prev)}
              title={isDarkMode ? 'Aydınlık moda geç' : 'Karanlık moda geç'}
              aria-label={isDarkMode ? 'Aydınlık moda geç' : 'Karanlık moda geç'}
              className="p-2.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5 text-amber-400" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600" />
              )}
            </button>

            {/* Mobile hamburger menu toggle */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              aria-expanded={isMobileMenuOpen}
              aria-label="Menüyü aç/kapat"
              className="md:hidden p-2.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer / Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 pt-3 pb-5 space-y-1 shadow-lg transition-all">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={getMobileLinkClasses}
                end={link.end}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Icon className="w-5 h-5" />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
