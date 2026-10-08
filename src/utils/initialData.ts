import type { Entry } from '../interfaces/entry';

/**
 * Initial demo dataset — fully fictional example data for demonstration purposes.
 * Loaded only if the localStorage key does not exist at all.
 */
export const INITIAL_ENTRIES: Entry[] = [
  {
    id: 'a1b2c3d4-0001-4e5f-8a9b-000000000001',
    date: '2025-01-06',
    dayNumber: 1,
    title: 'HTML Temelleri: Semantik Etiketler ve Sayfa Yapısı',
    topics: [
      'HTML5 semantik etiketler (header, main, footer)',
      'Blok ve satır içi öğeler',
      'Formlar ve giriş alanları',
      'Tarayıcı geliştirici araçları',
    ],
    tags: ['#html', '#semantik', '#web', '#demo'],
    hours: 1,
    notes:
      'Bu giriş tamamen kurgusal bir demo örneğidir. Eğitim amaçlı oluşturulmuş hayali verilerden oluşmaktadır. Gün 1 kapsamında HTML5 semantik etiketlerin kullanımı incelendi; header, main ve footer etiketleriyle basit bir sayfa iskeleti oluşturuldu. Form elemanları denendi.',
    status: 'completed',
    createdAt: '2025-01-06T09:00:00.000Z',
    updatedAt: '2025-01-06T09:00:00.000Z',
  },
  {
    id: 'a1b2c3d4-0002-4e5f-8a9b-000000000002',
    date: '2025-01-07',
    dayNumber: 2,
    title: 'CSS Kutu Modeli, Flexbox ve Temel Stil Kuralları',
    topics: [
      'CSS kutu modeli ve border-box',
      'Flexbox düzeni',
      'Renk ve tipografi stilleri',
      'Responsive tasarım temelleri',
    ],
    tags: ['#css', '#flexbox', '#responsive', '#demo'],
    hours: 2,
    notes:
      'Bu giriş tamamen kurgusal bir demo örneğidir. Eğitim amaçlı oluşturulmuş hayali verilerden oluşmaktadır. Gün 2 kapsamında CSS kutu modeli border-box davranışı hesaplandı. Flexbox ile basit bir kart bileşeni hizalandı. Renk paleti ve temel tipografi kuralları uygulandı.',
    status: 'completed',
    createdAt: '2025-01-07T09:00:00.000Z',
    updatedAt: '2025-01-07T09:00:00.000Z',
  },
  {
    id: 'a1b2c3d4-0003-4e5f-8a9b-000000000003',
    date: '2025-01-08',
    dayNumber: 3,
    title: 'JavaScript Temelleri: Değişkenler, Fonksiyonlar ve DOM',
    topics: [
      'let / const ve kapsam',
      'Arrow fonksiyonlar',
      'DOM seçiciler ve olay dinleyiciler',
      'Basit etkileşimli sayfa örneği',
    ],
    tags: ['#javascript', '#dom', '#etkinlik', '#demo'],
    hours: 1.5,
    notes:
      'Bu giriş tamamen kurgusal bir demo örneğidir. Eğitim amaçlı oluşturulmuş hayali verilerden oluşmaktadır. Gün 3 kapsamında JavaScript değişken kapsamı ve arrow fonksiyon sözdizimi çalışıldı. querySelector ile DOM öğelerine erişildi; addEventListener ile butona tıklama olayı tanımlandı.',
    status: 'completed',
    createdAt: '2025-01-08T09:00:00.000Z',
    updatedAt: '2025-01-08T09:00:00.000Z',
  },
  {
    id: 'a1b2c3d4-0004-4e5f-8a9b-000000000004',
    date: '2025-01-09',
    dayNumber: 4,
    title: 'TypeScript Giriş: Tip Sistemi ve Arayüzler',
    topics: [
      'TypeScript kurulumu ve tsconfig',
      'Temel tipler ve union tipler',
      'Interface ve type alias',
      'Tip güvenli fonksiyon imzaları',
    ],
    tags: ['#typescript', '#tipler', '#interface', '#demo'],
    hours: 2,
    notes:
      'Bu giriş tamamen kurgusal bir demo örneğidir. Eğitim amaçlı oluşturulmuş hayali verilerden oluşmaktadır. Gün 4 kapsamında TypeScript projesi sıfırdan kuruldu; tsconfig.json ayarları incelendi. string, number ve boolean temel tipleri denendi. Interface ile basit bir kullanıcı nesnesi tanımlandı.',
    status: 'completed',
    createdAt: '2025-01-09T09:00:00.000Z',
    updatedAt: '2025-01-09T09:00:00.000Z',
  },
  {
    id: 'a1b2c3d4-0005-4e5f-8a9b-000000000005',
    date: '2025-01-10',
    dayNumber: 5,
    title: 'React ile Bileşen Tabanlı Geliştirme ve useState Hook',
    topics: [
      'Vite + React projesi oluşturma',
      'JSX sözdizimi ve bileşenler',
      'useState hook ile durum yönetimi',
      'Props ile veri aktarımı',
    ],
    tags: ['#react', '#jsx', '#hooks', '#demo'],
    hours: 3,
    notes:
      'Bu giriş tamamen kurgusal bir demo örneğidir. Eğitim amaçlı oluşturulmuş hayali verilerden oluşmaktadır. Gün 5 kapsamında Vite ile React projesi oluşturuldu. JSX sözdizimi ve fonksiyonel bileşen yapısı incelendi. useState hook ile sayaç uygulaması geliştirildi; props ile değer üst bileşenden alt bileşene aktarıldı.',
    status: 'completed',
    createdAt: '2025-01-10T09:00:00.000Z',
    updatedAt: '2025-01-10T09:00:00.000Z',
  },
];
