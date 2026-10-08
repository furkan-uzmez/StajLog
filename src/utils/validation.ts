import type { Entry, EntryFormData, EntryStatus } from '../interfaces/entry';

/**
 * Validates whether a given string is a valid calendar date in YYYY-MM-DD format.
 * Uses Date.UTC to avoid timezone skew.
 */
export function isValidDateString(date: string): boolean {
  if (typeof date !== 'string') return false;
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(date)) return false;

  const [yearStr, monthStr, dayStr] = date.split('-');
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);

  if (isNaN(year) || isNaN(month) || isNaN(day)) return false;
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;

  const d = new Date(Date.UTC(year, month - 1, day));
  return (
    d.getUTCFullYear() === year &&
    d.getUTCMonth() === month - 1 &&
    d.getUTCDate() === day
  );
}

/**
 * Runtime type guard for Entry objects.
 * Validates all required fields, ranges, and types.
 */
export function isEntry(item: unknown): item is Entry {
  if (typeof item !== 'object' || item === null) return false;
  const candidate = item as Record<string, unknown>;

  // id: non-empty string
  if (typeof candidate.id !== 'string' || candidate.id.trim().length === 0) {
    return false;
  }

  // date: valid YYYY-MM-DD
  if (typeof candidate.date !== 'string' || !isValidDateString(candidate.date)) {
    return false;
  }

  // dayNumber: 1-365 positive integer
  if (
    typeof candidate.dayNumber !== 'number' ||
    !Number.isInteger(candidate.dayNumber) ||
    candidate.dayNumber < 1 ||
    candidate.dayNumber > 365
  ) {
    return false;
  }

  // title: 3-120 chars
  if (
    typeof candidate.title !== 'string' ||
    candidate.title.trim().length < 3 ||
    candidate.title.trim().length > 120
  ) {
    return false;
  }

  // topics: array of strings
  if (
    !Array.isArray(candidate.topics) ||
    !candidate.topics.every(t => typeof t === 'string')
  ) {
    return false;
  }

  // tags: array of strings
  if (
    !Array.isArray(candidate.tags) ||
    !candidate.tags.every(t => typeof t === 'string')
  ) {
    return false;
  }

  // hours: 0-24 finite number
  if (
    typeof candidate.hours !== 'number' ||
    !Number.isFinite(candidate.hours) ||
    candidate.hours < 0 ||
    candidate.hours > 24
  ) {
    return false;
  }

  // notes: string max 5000 chars
  if (typeof candidate.notes !== 'string' || candidate.notes.length > 5000) {
    return false;
  }

  // status: 'completed' | 'in_progress' | 'planned'
  if (
    candidate.status !== 'completed' &&
    candidate.status !== 'in_progress' &&
    candidate.status !== 'planned'
  ) {
    return false;
  }

  // createdAt & updatedAt: ISO strings
  if (
    typeof candidate.createdAt !== 'string' ||
    isNaN(Date.parse(candidate.createdAt))
  ) {
    return false;
  }

  if (
    typeof candidate.updatedAt !== 'string' ||
    isNaN(Date.parse(candidate.updatedAt))
  ) {
    return false;
  }

  return true;
}

/**
 * Runtime type guard for an array of Entry objects.
 * Verifies that the input is an array, every item conforms to Entry,
 * and all entry IDs are unique.
 */
export function isEntryArray(items: unknown): items is Entry[] {
  if (!Array.isArray(items)) return false;

  const seenIds = new Set<string>();
  for (const item of items) {
    if (!isEntry(item)) return false;
    if (seenIds.has(item.id)) return false;
    seenIds.add(item.id);
  }

  return true;
}

/**
 * Normalizes tags:
 * - lowercase
 * - strips whitespace
 * - ensures '#' prefix
 * - deduplicates
 */
export function normalizeTags(input: string | string[]): string[] {
  const rawList = Array.isArray(input)
    ? input
    : input.split(/[\s,]+/);

  const seen = new Set<string>();
  const result: string[] = [];

  for (const raw of rawList) {
    const cleaned = raw.trim().replace(/^#+/, '').trim().toLowerCase();
    if (cleaned.length > 0) {
      const tagged = `#${cleaned}`;
      if (!seen.has(tagged)) {
        seen.add(tagged);
        result.push(tagged);
      }
    }
  }

  return result;
}

/**
 * Normalizes topics:
 * - splits by newline or comma
 * - trims each topic
 * - filters out empty topics
 * - deduplicates preserving order
 */
export function normalizeTopics(input: string | string[]): string[] {
  const rawList = Array.isArray(input)
    ? input
    : input.split(/[\n,]+/);

  const seen = new Set<string>();
  const result: string[] = [];

  for (const raw of rawList) {
    const trimmed = raw.trim();
    if (trimmed.length > 0 && !seen.has(trimmed)) {
      seen.add(trimmed);
      result.push(trimmed);
    }
  }

  return result;
}

export interface FormValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  sanitized?: Omit<Entry, 'id' | 'createdAt' | 'updatedAt'>;
}

/**
 * Validates entry form inputs according to internship log rules:
 * - Title: 3-120 chars trimmed
 * - Date: valid YYYY-MM-DD
 * - DayNumber: 1-365 positive integer
 * - Hours: 0-24 finite number
 * - Notes: max 5000 chars
 * - Status: completed | in_progress | planned
 * - Tags & Topics: normalized and sanitized
 */
export function validateEntryForm(data: Partial<EntryFormData>): FormValidationResult {
  const errors: Record<string, string> = {};

  // Title: trim, min 3 max 120 chars
  const title = (data.title ?? '').trim();
  if (!title) {
    errors.title = 'Başlık alanı zorunludur.';
  } else if (title.length < 3) {
    errors.title = 'Başlık en az 3 karakter olmalıdır.';
  } else if (title.length > 120) {
    errors.title = 'Başlık en fazla 120 karakter olmalıdır.';
  }

  // Date: valid YYYY-MM-DD
  const date = (data.date ?? '').trim();
  if (!date) {
    errors.date = 'Tarih alanı zorunludur.';
  } else if (!isValidDateString(date)) {
    errors.date = 'Geçerli bir tarih seçiniz (YYYY-MM-DD formatında).';
  }

  // Day number: 1-365 positive integer
  const dayNumber = Number(data.dayNumber);
  if (data.dayNumber === undefined || data.dayNumber === null || String(data.dayNumber).trim() === '') {
    errors.dayNumber = 'Gün numarası zorunludur.';
  } else if (!Number.isInteger(dayNumber) || dayNumber < 1 || dayNumber > 365) {
    errors.dayNumber = 'Gün numarası 1 ile 365 arasında bir tam sayı olmalıdır.';
  }

  // Hours: 0-24 finite number
  const hours = Number(data.hours);
  if (data.hours === undefined || data.hours === null || String(data.hours).trim() === '') {
    errors.hours = 'Harcanan saat alanı zorunludur.';
  } else if (!Number.isFinite(hours) || hours < 0 || hours > 24) {
    errors.hours = 'Harcanan süre 0 ile 24 saat arasında olmalıdır.';
  }

  // Notes: optional, max 5000 chars
  const notes = (data.notes ?? '').trim();
  if (notes.length > 5000) {
    errors.notes = 'Notlar en fazla 5000 karakter olabilir.';
  }

  // Status: valid EntryStatus
  const validStatuses: EntryStatus[] = ['completed', 'in_progress', 'planned'];
  if (!data.status || !validStatuses.includes(data.status)) {
    errors.status = 'Geçerli bir durum seçiniz (completed, in_progress, planned).';
  }

  const isValid = Object.keys(errors).length === 0;

  if (!isValid) {
    return {
      isValid: false,
      errors,
    };
  }

  const sanitized: Omit<Entry, 'id' | 'createdAt' | 'updatedAt'> = {
    date,
    dayNumber,
    title,
    topics: normalizeTopics(data.topicsText ?? ''),
    tags: normalizeTags(data.tagsText ?? ''),
    hours,
    notes,
    status: data.status as EntryStatus,
  };

  return {
    isValid: true,
    errors: {},
    sanitized,
  };
}
