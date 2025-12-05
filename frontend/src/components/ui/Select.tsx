/**
 * Select component following Linear/Modern design system
 *
 * @module components/ui/Select
 */

import { forwardRef, type SelectHTMLAttributes, type ReactNode } from 'react';

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  /** Select options */
  options: SelectOption[];
  /** Label text above the select */
  label?: string;
  /** Error message to display */
  error?: string;
  /** Helper text below the select */
  helperText?: string;
  /** Placeholder option text */
  placeholder?: string;
  /** Icon or element to show on the left */
  leftElement?: ReactNode;
  /** Full width select */
  fullWidth?: boolean;
}

/**
 * Select dropdown component
 *
 * @example
 * ```tsx
 * <Select
 *   label="HTTP Method"
 *   options={[
 *     { value: 'GET', label: 'GET' },
 *     { value: 'POST', label: 'POST' },
 *   ]}
 *   value={method}
 *   onChange={(e) => setMethod(e.target.value)}
 * />
 * ```
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      options,
      label,
      error,
      helperText,
      placeholder,
      leftElement,
      fullWidth = false,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className={`flex flex-col gap-1.5 ${fullWidth ? 'w-full' : ''}`}>
        {label && (
          <label
            htmlFor={selectId}
            className="text-xs font-medium uppercase tracking-wider text-foreground-muted"
          >
            {label}
          </label>
        )}

        <div className="relative">
          {leftElement && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted pointer-events-none">
              {leftElement}
            </div>
          )}

          <select
            ref={ref}
            id={selectId}
            className={`
              w-full
              appearance-none
              bg-[#0F0F12]
              text-foreground
              border border-border
              rounded-lg
              px-3 py-2
              pr-10
              text-sm
              cursor-pointer
              transition-all duration-200 ease-expo-out
              shadow-inner-highlight
              focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30
              disabled:opacity-50 disabled:cursor-not-allowed
              ${leftElement ? 'pl-10' : ''}
              ${error ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/30' : ''}
              ${className}
            `}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={error ? `${selectId}-error` : helperText ? `${selectId}-helper` : undefined}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Dropdown chevron */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-foreground-muted">
            <ChevronDownIcon />
          </div>
        </div>

        {error && (
          <p id={`${selectId}-error`} className="text-xs text-red-400" role="alert">
            {error}
          </p>
        )}

        {helperText && !error && (
          <p id={`${selectId}-helper`} className="text-xs text-foreground-muted">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

function ChevronDownIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M4 6L8 10L12 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
