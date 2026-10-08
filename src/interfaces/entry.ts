/**
 * StajLog Entry Interfaces and Types
 * Defines data structures for internship log entries, forms, stats, and backups.
 */

export type EntryStatus = 'completed' | 'in_progress' | 'planned';

export interface Entry {
  /** Unique identifier (RFC 4122 UUID v4) */
  id: string;
  /** Calendar date in YYYY-MM-DD format */
  date: string;
  /** Day sequence number (1-365) */
  dayNumber: number;
  /** Primary title / main activity summary (3-120 chars) */
  title: string;
  /** List of sub-topics covered during the day */
  topics: string[];
  /** Normalized tags (lowercase, '#' prefixed, unique) */
  tags: string[];
  /** Hours spent (0-24) */
  hours: number;
  /** Detailed internship notes, achievements, learnings (max 5000 chars) */
  notes: string;
  /** Daily progress status */
  status: EntryStatus;
  /** ISO 8601 creation timestamp */
  createdAt: string;
  /** ISO 8601 last update timestamp */
  updatedAt: string;
}

export interface EntryFormData {
  date: string;
  dayNumber: number;
  title: string;
  topicsText: string;
  tagsText: string;
  hours: number;
  notes: string;
  status: EntryStatus;
}

export interface ExportPayload {
  version: 1;
  exportedAt: string;
  entries: Entry[];
}

export interface FilterOptions {
  search: string;
  selectedTags: string[];
  statusFilter: string;
}

export interface TagCount {
  tag: string;
  count: number;
}

export interface Stats {
  totalDays: number;
  totalHours: number;
  completedDays: number;
  tagCounts: TagCount[];
  recentEntries: Entry[];
}
