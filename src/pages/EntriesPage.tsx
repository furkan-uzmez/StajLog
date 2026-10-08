import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  PlusCircle,
  Filter,
  Tags,
  X,
  FileQuestion,
  Calendar,
  CheckCircle2,
  Clock,
  CalendarClock,
  RotateCcw,
} from 'lucide-react';
import { useEntries } from '../context/EntryContext';
import { useDebounce } from '../hooks/useDebounce';
import { EntryCard } from '../components/EntryCard';
import { ConfirmModal } from '../components/ConfirmModal';

const STATUS_FILTERS: { key: string; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: 'all', label: 'Tümü', icon: Filter },
  { key: 'completed', label: 'Tamamlandı', icon: CheckCircle2 },
  { key: 'in_progress', label: 'Devam Ediyor', icon: Clock },
  { key: 'planned', label: 'Planlandı', icon: CalendarClock },
];

export const EntriesPage: React.FC = () => {
  const { entries, deleteEntry } = useEntries();

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Debounced search query (250ms)
  const debouncedSearch = useDebounce(searchQuery, 250);

  // Derive unique tags and counts across all entries
  const availableTags = useMemo(() => {
    const counts = new Map<string, number>();
    for (const entry of entries) {
      for (const tag of entry.tags) {
        counts.set(tag, (counts.get(tag) || 0) + 1);
      }
    }
    return Array.from(counts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
  }, [entries]);

  // Status counts for badge tabs
  const statusCounts = useMemo(() => {
    return {
      all: entries.length,
      completed: entries.filter((e) => e.status === 'completed').length,
      in_progress: entries.filter((e) => e.status === 'in_progress').length,
      planned: entries.filter((e) => e.status === 'planned').length,
    };
  }, [entries]);

  // Multi-criteria filter & chronological descending sort
  const filteredEntries = useMemo(() => {
    const query = debouncedSearch.toLowerCase().trim();

    return entries
      .filter((entry) => {
        // Status filter
        if (statusFilter !== 'all' && entry.status !== statusFilter) {
          return false;
        }

        // Tag filter (entry must include all selected tags)
        if (selectedTags.length > 0) {
          const hasAllTags = selectedTags.every((t) => entry.tags.includes(t));
          if (!hasAllTags) {
            return false;
          }
        }

        // Search in title, notes, topics, tags
        if (query.length > 0) {
          const inTitle = entry.title.toLowerCase().includes(query);
          const inNotes = entry.notes.toLowerCase().includes(query);
          const inTopics = entry.topics.some((topic) =>
            topic.toLowerCase().includes(query)
          );
          const inTags = entry.tags.some((tag) =>
            tag.toLowerCase().includes(query)
          );
          if (!inTitle && !inNotes && !inTopics && !inTags) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        // Chronological descending sort by internship date, then dayNumber
        if (a.date !== b.date) {
          return b.date.localeCompare(a.date);
        }
        return b.dayNumber - a.dayNumber;
      });
  }, [entries, debouncedSearch, statusFilter, selectedTags]);

  const targetEntry = useMemo(
    () => entries.find((e) => e.id === deleteTargetId),
    [entries, deleteTargetId]
  );

  const hasActiveFilters = searchQuery.length > 0 || statusFilter !== 'all' || selectedTags.length > 0;

  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setSelectedTags([]);
  };

  const handleToggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header with Title and Quick Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Staj Günlükleri
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Toplam {entries.length} staj günü kayıtlı
            {filteredEntries.length !== entries.length && ` (Filtrelenen: ${filteredEntries.length})`}
          </p>
        </div>

        <Link
          to="/entries/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          Yeni Gün Ekle
        </Link>
      </div>

      {/* Filter Toolbar Container */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700/80 p-4 sm:p-5 shadow-xs space-y-4">
        {/* Row 1: Search Bar & Reset Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Başlık, notlar veya konularda ara..."
              className="w-full pl-10 pr-9 py-2 rounded-xl text-sm border border-gray-200 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-900/60 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                aria-label="Aramayı temizle"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700/70 dark:hover:bg-gray-700 transition shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Filtreleri Sıfırla
            </button>
          )}
        </div>

        {/* Row 2: Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-gray-100 dark:border-gray-700/50">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Durum:
          </span>
          {STATUS_FILTERS.map((tab) => {
            const Icon = tab.icon;
            const isSelected = statusFilter === tab.key;
            const count = statusCounts[tab.key as keyof typeof statusCounts] ?? 0;

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setStatusFilter(tab.key)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-gray-100 dark:bg-gray-700/60 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                <span
                  className={`ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-semibold ${
                    isSelected
                      ? 'bg-blue-700 text-white'
                      : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Row 3: Tag Filtering Bar (if tags exist) */}
        {availableTags.length > 0 && (
          <div className="pt-2 border-t border-gray-100 dark:border-gray-700/50 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Tags className="w-3 h-3" /> Etiketler:
              </span>
              {selectedTags.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedTags([])}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Etiketleri Temizle ({selectedTags.length})
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5">
              {availableTags.map(({ tag, count }) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleToggleTag(tag)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition ${
                      isSelected
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200 ring-1 ring-blue-500'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700/50 dark:text-gray-300 dark:hover:bg-gray-700'
                    }`}
                  >
                    <span>{tag}</span>
                    <span className="text-[10px] opacity-75">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Content Section: List or Empty States */}
      {entries.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/40 p-12 text-center">
          <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-3" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Kayıtlı Staj Günü Bulunamadı
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
            İlk staj gününüzü oluşturarak staj defterinizi doldurmaya hemen başlayabilirsiniz.
          </p>
          <div className="mt-5">
            <Link
              to="/entries/new"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition shadow-xs"
            >
              <PlusCircle className="w-4 h-4" />
              Yeni Gün Ekle
            </Link>
          </div>
        </div>
      ) : filteredEntries.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700/80 bg-white dark:bg-gray-800/40 p-12 text-center">
          <FileQuestion className="w-12 h-12 mx-auto text-gray-400 mb-3" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Arama Kriterlerine Uygun Günlük Bulunamadı
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            Arama sorgunuz, seçilen durum veya etiket filtreleri hiçbir staj günüyle eşleşmedi.
          </p>
          <div className="mt-5">
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition"
            >
              <RotateCcw className="w-4 h-4" />
              Filtreleri Temizle
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEntries.map((entry) => (
            <EntryCard
              key={entry.id}
              entry={entry}
              onDelete={(id) => setDeleteTargetId(id)}
            />
          ))}
        </div>
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

export default EntriesPage;
