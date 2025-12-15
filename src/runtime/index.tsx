// ============================================================================
// Runtime Module - Production Rendering Mode
// ============================================================================

import {
  BarChart3,
  Bell,
  ChevronLeft,
  FileText,
  Globe,
  LayoutDashboard,
  Menu,
  Moon,
  Search,
  Settings,
  Sun,
  Users,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  PageRenderer,
  useMetadataStore,
  useRuntimeStore,
  useTenantStore,
  type PageMetadata,
} from '../core';
import { themeManager } from '../core/theme-engine';

// ============================================================================
// Sidebar Navigation
// ============================================================================

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { id: 'documents', label: 'Documents', icon: <FileText className="w-5 h-5" /> },
  { id: 'customers', label: 'Customers', icon: <Users className="w-5 h-5" /> },
  { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-5 h-5" /> },
  { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
];

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  currentPage: string;
  onNavigate: (pageId: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle, currentPage, onNavigate }) => {
  const { theme } = useTenantStore();

  return (
    <aside
      className={`
        fixed left-0 top-0 h-full z-30
        bg-(--color-surface) border-r border-(--color-border)
        transition-all duration-300 ease-in-out
        ${isOpen ? 'w-64' : 'w-16'}
      `}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-(--color-border)">
        {isOpen && (
          <div className="flex items-center gap-4">
            {theme?.logo ? (
              <img src={theme.logo} alt="Logo" className="h-8 w-8 object-contain text-(--color-text-primary)" />
            ) : (
              <div className="w-8 h-8 rounded-xs gradient-primary" />
            )}
            <span className="text-xl font-semibold text-(--color-text-primary)">
              Volta
            </span>
          </div>
        )}
        <button
          onClick={onToggle}
          className="p-2 rounded-xs hover:bg-(--color-surface-hover) transition-colors"
        >
          {isOpen ? <ChevronLeft className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="p-2 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-xs
              transition-colors duration-150
              ${currentPage === item.id
                ? 'bg-(--color-primary) text-white'
                : 'text-(--color-text-primary) hover:bg-(--color-surface-hover)'}
            `}
            title={!isOpen ? item.label : undefined}
          >
            {item.icon}
            {isOpen && <span className="text-sm font-medium">{item.label}</span>}
          </button>
        ))}
      </nav>
    </aside>
  );
};

// ============================================================================
// Header
// ============================================================================

interface HeaderProps {
  sidebarOpen: boolean;
  onSearch?: (query: string) => void;
}

const Header: React.FC<HeaderProps> = ({ sidebarOpen }) => {
  const { t, i18n } = useTranslation('common');
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { locale, setLocale } = useTenantStore();

  const toggleDarkMode = () => {
    const newMode = themeManager.toggleDarkMode();
    setDarkMode(newMode);
  };

  const toggleLanguage = () => {
    const newLocale = locale === 'en' ? 'tr' : 'en';
    setLocale(newLocale);
    i18n.changeLanguage(newLocale);
  };

  return (
    <header
      className={`
        fixed top-0 right-0 h-16 z-20
        bg-(--color-surface) border-b border-(--color-border)
        flex items-center justify-between px-6
        transition-all duration-300
        ${sidebarOpen ? 'left-64' : 'left-16'}
      `}
    >
      {/* Search */}
      <div className="relative w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--color-text-muted)" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('actions.search')}
          className="w-full pl-10 pr-4 py-2 text-sm rounded-xs
            bg-(--color-surface-hover)
            text-(--color-text-primary)
            placeholder-(--color-text-muted)
            focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
        />
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        {/* Language Toggle */}
        <button
          onClick={toggleLanguage}
          className="p-2 rounded-xs hover:bg-(--color-surface-hover) transition-colors"
          title="Change Language"
        >
          <Globe className="w-5 h-5" />
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-xs hover:bg-(--color-surface-hover) transition-colors"
          title="Toggle Theme"
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Notifications */}
        <button className="relative p-2 rounded-xs hover:bg-(--color-surface-hover) transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* User Avatar */}
        <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center text-white font-medium ml-2">
          JD
        </div>
      </div>
    </header>
  );
};

// ============================================================================
// Demo Page Content
// ============================================================================

const demoPages: Record<string, PageMetadata> = {
  dashboard: {
    pageId: 'dashboard',
    title: { en: 'Dashboard', tr: 'Gösterge Paneli' },
    components: [
      {
        id: 'chart-1',
        type: 'graph',
        props: {
          chartType: 'bar',
          title: 'Monthly Sales',
          data: [
            { name: 'Jan', value: 4000 },
            { name: 'Feb', value: 3000 },
            { name: 'Mar', value: 5000 },
            { name: 'Apr', value: 4500 },
            { name: 'May', value: 6000 },
            { name: 'Jun', value: 5500 },
          ],
        },
      },
      {
        id: 'tree-1',
        type: 'data-tree',
        props: {
          data: [
            {
              id: '1',
              label: 'Organization',
              children: [
                {
                  id: '1-1', label: 'Sales Team', children: [
                    { id: '1-1-1', label: 'John Doe', icon: 'file' },
                    { id: '1-1-2', label: 'Jane Smith', icon: 'file' },
                  ]
                },
                {
                  id: '1-2', label: 'Marketing Team', children: [
                    { id: '1-2-1', label: 'Bob Wilson', icon: 'file' },
                  ]
                },
              ],
            },
          ],
          expandable: true,
        },
      },
    ],
    layout: 'grid',
  },
  customers: {
    pageId: 'customers',
    title: { en: 'Customers', tr: 'Müşteriler' },
    components: [
      {
        id: 'select-1',
        type: 'multi-select',
        props: {
          options: [
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' },
            { value: 'pending', label: 'Pending' },
          ],
          placeholder: 'Filter by status...',
          multiple: true,
          searchable: true,
        },
      },
    ],
    layout: 'stack',
  },
  analytics: {
    pageId: 'analytics',
    title: { en: 'Analytics', tr: 'Analitik' },
    components: [
      {
        id: 'pie-chart',
        type: 'graph',
        props: {
          chartType: 'pie',
          title: 'Revenue by Category',
          data: [
            { name: 'Electronics', value: 35 },
            { name: 'Clothing', value: 25 },
            { name: 'Books', value: 15 },
            { name: 'Home & Garden', value: 15 },
            { name: 'Other', value: 10 },
          ],
        },
      },
      {
        id: 'line-chart',
        type: 'graph',
        props: {
          chartType: 'area',
          title: 'Website Traffic',
          data: [
            { name: 'Week 1', value: 1200 },
            { name: 'Week 2', value: 1900 },
            { name: 'Week 3', value: 1500 },
            { name: 'Week 4', value: 2500 },
          ],
        },
      },
    ],
    layout: 'grid',
  },
  documents: {
    pageId: 'documents',
    title: { en: 'Documents', tr: 'Belgeler' },
    components: [
      {
        id: 'query-builder-1',
        type: 'query-builder',
        props: {
          showPreview: true,
          fields: [
            { name: 'id', label: 'Document ID', dataType: 'number' },
            { name: 'title', label: 'Title', dataType: 'string' },
            { name: 'author', label: 'Author', dataType: 'string' },
            {
              name: 'status', label: 'Status', dataType: 'string', valueEditorType: 'select', values: [
                { name: 'draft', label: 'Draft' },
                { name: 'review', label: 'In Review' },
                { name: 'published', label: 'Published' },
                { name: 'archived', label: 'Archived' },
              ]
            },
            { name: 'createdAt', label: 'Created At', dataType: 'date', inputType: 'date' },
            { name: 'tags', label: 'Tags', dataType: 'string' },
            { name: 'views', label: 'View Count', dataType: 'number' },
          ],
        },
      },
    ],
    layout: 'stack',
  },
  settings: {
    pageId: 'settings',
    title: { en: 'Settings', tr: 'Ayarlar' },
    components: [
      {
        id: 'form-builder-1',
        type: 'form-builder',
        props: {
          previewMode: false,
          initialFields: [
            {
              id: 'field-1',
              type: 'text',
              name: 'companyName',
              label: 'Company Name',
              placeholder: 'Enter company name',
              required: true,
            },
            {
              id: 'field-2',
              type: 'email',
              name: 'contactEmail',
              label: 'Contact Email',
              placeholder: 'contact@company.com',
              required: true,
            },
            {
              id: 'field-3',
              type: 'select',
              name: 'timezone',
              label: 'Timezone',
              required: true,
              options: [
                { value: 'utc', label: 'UTC' },
                { value: 'europe-istanbul', label: 'Europe/Istanbul' },
                { value: 'america-new-york', label: 'America/New York' },
                { value: 'asia-tokyo', label: 'Asia/Tokyo' },
              ],
            },
            {
              id: 'field-4',
              type: 'checkbox',
              name: 'notifications',
              label: 'Email Notifications',
              placeholder: 'Receive email notifications',
            },
          ],
        },
      },
    ],
    layout: 'stack',
  },
};

// ============================================================================
// Runtime Main Component
// ============================================================================

const Runtime: React.FC = () => {
  const { t } = useTranslation('common');
  const { sidebarOpen, currentPage, toggleSidebar, setCurrentPage } = useRuntimeStore();
  const { pages, setPages } = useMetadataStore();

  // Load demo pages on mount
  useEffect(() => {
    setPages(demoPages);
    if (!currentPage) {
      setCurrentPage('dashboard');
    }
  }, [setPages, setCurrentPage, currentPage]);

  const activePage = pages[currentPage || 'dashboard'];

  const handleComponentError = (componentId: string, error: Error) => {
    console.error(`Component ${componentId} error:`, error);
  };

  return (
    <div className="min-h-screen bg-(--color-background)">
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={toggleSidebar}
        currentPage={currentPage || 'dashboard'}
        onNavigate={setCurrentPage}
      />

      <Header sidebarOpen={sidebarOpen} />

      <main
        className={`
          pt-24 pb-8 px-8
          transition-all duration-300
          ${sidebarOpen ? 'ml-64' : 'ml-16'}
        `}
      >
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-(--color-text-primary)">
            {activePage?.title?.[useTenantStore.getState().locale] || activePage?.title?.['en'] || 'Page'}
          </h1>
        </div>

        {/* Page Content */}
        {activePage ? (
          <PageRenderer
            page={activePage}
            layout={typeof activePage.layout === 'string' ? activePage.layout : 'stack'}
            onComponentError={handleComponentError}
          />
        ) : (
          <div className="p-8 text-center text-(--color-text-muted)">
            {t('app.loading')}
          </div>
        )}
      </main>
    </div>
  );
};

export default Runtime;
