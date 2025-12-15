
import React from 'react';
import type { DataSourceConfig } from '../../../core/types/layout';
import { FormSection, FormTextarea } from '../shared/DesignerForm';

interface StaticDataSourceEditorProps {
  config: DataSourceConfig;
  onChange: (updates: Partial<DataSourceConfig>) => void;
}

export const StaticDataSourceEditor: React.FC<StaticDataSourceEditorProps> = ({
  config,
  onChange,
}) => {
  return (
    <FormSection>
      <FormTextarea
        label="Static Data (JSON)"
        value={typeof config.staticData === 'string'
          ? config.staticData
          : JSON.stringify(config.staticData || [], null, 2)}
        onChange={(e) => {
          try {
            const parsed = JSON.parse(e.target.value);
            onChange({ staticData: parsed });
          } catch {
            // Keep as string if invalid JSON
            onChange({ staticData: e.target.value });
          }
        }}
        placeholder='[{"id": 1, "name": "Sample"}]'
        rows={6}
        className="font-mono"
      />
    </FormSection>
  );
};
