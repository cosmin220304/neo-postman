/**
 * Headers editor - add, edit, remove, and toggle HTTP headers
 *
 * @module components/request-builder/HeadersEditor
 */

import { Button, Input } from '../ui';
import type { Header } from '../../types';

interface HeadersEditorProps {
  /** Current headers list */
  headers: Header[];
  /** Callback when headers change */
  onChange: (headers: Header[]) => void;
  /** Disable editing */
  disabled?: boolean;
}

/**
 * Editable table of HTTP headers with add/remove/toggle functionality
 *
 * @example
 * ```tsx
 * <HeadersEditor
 *   headers={headers}
 *   onChange={setHeaders}
 * />
 * ```
 */
export function HeadersEditor({ headers, onChange, disabled = false }: HeadersEditorProps) {
  const updateHeader = (index: number, updates: Partial<Header>) => {
    const newHeaders = headers.map((h, i) => (i === index ? { ...h, ...updates } : h));
    onChange(newHeaders);
  };

  const removeHeader = (index: number) => {
    onChange(headers.filter((_, i) => i !== index));
  };

  const addHeader = () => {
    onChange([...headers, { key: '', value: '', enabled: true }]);
  };

  const toggleHeader = (index: number) => {
    const header = headers[index];
    if (header) {
      updateHeader(index, { enabled: !header.enabled });
    }
  };

  return (
    <div className="space-y-3">
      {/* Headers table */}
      <div className="space-y-2">
        {/* Header row */}
        <div className="grid grid-cols-[auto_1fr_1fr_auto] gap-2 px-1">
          <div className="w-8" /> {/* Checkbox column */}
          <span className="text-xs font-medium uppercase tracking-wider text-foreground-muted">
            Key
          </span>
          <span className="text-xs font-medium uppercase tracking-wider text-foreground-muted">
            Value
          </span>
          <div className="w-8" /> {/* Actions column */}
        </div>

        {/* Header rows */}
        {headers.map((header, index) => (
          <div
            key={index}
            className={`
              grid grid-cols-[auto_1fr_1fr_auto] gap-2 items-center
              ${!header.enabled ? 'opacity-50' : ''}
            `}
          >
            {/* Enable/disable checkbox */}
            <button
              type="button"
              onClick={() => toggleHeader(index)}
              disabled={disabled}
              className="
                w-8 h-8 flex items-center justify-center
                rounded-md
                hover:bg-surface transition-colors
                focus:outline-none focus:ring-2 focus:ring-accent/50
                disabled:cursor-not-allowed
              "
              aria-label={header.enabled ? 'Disable header' : 'Enable header'}
            >
              <div
                className={`
                  w-4 h-4 rounded border-2 transition-colors
                  ${
                    header.enabled
                      ? 'bg-accent border-accent'
                      : 'bg-transparent border-foreground-muted'
                  }
                `}
              >
                {header.enabled && (
                  <svg viewBox="0 0 16 16" fill="none" className="text-white">
                    <path
                      d="M4 8L7 11L12 5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
            </button>

            {/* Key input */}
            <Input
              value={header.key}
              onChange={(e) => updateHeader(index, { key: e.target.value })}
              placeholder="Header name"
              disabled={disabled || !header.enabled}
              className="h-9"
            />

            {/* Value input */}
            <Input
              value={header.value}
              onChange={(e) => updateHeader(index, { value: e.target.value })}
              placeholder="Header value"
              disabled={disabled || !header.enabled}
              className="h-9"
            />

            {/* Remove button */}
            <button
              type="button"
              onClick={() => removeHeader(index)}
              disabled={disabled}
              className="
                w-8 h-8 flex items-center justify-center
                rounded-md
                text-foreground-muted hover:text-red-400 hover:bg-red-500/10
                transition-colors
                focus:outline-none focus:ring-2 focus:ring-accent/50
                disabled:cursor-not-allowed disabled:hover:text-foreground-muted disabled:hover:bg-transparent
              "
              aria-label="Remove header"
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

        {/* Empty state */}
        {headers.length === 0 && (
          <div className="py-4 text-center text-sm text-foreground-muted">
            No headers added yet
          </div>
        )}
      </div>

      {/* Add header button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={addHeader}
        disabled={disabled}
        leftIcon={
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M7 2V12M2 7H12"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        }
      >
        Add Header
      </Button>
    </div>
  );
}
