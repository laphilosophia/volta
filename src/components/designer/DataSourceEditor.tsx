// ============================================================================
// Data Source Editor Component
// ============================================================================

import {
  Code,
  Database,
  FileJson,
  Globe,
  Link,
  Play,
  RefreshCw,
} from 'lucide-react';
import React, { useCallback, useState } from 'react';
import type { DataSourceConfig, DataSourceType } from '../../core/types/layout';

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
  const [testResult, setTestResult] = useState<{ success: boolean; data?: unknown; error?: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const handleTypeChange = useCallback((type: DataSourceType) => {
    onChange({ ...config, type });
  }, [config, onChange]);

  const handleApiChange = useCallback((field: string, value: unknown) => {
    onChange({ ...config, [field]: value });
  }, [config, onChange]);

  const handleTest = useCallback(async () => {
    if (!onTestConnection) return;

    setIsTesting(true);
    setTestResult(null);

    try {
      const result = await onTestConnection(config);
      setTestResult(result);
    } catch (error) {
      setTestResult({ success: false, error: String(error) });
    } finally {
      setIsTesting(false);
    }
  }, [config, onTestConnection]);

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

      {/* API Configuration */}
      {config.type === 'api' && (
        <div className="space-y-3 p-3 rounded-xs bg-(--color-surface-hover)">
          <div>
            <label className="block text-xs font-medium text-(--color-text-secondary) mb-1">
              Endpoint URL
            </label>
            <input
              type="text"
              value={config.endpoint || ''}
              onChange={(e) => handleApiChange('endpoint', e.target.value)}
              placeholder="https://api.example.com/data"
              className="w-full px-3 py-2 text-sm rounded-xs border border-(--color-border)
                bg-(--color-surface) text-(--color-text-primary)
                focus:ring-2 focus:ring-(--color-primary) focus:border-transparent"
            />
          </div>

          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-xs font-medium text-(--color-text-secondary) mb-1">
                Method
              </label>
              <select
                value={config.method || 'GET'}
                onChange={(e) => handleApiChange('method', e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xs border border-(--color-border)
                  bg-(--color-surface) text-(--color-text-primary)"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-(--color-text-secondary) mb-1">
                Refresh Interval
              </label>
              <select
                value={config.refreshInterval || 0}
                onChange={(e) => handleApiChange('refreshInterval', Number(e.target.value))}
                className="w-full px-3 py-2 text-sm rounded-xs border border-(--color-border)
                  bg-(--color-surface) text-(--color-text-primary)"
              >
                <option value={0}>Manual</option>
                <option value={5000}>5 seconds</option>
                <option value={30000}>30 seconds</option>
                <option value={60000}>1 minute</option>
                <option value={300000}>5 minutes</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-(--color-text-secondary) mb-1">
              Response Path (optional)
            </label>
            <input
              type="text"
              value={config.responsePath || ''}
              onChange={(e) => handleApiChange('responsePath', e.target.value)}
              placeholder="data.items"
              className="w-full px-3 py-2 text-sm rounded-xs border border-(--color-border)
                bg-(--color-surface) text-(--color-text-primary)
                focus:ring-2 focus:ring-(--color-primary) focus:border-transparent"
            />
            <p className="mt-1 text-xs text-(--color-text-muted)">
              Extract nested data from response (e.g., "data.results")
            </p>
          </div>

          {onTestConnection && (
            <button
              onClick={handleTest}
              disabled={isTesting || !config.endpoint}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm
                bg-(--color-primary) text-white rounded-xs
                hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {isTesting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              Test Connection
            </button>
          )}
        </div>
      )}

      {/* Query Builder Configuration */}
      {config.type === 'query' && (
        <div className="space-y-3 p-3 rounded-xs bg-(--color-surface-hover)">
          <div>
            <label className="block text-xs font-medium text-(--color-text-secondary) mb-1">
              Table/Collection Name
            </label>
            <input
              type="text"
              value={config.table || ''}
              onChange={(e) => handleApiChange('table', e.target.value)}
              placeholder="customers"
              className="w-full px-3 py-2 text-sm rounded-xs border border-(--color-border)
                bg-(--color-surface) text-(--color-text-primary)
                focus:ring-2 focus:ring-(--color-primary) focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-(--color-text-secondary) mb-1">
              Output Format
            </label>
            <select
              value={config.outputFormat || 'sql'}
              onChange={(e) => handleApiChange('outputFormat', e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xs border border-(--color-border)
                bg-(--color-surface) text-(--color-text-primary)"
            >
              <option value="sql">SQL</option>
              <option value="json">JSON</option>
              <option value="mongodb">MongoDB</option>
            </select>
          </div>

          <div className="p-3 rounded-xs bg-(--color-surface) border border-(--color-border)">
            <div className="flex items-center gap-2 text-sm text-(--color-text-muted)">
              <Code className="w-4 h-4" />
              <span>Query Builder will appear in component editor</span>
            </div>
          </div>
        </div>
      )}

      {/* Static JSON Configuration */}
      {config.type === 'static' && (
        <div className="space-y-3 p-3 rounded-xs bg-(--color-surface-hover)">
          <div>
            <label className="block text-xs font-medium text-(--color-text-secondary) mb-1">
              Static Data (JSON)
            </label>
            <textarea
              value={typeof config.staticData === 'string'
                ? config.staticData
                : JSON.stringify(config.staticData || [], null, 2)}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  handleApiChange('staticData', parsed);
                } catch {
                  // Keep as string if invalid JSON
                  handleApiChange('staticData', e.target.value);
                }
              }}
              placeholder='[{"id": 1, "name": "Sample"}]'
              rows={6}
              className="w-full px-3 py-2 text-sm font-mono rounded-xs border border-(--color-border) bg-(--color-surface) text-(--color-text-primary) focus:ring-2 focus:ring-(--color-primary) focus:border-transparent"
            />
          </div>
        </div>
      )}

      {/* Component Binding Configuration */}
      {config.type === 'binding' && (
        <div className="space-y-3 p-3 rounded-xs bg-(--color-surface-hover)">
          {availableBindings.length > 0 ? (
            <>
              <div>
                <label className="block text-xs font-medium text-(--color-text-secondary) mb-1">
                  Source Component
                </label>
                <select
                  value={config.bindingSource?.componentId || ''}
                  onChange={(e) => handleApiChange('bindingSource', {
                    ...config.bindingSource,
                    componentId: e.target.value,
                    outputKey: '',
                  })}
                  className="w-full px-3 py-2 text-sm rounded-xs border border-(--color-border) bg-(--color-surface) text-(--color-text-primary)">
                  <option value="">Select component...</option>
                  {availableBindings.map((binding) => (
                    <option key={binding.componentId} value={binding.componentId}>
                      {binding.componentName}
                    </option>
                  ))}
                </select>
              </div>

              {config.bindingSource?.componentId && (
                <div>
                  <label className="block text-xs font-medium text-(--color-text-secondary) mb-1">
                    Output Value
                  </label>
                  <select
                    value={config.bindingSource?.outputKey || ''}
                    onChange={(e) => handleApiChange('bindingSource', {
                      ...config.bindingSource,
                      outputKey: e.target.value,
                    })}
                    className="w-full px-3 py-2 text-sm rounded-xs border border-(--color-border) bg-(--color-surface) text-(--color-text-primary)"
                  >
                    <option value="">Select output...</option>
                    {availableBindings
                      .find(b => b.componentId === config.bindingSource?.componentId)
                      ?.outputs.map((output) => (
                        <option key={output.key} value={output.key}>
                          {output.label}
                        </option>
                      ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-(--color-text-secondary) mb-1">
                  Transform (optional)
                </label>
                <input
                  type="text"
                  value={config.bindingSource?.transform || ''}
                  onChange={(e) => handleApiChange('bindingSource', {
                    ...config.bindingSource,
                    transform: e.target.value,
                  })}
                  placeholder="item => item.children"
                  className="w-full px-3 py-2 text-sm rounded-xs border border-(--color-border) bg-(--color-surface) text-(--color-text-primary) focus:ring-2 focus:ring-(--color-primary) focus:border-transparent"
                />
              </div>
            </>
          ) : (
            <div className="text-center py-4 text-sm text-(--color-text-muted)">
              <Link className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No components available for binding.</p>
              <p className="text-xs mt-1">Add components that emit data first.</p>
            </div>
          )}
        </div>
      )}

      {/* Test Result */}
      {testResult && (
        <div className={`p-3 rounded-xs border ${testResult.success
          ? 'bg-green-50 border-green-200'
          : 'bg-red-50 border-red-200'
          }`}>
          <p className={`text-sm font-medium ${testResult.success ? 'text-green-700' : 'text-red-700'}`}>
            {testResult.success ? '✓ Connection successful' : '✗ Connection failed'}
          </p>
          {testResult.error && (
            <p className="text-xs text-red-600 mt-1">{testResult.error}</p>
          )}
          {testResult.success && testResult.data !== undefined && testResult.data !== null ? (
            <pre className="mt-2 p-2 text-xs bg-white rounded overflow-auto max-h-32">
              {JSON.stringify(testResult.data, null, 2)}
            </pre>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default DataSourceEditor;
