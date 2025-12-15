import { Code } from 'lucide-react'
import React from 'react'
import type { DataSourceConfig } from '../../../core/types/layout'
import { FormInput, FormSection, FormSelect } from '../shared/DesignerForm'

interface QueryDataSourceEditorProps {
  config: DataSourceConfig
  onChange: (updates: Partial<DataSourceConfig>) => void
}

export const QueryDataSourceEditor: React.FC<QueryDataSourceEditorProps> = ({
  config,
  onChange,
}) => {
  return (
    <FormSection>
      <FormInput
        label="Table/Collection Name"
        type="text"
        value={config.table || ''}
        onChange={(e) => onChange({ table: e.target.value })}
        placeholder="customers"
      />

      <FormSelect
        label="Output Format"
        value={config.outputFormat || 'sql'}
        onChange={(e) => onChange({ outputFormat: e.target.value as 'sql' | 'json' | 'mongodb' })}
      >
        <option value="sql">SQL</option>
        <option value="json">JSON</option>
        <option value="mongodb">MongoDB</option>
      </FormSelect>

      <div className="p-3 rounded-xs bg-(--color-surface) border border-(--color-border)">
        <div className="flex items-center gap-2 text-sm text-(--color-text-muted)">
          <Code className="w-4 h-4" />
          <span>Query Builder will appear in component editor</span>
        </div>
      </div>
    </FormSection>
  )
}
