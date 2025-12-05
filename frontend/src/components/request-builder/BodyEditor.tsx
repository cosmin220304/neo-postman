/**
 * Request body editor with type selector
 *
 * @module components/request-builder/BodyEditor
 */

import { Textarea } from '../ui';
import type { RequestBody, BodyType } from '../../types';

interface BodyEditorProps {
  /** Current body configuration */
  body: RequestBody;
  /** Callback when body changes */
  onChange: (body: RequestBody) => void;
  /** Disable editing */
  disabled?: boolean;
}

const BODY_TYPES: { value: BodyType; label: string }[] = [
  { value: 'json', label: 'JSON' },
  { value: 'raw', label: 'Raw' },
  { value: 'form-data', label: 'Form Data' },
  { value: 'x-www-form-urlencoded', label: 'URL Encoded' },
];

/**
 * Request body editor with type selector and content area
 *
 * @example
 * ```tsx
 * <BodyEditor
 *   body={body}
 *   onChange={setBody}
 * />
 * ```
 */
export function BodyEditor({ body, onChange, disabled = false }: BodyEditorProps) {
  const currentType = body?.type ?? 'json';
  const currentContent = body?.content ?? '';

  const handleTypeChange = (type: BodyType) => {
    onChange({
      type,
      content: currentContent,
    });
  };

  const handleContentChange = (content: string) => {
    onChange({
      type: currentType,
      content,
    });
  };

  const clearBody = () => {
    onChange(null);
  };

  // Check if body has content
  const hasContent = currentContent.trim().length > 0;

  return (
    <div className="space-y-3">
      {/* Body type selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 p-1 bg-surface rounded-lg">
          {BODY_TYPES.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => handleTypeChange(type.value)}
              disabled={disabled}
              className={`
                px-3 py-1.5
                text-xs font-medium
                rounded-md
                transition-all duration-150
                focus:outline-none focus:ring-2 focus:ring-accent/50
                disabled:cursor-not-allowed
                ${
                  currentType === type.value
                    ? 'bg-accent text-white shadow-sm'
                    : 'text-foreground-muted hover:text-foreground hover:bg-surface-hover'
                }
              `}
            >
              {type.label}
            </button>
          ))}
        </div>

        {/* Clear button */}
        {hasContent && (
          <button
            type="button"
            onClick={clearBody}
            disabled={disabled}
            className="
              text-xs text-foreground-muted hover:text-foreground
              transition-colors
              focus:outline-none focus:underline
            "
          >
            Clear
          </button>
        )}
      </div>

      {/* Content editor */}
      {currentType === 'json' && (
        <JsonEditor
          value={currentContent}
          onChange={handleContentChange}
          disabled={disabled}
        />
      )}

      {currentType === 'raw' && (
        <Textarea
          value={currentContent}
          onChange={(e) => handleContentChange(e.target.value)}
          placeholder="Enter raw body content..."
          disabled={disabled}
          mono
          fullWidth
          className="min-h-[200px]"
        />
      )}

      {currentType === 'form-data' && (
        <FormDataEditor
          value={currentContent}
          onChange={handleContentChange}
          disabled={disabled}
        />
      )}

      {currentType === 'x-www-form-urlencoded' && (
        <FormDataEditor
          value={currentContent}
          onChange={handleContentChange}
          disabled={disabled}
        />
      )}
    </div>
  );
}

/**
 * JSON editor with syntax validation
 */
function JsonEditor({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  // Simple JSON validation
  let isValid = true;
  let errorMessage = '';

  if (value.trim()) {
    try {
      JSON.parse(value);
    } catch (e) {
      isValid = false;
      errorMessage = e instanceof Error ? e.message : 'Invalid JSON';
    }
  }

  const formatJson = () => {
    if (!value.trim()) return;
    try {
      const parsed = JSON.parse(value);
      onChange(JSON.stringify(parsed, null, 2));
    } catch {
      // Ignore formatting if invalid
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {!isValid && value.trim() && (
            <span className="text-xs text-red-400">{errorMessage}</span>
          )}
        </div>
        <button
          type="button"
          onClick={formatJson}
          disabled={disabled || !value.trim() || !isValid}
          className="
            text-xs text-foreground-muted hover:text-foreground
            transition-colors
            focus:outline-none focus:underline
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          Format
        </button>
      </div>

      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder='{"key": "value"}'
        disabled={disabled}
        mono
        fullWidth
        className={`min-h-[200px] ${!isValid && value.trim() ? 'border-red-500/50' : ''}`}
      />
    </div>
  );
}

/**
 * Form data editor (key-value pairs)
 * Stores as JSON string of key-value pairs
 */
function FormDataEditor({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  // Parse form data from JSON string
  let formData: Array<{ key: string; value: string }> = [];
  try {
    formData = value ? JSON.parse(value) : [];
  } catch {
    formData = [];
  }

  const updateFormData = (newData: Array<{ key: string; value: string }>) => {
    onChange(JSON.stringify(newData));
  };

  const addField = () => {
    updateFormData([...formData, { key: '', value: '' }]);
  };

  const updateField = (index: number, updates: { key?: string; value?: string }) => {
    const newData = formData.map((item, i) =>
      i === index ? { ...item, ...updates } : item
    );
    updateFormData(newData);
  };

  const removeField = (index: number) => {
    updateFormData(formData.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      {/* Form fields */}
      {formData.map((field, index) => (
        <div key={index} className="flex items-center gap-2">
          <input
            type="text"
            value={field.key}
            onChange={(e) => updateField(index, { key: e.target.value })}
            placeholder="Key"
            disabled={disabled}
            className="
              flex-1 h-9 px-3
              text-sm
              bg-[#0F0F12] text-foreground
              border border-border rounded-lg
              focus:outline-none focus:border-accent
              disabled:opacity-50
            "
          />
          <input
            type="text"
            value={field.value}
            onChange={(e) => updateField(index, { value: e.target.value })}
            placeholder="Value"
            disabled={disabled}
            className="
              flex-1 h-9 px-3
              text-sm
              bg-[#0F0F12] text-foreground
              border border-border rounded-lg
              focus:outline-none focus:border-accent
              disabled:opacity-50
            "
          />
          <button
            type="button"
            onClick={() => removeField(index)}
            disabled={disabled}
            className="
              w-8 h-8 flex items-center justify-center
              text-foreground-muted hover:text-red-400
              transition-colors
            "
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M4 4L12 12M12 4L4 12"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      ))}

      {/* Add field button */}
      <button
        type="button"
        onClick={addField}
        disabled={disabled}
        className="
          flex items-center gap-2
          px-3 py-1.5
          text-xs text-foreground-muted hover:text-foreground
          transition-colors
        "
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path
            d="M7 2V12M2 7H12"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        Add Field
      </button>
    </div>
  );
}
