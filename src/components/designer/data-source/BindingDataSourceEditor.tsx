import { Link } from 'lucide-react'
import React from 'react'
import type { DataSourceConfig } from '../../../core/types/layout'
import { FormSection, FormSelect } from '../shared/DesignerForm'

interface BindingDataSourceEditorProps {
  config: DataSourceConfig
  onChange: (updates: Partial<DataSourceConfig>) => void
  availableBindings: {
    componentId: string
    componentName: string
    outputs: { key: string; label: string }[]
  }[]
}

export const BindingDataSourceEditor: React.FC<BindingDataSourceEditorProps> = ({
  config,
  onChange,
  availableBindings,
}) => {
  return (
    <FormSection>
      {availableBindings.length > 0 ? (
        <>
          <FormSelect
            label="Source Component"
            value={config.bindingSource?.componentId || ''}
            onChange={(e) =>
              onChange({
                bindingSource: {
                  componentId: e.target.value,
                  outputKey: '', // Reset output key when component changes
                  transform: config.bindingSource?.transform,
                },
              })
            }
          >
            <option value="">Select component...</option>
            {availableBindings.map((binding) => (
              <option key={binding.componentId} value={binding.componentId}>
                {binding.componentName}
              </option>
            ))}
          </FormSelect>

          {config.bindingSource?.componentId && (
            <FormSelect
              label="Output Value"
              value={config.bindingSource?.outputKey || ''}
              onChange={(e) =>
                onChange({
                  bindingSource: {
                    transform: config.bindingSource?.transform,
                    componentId: config.bindingSource?.componentId || '',
                    outputKey: e.target.value,
                  },
                })
              }
            >
              <option value="">Select output...</option>
              {availableBindings
                .find((b) => b.componentId === config.bindingSource?.componentId)
                ?.outputs.map((output) => (
                  <option key={output.key} value={output.key}>
                    {output.label}
                  </option>
                ))}
            </FormSelect>
          )}

          {/*
            SECURITY: 'transform' field removed to prevent XSS.
            Do not re-add without a safe sandboxed execution environment.
          */}
        </>
      ) : (
        <div className="text-center py-4 text-sm text-(--color-text-muted)">
          <Link className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>No components available for binding.</p>
          <p className="text-xs mt-1">Add components that emit data first.</p>
        </div>
      )}
    </FormSection>
  )
}
