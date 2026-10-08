import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Clock,
  BookOpen,
  Tag,
  FileText,
  Save,
  X,
  AlertCircle,
  Hash,
  Activity,
} from 'lucide-react';
import type { Entry, EntryFormData, EntryStatus } from '../interfaces/entry';
import { validateEntryForm } from '../utils/validation';
import { suggestTags } from '../utils/tagSuggester';
import { TagSuggestions } from './TagSuggestions';

export interface EntryFormProps {
  initialData?: Entry;
  onSubmit: (data: Omit<Entry, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const EntryForm: React.FC<EntryFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const isEditing = Boolean(initialData);

  // Form field state
  const [formData, setFormData] = useState<EntryFormData>(() => {
    const d = new Date();
    const localDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return {
      date: initialData?.date ?? localDate,
      dayNumber: initialData?.dayNumber ?? 1,
      title: initialData?.title ?? '',
      topicsText: initialData ? initialData.topics.join(', ') : '',
      tagsText: initialData ? initialData.tags.join(', ') : '',
      hours: initialData?.hours ?? 8,
      notes: initialData?.notes ?? '',
      status: initialData?.status ?? 'completed',
    };
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Parse existing tags from input text for suggestTags lookup
  const currentTagsList = useMemo(() => {
    return formData.tagsText
      .split(/[,\s]+/)
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
  }, [formData.tagsText]);

  // Compute tag suggestions dynamically based on title, topics and notes
  const tagSuggestions = useMemo(() => {
    const combinedContent = `${formData.title} ${formData.topicsText} ${formData.notes}`;
    return suggestTags(combinedContent, currentTagsList);
  }, [formData.title, formData.topicsText, formData.notes, currentTagsList]);

  // Handle adding suggested tag into tagsText
  const handleSelectSuggestedTag = (tagToAdd: string) => {
    setFormData((prev) => {
      const existing = prev.tagsText.trim();
      const newTagsText = existing ? `${existing}, ${tagToAdd}` : tagToAdd;
      return { ...prev, tagsText: newTagsText };
    });
    // Clear tag error if any
    setErrors((prev) => {
      if (!prev.tagsText) return prev;
      const copy = { ...prev };
      delete copy.tagsText;
      return copy;
    });
  };

  // Generic field change handler with automatic error clearing
  const handleChange = (
    field: keyof EntryFormData,
    value: string | number
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateEntryForm({
      date: formData.date,
      dayNumber: Number(formData.dayNumber),
      title: formData.title,
      hours: Number(formData.hours),
      notes: formData.notes,
      status: formData.status as EntryStatus,
      topicsText: formData.topicsText,
      tagsText: formData.tagsText,
    });

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    if (validation.sanitized) {
      onSubmit(validation.sanitized);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700/80 shadow-sm p-6 sm:p-8 space-y-6"
    >
      <div className="border-b border-gray-100 dark:border-gray-700 pb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          {isEditing ? 'Staj Günlüğünü Düzenle' : 'Yeni Staj Günlüğü Ekle'}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {isEditing
            ? 'Mevcut staj günü kaydınızın bilgilerini güncelleyin.'
            : 'Stajda bugün gerçekleştirdiğiniz faaliyetleri ve öğrendiklerinizi kaydedin.'}
        </p>
      </div>

      {/* Row 1: Date, Day Number, Hours & Status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Date */}
        <div>
          <label
            htmlFor="date"
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
          >
            <Calendar className="w-3.5 h-3.5 text-blue-500" />
            <span>Tarih</span>
            <span className="text-red-500">*</span>
          </label>
          <input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => handleChange('date', e.target.value)}
            aria-invalid={Boolean(errors.date)}
            aria-describedby={errors.date ? 'date-error' : undefined}
            className={`w-full px-3.5 py-2 text-sm rounded-lg border bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors focus:outline-none focus:ring-2 ${
              errors.date
                ? 'border-red-500 focus:ring-red-400'
                : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
            }`}
          />
          {errors.date && (
            <div id="date-error" className="mt-1 text-xs text-red-500 font-medium flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              <span>{errors.date}</span>
            </div>
          )}
        </div>

        {/* Day Number */}
        <div>
          <label
            htmlFor="dayNumber"
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
          >
            <Hash className="w-3.5 h-3.5 text-indigo-500" />
            <span>Gün No (1 - 365)</span>
            <span className="text-red-500">*</span>
          </label>
          <input
            id="dayNumber"
            type="number"
            min={1}
            max={365}
            value={formData.dayNumber}
            onChange={(e) => handleChange('dayNumber', e.target.value)}
            aria-invalid={Boolean(errors.dayNumber)}
            aria-describedby={errors.dayNumber ? 'dayNumber-error' : undefined}
            className={`w-full px-3.5 py-2 text-sm rounded-lg border bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors focus:outline-none focus:ring-2 ${
              errors.dayNumber
                ? 'border-red-500 focus:ring-red-400'
                : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
            }`}
          />
          {errors.dayNumber && (
            <div id="dayNumber-error" className="mt-1 text-xs text-red-500 font-medium flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              <span>{errors.dayNumber}</span>
            </div>
          )}
        </div>

        {/* Hours Spent */}
        <div>
          <label
            htmlFor="hours"
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
          >
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>Harcanan Saat</span>
            <span className="text-red-500">*</span>
          </label>
          <input
            id="hours"
            type="number"
            min={0}
            max={24}
            step={0.5}
            value={formData.hours}
            onChange={(e) => handleChange('hours', e.target.value)}
            aria-invalid={Boolean(errors.hours)}
            aria-describedby={errors.hours ? 'hours-error' : undefined}
            className={`w-full px-3.5 py-2 text-sm rounded-lg border bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors focus:outline-none focus:ring-2 ${
              errors.hours
                ? 'border-red-500 focus:ring-red-400'
                : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
            }`}
          />
          {errors.hours && (
            <div id="hours-error" className="mt-1 text-xs text-red-500 font-medium flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              <span>{errors.hours}</span>
            </div>
          )}
        </div>

        {/* Status */}
        <div>
          <label
            htmlFor="status"
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
          >
            <Activity className="w-3.5 h-3.5 text-emerald-500" />
            <span>Durum</span>
            <span className="text-red-500">*</span>
          </label>
          <select
            id="status"
            value={formData.status}
            onChange={(e) => handleChange('status', e.target.value as EntryStatus)}
            aria-invalid={Boolean(errors.status)}
            aria-describedby={errors.status ? 'status-error' : undefined}
            className={`w-full px-3.5 py-2 text-sm rounded-lg border bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors focus:outline-none focus:ring-2 ${
              errors.status
                ? 'border-red-500 focus:ring-red-400'
                : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
            }`}
          >
            <option value="completed">Tamamlandı</option>
            <option value="in_progress">Devam Ediyor</option>
            <option value="planned">Planlandı</option>
          </select>
          {errors.status && (
            <div id="status-error" className="mt-1 text-xs text-red-500 font-medium flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              <span>{errors.status}</span>
            </div>
          )}
        </div>
      </div>

      {/* Row 2: Title */}
      <div>
        <label
          htmlFor="title"
          className="flex items-center justify-between text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
        >
          <span className="flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-blue-500" />
            <span>Günlük Başlığı / Ana Faaliyet</span>
            <span className="text-red-500">*</span>
          </span>
          <span className="text-[11px] text-gray-400 font-normal">
            {formData.title.length} / 120
          </span>
        </label>
        <input
          id="title"
          type="text"
          maxLength={120}
          placeholder="Örn: React Router v6 ve SPA Rotalama Mimarisi"
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
          aria-invalid={Boolean(errors.title)}
          aria-describedby={errors.title ? 'title-error' : undefined}
          className={`w-full px-3.5 py-2 text-sm rounded-lg border bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors focus:outline-none focus:ring-2 ${
            errors.title
              ? 'border-red-500 focus:ring-red-400'
              : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
          }`}
        />
        {errors.title && (
          <div id="title-error" className="mt-1 text-xs text-red-500 font-medium flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            <span>{errors.title}</span>
          </div>
        )}
      </div>

      {/* Row 3: Topics */}
      <div>
        <label
          htmlFor="topicsText"
          className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
        >
          <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
          <span>İşlenen Konular (virgülle ayırın)</span>
        </label>
        <input
          id="topicsText"
          type="text"
          placeholder="Örn: React Router, BrowserRouter, NavLink, Outlet, 404 Sayfası"
          value={formData.topicsText}
          onChange={(e) => handleChange('topicsText', e.target.value)}
          className="w-full px-3.5 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Row 4: Tags and TagSuggestions */}
      <div>
        <label
          htmlFor="tagsText"
          className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
        >
          <Tag className="w-3.5 h-3.5 text-purple-500" />
          <span>Etiketler (virgülle veya boşlukla, # işareti isteğe bağlı)</span>
        </label>
        <input
          id="tagsText"
          type="text"
          placeholder="Örn: #react, #typescript, #routing, #spa"
          value={formData.tagsText}
          onChange={(e) => handleChange('tagsText', e.target.value)}
          className="w-full px-3.5 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Suggestion Chips */}
        <TagSuggestions
          suggestions={tagSuggestions}
          onSelectTag={handleSelectSuggestedTag}
        />
      </div>

      {/* Row 5: Notes */}
      <div>
        <label
          htmlFor="notes"
          className="flex items-center justify-between text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
        >
          <span className="flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-blue-500" />
            <span>Detaylı Notlar ve Öğrenim Günlüğü</span>
          </span>
          <span
            className={`text-[11px] font-normal ${
              formData.notes.length > 5000 ? 'text-red-500 font-bold' : 'text-gray-400'
            }`}
          >
            {formData.notes.length} / 5000
          </span>
        </label>
        <textarea
          id="notes"
          rows={6}
          maxLength={5000}
          placeholder="Bugün stajda hangi görevler tamamlandı, hangi problemler çözüldü, hangi yeni teknolojiler öğrenildi?..."
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          aria-invalid={Boolean(errors.notes)}
          aria-describedby={errors.notes ? 'notes-error' : undefined}
          className={`w-full px-3.5 py-2.5 text-sm rounded-lg border bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors focus:outline-none focus:ring-2 leading-relaxed resize-y ${
            errors.notes
              ? 'border-red-500 focus:ring-red-400'
              : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
          }`}
        />
        {errors.notes && (
          <div id="notes-error" className="mt-1 text-xs text-red-500 font-medium flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            <span>{errors.notes}</span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex flex-col-reverse sm:flex-row items-center justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 dark:text-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:opacity-50"
        >
          <X className="w-4 h-4" />
          <span>İptal</span>
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
        >
          <Save className="w-4 h-4" />
          <span>
            {isSubmitting
              ? 'Kaydediliyor...'
              : isEditing
              ? 'Değişiklikleri Kaydet'
              : 'Günlüğü Kaydet'}
          </span>
        </button>
      </div>
    </form>
  );
};

export default EntryForm;
