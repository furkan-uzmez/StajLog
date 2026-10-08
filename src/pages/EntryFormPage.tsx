import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, AlertCircle, Edit3, PlusCircle } from 'lucide-react';
import { useEntries } from '../context/EntryContext';
import { EntryForm } from '../components/EntryForm';
import type { Entry } from '../interfaces/entry';

export const EntryFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { entries, createEntry, updateEntry } = useEntries();

  const isEditMode = Boolean(id);
  const entryToEdit = id ? entries.find((e) => e.id === id) : undefined;
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Handle case where id is specified in URL but entry is not found
  if (isEditMode && !entryToEdit) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 animate-fadeIn">
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700/80 p-8 text-center shadow-xs">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Staj Kaydı Bulunamadı
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            Düzenlemek istediğiniz staj kaydı mevcut değil ya da silinmiş olabilir.
          </p>
          <div className="mt-6">
            <Link
              to="/entries"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm text-white bg-blue-600 hover:bg-blue-700 transition shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              Tüm Günlüklere Dön
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = (data: Omit<Entry, 'id' | 'createdAt' | 'updatedAt'>) => {
    const result = isEditMode && id
      ? updateEntry(id, data)
      : createEntry(data);

    if (result.success) {
      setErrorMessage(null);
      navigate('/entries');
    } else {
      setErrorMessage(result.error || 'Kayıt kaydedilirken bir hata meydana geldi.');
    }
  };

  const handleCancel = () => {
    navigate('/entries');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      {/* Top Navigation & Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            to="/entries"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-2 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Günlüklere Geri Dön
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2.5">
            {isEditMode ? (
              <>
                <Edit3 className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                <span>Gün {entryToEdit?.dayNumber} — Kaydı Düzenle</span>
              </>
            ) : (
              <>
                <PlusCircle className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                <span>Yeni Staj Günü Ekle</span>
              </>
            )}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {isEditMode
              ? 'Mevcut staj gününün detaylarını, kazanımlarını ve etiketlerini güncelleyin.'
              : 'Staj defteriniz için yeni bir gün kaydı oluşturun ve aktivitelerinizi ekleyin.'}
          </p>
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div
          role="alert"
          className="p-4 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-200 flex items-center justify-between gap-3 text-sm animate-fadeIn"
        >
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-red-600 dark:text-red-400 hover:opacity-75 text-xs font-semibold px-2 py-1"
          >
            Kapat
          </button>
        </div>
      )}

      {/* Entry Form Container */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700/80 p-6 sm:p-8 shadow-xs">
        <EntryForm
          key={entryToEdit?.id ?? 'new'}
          initialData={entryToEdit}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
};

export default EntryFormPage;
