// ============================================================================
// i18n Configuration - Internationalization
// ============================================================================

import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

// Initialize i18n without HTTP backend in development
// In production, you would add HttpBackend for CDN-based translations
i18n.use(initReactI18next).init({
  fallbackLng: 'en',
  supportedLngs: ['en', 'tr', 'de', 'fr', 'es'],
  load: 'languageOnly',
  ns: ['common', 'components', 'errors', 'designer'],
  defaultNS: 'common',
  interpolation: {
    escapeValue: false, // React already escapes
  },
  react: {
    useSuspense: false, // Disable suspense to prevent loading issues
  },
  // Use resource bundles instead of HTTP backend in development
  resources: {},
})

export default i18n

// ============================================================================
// Fallback translations (loaded when CDN is unavailable)
// ============================================================================

// Load fallback translations for development
i18n.addResourceBundle('en', 'common', {
  app: {
    name: 'CRM Platform',
    loading: 'Loading...',
    error: 'An error occurred',
  },
  nav: {
    dashboard: 'Dashboard',
    designer: 'Designer',
    settings: 'Settings',
    logout: 'Logout',
  },
  actions: {
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    create: 'Create',
    search: 'Search',
    filter: 'Filter',
    export: 'Export',
    import: 'Import',
  },
  messages: {
    saved: 'Changes saved successfully',
    deleted: 'Item deleted successfully',
    error: 'Something went wrong. Please try again.',
    confirm: 'Are you sure?',
    unsavedChanges: 'You have unsaved changes. Are you sure you want to leave?',
  },
})

i18n.addResourceBundle('tr', 'common', {
  app: {
    name: 'CRM Platformu',
    loading: 'Yükleniyor...',
    error: 'Bir hata oluştu',
  },
  nav: {
    dashboard: 'Gösterge Paneli',
    designer: 'Tasarımcı',
    settings: 'Ayarlar',
    logout: 'Çıkış Yap',
  },
  actions: {
    save: 'Kaydet',
    cancel: 'İptal',
    delete: 'Sil',
    edit: 'Düzenle',
    create: 'Oluştur',
    search: 'Ara',
    filter: 'Filtrele',
    export: 'Dışa Aktar',
    import: 'İçe Aktar',
  },
  messages: {
    saved: 'Değişiklikler başarıyla kaydedildi',
    deleted: 'Öğe başarıyla silindi',
    error: 'Bir şeyler yanlış gitti. Lütfen tekrar deneyin.',
    confirm: 'Emin misiniz?',
    unsavedChanges: 'Kaydedilmemiş değişiklikleriniz var. Ayrılmak istediğinizden emin misiniz?',
  },
})

i18n.addResourceBundle('en', 'components', {
  dataTree: {
    title: 'Data Tree',
    expand: 'Expand All',
    collapse: 'Collapse All',
    noData: 'No data available',
  },
  multiSelect: {
    placeholder: 'Select options...',
    searchPlaceholder: 'Search...',
    noOptions: 'No options available',
    selected: '{{count}} selected',
  },
  graph: {
    title: 'Graph',
    noData: 'No data to display',
  },
  input: {
    required: 'This field is required',
    invalid: 'Invalid input',
  },
  dataTable: {
    noData: 'No records found',
    loading: 'Loading data...',
    rowsPerPage: 'Rows per page',
    of: 'of',
  },
  queryBuilder: {
    title: 'Query Builder',
    description: 'Build database queries visually',
    execute: 'Execute',
    reset: 'Reset',
    copy: 'Copy',
    copied: 'Copied!',
    noRules: 'No rules defined. Click "+ Rule" to add a condition.',
    addRule: 'Rule',
    addGroup: 'Group',
    sql: 'SQL',
    json: 'JSON',
    mongodb: 'MongoDB',
  },
})

i18n.addResourceBundle('tr', 'components', {
  dataTree: {
    title: 'Veri Ağacı',
    expand: 'Tümünü Genişlet',
    collapse: 'Tümünü Daralt',
    noData: 'Veri mevcut değil',
  },
  multiSelect: {
    placeholder: 'Seçenekleri seçin...',
    searchPlaceholder: 'Ara...',
    noOptions: 'Seçenek mevcut değil',
    selected: '{{count}} seçildi',
  },
  graph: {
    title: 'Grafik',
    noData: 'Gösterilecek veri yok',
  },
  input: {
    required: 'Bu alan zorunludur',
    invalid: 'Geçersiz giriş',
  },
  dataTable: {
    noData: 'Kayıt bulunamadı',
    loading: 'Veriler yükleniyor...',
    rowsPerPage: 'Sayfa başına satır',
    of: '/',
  },
  queryBuilder: {
    title: 'Sorgu Oluşturucu',
    description: 'Veritabanı sorgularını görsel olarak oluşturun',
    execute: 'Çalıştır',
    reset: 'Sıfırla',
    copy: 'Kopyala',
    copied: 'Kopyalandı!',
    noRules: 'Kural tanımlanmadı. Koşul eklemek için "+ Kural" düğmesine tıklayın.',
    addRule: 'Kural',
    addGroup: 'Grup',
    sql: 'SQL',
    json: 'JSON',
    mongodb: 'MongoDB',
  },
})
