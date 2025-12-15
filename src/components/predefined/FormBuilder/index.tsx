// ============================================================================
// Form Builder Component - Dynamic Form Creation with Validation
// ============================================================================

import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  AlertCircle,
  Calendar,
  Check,
  Eye,
  EyeOff,
  FileText,
  GripVertical,
  Hash,
  List,
  Mail,
  Play,
  Plus,
  Save,
  Settings,
  ToggleLeft,
  Trash2,
  Type,
} from 'lucide-react';
import React, { useCallback, useMemo, useState } from 'react';
import { Controller, useForm, type FieldValues, type SubmitHandler } from 'react-hook-form';
import { z } from 'zod';

// ============================================================================
// Types
// ============================================================================

export type FieldType =
  | 'text'
  | 'email'
  | 'number'
  | 'date'
  | 'textarea'
  | 'select'
  | 'checkbox'
  | 'radio';

export interface FormFieldDefinition {
  id: string;
  type: FieldType;
  name: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  validation?: {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    customMessage?: string;
  };
  options?: { value: string; label: string }[];
  defaultValue?: string | number | boolean;
}

export interface FormBuilderProps {
  /** Initial form fields */
  initialFields?: FormFieldDefinition[];
  /** Callback when form structure changes */
  onFieldsChange?: (fields: FormFieldDefinition[]) => void;
  /** Callback when form is submitted */
  onSubmit?: (data: FieldValues) => void;
  /** Preview mode */
  previewMode?: boolean;
  /** Component ID for metadata */
  componentId?: string;
}

// ============================================================================
// Field Type Icons
// ============================================================================

const fieldTypeIcons: Record<FieldType, React.ReactNode> = {
  text: <Type className="w-4 h-4" />,
  email: <Mail className="w-4 h-4" />,
  number: <Hash className="w-4 h-4" />,
  date: <Calendar className="w-4 h-4" />,
  textarea: <FileText className="w-4 h-4" />,
  select: <List className="w-4 h-4" />,
  checkbox: <ToggleLeft className="w-4 h-4" />,
  radio: <List className="w-4 h-4" />,
};

const fieldTypeLabels: Record<FieldType, string> = {
  text: 'Text',
  email: 'Email',
  number: 'Number',
  date: 'Date',
  textarea: 'Textarea',
  select: 'Dropdown',
  checkbox: 'Checkbox',
  radio: 'Radio',
};

// ============================================================================
// Default Fields
// ============================================================================

const defaultFormFields: FormFieldDefinition[] = [
  {
    id: 'field-1',
    type: 'text',
    name: 'fullName',
    label: 'Full Name',
    placeholder: 'Enter your full name',
    required: true,
    validation: { minLength: 2, maxLength: 100 },
  },
  {
    id: 'field-2',
    type: 'email',
    name: 'email',
    label: 'Email Address',
    placeholder: 'you@example.com',
    required: true,
  },
  {
    id: 'field-3',
    type: 'select',
    name: 'department',
    label: 'Department',
    required: true,
    options: [
      { value: 'sales', label: 'Sales' },
      { value: 'engineering', label: 'Engineering' },
      { value: 'marketing', label: 'Marketing' },
      { value: 'hr', label: 'Human Resources' },
    ],
  },
];

// ============================================================================
// Sortable Field Item
// ============================================================================

interface SortableFieldItemProps {
  field: FormFieldDefinition;
  onEdit: (field: FormFieldDefinition) => void;
  onDelete: (id: string) => void;
  isEditing: boolean;
}

const SortableFieldItem: React.FC<SortableFieldItemProps> = ({
  field,
  onEdit,
  onDelete,
  isEditing,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        flex items-center gap-3 p-3 rounded-xs border
        ${isEditing
          ? 'border-(--color-primary) bg-(--color-primary-light)'
          : 'border-(--color-border) bg-(--color-surface)'}
        ${isDragging ? 'shadow-lg' : ''}
        transition-colors
      `}
    >
      {/* Drag Handle */}
      <button
        {...attributes}
        {...listeners}
        className="p-1 cursor-grab hover:bg-(--color-surface-hover) rounded"
      >
        <GripVertical className="w-4 h-4 text-(--color-text-muted)" />
      </button>

      {/* Field Type Icon */}
      <div className="p-2 rounded-md bg-(--color-surface-hover)">
        {fieldTypeIcons[field.type]}
      </div>

      {/* Field Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-(--color-text-primary) truncate">
            {field.label}
          </span>
          {field.required && (
            <span className="text-xs text-red-500">*</span>
          )}
        </div>
        <span className="text-xs text-(--color-text-muted)">
          {fieldTypeLabels[field.type]} • {field.name}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onEdit(field)}
          className="p-1.5 rounded hover:bg-(--color-surface-hover) transition-colors"
          title="Edit field"
        >
          <Settings className="w-4 h-4 text-(--color-text-muted)" />
        </button>
        <button
          onClick={() => onDelete(field.id)}
          className="p-1.5 rounded hover:bg-red-50 text-red-500 transition-colors"
          title="Delete field"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// Field Editor Panel
// ============================================================================

interface FieldEditorProps {
  field: FormFieldDefinition | null;
  onSave: (field: FormFieldDefinition) => void;
  onClose: () => void;
}

const FieldEditor: React.FC<FieldEditorProps> = ({ field, onSave, onClose }) => {
  const [editedField, setEditedField] = useState<FormFieldDefinition | null>(field);

  if (!editedField) return null;

  const handleChange = (key: keyof FormFieldDefinition, value: unknown) => {
    setEditedField((prev) => prev ? { ...prev, [key]: value } : null);
  };

  const handleSave = () => {
    if (editedField) {
      onSave(editedField);
      onClose();
    }
  };

  return (
    <div className="p-4 border-l border-(--color-border) bg-(--color-surface) w-80">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-(--color-text-primary)">
          Edit Field
        </h3>
        <button
          onClick={onClose}
          className="text-(--color-text-muted) hover:text-(--color-text-primary)"
        >
          ×
        </button>
      </div>

      <div className="space-y-4">
        {/* Label */}
        <div>
          <label className="block text-xs font-medium text-(--color-text-secondary) mb-1">
            Label
          </label>
          <input
            type="text"
            value={editedField.label}
            onChange={(e) => handleChange('label', e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-xs border border-(--color-border)
              bg-(--color-surface) focus:ring-2 focus:ring-(--color-primary)"
          />
        </div>

        {/* Name */}
        <div>
          <label className="block text-xs font-medium text-(--color-text-secondary) mb-1">
            Field Name (API key)
          </label>
          <input
            type="text"
            value={editedField.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-xs border border-(--color-border)
              bg-(--color-surface) focus:ring-2 focus:ring-(--color-primary)"
          />
        </div>

        {/* Type */}
        <div>
          <label className="block text-xs font-medium text-(--color-text-secondary) mb-1">
            Field Type
          </label>
          <select
            value={editedField.type}
            onChange={(e) => handleChange('type', e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-xs border border-(--color-border)
              bg-(--color-surface) focus:ring-2 focus:ring-(--color-primary)"
          >
            {Object.entries(fieldTypeLabels).map(([type, label]) => (
              <option key={type} value={type}>{label}</option>
            ))}
          </select>
        </div>

        {/* Placeholder */}
        <div>
          <label className="block text-xs font-medium text-(--color-text-secondary) mb-1">
            Placeholder
          </label>
          <input
            type="text"
            value={editedField.placeholder || ''}
            onChange={(e) => handleChange('placeholder', e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-xs border border-(--color-border)
              bg-(--color-surface) focus:ring-2 focus:ring-(--color-primary)"
          />
        </div>

        {/* Required */}
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={editedField.required || false}
            onChange={(e) => handleChange('required', e.target.checked)}
            className="w-4 h-4 rounded border-(--color-border) text-(--color-primary)"
          />
          <span className="text-sm text-(--color-text-primary)">Required field</span>
        </label>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm
            bg-(--color-primary) text-white rounded-xs hover:opacity-90 transition-opacity"
        >
          <Save className="w-4 h-4" />
          Save Changes
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// Form Preview (Runtime)
// ============================================================================

interface FormPreviewProps {
  fields: FormFieldDefinition[];
  onSubmit: (data: FieldValues) => void;
}

const FormPreview: React.FC<FormPreviewProps> = ({ fields, onSubmit }) => {
  // Build Zod schema dynamically
  const schema = useMemo(() => {
    const shape: Record<string, z.ZodTypeAny> = {};

    fields.forEach((field) => {
      let fieldSchema: z.ZodTypeAny;

      switch (field.type) {
        case 'email':
          fieldSchema = z.string().email('Invalid email address');
          break;
        case 'number':
          fieldSchema = z.coerce.number();
          if (field.validation?.min !== undefined) {
            fieldSchema = (fieldSchema as z.ZodNumber).min(field.validation.min);
          }
          if (field.validation?.max !== undefined) {
            fieldSchema = (fieldSchema as z.ZodNumber).max(field.validation.max);
          }
          break;
        case 'checkbox':
          fieldSchema = z.boolean();
          break;
        default:
          fieldSchema = z.string();
          if (field.validation?.minLength) {
            fieldSchema = (fieldSchema as z.ZodString).min(field.validation.minLength);
          }
          if (field.validation?.maxLength) {
            fieldSchema = (fieldSchema as z.ZodString).max(field.validation.maxLength);
          }
      }

      if (!field.required && field.type !== 'checkbox') {
        fieldSchema = fieldSchema.optional();
      }

      shape[field.name] = fieldSchema;
    });

    return z.object(shape);
  }, [fields]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const onFormSubmit: SubmitHandler<FieldValues> = (data) => {
    onSubmit(data);
  };

  const renderField = (field: FormFieldDefinition) => {
    const error = errors[field.name];
    const baseInputClass = `
      w-full px-3 py-2.5 text-sm rounded-xs border
      ${error
        ? 'border-red-500 focus:ring-red-500'
        : 'border-[var(--color-border)] focus:ring-[var(--color-primary)]'}
      bg-[var(--color-surface)] focus:ring-2 focus:border-transparent
      transition-colors
    `;

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            {...register(field.name)}
            placeholder={field.placeholder}
            rows={4}
            className={baseInputClass}
          />
        );

      case 'select':
        return (
          <select {...register(field.name)} className={baseInputClass}>
            <option value="">Select...</option>
            {field.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );

      case 'checkbox':
        return (
          <Controller
            name={field.name}
            control={control}
            render={({ field: controllerField }) => (
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(controllerField.value)}
                  onChange={controllerField.onChange}
                  className="w-5 h-5 rounded border-(--color-border) text-(--color-primary)"
                />
                <span className="text-sm text-(--color-text-primary)">
                  {field.placeholder || 'Yes'}
                </span>
              </label>
            )}
          />
        );

      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map((opt) => (
              <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  {...register(field.name)}
                  value={opt.value}
                  className="w-4 h-4 text-(--color-primary)"
                />
                <span className="text-sm text-(--color-text-primary)">{opt.label}</span>
              </label>
            ))}
          </div>
        );

      default:
        return (
          <input
            type={field.type}
            {...register(field.name)}
            placeholder={field.placeholder}
            className={baseInputClass}
          />
        );
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-5">
      {fields.map((field) => (
        <div key={field.id}>
          <label className="block text-sm font-medium text-(--color-text-primary) mb-1.5">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {renderField(field)}
          {errors[field.name] && (
            <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors[field.name]?.message as string || 'This field is invalid'}
            </p>
          )}
        </div>
      ))}

      <button
        type="submit"
        disabled={isSubmitting}
        className={`
          w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium
          rounded-xs transition-all
          ${isSubmitSuccessful
            ? 'bg-green-500 text-white'
            : 'bg-(--color-primary) text-white hover:opacity-90'}
        `}
      >
        {isSubmitting ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : isSubmitSuccessful ? (
          <>
            <Check className="w-5 h-5" />
            Submitted!
          </>
        ) : (
          <>
            <Play className="w-5 h-5" />
            Submit Form
          </>
        )}
      </button>
    </form>
  );
};

// ============================================================================
// Form Builder Main Component
// ============================================================================

const FormBuilder: React.FC<FormBuilderProps> = ({
  initialFields = defaultFormFields,
  onFieldsChange,
  onSubmit,
  previewMode = false,
}) => {
  const [fields, setFields] = useState<FormFieldDefinition[]>(initialFields);
  const [editingField, setEditingField] = useState<FormFieldDefinition | null>(null);
  const [isPreview, setIsPreview] = useState(previewMode);
  const [lastSubmission, setLastSubmission] = useState<FieldValues | null>(null);

  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag end
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setFields((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        const newFields = arrayMove(items, oldIndex, newIndex);
        onFieldsChange?.(newFields);
        return newFields;
      });
    }
  }, [onFieldsChange]);

  // Add new field
  const addField = useCallback((type: FieldType) => {
    const newField: FormFieldDefinition = {
      id: `field-${Date.now()}`,
      type,
      name: `field_${Date.now()}`,
      label: `New ${fieldTypeLabels[type]} Field`,
      placeholder: '',
      required: false,
    };

    if (type === 'select' || type === 'radio') {
      newField.options = [
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2' },
      ];
    }

    setFields((prev) => {
      const newFields = [...prev, newField];
      onFieldsChange?.(newFields);
      return newFields;
    });
    setEditingField(newField);
  }, [onFieldsChange]);

  // Update field
  const updateField = useCallback((updatedField: FormFieldDefinition) => {
    setFields((prev) => {
      const newFields = prev.map((f) =>
        f.id === updatedField.id ? updatedField : f
      );
      onFieldsChange?.(newFields);
      return newFields;
    });
  }, [onFieldsChange]);

  // Delete field
  const deleteField = useCallback((id: string) => {
    setFields((prev) => {
      const newFields = prev.filter((f) => f.id !== id);
      onFieldsChange?.(newFields);
      return newFields;
    });
    if (editingField?.id === id) {
      setEditingField(null);
    }
  }, [editingField, onFieldsChange]);

  // Handle form submission
  const handleFormSubmit = useCallback((data: FieldValues) => {
    setLastSubmission(data);
    onSubmit?.(data);
  }, [onSubmit]);

  return (
    <div className="rounded-xl border border-(--color-border) bg-(--color-surface) overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-(--color-border) bg-linear-to-r from-(--color-surface) to-(--color-surface-hover)">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xs bg-(--color-secondary) bg-opacity-10">
            <FileText className="w-5 h-5 text-(--color-secondary)" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-(--color-text-primary)">
              Form Builder
            </h3>
            <p className="text-xs text-(--color-text-muted)">
              {fields.length} fields • Drag to reorder
            </p>
          </div>
        </div>

        {/* Preview Toggle */}
        <button
          onClick={() => setIsPreview(!isPreview)}
          className={`
            flex items-center gap-2 px-4 py-2 text-sm rounded-xs transition-colors
            ${isPreview
              ? 'bg-(--color-primary) text-white'
              : 'bg-(--color-surface-hover) text-(--color-text-primary)'}
          `}
        >
          {isPreview ? (
            <>
              <EyeOff className="w-4 h-4" />
              Edit Mode
            </>
          ) : (
            <>
              <Eye className="w-4 h-4" />
              Preview
            </>
          )}
        </button>
      </div>

      <div className="flex">
        {/* Main Content */}
        <div className="flex-1 p-4">
          {isPreview ? (
            /* Preview Mode */
            <div className="max-w-lg mx-auto">
              <div className="mb-4 p-3 rounded-xs bg-blue-50 border border-blue-200">
                <p className="text-sm text-blue-700">
                  🎯 <strong>Preview Mode</strong> - Test your form with validation
                </p>
              </div>
              <FormPreview fields={fields} onSubmit={handleFormSubmit} />

              {lastSubmission && (
                <div className="mt-6 p-4 rounded-xs bg-green-50 border border-green-200">
                  <p className="text-sm font-medium text-green-700 mb-2">
                    ✅ Form Data Submitted:
                  </p>
                  <pre className="text-xs text-green-800 bg-green-100 p-2 rounded overflow-x-auto">
                    {JSON.stringify(lastSubmission, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ) : (
            /* Edit Mode */
            <>
              {/* Add Field Buttons */}
              <div className="mb-4 p-3 rounded-xs bg-(--color-surface-hover)">
                <p className="text-xs font-medium text-(--color-text-muted) mb-2">
                  ADD FIELD
                </p>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(fieldTypeLabels) as FieldType[]).map((type) => (
                    <button
                      key={type}
                      onClick={() => addField(type)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md
                        bg-(--color-surface) border border-(--color-border)
                        text-(--color-text-primary) hover:border-(--color-primary)
                        hover:text-(--color-primary) transition-colors"
                    >
                      {fieldTypeIcons[type]}
                      {fieldTypeLabels[type]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sortable Fields */}
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={fields.map((f) => f.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {fields.map((field) => (
                      <SortableFieldItem
                        key={field.id}
                        field={field}
                        onEdit={setEditingField}
                        onDelete={deleteField}
                        isEditing={editingField?.id === field.id}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>

              {fields.length === 0 && (
                <div className="text-center py-12 text-(--color-text-muted)">
                  <Plus className="w-10 h-10 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No fields yet. Click a field type above to add.</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Field Editor Sidebar */}
        {!isPreview && editingField && (
          <FieldEditor
            field={editingField}
            onSave={updateField}
            onClose={() => setEditingField(null)}
          />
        )}
      </div>

      {/* Schema Preview */}
      {!isPreview && fields.length > 0 && (
        <div className="border-t border-(--color-border) p-4">
          <details className="text-sm">
            <summary className="cursor-pointer text-(--color-text-muted) hover:text-(--color-text-primary)">
              View Form Schema (JSON)
            </summary>
            <pre className="mt-2 p-3 rounded-xs bg-[#1e1e1e] text-[#d4d4d4] text-xs overflow-x-auto">
              {JSON.stringify(fields, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
};

export default FormBuilder;
