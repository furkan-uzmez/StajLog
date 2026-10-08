import React, { useState, useRef } from 'react';
import {
  Download,
  Upload,
  RotateCcw,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Info,
  Database,
  FileCode,
  HardDrive,
  Calendar,
  Layers,
  X,
} from 'lucide-react';
import { useEntries } from '../context/EntryContext';
import { ConfirmModal } from '../components/ConfirmModal';
import { isEntryArray } from '../utils/validation';
import type { Entry, ExportPayload } from '../interfaces/entry';

type ModalAction = 'import' | 'load_demo' | 'reset' | null;

export const SettingsPage: React.FC = () => {
  const {
    entries,
    restoreEntries,
    resetAllEntries,
    loadInitialData,
  } = useEntries();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeModal, setActiveModal] = useState<ModalAction>(null);
  const [pendingImportEntries, setPendingImportEntries] = useState<Entry[] | null>(null);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Compute summary metrics for info card
  const totalCompletedHours = entries
    .filter((e) => e.status === 'completed')
    .reduce((acc, curr) => acc + curr.hours, 0);

  const completedDaysCount = entries.filter((e) => e.status === 'completed').length;

  // JSON Export Handler
  const handleExport = () => {
    try {
      const payload: ExportPayload = {
        version: 1,
        exportedAt: new Date().toISOString(),
        entries,
      };

      const jsonStr = JSON.stringify(payload, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');

      const dateStamp = new Date().toISOString().slice(0, 10);
      link.href = url;
      link.download = `stajlog-backup-${dateStamp}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setNotification({
        type: 'success',
        message: `${entries.length} adet staj kaydı içeren JSON yedeği başarıyla indirildi.`,
      });
    } catch {
      setNotification({
        type: 'error',
        message: 'Yedek dosyası oluşturulurken bir hata oluştu.',
      });
    }
  };

  // JSON Import File Selection Handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const rawContent = event.target?.result as string;
        const parsed = JSON.parse(rawContent);

        let validatedEntries: Entry[] | null = null;
        if (parsed && typeof parsed === 'object') {
          if ('entries' in parsed && isEntryArray(parsed.entries)) {
            validatedEntries = parsed.entries;
          } else if (isEntryArray(parsed)) {
            validatedEntries = parsed;
          }
        }

        if (validatedEntries && validatedEntries.length > 0) {
          setPendingImportEntries(validatedEntries);
          setActiveModal('import');
        } else if (validatedEntries && validatedEntries.length === 0) {
          setNotification({
            type: 'error',
            message: 'Yedek dosyasında yüklenebilecek herhangi bir staj kaydı bulunamadı.',
          });
        } else {
          setNotification({
            type: 'error',
            message: 'Geçersiz yedek formatı: Dosya StajLog şemasıyla uyumlu geçerli kayıtlar içermiyor.',
          });
        }
      } catch {
        setNotification({
          type: 'error',
          message: 'JSON dosyası okunamadı veya biçimi bozuk.',
        });
      } finally {
        e.target.value = '';
      }
    };

    reader.onerror = () => {
      setNotification({
        type: 'error',
        message: 'Dosya okunurken bir okuma hatası meydana geldi.',
      });
      e.target.value = '';
    };

    reader.readAsText(file);
  };

  // Confirm Modal Action Dispatcher
  const handleConfirmAction = () => {
    if (activeModal === 'import' && pendingImportEntries) {
      const count = pendingImportEntries.length;
      const res = restoreEntries(pendingImportEntries);
      if (res.success) {
        setPendingImportEntries(null);
        setActiveModal(null);
        setNotification({
          type: 'success',
          message: `${count} adet staj kaydı başarıyla sisteme aktarıldı.`,
        });
      } else {
        setNotification({
          type: 'error',
          message: res.error || 'Veriler içe aktarılırken depolama hatası oluştu.',
        });
      }
    } else if (activeModal === 'load_demo') {
      const res = loadInitialData();
      if (res.success) {
        setActiveModal(null);
        setNotification({
          type: 'success',
          message: 'Kurgusal örnek kayıtlar başarıyla yüklendi. (Bu veriler gerçek kullanıcı verisi değildir.)',
        });
      } else {
        setNotification({
          type: 'error',
          message: res.error || 'Örnek veriler yüklenirken depolama hatası oluştu.',
        });
      }
    } else if (activeModal === 'reset') {
      const res = resetAllEntries();
      if (res.success) {
        setActiveModal(null);
        setNotification({
          type: 'success',
          message: 'Tüm staj kayıtları (stajlog_entries) başarıyla sıfırlandı.',
        });
      } else {
        setNotification({
          type: 'error',
          message: res.error || 'Kayıtlar sıfırlanırken depolama hatası oluştu.',
        });
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          Sistem Ayarları & Veri Yönetimi
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Staj günlüklerinizi yedekleyin, dışa aktarın, örnek verileri yükleyin veya veritabanını yönetin.
        </p>
      </div>

      {/* Notification Toast Banner */}
      {notification && (
        <div
          role="status"
          className={`flex items-start justify-between p-4 rounded-xl border transition ${
            notification.type === 'success'
              ? 'bg-green-50 dark:bg-green-950/40 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200'
              : 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
          }`}
        >
          <div className="flex items-start gap-3">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0 text-green-600 dark:text-green-400" />
            ) : (
              <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0 text-red-600 dark:text-red-400" />
            )}
            <p className="text-sm font-medium">{notification.message}</p>
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 opacity-70 hover:opacity-100 transition"
            aria-label="Kapat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Hidden File Input for Import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        onChange={handleFileChange}
        className="hidden"
        aria-hidden="true"
      />

      {/* Data Management Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Backup & Export Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700/80 p-6 shadow-xs flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Download className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              JSON Yedeği İndir
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              Mevcut tüm staj günlüklerinizi, etiketlerinizi ve saat kayıtlarınızı güvenli bir JSON dosyası olarak bilgisayarınıza indirin.
            </p>
          </div>

          <div className="pt-6">
            <button
              type="button"
              onClick={handleExport}
              disabled={entries.length === 0}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-xs"
            >
              <Download className="w-4 h-4" />
              Yedeği İndir ({entries.length} Kayıt)
            </button>
          </div>
        </div>

        {/* Restore & Import Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700/80 p-6 shadow-xs flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Upload className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              JSON Yedeği Yükle
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              Daha önce aldığınız bir StajLog JSON yedek dosyasını seçerek tüm staj verilerini tek seferde sisteme geri yükleyin.
            </p>
          </div>

          <div className="pt-6">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm text-white bg-purple-600 hover:bg-purple-700 transition shadow-xs"
            >
              <Upload className="w-4 h-4" />
              Yedek Dosyası Seç
            </button>
          </div>
        </div>

        {/* Load Demo Data Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700/80 p-6 shadow-xs flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <RotateCcw className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Örnek Verileri Yükle
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              AI, Web, CSS, JS ve React konularını içeren hazır kurgusal örnek kayıtları sisteme yükleyin. Bu veriler gerçek kullanıcı verisi değildir.
            </p>
          </div>

          <div className="pt-6">
            <button
              type="button"
              onClick={() => setActiveModal('load_demo')}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm text-emerald-700 dark:text-emerald-300 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 transition"
            >
              <RotateCcw className="w-4 h-4" />
              Demo Verileri Yükle (Kurgusal Örnek Kayıtlar)
            </button>
          </div>
        </div>

        {/* Reset All Data Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-red-200 dark:border-red-900/40 p-6 shadow-xs flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-red-600 dark:text-red-400">
              Tüm Verileri Sıfırla
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              Yalnızca <code className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 font-mono text-xs">stajlog_entries</code> anahtarına ait tüm verileri temizler. Tema ayarlarınız korunur.
            </p>
          </div>

          <div className="pt-6">
            <button
              type="button"
              onClick={() => setActiveModal('reset')}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm text-white bg-red-600 hover:bg-red-700 transition shadow-xs"
            >
              <Trash2 className="w-4 h-4" />
              Tüm Kayıtları Sıfırla
            </button>
          </div>
        </div>
      </div>

      {/* Project & Internship Information Card */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700/80 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-700/60 pb-4">
          <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Proje & Staj Bilgileri
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Uygulama çalışma ortamı ve staj süreci özet metrikleri
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 space-y-1">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-500" /> Proje Adı
            </span>
            <p className="font-semibold text-gray-900 dark:text-white">StajLog Takip Portalı</p>
          </div>

          <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 space-y-1">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-500" /> Veri Seti
            </span>
            <p className="font-semibold text-gray-900 dark:text-white">Demo Modu (Kurgusal Örnek Kayıtlar)</p>
          </div>

          <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 space-y-1">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-purple-500" /> Depolama Anahtarı
            </span>
            <p className="font-semibold font-mono text-xs text-gray-900 dark:text-white">stajlog_entries</p>
          </div>

          <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 space-y-1">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-amber-500" /> Kayıtlı Gün / Tamamlanan
            </span>
            <p className="font-semibold text-gray-900 dark:text-white">
              {entries.length} Gün ({completedDaysCount} Tamamlandı)
            </p>
          </div>

          <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 space-y-1">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-500" /> Toplam Staj Saati
            </span>
            <p className="font-semibold text-gray-900 dark:text-white">{totalCompletedHours} Saat</p>
          </div>

          <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 space-y-1">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium flex items-center gap-1.5">
              <FileCode className="w-3.5 h-3.5 text-pink-500" /> Teknoloji Yığını
            </span>
            <p className="font-semibold text-gray-900 dark:text-white">React 18 + TS + Tailwind</p>
          </div>
        </div>
      </section>

      {/* Confirmation Modals */}
      <ConfirmModal
        isOpen={activeModal === 'import'}
        title="Yedeği Geri Yükle"
        message={
          pendingImportEntries
            ? `Seçilen dosyada ${pendingImportEntries.length} adet staj kaydı bulundu. Mevcut tüm verileriniz bu yedekle değiştirilecektir. Onaylıyor musunuz?`
            : 'Yedeği geri yüklemek istediğinize emin misiniz?'
        }
        confirmLabel="Yedeği Yükle"
        cancelLabel="Vazgeç"
        isDanger={false}
        onConfirm={handleConfirmAction}
        onCancel={() => {
          setActiveModal(null);
          setPendingImportEntries(null);
        }}
      />

      <ConfirmModal
        isOpen={activeModal === 'load_demo'}
        title="Örnek Verileri Yükle"
        message="Mevcut kayıtlarınızın üzerine kurgusal örnek kayıtlar yüklenecektir. Bu veriler gerçek kullanıcı verisi değildir. Devam etmek istiyor musunuz?"
        confirmLabel="Örnek Verileri Yükle"
        cancelLabel="Vazgeç"
        isDanger={false}
        onConfirm={handleConfirmAction}
        onCancel={() => setActiveModal(null)}
      />

      <ConfirmModal
        isOpen={activeModal === 'reset'}
        title="Tüm Verileri Sıfırla"
        message="Tüm staj kayıtlarınız kalıcı olarak silinecektir (yalnızca stajlog_entries anahtarı sıfırlanacaktır). Bu işlem geri alınamaz. Emin misiniz?"
        confirmLabel="Kayıtları Sıfırla"
        cancelLabel="Vazgeç"
        isDanger={true}
        onConfirm={handleConfirmAction}
        onCancel={() => setActiveModal(null)}
      />
    </div>
  );
};

export default SettingsPage;
