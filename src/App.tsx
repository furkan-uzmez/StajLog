import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { EntryProvider } from './context/EntryContext';
import { Navbar } from './components/Navbar';
import {
  DashboardPage,
  EntriesPage,
  EntryFormPage,
  SettingsPage,
  NotFoundPage,
} from './pages';

const CURRENT_YEAR = new Date().getFullYear();

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <EntryProvider>
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
          <Navbar />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/entries" element={<EntriesPage />} />
              <Route path="/entries/new" element={<EntryFormPage />} />
              <Route path="/entries/:id/edit" element={<EntryFormPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          <footer className="border-t border-gray-200 dark:border-gray-800 py-6 text-center text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900/60 transition-colors">
            <div className="max-w-7xl mx-auto px-4">
              <p>
                StajLog — Günlük Staj Takip & Yönetim Portalı &copy; {CURRENT_YEAR}
              </p>
            </div>
          </footer>
        </div>
      </EntryProvider>
    </BrowserRouter>
  );
};

export default App;
