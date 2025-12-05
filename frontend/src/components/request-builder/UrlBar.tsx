/**
 * URL input bar with method selector and send button
 *
 * @module components/request-builder/UrlBar
 */

import { useRef, type KeyboardEvent } from 'react';
import { Button } from '../ui';
import { MethodSelector } from './MethodSelector';
import type { HttpMethod } from '../../types';

interface UrlBarProps {
  /** HTTP method */
  method: HttpMethod;
  /** Request URL */
  url: string;
  /** Loading state */
  loading?: boolean;
  /** Callback when method changes */
  onMethodChange: (method: HttpMethod) => void;
  /** Callback when URL changes */
  onUrlChange: (url: string) => void;
  /** Callback when send is clicked or Enter is pressed */
  onSend: () => void;
}

/**
 * URL input bar with integrated method selector and send button
 *
 * @example
 * ```tsx
 * <UrlBar
 *   method="GET"
 *   url="https://api.example.com"
 *   onMethodChange={setMethod}
 *   onUrlChange={setUrl}
 *   onSend={handleSend}
 * />
 * ```
 */
export function UrlBar({
  method,
  url,
  loading = false,
  onMethodChange,
  onUrlChange,
  onSend,
}: UrlBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // Send on Enter (or Ctrl+Enter)
    if (e.key === 'Enter' && !loading) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Method selector */}
      <MethodSelector value={method} onChange={onMethodChange} disabled={loading} />

      {/* URL input */}
      <div className="relative flex-1">
        <input
          ref={inputRef}
          type="text"
          value={url}
          onChange={(e) => onUrlChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter request URL..."
          disabled={loading}
          className="
            w-full h-10
            px-4
            font-mono text-sm
            text-foreground
            placeholder:text-foreground-muted/50
            bg-[#0F0F12]
            border border-border
            rounded-lg
            transition-all duration-200 ease-expo-out
            shadow-inner-highlight
            focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30
            disabled:opacity-50 disabled:cursor-not-allowed
          "
          aria-label="Request URL"
        />

        {/* Variable highlight preview (future enhancement) */}
        {url.includes('{{') && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <span className="text-xs text-accent">Has variables</span>
          </div>
        )}
      </div>

      {/* Send button */}
      <Button
        variant="primary"
        onClick={onSend}
        loading={loading}
        disabled={!url.trim()}
        className="h-10 px-6"
      >
        {loading ? 'Sending...' : 'Send'}
      </Button>
    </div>
  );
}
