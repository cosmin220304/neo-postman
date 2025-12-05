/**
 * Input component following Linear/Modern design system
 *
 * @module components/ui/Input
 */

import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Label text above the input */
  label?: string;
  /** Error message to display */
  error?: string;
  /** Helper text below the input */
  helperText?: string;
  /** Icon or element to show on the left */
  leftElement?: ReactNode;
  /** Icon or element to show on the right */
  rightElement?: ReactNode;
  /** Use monospace font (for URLs, code, etc.) */
  mono?: boolean;
  /** Full width input */
  fullWidth?: boolean;
}

/**
 * Input component with label, error, and helper text support
 *
 * @example
 * ```tsx
 * <Input
 *   label="URL"
 *   placeholder="https://api.example.com"
 *   mono
 *   fullWidth
 * />
 *
 * <Input
 *   label="Header Value"
 *   error="This field is required"
 * />
 * ```
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftElement,
      rightElement,
      mono = false,
      fullWidth = false,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className={`flex flex-col gap-1.5 ${fullWidth ? 'w-full' : ''}`}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-medium uppercase tracking-wider text-foreground-muted"
          >
            {label}
          </label>
        )}

        <div className="relative">
          {leftElement && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted">
              {leftElement}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            className={`
              w-full
              bg-[#0F0F12]
              text-foreground
              placeholder:text-foreground-muted/50
              border border-border
              rounded-lg
              px-3 py-2
              text-sm
              transition-all duration-200 ease-expo-out
              shadow-inner-highlight
              focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30
              disabled:opacity-50 disabled:cursor-not-allowed
              ${mono ? 'font-mono' : ''}
              ${leftElement ? 'pl-10' : ''}
              ${rightElement ? 'pr-10' : ''}
              ${error ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/30' : ''}
              ${className}
            `}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
            {...props}
          />

          {rightElement && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted">
              {rightElement}
            </div>
          )}
        </div>

        {error && (
          <p id={`${inputId}-error`} className="text-xs text-red-400" role="alert">
            {error}
          </p>
        )}

        {helperText && !error && (
          <p id={`${inputId}-helper`} className="text-xs text-foreground-muted">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

/**
 * Textarea variant of Input for multi-line text
 */
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  mono?: boolean;
  fullWidth?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      helperText,
      mono = false,
      fullWidth = false,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className={`flex flex-col gap-1.5 ${fullWidth ? 'w-full' : ''}`}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-medium uppercase tracking-wider text-foreground-muted"
          >
            {label}
          </label>
        )}

        <textarea
          ref={ref}
          id={inputId}
          className={`
            w-full
            bg-[#0F0F12]
            text-foreground
            placeholder:text-foreground-muted/50
            border border-border
            rounded-lg
            px-3 py-2
            text-sm
            resize-y min-h-[80px]
            transition-all duration-200 ease-expo-out
            shadow-inner-highlight
            focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30
            disabled:opacity-50 disabled:cursor-not-allowed
            ${mono ? 'font-mono' : ''}
            ${error ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/30' : ''}
            ${className}
          `}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          {...props}
        />

        {error && (
          <p id={`${inputId}-error`} className="text-xs text-red-400" role="alert">
            {error}
          </p>
        )}

        {helperText && !error && (
          <p id={`${inputId}-helper`} className="text-xs text-foreground-muted">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
