/**
 * HTTP Method selector dropdown
 *
 * @module components/request-builder/MethodSelector
 */

import type { HttpMethod } from '../../types';

interface MethodSelectorProps {
  /** Currently selected method */
  value: HttpMethod;
  /** Callback when method changes */
  onChange: (method: HttpMethod) => void;
  /** Disable the selector */
  disabled?: boolean;
}

const METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];

/** Color classes for each HTTP method */
const METHOD_COLORS: Record<HttpMethod, string> = {
  GET: 'text-emerald-400 bg-emerald-500/20',
  POST: 'text-blue-400 bg-blue-500/20',
  PUT: 'text-amber-400 bg-amber-500/20',
  PATCH: 'text-violet-400 bg-violet-500/20',
  DELETE: 'text-red-400 bg-red-500/20',
  HEAD: 'text-gray-400 bg-gray-500/20',
  OPTIONS: 'text-gray-400 bg-gray-500/20',
};

/**
 * Dropdown selector for HTTP methods with color-coded options
 *
 * @example
 * ```tsx
 * <MethodSelector
 *   value={method}
 *   onChange={setMethod}
 * />
 * ```
 */
export function MethodSelector({ value, onChange, disabled = false }: MethodSelectorProps) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as HttpMethod)}
        disabled={disabled}
        className={`
          appearance-none
          w-28 h-10
          px-3 pr-8
          text-sm font-semibold
          rounded-lg
          border border-border
          bg-[#0F0F12]
          cursor-pointer
          transition-all duration-200 ease-expo-out
          focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30
          disabled:opacity-50 disabled:cursor-not-allowed
          ${METHOD_COLORS[value]}
        `}
        aria-label="HTTP Method"
      >
        {METHODS.map((method) => (
          <option key={method} value={method} className="bg-bg-elevated text-foreground">
            {method}
          </option>
        ))}
      </select>

      {/* Dropdown chevron */}
      <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          className="text-current opacity-60"
        >
          <path
            d="M3 4.5L6 7.5L9 4.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}

/**
 * Get the color class for a method (for use in other components)
 */
export function getMethodColor(method: HttpMethod): string {
  return METHOD_COLORS[method];
}
