// ============================================================================
// Query Builder Component - Visual Database Query Creator
// ============================================================================

import {
  Code,
  Copy,
  Database,
  FileJson,
  Filter,
  Play,
  Plus,
  RefreshCw,
  Table,
  Trash2,
} from 'lucide-react';
import React, { useCallback, useMemo, useState } from 'react';
import {
  type Field,
  QueryBuilder as RQB,
  type RuleGroupType,
  defaultOperators,
  formatQuery
} from 'react-querybuilder';
import 'react-querybuilder/dist/query-builder.css';

// ============================================================================
// Types
// ============================================================================

export interface QueryField extends Field {
  dataType?: 'string' | 'number' | 'date' | 'boolean' | 'array';
  tableName?: string;
}

export interface QueryBuilderProps {
  /** Available fields for querying */
  fields?: QueryField[];
  /** Initial query state */
  initialQuery?: RuleGroupType;
  /** Callback when query changes */
  onQueryChange?: (query: RuleGroupType) => void;
  /** Callback when query is executed */
  onExecute?: (query: RuleGroupType, formatted: QueryFormats) => void;
  /** Available tables/entities */
  tables?: TableDefinition[];
  /** Component ID for metadata */
  componentId?: string;
  /** Show query preview */
  showPreview?: boolean;
  /** Allow multiple tables */
  multiTable?: boolean;
}

export interface TableDefinition {
  name: string;
  label: string;
  fields: QueryField[];
}

export interface QueryFormats {
  sql: string;
  json: string;
  mongodb: string;
  parameterized: { sql: string; params: unknown[] };
}

// ============================================================================
// Custom Operators
// ============================================================================

const customOperators = [
  ...defaultOperators,
  { name: 'isEmpty', label: 'is empty' },
  { name: 'isNotEmpty', label: 'is not empty' },
  { name: 'startsWith', label: 'starts with' },
  { name: 'endsWith', label: 'ends with' },
  { name: 'between', label: 'between' },
  { name: 'notBetween', label: 'not between' },
];

// ============================================================================
// Default Fields (Demo)
// ============================================================================

const defaultFields: QueryField[] = [
  { name: 'id', label: 'ID', dataType: 'number' },
  { name: 'firstName', label: 'First Name', dataType: 'string' },
  { name: 'lastName', label: 'Last Name', dataType: 'string' },
  { name: 'email', label: 'Email', dataType: 'string' },
  { name: 'age', label: 'Age', dataType: 'number' },
  { name: 'createdAt', label: 'Created At', dataType: 'date', inputType: 'date' },
  { name: 'isActive', label: 'Is Active', dataType: 'boolean', valueEditorType: 'checkbox' },
  {
    name: 'department', label: 'Department', dataType: 'string', valueEditorType: 'select', values: [
      { name: 'sales', label: 'Sales' },
      { name: 'engineering', label: 'Engineering' },
      { name: 'marketing', label: 'Marketing' },
      { name: 'hr', label: 'Human Resources' },
    ]
  },
  { name: 'salary', label: 'Salary', dataType: 'number' },
  {
    name: 'country', label: 'Country', dataType: 'string', valueEditorType: 'select', values: [
      { name: 'us', label: 'United States' },
      { name: 'uk', label: 'United Kingdom' },
      { name: 'tr', label: 'Turkey' },
      { name: 'de', label: 'Germany' },
    ]
  },
];

// ============================================================================
// Default Query
// ============================================================================

const defaultQuery: RuleGroupType = {
  combinator: 'and',
  rules: [],
};

// ============================================================================
// Query Builder Component
// ============================================================================

const QueryBuilder: React.FC<QueryBuilderProps> = ({
  fields = defaultFields,
  initialQuery = defaultQuery,
  onQueryChange,
  onExecute,
  tables = [],
  showPreview = true,
}) => {
  const [query, setQuery] = useState<RuleGroupType>(initialQuery);
  const [activeFormat, setActiveFormat] = useState<'sql' | 'json' | 'mongodb'>('sql');
  const [selectedTable, setSelectedTable] = useState<string>(tables[0]?.name || '');
  const [copied, setCopied] = useState(false);

  // Get fields based on selected table
  const activeFields = useMemo(() => {
    if (tables.length > 0 && selectedTable) {
      const table = tables.find(t => t.name === selectedTable);
      return table?.fields || [];
    }
    return fields;
  }, [tables, selectedTable, fields]);

  // Format query to different outputs
  const formattedQuery = useMemo((): QueryFormats => {
    try {
      return {
        sql: formatQuery(query, 'sql'),
        json: formatQuery(query, 'json'),
        mongodb: formatQuery(query, 'mongodb'),
        parameterized: formatQuery(query, 'parameterized') as { sql: string; params: unknown[] },
      };
    } catch {
      return {
        sql: '-- Invalid query',
        json: '{}',
        mongodb: '{}',
        parameterized: { sql: '', params: [] },
      };
    }
  }, [query]);

  // Handle query change
  const handleQueryChange = useCallback((newQuery: RuleGroupType) => {
    setQuery(newQuery);
    onQueryChange?.(newQuery);
  }, [onQueryChange]);

  // Handle execute
  const handleExecute = useCallback(() => {
    onExecute?.(query, formattedQuery);
  }, [query, formattedQuery, onExecute]);

  // Handle reset
  const handleReset = useCallback(() => {
    setQuery(defaultQuery);
    onQueryChange?.(defaultQuery);
  }, [onQueryChange]);

  // Handle copy
  const handleCopy = useCallback(async () => {
    const textToCopy = activeFormat === 'sql'
      ? formattedQuery.sql
      : activeFormat === 'json'
        ? formattedQuery.json
        : formattedQuery.mongodb;

    await navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [activeFormat, formattedQuery]);

  return (
    <div className="rounded-xl border border-(--color-border) bg-(--color-surface) overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-(--color-border) bg-linear-to-r from-(--color-surface) to-(--color-surface-hover)">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xs bg-(--color-primary) bg-opacity-10">
            <Filter className="w-5 h-5 text-(--color-primary)" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-(--color-text-primary)">
              Query Builder
            </h3>
            <p className="text-xs text-(--color-text-muted)">
              Build database queries visually
            </p>
          </div>
        </div>

        {/* Table Selector */}
        {tables.length > 0 && (
          <div className="flex items-center gap-2">
            <Table className="w-4 h-4 text-(--color-text-muted)" />
            <select
              value={selectedTable}
              onChange={(e) => setSelectedTable(e.target.value)}
              className="px-3 py-1.5 text-sm rounded-xs border border-(--color-border)
                bg-(--color-surface) text-(--color-text-primary)
                focus:ring-2 focus:ring-(--color-primary) focus:border-transparent"
            >
              {tables.map((table) => (
                <option key={table.name} value={table.name}>
                  {table.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-xs
              text-(--color-text-secondary) hover:bg-(--color-surface-hover)
              transition-colors"
            title="Reset Query"
          >
            <RefreshCw className="w-4 h-4" />
            Reset
          </button>
          <button
            onClick={handleExecute}
            className="flex items-center gap-1.5 px-4 py-1.5 text-sm rounded-xs
              bg-(--color-primary) text-white hover:opacity-90
              transition-opacity"
          >
            <Play className="w-4 h-4" />
            Execute
          </button>
        </div>
      </div>

      {/* Query Builder */}
      <div className="p-4 query-builder-wrapper">
        <RQB
          fields={activeFields}
          query={query}
          onQueryChange={handleQueryChange}
          operators={customOperators}
          controlClassnames={{
            queryBuilder: 'qb-custom',
            ruleGroup: 'qb-rule-group',
            header: 'qb-header',
            body: 'qb-body',
            combinators: 'qb-combinators',
            addRule: 'qb-add-rule',
            addGroup: 'qb-add-group',
            removeGroup: 'qb-remove-group',
            rule: 'qb-rule',
            fields: 'qb-fields',
            operators: 'qb-operators',
            value: 'qb-value',
            removeRule: 'qb-remove-rule',
          }}
          controlElements={{
            addRuleAction: ({ handleOnClick, disabled, title }) => (
              <button
                onClick={handleOnClick}
                disabled={disabled}
                title={title}
                type="button"
                className="flex items-center gap-1 px-2 py-1 text-xs rounded
                  text-(--color-primary) hover:bg-(--color-primary-light)
                  transition-colors"
              >
                <Plus className="w-3 h-3" />
                Rule
              </button>
            ),
            addGroupAction: ({ handleOnClick, disabled, title }) => (
              <button
                onClick={handleOnClick}
                disabled={disabled}
                title={title}
                type="button"
                className="flex items-center gap-1 px-2 py-1 text-xs rounded
                  text-(--color-secondary) hover:bg-(--color-secondary) hover:bg-opacity-10
                  transition-colors"
              >
                <Plus className="w-3 h-3" />
                Group
              </button>
            ),
            removeRuleAction: ({ handleOnClick, disabled, title }) => (
              <button
                onClick={handleOnClick}
                disabled={disabled}
                title={title}
                type="button"
                className="p-1 rounded text-red-500 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            ),
            removeGroupAction: ({ handleOnClick, disabled, title }) => (
              <button
                onClick={handleOnClick}
                disabled={disabled}
                title={title}
                type="button"
                className="p-1 rounded text-red-500 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            ),
          }}
        />

        {query.rules.length === 0 && (
          <div className="mt-4 p-6 rounded-xs border-2 border-dashed border-(--color-border) text-center">
            <Database className="w-10 h-10 mx-auto mb-3 text-(--color-text-muted) opacity-50" />
            <p className="text-sm text-(--color-text-muted)">
              No rules defined. Click <strong>"+ Rule"</strong> to add a condition.
            </p>
          </div>
        )}
      </div>

      {/* Query Preview */}
      {showPreview && query.rules.length > 0 && (
        <div className="border-t border-(--color-border)">
          {/* Format Tabs */}
          <div className="flex items-center justify-between px-4 py-2 bg-(--color-surface-hover)">
            <div className="flex gap-1">
              <button
                onClick={() => setActiveFormat('sql')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-xs transition-colors
                  ${activeFormat === 'sql'
                    ? 'bg-(--color-primary) text-white'
                    : 'text-(--color-text-secondary) hover:bg-(--color-surface)'}`}
              >
                <Database className="w-3.5 h-3.5" />
                SQL
              </button>
              <button
                onClick={() => setActiveFormat('json')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-xs transition-colors
                  ${activeFormat === 'json'
                    ? 'bg-(--color-primary) text-white'
                    : 'text-(--color-text-secondary) hover:bg-(--color-surface)'}`}
              >
                <FileJson className="w-3.5 h-3.5" />
                JSON
              </button>
              <button
                onClick={() => setActiveFormat('mongodb')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-xs transition-colors
                  ${activeFormat === 'mongodb'
                    ? 'bg-(--color-primary) text-white'
                    : 'text-(--color-text-secondary) hover:bg-(--color-surface)'}`}
              >
                <Code className="w-3.5 h-3.5" />
                MongoDB
              </button>
            </div>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-xs
                text-(--color-text-secondary) hover:bg-(--color-surface)
                transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>

          {/* Query Output */}
          <div className="p-4">
            <pre className="p-4 rounded-xs bg-[#1e1e1e] text-[#d4d4d4] text-sm font-mono overflow-x-auto">
              <code>
                {activeFormat === 'sql' && formattedQuery.sql}
                {activeFormat === 'json' && JSON.stringify(JSON.parse(formattedQuery.json), null, 2)}
                {activeFormat === 'mongodb' && formattedQuery.mongodb}
              </code>
            </pre>
          </div>
        </div>
      )}

      {/* Custom Styles */}
      <style>{`
        .query-builder-wrapper .queryBuilder {
          background: transparent;
          font-family: inherit;
        }

        .query-builder-wrapper .ruleGroup {
          background: var(--color-surface-hover);
          border: 1px solid var(--color-border);
          border-radius: 0.75rem;
          padding: 1rem;
          margin: 0.5rem 0;
        }

        .query-builder-wrapper .ruleGroup-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid var(--color-border);
        }

        .query-builder-wrapper .ruleGroup-body {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .query-builder-wrapper .rule {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem;
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: 0.5rem;
        }

        .query-builder-wrapper select,
        .query-builder-wrapper input[type="text"],
        .query-builder-wrapper input[type="number"],
        .query-builder-wrapper input[type="date"] {
          padding: 0.375rem 0.75rem;
          font-size: 0.875rem;
          border: 1px solid var(--color-border);
          border-radius: 0.375rem;
          background: var(--color-surface);
          color: var(--color-text-primary);
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .query-builder-wrapper select:focus,
        .query-builder-wrapper input:focus {
          border-color: var(--color-primary);
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
        }

        .query-builder-wrapper .ruleGroup-combinators {
          font-weight: 600;
          color: var(--color-text-primary);
        }

        .query-builder-wrapper .ruleGroup-combinators select {
          font-weight: 600;
          text-transform: uppercase;
          background: var(--color-primary);
          color: white;
          border-color: var(--color-primary);
        }

        .query-builder-wrapper input[type="checkbox"] {
          width: 1rem;
          height: 1rem;
          accent-color: var(--color-primary);
        }
      `}</style>
    </div>
  );
};

export default QueryBuilder;
