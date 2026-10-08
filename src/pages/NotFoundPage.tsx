import React from 'react';
import { Link } from 'react-router-dom';
import { Home, BookOpen, AlertOctagon } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center py-12 px-4 animate-fadeIn">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700/80 p-8 sm:p-10 text-center shadow-xs">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-6 shadow-inner">
          <AlertOctagon className="w-8 h-8" />
        </div>

        <span className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 mb-3">
          404 Hatası
        </span>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Sayfa Bulunamadı
        </h1>

        <p className="mt-3 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
          Aradığınız sayfa mevcut değil, adı değiştirilmiş veya geçici olarak kullanımdan kaldırılmış olabilir.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition active:scale-95"
          >
            <Home className="w-4 h-4" />
            Ana Sayfaya Dön
          </Link>
          <Link
            to="/entries"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm text-gray-700 dark:text-gray-200 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition"
          >
            <BookOpen className="w-4 h-4" />
            Günlüklere Git
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
