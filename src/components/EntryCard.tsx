import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  CheckCircle2,
  CalendarClock,
  BookOpen,
  Edit3,
  Trash2,
  ChevronDown,
  ChevronUp,
  Hash,
} from 'lucide-react';
import type { Entry, EntryStatus } from '../interfaces/entry';

export interface EntryCardProps {
  entry: Entry;
  onDelete: (id: string) => void;
}

const STATUS_CONFIG: Record<
  EntryStatus,
  {
    label: string;
    badgeClass: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  completed: {
    label: 'Tamamlandı',
    badgeClass:
      'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60',
    icon: CheckCircle2,
  },
  in_progress: {
    label: 'Devam Ediyor',
    badgeClass:
      'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60',
    icon: Clock,
  },
  planned: {
    label: 'Planlandı',
    badgeClass:
      'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800/60',
    icon: CalendarClock,
  },
};

export const EntryCard: React.FC<EntryCardProps> = ({ entry, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const statusInfo = STATUS_CONFIG[entry.status] || STATUS_CONFIG.planned;
  const StatusIcon = statusInfo.icon;
  const hasLongNotes = entry.notes && (entry.notes.length > 220 || entry.notes.includes('\n'));

  // Format date display (e.g. 2026-10-08 -> 8 Ekim 2026 if valid)
  const formattedDate = (() => {
    try {
      const parts = entry.date.split('-');
      if (parts.length === 3) {
        const year = Number(parts[0]);
        const month = Number(parts[1]) - 1;
        const day = Number(parts[2]);
        const d = new Date(Date.UTC(year, month, day));
        return d.toLocaleDateString('tr-TR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          timeZone: 'UTC',
        });
      }
    } catch {
      // Fallback to raw string
    }
    return entry.date;
  })();

  return (
    <article className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700/80 shadow-xs hover:shadow-md transition-all duration-200 p-5 sm:p-6 flex flex-col justify-between">
      <div>
        {/* Top Header: Day Badge, Date, Hours & Status */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-gray-100 dark:border-gray-700/50">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200">
              Gün {entry.dayNumber}
            </span>
            <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formattedDate}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200">
              <Clock className="w-3 h-3 text-gray-500 dark:text-gray-400" />
              <span>{entry.hours} Saat</span>
            </span>
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusInfo.badgeClass}`}
            >
              <StatusIcon className="w-3.5 h-3.5" />
              <span>{statusInfo.label}</span>
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className="mt-3.5 text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug">
          {entry.title}
        </h3>

        {/* Topics Covered */}
        {entry.topics.length > 0 && (
          <div className="mt-3 flex items-start gap-1.5">
            <BookOpen className="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0 mt-0.5" />
            <div className="flex flex-wrap gap-1.5">
              {entry.topics.map((topic, idx) => (
                <span
                  key={`${topic}-${idx}`}
                  className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700/60 dark:text-gray-300"
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Notes (with expand/collapse if long) */}
        {entry.notes && (
          <div className="mt-3.5 text-sm text-gray-600 dark:text-gray-300 bg-gray-50/70 dark:bg-gray-900/40 rounded-lg p-3 border border-gray-100 dark:border-gray-800">
            <p
              className={`whitespace-pre-line leading-relaxed ${
                !isExpanded && hasLongNotes ? 'line-clamp-3' : ''
              }`}
            >
              {entry.notes}
            </p>
            {hasLongNotes && (
              <button
                type="button"
                onClick={() => setIsExpanded((prev) => !prev)}
                className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 focus:outline-none"
              >
                {isExpanded ? (
                  <>
                    <span>Gizle</span>
                    <ChevronUp className="w-3.5 h-3.5" />
                  </>
                ) : (
                  <>
                    <span>Devamını Gör</span>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            )}
          </div>
        )}

        {/* Tags */}
        {entry.tags.length > 0 && (
          <div className="mt-3.5 flex flex-wrap gap-1.5 items-center">
            {entry.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-100 dark:border-blue-900/40"
              >
                <Hash className="w-3 h-3 opacity-60" />
                <span>{tag.replace(/^#/, '')}</span>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Card Footer Actions: Edit & Delete */}
      <div className="mt-5 pt-3.5 border-t border-gray-100 dark:border-gray-700/50 flex items-center justify-end gap-2">
        <Link
          to={`/entries/${entry.id}/edit`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 dark:text-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          title="Günlüğü Düzenle"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Düzenle</span>
        </Link>
        <button
          type="button"
          onClick={() => onDelete(entry.id)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 dark:text-red-400 dark:bg-red-950/40 dark:hover:bg-red-900/60 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
          title="Günlüğü Sil"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Sil</span>
        </button>
      </div>
    </article>
  );
};

export default EntryCard;
