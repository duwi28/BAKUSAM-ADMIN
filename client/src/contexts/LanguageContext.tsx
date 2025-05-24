import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'id' | 'en' | 'ar' | 'zh' | 'ja';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  id: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.drivers': 'Driver',
    'nav.customers': 'Customer',
    'nav.orders': 'Order',
    'nav.vehicles': 'Kendaraan',
    'nav.pricing': 'Tarif & Promo',
    'nav.reports': 'Laporan',
    'nav.notifications': 'Notifikasi',
    'nav.settings': 'Pengaturan',
    'nav.logout': 'Keluar',
    'nav.smartRoute': 'Optimasi Rute Cerdas',
    'nav.realtimeRoute': 'Peta Rute Real-Time',
    'nav.weatherRoute': 'Optimasi Rute Cuaca',
    'nav.aiRecommendation': 'Sistem Rekomendasi AI',
    'nav.driverChat': 'Chat Komunitas Driver',
    'nav.analytics': 'Analytics & Laporan',
    'nav.bulkOps': 'Operasi Massal',
    'nav.revenueCalc': 'Kalkulator Pendapatan',
    'nav.tracking': 'Tracking & Assignment',

    // Dashboard
    'dashboard.title': 'Dashboard Admin',
    'dashboard.welcome': 'Selamat datang di Bakusam Express',
    'dashboard.totalDrivers': 'Total Driver',
    'dashboard.activeDrivers': 'Driver Aktif',
    'dashboard.totalOrders': 'Total Order',
    'dashboard.pendingOrders': 'Order Pending',
    'dashboard.completedOrders': 'Order Selesai',
    'dashboard.revenue': 'Pendapatan',
    'dashboard.today': 'Hari Ini',
    'dashboard.thisWeek': 'Minggu Ini',
    'dashboard.thisMonth': 'Bulan Ini',

    // Common
    'common.save': 'Simpan',
    'common.cancel': 'Batal',
    'common.edit': 'Edit',
    'common.delete': 'Hapus',
    'common.search': 'Cari',
    'common.filter': 'Filter',
    'common.add': 'Tambah',
    'common.status': 'Status',
    'common.actions': 'Aksi',
    'common.loading': 'Memuat...',
    'common.noData': 'Tidak ada data',
    'common.success': 'Berhasil',
    'common.error': 'Error',
    'common.confirm': 'Konfirmasi',
    'common.yes': 'Ya',
    'common.no': 'Tidak',

    // Weather
    'weather.title': 'Optimasi Rute Berdasarkan Cuaca',
    'weather.subtitle': 'Optimasi rute cerdas berdasarkan kondisi cuaca real-time untuk keamanan dan efisiensi maksimal',
    'weather.currentWeather': 'Cuaca Saat Ini',
    'weather.alerts': 'Peringatan Cuaca',
    'weather.routes': 'Rute Optimal Cuaca',
    'weather.temperature': 'Suhu',
    'weather.humidity': 'Kelembaban',
    'weather.windSpeed': 'Kecepatan Angin',
    'weather.visibility': 'Jarak Pandang',
    'weather.precipitation': 'Hujan',
    'weather.forecast': 'Prakiraan',
    'weather.safetyScore': 'Skor Keamanan',
    'weather.useRoute': 'Gunakan Rute',

    // Language selector
    'language.select': 'Pilih Bahasa',
    'language.id': '🇮🇩 Bahasa Indonesia',
    'language.en': '🇺🇸 English',
    'language.ar': '🇸🇦 العربية',
    'language.zh': '🇨🇳 中文',
    'language.ja': '🇯🇵 日本語',
  },
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.drivers': 'Drivers',
    'nav.customers': 'Customers',
    'nav.orders': 'Orders',
    'nav.vehicles': 'Vehicles',
    'nav.pricing': 'Pricing & Promos',
    'nav.reports': 'Reports',
    'nav.notifications': 'Notifications',
    'nav.settings': 'Settings',
    'nav.logout': 'Logout',
    'nav.smartRoute': 'Smart Route Optimization',
    'nav.realtimeRoute': 'Real-Time Route Map',
    'nav.weatherRoute': 'Weather Route Optimization',
    'nav.aiRecommendation': 'AI Recommendation System',
    'nav.driverChat': 'Driver Community Chat',
    'nav.analytics': 'Analytics & Reports',
    'nav.bulkOps': 'Bulk Operations',
    'nav.revenueCalc': 'Revenue Calculator',
    'nav.tracking': 'Tracking & Assignment',

    // Dashboard
    'dashboard.title': 'Admin Dashboard',
    'dashboard.welcome': 'Welcome to Bakusam Express',
    'dashboard.totalDrivers': 'Total Drivers',
    'dashboard.activeDrivers': 'Active Drivers',
    'dashboard.totalOrders': 'Total Orders',
    'dashboard.pendingOrders': 'Pending Orders',
    'dashboard.completedOrders': 'Completed Orders',
    'dashboard.revenue': 'Revenue',
    'dashboard.today': 'Today',
    'dashboard.thisWeek': 'This Week',
    'dashboard.thisMonth': 'This Month',

    // Common
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.add': 'Add',
    'common.status': 'Status',
    'common.actions': 'Actions',
    'common.loading': 'Loading...',
    'common.noData': 'No data available',
    'common.success': 'Success',
    'common.error': 'Error',
    'common.confirm': 'Confirm',
    'common.yes': 'Yes',
    'common.no': 'No',

    // Weather
    'weather.title': 'Weather-Based Route Optimization',
    'weather.subtitle': 'Smart route optimization based on real-time weather conditions for maximum safety and efficiency',
    'weather.currentWeather': 'Current Weather',
    'weather.alerts': 'Weather Alerts',
    'weather.routes': 'Weather-Optimized Routes',
    'weather.temperature': 'Temperature',
    'weather.humidity': 'Humidity',
    'weather.windSpeed': 'Wind Speed',
    'weather.visibility': 'Visibility',
    'weather.precipitation': 'Precipitation',
    'weather.forecast': 'Forecast',
    'weather.safetyScore': 'Safety Score',
    'weather.useRoute': 'Use Route',

    // Language selector
    'language.select': 'Select Language',
    'language.id': '🇮🇩 Bahasa Indonesia',
    'language.en': '🇺🇸 English',
    'language.ar': '🇸🇦 العربية',
    'language.zh': '🇨🇳 中文',
    'language.ja': '🇯🇵 日本語',
  },
  ar: {
    // Navigation
    'nav.dashboard': 'لوحة التحكم',
    'nav.drivers': 'السائقون',
    'nav.customers': 'العملاء',
    'nav.orders': 'الطلبات',
    'nav.vehicles': 'المركبات',
    'nav.pricing': 'الأسعار والعروض',
    'nav.reports': 'التقارير',
    'nav.notifications': 'الإشعارات',
    'nav.settings': 'الإعدادات',
    'nav.logout': 'تسجيل الخروج',
    'nav.smartRoute': 'تحسين المسار الذكي',
    'nav.realtimeRoute': 'خريطة المسار المباشر',
    'nav.weatherRoute': 'تحسين المسار حسب الطقس',
    'nav.aiRecommendation': 'نظام التوصيات الذكي',
    'nav.driverChat': 'دردشة مجتمع السائقين',
    'nav.analytics': 'التحليلات والتقارير',
    'nav.bulkOps': 'العمليات المجمعة',
    'nav.revenueCalc': 'حاسبة الإيرادات',
    'nav.tracking': 'التتبع والتعيين',

    // Dashboard
    'dashboard.title': 'لوحة تحكم المدير',
    'dashboard.welcome': 'مرحباً بك في باكوسام إكسبرس',
    'dashboard.totalDrivers': 'إجمالي السائقين',
    'dashboard.activeDrivers': 'السائقون النشطون',
    'dashboard.totalOrders': 'إجمالي الطلبات',
    'dashboard.pendingOrders': 'الطلبات المعلقة',
    'dashboard.completedOrders': 'الطلبات المكتملة',
    'dashboard.revenue': 'الإيرادات',
    'dashboard.today': 'اليوم',
    'dashboard.thisWeek': 'هذا الأسبوع',
    'dashboard.thisMonth': 'هذا الشهر',

    // Common
    'common.save': 'حفظ',
    'common.cancel': 'إلغاء',
    'common.edit': 'تعديل',
    'common.delete': 'حذف',
    'common.search': 'بحث',
    'common.filter': 'تصفية',
    'common.add': 'إضافة',
    'common.status': 'الحالة',
    'common.actions': 'الإجراءات',
    'common.loading': 'جاري التحميل...',
    'common.noData': 'لا توجد بيانات',
    'common.success': 'نجح',
    'common.error': 'خطأ',
    'common.confirm': 'تأكيد',
    'common.yes': 'نعم',
    'common.no': 'لا',

    // Weather
    'weather.title': 'تحسين المسار حسب الطقس',
    'weather.subtitle': 'تحسين المسار الذكي بناءً على أحوال الطقس المباشرة لضمان السلامة والكفاءة القصوى',
    'weather.currentWeather': 'الطقس الحالي',
    'weather.alerts': 'تنبيهات الطقس',
    'weather.routes': 'المسارات المحسّنة للطقس',
    'weather.temperature': 'درجة الحرارة',
    'weather.humidity': 'الرطوبة',
    'weather.windSpeed': 'سرعة الرياح',
    'weather.visibility': 'الرؤية',
    'weather.precipitation': 'الهطول',
    'weather.forecast': 'التوقعات',
    'weather.safetyScore': 'نقاط السلامة',
    'weather.useRoute': 'استخدم المسار',

    // Language selector
    'language.select': 'اختر اللغة',
    'language.id': '🇮🇩 البهاسا الإندونيسية',
    'language.en': '🇺🇸 الإنجليزية',
    'language.ar': '🇸🇦 العربية',
    'language.zh': '🇨🇳 الصينية',
    'language.ja': '🇯🇵 اليابانية',
  },
  zh: {
    // Navigation
    'nav.dashboard': '仪表板',
    'nav.drivers': '司机',
    'nav.customers': '客户',
    'nav.orders': '订单',
    'nav.vehicles': '车辆',
    'nav.pricing': '定价和促销',
    'nav.reports': '报告',
    'nav.notifications': '通知',
    'nav.settings': '设置',
    'nav.logout': '登出',
    'nav.smartRoute': '智能路线优化',
    'nav.realtimeRoute': '实时路线地图',
    'nav.weatherRoute': '天气路线优化',
    'nav.aiRecommendation': 'AI推荐系统',
    'nav.driverChat': '司机社区聊天',
    'nav.analytics': '分析和报告',
    'nav.bulkOps': '批量操作',
    'nav.revenueCalc': '收入计算器',
    'nav.tracking': '跟踪和分配',

    // Dashboard
    'dashboard.title': '管理仪表板',
    'dashboard.welcome': '欢迎来到Bakusam Express',
    'dashboard.totalDrivers': '总司机数',
    'dashboard.activeDrivers': '活跃司机',
    'dashboard.totalOrders': '总订单数',
    'dashboard.pendingOrders': '待处理订单',
    'dashboard.completedOrders': '已完成订单',
    'dashboard.revenue': '收入',
    'dashboard.today': '今天',
    'dashboard.thisWeek': '本周',
    'dashboard.thisMonth': '本月',

    // Common
    'common.save': '保存',
    'common.cancel': '取消',
    'common.edit': '编辑',
    'common.delete': '删除',
    'common.search': '搜索',
    'common.filter': '筛选',
    'common.add': '添加',
    'common.status': '状态',
    'common.actions': '操作',
    'common.loading': '加载中...',
    'common.noData': '暂无数据',
    'common.success': '成功',
    'common.error': '错误',
    'common.confirm': '确认',
    'common.yes': '是',
    'common.no': '否',

    // Weather
    'weather.title': '基于天气的路线优化',
    'weather.subtitle': '基于实时天气条件的智能路线优化，确保最大安全性和效率',
    'weather.currentWeather': '当前天气',
    'weather.alerts': '天气警报',
    'weather.routes': '天气优化路线',
    'weather.temperature': '温度',
    'weather.humidity': '湿度',
    'weather.windSpeed': '风速',
    'weather.visibility': '能见度',
    'weather.precipitation': '降水',
    'weather.forecast': '预报',
    'weather.safetyScore': '安全评分',
    'weather.useRoute': '使用路线',

    // Language selector
    'language.select': '选择语言',
    'language.id': '🇮🇩 印尼语',
    'language.en': '🇺🇸 英语',
    'language.ar': '🇸🇦 阿拉伯语',
    'language.zh': '🇨🇳 中文',
    'language.ja': '🇯🇵 日语',
  },
  ja: {
    // Navigation
    'nav.dashboard': 'ダッシュボード',
    'nav.drivers': 'ドライバー',
    'nav.customers': 'お客様',
    'nav.orders': '注文',
    'nav.vehicles': '車両',
    'nav.pricing': '料金とプロモ',
    'nav.reports': 'レポート',
    'nav.notifications': '通知',
    'nav.settings': '設定',
    'nav.logout': 'ログアウト',
    'nav.smartRoute': 'スマートルート最適化',
    'nav.realtimeRoute': 'リアルタイムルートマップ',
    'nav.weatherRoute': '天気ルート最適化',
    'nav.aiRecommendation': 'AI推奨システム',
    'nav.driverChat': 'ドライバーコミュニティチャット',
    'nav.analytics': '分析とレポート',
    'nav.bulkOps': '一括操作',
    'nav.revenueCalc': '収益計算機',
    'nav.tracking': '追跡と割り当て',

    // Dashboard
    'dashboard.title': '管理ダッシュボード',
    'dashboard.welcome': 'Bakusam Expressへようこそ',
    'dashboard.totalDrivers': '総ドライバー数',
    'dashboard.activeDrivers': 'アクティブドライバー',
    'dashboard.totalOrders': '総注文数',
    'dashboard.pendingOrders': '保留中の注文',
    'dashboard.completedOrders': '完了した注文',
    'dashboard.revenue': '収益',
    'dashboard.today': '今日',
    'dashboard.thisWeek': '今週',
    'dashboard.thisMonth': '今月',

    // Common
    'common.save': '保存',
    'common.cancel': 'キャンセル',
    'common.edit': '編集',
    'common.delete': '削除',
    'common.search': '検索',
    'common.filter': 'フィルター',
    'common.add': '追加',
    'common.status': 'ステータス',
    'common.actions': 'アクション',
    'common.loading': '読み込み中...',
    'common.noData': 'データがありません',
    'common.success': '成功',
    'common.error': 'エラー',
    'common.confirm': '確認',
    'common.yes': 'はい',
    'common.no': 'いいえ',

    // Weather
    'weather.title': '天気ベースのルート最適化',
    'weather.subtitle': 'リアルタイムの天気条件に基づく最大の安全性と効率のためのスマートルート最適化',
    'weather.currentWeather': '現在の天気',
    'weather.alerts': '天気警報',
    'weather.routes': '天気最適化ルート',
    'weather.temperature': '気温',
    'weather.humidity': '湿度',
    'weather.windSpeed': '風速',
    'weather.visibility': '視界',
    'weather.precipitation': '降水量',
    'weather.forecast': '予報',
    'weather.safetyScore': '安全スコア',
    'weather.useRoute': 'ルートを使用',

    // Language selector
    'language.select': '言語を選択',
    'language.id': '🇮🇩 インドネシア語',
    'language.en': '🇺🇸 英語',
    'language.ar': '🇸🇦 アラビア語',
    'language.zh': '🇨🇳 中国語',
    'language.ja': '🇯🇵 日本語',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('bakusam-language');
    return (saved as Language) || 'id';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('bakusam-language', lang);
    
    // Update document direction for RTL languages
    if (lang === 'ar') {
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = 'ar';
    } else {
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = lang;
    }
  };

  const t = (key: string): string => {
    return (translations[language] as any)?.[key] || key;
  };

  useEffect(() => {
    // Set initial document direction and language
    if (language === 'ar') {
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = 'ar';
    } else {
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = language;
    }
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}