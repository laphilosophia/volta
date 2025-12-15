
import { Play, RefreshCw } from 'lucide-react';
import React, { useState } from 'react';
import type { DataSourceConfig } from '../../../core/types/layout';
import { voltaConfig } from '../../../voltaboard.config';
import { FormInput, FormSection, FormSelect } from '../shared/DesignerForm';

interface ApiDataSourceEditorProps {
  config: DataSourceConfig;
  onChange: (updates: Partial<DataSourceConfig>) => void;
  onTestConnection?: (config: DataSourceConfig) => Promise<{ success: boolean; data?: unknown; error?: string }>;
}

export const ApiDataSourceEditor: React.FC<ApiDataSourceEditorProps> = ({
  config,
  onChange,
  onTestConnection,
}) => {
  const [testResult, setTestResult] = useState<{ success: boolean; data?: unknown; error?: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const handleTest = async () => {
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
  };

  return (
    <FormSection>
      <FormSelect
        label="Select Endpoint"
        value={config.endpoint || ''}
        onChange={(e) => onChange({ endpoint: e.target.value })}
      >
        <option value="">-- Choose an endpoint --</option>
        {Object.entries(voltaConfig.endpoints).map(([key, def]) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const d = def as any;
          return (
            <option key={key} value={key}>
              {key} ({d.method} {d.path})
            </option>
          );
        })}
      </FormSelect>

      <div className="flex gap-2">
        <div className="flex-1">
          <FormSelect
            label="Method"
            value={config.method || 'GET'}
            onChange={(e) => onChange({ method: e.target.value as 'GET' | 'POST' | 'PUT' | 'DELETE' })}
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
          </FormSelect>
        </div>
        <div className="flex-1">
          <FormSelect
            label="Refresh Interval"
            value={config.refreshInterval || 0}
            onChange={(e) => onChange({ refreshInterval: Number(e.target.value) })}
          >
            <option value={0}>Manual</option>
            <option value={5000}>5 seconds</option>
            <option value={30000}>30 seconds</option>
            <option value={60000}>1 minute</option>
            <option value={300000}>5 minutes</option>
          </FormSelect>
        </div>
      </div>

      <div>
        <FormInput
          label="Response Path (optional)"
          type="text"
          value={config.responsePath || ''}
          onChange={(e) => onChange({ responsePath: e.target.value })}
          placeholder="data.items"
        />
        <p className="mt-1 text-xs text-(--color-text-muted)">
          Extract nested data from response (e.g., "data.results")
        </p>
      </div>

      {onTestConnection && (
        <>
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
        </>
      )}
    </FormSection>
  );
};
