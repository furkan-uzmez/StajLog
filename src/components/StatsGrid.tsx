import React, { useMemo } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Tags,
  Hash,
} from 'lucide-react';
import type { Entry } from '../interfaces/entry';

export interface StatsGridProps {
  entries: Entry[];
}

export const StatsGrid: React.FC<StatsGridProps> = ({ entries }) => {
  const stats = useMemo(() => {
    const totalDays = entries.length;
    const completedDays = entries.filter((e) => e.status === 'completed').length;
    const totalCompletedHours = entries
      .filter((e) => e.status === 'completed')
      .reduce((sum, e) => sum + e.hours, 0);

    // Compute tag frequency
    const tagCountMap = new Map<string, number>();
    for (const entry of entries) {
      if (Array.isArray(entry.tags)) {
        for (const tag of entry.tags) {
          const normalized = tag.toLowerCase().trim();
          if (normalized) {
            tagCountMap.set(normalized, (tagCountMap.get(normalized) || 0) + 1);
          }
        }
      }
    }

    const sortedTags = Array.from(tagCountMap.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const maxTagCount = sortedTags.length > 0 ? sortedTags[0].count : 1;
    const completionRate =
      totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;

    return {
      totalDays,
      completedDays,
      totalCompletedHours,
      completionRate,
      topTags: sortedTags,
      maxTagCount,
    };
  }, [entries]);

  return (
    <div className="space-y-6">
      {/* 3 Main KPI Metrics in Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Metric 1: Toplam Gün */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700/80 p-5 shadow-xs flex items-center gap-4 transition-all hover:shadow-md">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Toplam Gün
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
                {stats.totalDays}
              </span>
              <span className="text-xs text-gray-400 dark:text-gray-400">
                Kayıtlı Gün
              </span>
            </div>
          </div>
        </div>

        {/* Metric 2: Tamamlanan Gün */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700/80 p-5 shadow-xs flex items-center gap-4 transition-all hover:shadow-md">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Tamamlanan Gün
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
                {stats.completedDays}
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                %{stats.completionRate}
              </span>
            </div>
          </div>
        </div>

        {/* Metric 3: Toplam Staj Saati */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700/80 p-5 shadow-xs flex items-center gap-4 transition-all hover:shadow-md sm:col-span-2 lg:col-span-1">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Toplam Staj Saati
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
                {stats.totalCompletedHours}
              </span>
              <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                Saat (Tamamlanan)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Top 5 Tags Section with Progress Bars */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700/80 p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-700/60">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Tags className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">
              En Çok Kullanılan İlk 5 Etiket
            </h3>
          </div>
          <span className="text-xs text-gray-400 dark:text-gray-400">
            Frekans ve Dağılım
          </span>
        </div>

        {stats.topTags.length === 0 ? (
          <div className="py-6 text-center text-sm text-gray-400 dark:text-gray-400">
            Henüz etiket eklenmiş staj günlüğü bulunmuyor.
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {stats.topTags.map((item, index) => {
              const percentage = Math.round((item.count / stats.maxTagCount) * 100);
              return (
                <div key={item.tag} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="inline-flex items-center gap-1 text-gray-700 dark:text-gray-200">
                      <span className="w-4 text-center font-bold text-gray-400 dark:text-gray-400">
                        #{index + 1}
                      </span>
                      <Hash className="w-3 h-3 text-blue-500 opacity-70" />
                      <span>{item.tag.replace(/^#/, '')}</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-bold text-[11px]">
                      {item.count} gün
                    </span>
                  </div>
                  {/* Visual progress bar */}
                  <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500"
                      style={{ width: `${Math.max(percentage, 8)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsGrid;
