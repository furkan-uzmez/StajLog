import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusCircle,
  BookOpen,
  ArrowRight,
  AlertTriangle,
  Sparkles,
  FileText,
  X,
} from 'lucide-react';
import { useEntries } from '../context/EntryContext';
import { StatsGrid } from '../components/StatsGrid';
import { EntryCard } from '../components/EntryCard';
import { ConfirmModal } from '../components/ConfirmModal';

export const DashboardPage: React.FC = () => {
  const { entries, deleteEntry, loadInitialData, storageError, clearStorageError } = useEntries();
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const targetEntry = useMemo(
    () => entries.find((e) => e.id === deleteTargetId),
    [entries, deleteTargetId]
  );

  const recentEntries = useMemo(() => {
    return [...entries]
      .sort((a, b) => {
        if (a.date !== b.date) {
          return b.date.localeCompare(a.date);
        }
        return b.dayNumber - a.dayNumber;
      })
      .slice(0, 3);
  }, [entries]);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Storage Error Warning Banner */}
      {storageError && (
        <div
          role="alert"
          className="flex items-start justify-between p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-amber-800 dark:text-amber-200"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
            <div>
              <p className="font-semibold text-sm">Depolama Uyarısı</p>
              <p className="text-sm mt-0.5">{storageError}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={clearStorageError}
            className="p-1 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-600 dark:text-amber-400 transition"
            aria-label="Uyarıyı kapat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Hero Welcome Section */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white p-6 sm:p-10 shadow-lg">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/15 backdrop-blur-md text-blue-100 border border-white/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Staj Defteri Takip Portalı</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-white">
            StajLog — Günlük Staj Takip Paneli
          </h1>

          <p className="text-blue-100 text-sm sm:text-base leading-relaxed">
            Staj sürecinizi, günlük kazanımlarınızı, çalıştığınız konuları ve harcanan süreleri
            düzenli kaydedin; raporlama ve defter teslimine hazır kalın.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              to="/entries/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm text-blue-700 bg-white hover:bg-blue-50 shadow-md hover:shadow-lg transition-all transform active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              Yeni Gün Ekle
            </Link>
            <Link
              to="/entries"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm text-white bg-white/15 hover:bg-white/25 border border-white/20 backdrop-blur-sm transition-all"
            >
              <BookOpen className="w-4 h-4" />
              Tüm Günlükleri İncele
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Ambient background decoration */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-12 -bottom-12 w-80 h-80 rounded-full bg-white/10 blur-2xl"
        />
      </section>

      {/* Empty State vs Content */}
      {entries.length === 0 ? (
        <section className="rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/50 p-10 sm:p-14 text-center">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4">
            <FileText className="w-8 h-8" />
          </div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
            Henüz Kayıtlı Staj Günü Bulunmuyor
          </h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            Staj deneyimlerinizi kaydetmeye başlamak için ilk gününüzü ekleyebilir veya test etmek için örnek staj verilerini yükleyebilirsiniz.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/entries/new"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition shadow-xs"
            >
              <PlusCircle className="w-4 h-4" />
              İlk Günü Ekle
            </Link>
            <button
              type="button"
              onClick={loadInitialData}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              Örnek Verileri Yükle
            </button>
          </div>
        </section>
      ) : (
        <>
          {/* Stats KPI and Tag Grid */}
          <section aria-label="Staj İstatistikleri">
            <StatsGrid entries={entries} />
          </section>

          {/* Recent Entries Section */}
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-gray-200 dark:border-gray-800 pb-3">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                  Son Eklenen Staj Günleri
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  Kronolojik olarak en yeni staj kayıtları
                </p>
              </div>

              <Link
                to="/entries"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition"
              >
                <span>Tümünü Gör ({entries.length})</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentEntries.map((entry) => (
                <EntryCard
                  key={entry.id}
                  entry={entry}
                  onDelete={(id) => setDeleteTargetId(id)}
                />
              ))}
            </div>
          </section>
        </>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTargetId)}
        title="Staj Gününü Sil"
        message={
          targetEntry
            ? `Gün ${targetEntry.dayNumber} — "${targetEntry.title}" kaydını silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`
            : 'Bu kaydı silmek istediğinize emin misiniz?'
        }
        confirmLabel="Kaydı Sil"
        cancelLabel="Vazgeç"
        isDanger={true}
        onConfirm={() => {
          if (deleteTargetId) {
            deleteEntry(deleteTargetId);
            setDeleteTargetId(null);
          }
        }}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
};

export default DashboardPage;
