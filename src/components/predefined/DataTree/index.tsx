// ============================================================================
// Data Tree Component
// ============================================================================

import { ChevronDown, ChevronRight, File, Folder, FolderOpen } from 'lucide-react';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface TreeNode {
  id: string;
  label: string;
  children?: TreeNode[];
  icon?: 'folder' | 'file';
  data?: Record<string, unknown>;
}

interface DataTreeProps {
  data?: TreeNode[];
  dataSource?: {
    query: Record<string, unknown>;
    schema: Record<string, unknown>;
  };
  expandable?: boolean;
  selectable?: boolean;
  onSelect?: (node: TreeNode) => void;
  defaultExpanded?: string[];
  componentId?: string;
}

const DataTree: React.FC<DataTreeProps> = ({
  data = [],
  expandable = true,
  selectable = false,
  onSelect,
  defaultExpanded = [],
}) => {
  const { t } = useTranslation('components');
  const [expanded, setExpanded] = useState<Set<string>>(new Set(defaultExpanded));
  const [selected, setSelected] = useState<string | null>(null);

  const toggleExpand = useCallback((nodeId: string) => {
    if (!expandable) return;

    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  }, [expandable]);

  const handleSelect = useCallback((node: TreeNode) => {
    if (!selectable) return;

    setSelected(node.id);
    onSelect?.(node);
  }, [selectable, onSelect]);

  const expandAll = useCallback(() => {
    const allIds = new Set<string>();
    const collectIds = (nodes: TreeNode[]) => {
      nodes.forEach((node) => {
        if (node.children?.length) {
          allIds.add(node.id);
          collectIds(node.children);
        }
      });
    };
    collectIds(data);
    setExpanded(allIds);
  }, [data]);

  const collapseAll = useCallback(() => {
    setExpanded(new Set());
  }, []);

  const renderNode = useMemo(() => {
    const render = (node: TreeNode, level: number = 0): React.ReactNode => {
      const hasChildren = node.children && node.children.length > 0;
      const isExpanded = expanded.has(node.id);
      const isSelected = selected === node.id;

      return (
        <div key={node.id} className="select-none">
          <div
            className={`
              flex items-center gap-2 py-1.5 px-2 rounded-md cursor-pointer
              transition-colors duration-150
              hover:bg-[var(--color-surface-hover)]
              ${isSelected ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)]' : ''}
            `}
            style={{ paddingLeft: `${level * 1.25 + 0.5}rem` }}
            onClick={() => {
              if (hasChildren) toggleExpand(node.id);
              handleSelect(node);
            }}
          >
            {/* Expand/Collapse Icon */}
            {hasChildren ? (
              <button
                className="p-0.5 hover:bg-[var(--color-surface-hover)] rounded transition-transform duration-200"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpand(node.id);
                }}
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-[var(--color-text-secondary)]" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-[var(--color-text-secondary)]" />
                )}
              </button>
            ) : (
              <span className="w-5" />
            )}

            {/* Node Icon */}
            {node.icon === 'file' ? (
              <File className="w-4 h-4 text-[var(--color-text-muted)]" />
            ) : hasChildren ? (
              isExpanded ? (
                <FolderOpen className="w-4 h-4 text-[var(--color-accent)]" />
              ) : (
                <Folder className="w-4 h-4 text-[var(--color-accent)]" />
              )
            ) : (
              <File className="w-4 h-4 text-[var(--color-text-muted)]" />
            )}

            {/* Node Label */}
            <span className="text-sm text-[var(--color-text-primary)]">
              {node.label}
            </span>
          </div>

          {/* Children */}
          {hasChildren && isExpanded && (
            <div className="animate-fadeIn">
              {node.children!.map((child) => render(child, level + 1))}
            </div>
          )}
        </div>
      );
    };

    return render;
  }, [expanded, selected, toggleExpand, handleSelect]);

  if (data.length === 0) {
    return (
      <div className="p-4 rounded-xs border border-[var(--color-border)] bg-[var(--color-surface)]">
        <p className="text-sm text-[var(--color-text-muted)] text-center">
          {t('dataTree.noData')}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xs border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-surface-hover)]">
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
          {t('dataTree.title')}
        </h3>
        {expandable && (
          <div className="flex gap-2">
            <button
              onClick={expandAll}
              className="text-xs text-[var(--color-primary)] hover:underline"
            >
              {t('dataTree.expand')}
            </button>
            <span className="text-[var(--color-text-muted)]">|</span>
            <button
              onClick={collapseAll}
              className="text-xs text-[var(--color-primary)] hover:underline"
            >
              {t('dataTree.collapse')}
            </button>
          </div>
        )}
      </div>

      {/* Tree Content */}
      <div className="p-2 max-h-[400px] overflow-y-auto">
        {data.map((node) => renderNode(node, 0))}
      </div>
    </div>
  );
};

export default DataTree;
