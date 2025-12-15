// ============================================================================
// Multi Select Component
// ============================================================================

import { Check, ChevronDown, Search, X } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Option {
  value: string;
  label: string;
  disabled?: boolean;
}

interface MultiSelectProps {
  options?: Option[];
  value?: string[];
  onChange?: (value: string[]) => void;
  placeholder?: string;
  multiple?: boolean;
  searchable?: boolean;
  disabled?: boolean;
  dataSource?: {
    query: Record<string, unknown>;
    schema: Record<string, unknown>;
  };
  componentId?: string;
}

const MultiSelect: React.FC<MultiSelectProps> = ({
  options = [],
  value = [],
  onChange,
  placeholder,
  multiple = true,
  searchable = true,
  disabled = false,
}) => {
  const { t } = useTranslation('components');
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus input when opening
  useEffect(() => {
    if (isOpen && searchable && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, searchable]);

  const filteredOptions = useMemo(() => {
    if (!search) return options;
    return options.filter((opt) =>
      opt.label.toLowerCase().includes(search.toLowerCase())
    );
  }, [options, search]);

  const handleToggle = useCallback((optionValue: string) => {
    if (multiple) {
      const newValue = value.includes(optionValue)
        ? value.filter((v) => v !== optionValue)
        : [...value, optionValue];
      onChange?.(newValue);
    } else {
      onChange?.([optionValue]);
      setIsOpen(false);
    }
  }, [multiple, value, onChange]);

  const handleRemove = useCallback((optionValue: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.(value.filter((v) => v !== optionValue));
  }, [value, onChange]);

  const handleClear = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.([]);
    setSearch('');
  }, [onChange]);

  const selectedLabels = useMemo(() => {
    return value
      .map((v) => options.find((opt) => opt.value === v)?.label)
      .filter(Boolean) as string[];
  }, [value, options]);

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full min-h-[42px] px-3 py-2 rounded-xs border text-left
          flex items-center justify-between gap-2
          transition-all duration-200
          bg-[var(--color-surface)]
          border-[var(--color-border)]
          focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-[var(--color-primary)]'}
        `}
      >
        <div className="flex-1 flex flex-wrap gap-1">
          {selectedLabels.length > 0 ? (
            multiple ? (
              selectedLabels.map((label, idx) => (
                <span
                  key={value[idx]}
                  className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full
                    bg-[var(--color-primary-light)] text-[var(--color-primary)]"
                >
                  {label}
                  <X
                    className="w-3 h-3 cursor-pointer hover:text-[var(--color-primary-dark)]"
                    onClick={(e) => handleRemove(value[idx], e)}
                  />
                </span>
              ))
            ) : (
              <span className="text-sm text-[var(--color-text-primary)]">
                {selectedLabels[0]}
              </span>
            )
          ) : (
            <span className="text-sm text-[var(--color-text-muted)]">
              {placeholder || t('multiSelect.placeholder')}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {value.length > 0 && (
            <X
              className="w-4 h-4 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] cursor-pointer"
              onClick={handleClear}
            />
          )}
          <ChevronDown
            className={`w-4 h-4 text-[var(--color-text-muted)] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''
              }`}
          />
        </div>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 rounded-xs border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg animate-fadeIn">
          {/* Search Input */}
          {searchable && (
            <div className="p-2 border-b border-[var(--color-border)]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
                <input
                  ref={inputRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t('multiSelect.searchPlaceholder')}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-md
                    bg-[var(--color-surface-hover)]
                    text-[var(--color-text-primary)]
                    placeholder-[var(--color-text-muted)]
                    focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
              </div>
            </div>
          )}

          {/* Options List */}
          <div className="max-h-60 overflow-y-auto p-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => {
                const isSelected = value.includes(option.value);
                const isDisabled = option.disabled;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => !isDisabled && handleToggle(option.value)}
                    disabled={isDisabled}
                    className={`
                      w-full flex items-center gap-2 px-3 py-2 rounded-md text-left text-sm
                      transition-colors duration-150
                      ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                      ${isSelected
                        ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)]'
                        : 'hover:bg-[var(--color-surface-hover)] text-[var(--color-text-primary)]'}
                    `}
                  >
                    {multiple && (
                      <div
                        className={`
                          w-4 h-4 rounded border flex items-center justify-center
                          transition-colors duration-150
                          ${isSelected
                            ? 'bg-[var(--color-primary)] border-[var(--color-primary)]'
                            : 'border-[var(--color-border)]'}
                        `}
                      >
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </div>
                    )}
                    {option.label}
                  </button>
                );
              })
            ) : (
              <p className="px-3 py-2 text-sm text-[var(--color-text-muted)] text-center">
                {t('multiSelect.noOptions')}
              </p>
            )}
          </div>

          {/* Selected Count */}
          {multiple && value.length > 0 && (
            <div className="px-3 py-2 border-t border-[var(--color-border)] text-xs text-[var(--color-text-muted)]">
              {t('multiSelect.selected', { count: value.length })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MultiSelect;
