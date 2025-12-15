// ============================================================================
// Data Source Editor Component
// ============================================================================

import {
  Database,
  FileJson,
  Globe,
  Link
} from 'lucide-react';
import React, { useCallback } from 'react';
import type { DataSourceConfig, DataSourceType } from '../../core/types/layout';
import {
  ApiDataSourceEditor,
  BindingDataSourceEditor,
  QueryDataSourceEditor,
  StaticDataSourceEditor
} from './data-source';

// ============================================================================
// Types
// ============================================================================

interface DataSourceEditorProps {
  config: DataSourceConfig;
  onChange: (config: DataSourceConfig) => void;
  availableBindings?: {
    componentId: string;
    componentName: string;
    outputs: { key: string; label: string }[];
  }[];
  onTestConnection?: (config: DataSourceConfig) => Promise<{ success: boolean; data?: unknown; error?: string }>;
}

// ============================================================================
// Data Source Type Selector
// ============================================================================

const dataSourceTypes: { type: DataSourceType; label: string; icon: React.ReactNode; description: string }[] = [
  {
    type: 'api',
    label: 'API Endpoint',
    icon: <Globe className="w-4 h-4" />,
    description: 'Fetch data from REST API',
  },
  {
    type: 'query',
    label: 'Query Builder',
    icon: <Database className="w-4 h-4" />,
    description: 'Build database query',
  },
  {
    type: 'static',
    label: 'Static JSON',
    icon: <FileJson className="w-4 h-4" />,
    description: 'Use static data',
  },
  {
    type: 'binding',
    label: 'Component Binding',
    icon: <Link className="w-4 h-4" />,
    description: 'Bind to another component',
  },
];

// ============================================================================
// Main Component
// ============================================================================

const DataSourceEditor: React.FC<DataSourceEditorProps> = ({
  config,
  onChange,
  availableBindings = [],
  onTestConnection,
}) => {

  const handleTypeChange = useCallback((type: DataSourceType) => {
    onChange({ ...config, type });
  }, [config, onChange]);

  const handleUpdate = useCallback((updates: Partial<DataSourceConfig>) => {
    onChange({ ...config, ...updates });
  }, [config, onChange]);

  return (
    <div className="space-y-4">
      {/* Data Source Type Selection */}
      <div>
        <label className="block text-xs font-medium text-(--color-text-secondary) mb-2">
          Data Source Type
        </label>
        <div className="grid grid-cols-2 gap-2">
          {dataSourceTypes.map(({ type, label, icon, description }) => (
            <button
              key={type}
              onClick={() => handleTypeChange(type)}
              className={`
                p-3 rounded-xs border text-left transition-all
                ${config.type === type
                  ? 'border-(--color-primary) bg-(--color-primary)/5'
                  : 'border-(--color-border) hover:border-(--color-primary) hover:bg-(--color-surface-hover)'}
              `}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={config.type === type ? 'text-(--color-primary)' : 'text-(--color-text-muted)'}>
                  {icon}
                </span>
                <span className={`text-sm font-medium ${config.type === type ? 'text-(--color-primary)' : 'text-(--color-text-primary)'}`}>
                  {label}
                </span>
              </div>
              <p className="text-xs text-(--color-text-muted)">{description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Editor Content */}
      <div className="mt-4">
        {config.type === 'api' && (
          <ApiDataSourceEditor
            config={config}
            onChange={handleUpdate}
            onTestConnection={onTestConnection}
          />
        )}

        {config.type === 'query' && (
          <QueryDataSourceEditor
            config={config}
            onChange={handleUpdate}
          />
        )}

        {config.type === 'static' && (
          <StaticDataSourceEditor
            config={config}
            onChange={handleUpdate}
          />
        )}

        {config.type === 'binding' && (
          <BindingDataSourceEditor
            config={config}
            onChange={handleUpdate}
            availableBindings={availableBindings}
          />
        )}
      </div>
    </div>
  );
};

export default DataSourceEditor;
