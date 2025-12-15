
import React from 'react';

// Common base styles
const BASE_INPUT_STYLES = `
  w-full px-3 py-2 text-sm rounded-xs border border-(--color-border)
  bg-(--color-surface) text-(--color-text-primary)
  focus:ring-2 focus:ring-(--color-primary) focus:border-transparent
  placeholder-(--color-text-muted)
`;

const BASE_LABEL_STYLES = "block text-xs font-medium text-(--color-text-secondary) mb-1";

// ============================================================================
// Form Section
// ============================================================================

export const FormSection: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = "space-y-3 p-3 rounded-xs bg-(--color-surface-hover)"
}) => (
  <div className={className}>
    {children}
  </div>
);

// ============================================================================
// Form Label
// ============================================================================

export const FormLabel: React.FC<{ children: React.ReactNode; htmlFor?: string }> = ({ children, htmlFor }) => (
  <label htmlFor={htmlFor} className={BASE_LABEL_STYLES}>
    {children}
  </label>
);

// ============================================================================
// Form Input
// ============================================================================

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const FormInput: React.FC<FormInputProps> = ({ label, className = '', ...props }) => (
  <div>
    {label && <FormLabel>{label}</FormLabel>}
    <input
      className={`${BASE_INPUT_STYLES} ${className}`}
      {...props}
    />
  </div>
);

// ============================================================================
// Form Textarea
// ============================================================================

interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export const FormTextarea: React.FC<FormTextareaProps> = ({ label, className = '', ...props }) => (
  <div>
    {label && <FormLabel>{label}</FormLabel>}
    <textarea
      className={`${BASE_INPUT_STYLES} ${className}`} // Textarea shares similar styles usually
      {...props}
    />
  </div>
);

// ============================================================================
// Form Select
// ============================================================================

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

export const FormSelect: React.FC<FormSelectProps> = ({ label, children, className = '', ...props }) => (
  <div>
    {label && <FormLabel>{label}</FormLabel>}
    <select
      className={`${BASE_INPUT_STYLES} ${className} appearance-none`} // appearance-none often needed for custom arrow, but keeping simple for now
      {...props}
    >
      {children}
    </select>
  </div>
);
