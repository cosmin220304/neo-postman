/**
 * History list component - displays request history from IndexedDB
 *
 * @module components/sidebar/HistoryList
 */

import { useEffect, useState } from 'react';
import { getHistory, clearHistory, deleteHistoryEntry } from '../../services/db';
import { useRequestStore } from '../../stores';
import { getMethodColor } from '../request-builder/MethodSelector';
import type { HistoryEntry, HttpMethod } from '../../types';

/**
 * History list showing past requests grouped by date
 */
export function HistoryList() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const history = await getHistory(100);
      setEntries(history);
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  // Refresh history when request store response changes
  const response = useRequestStore((state) => state.response);
  useEffect(() => {
    if (response) {
      loadHistory();
    }
  }, [response]);

  const handleClearAll = async () => {
    if (confirm('Clear all history?')) {
      await clearHistory();
      setEntries([]);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteHistoryEntry(id);
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
        <ClockIcon className="h-10 w-10 text-foreground-muted/50" />
        <div>
          <p className="text-sm font-medium text-foreground">No History</p>
          <p className="text-xs text-foreground-muted">Send a request to see it here</p>
        </div>
      </div>
    );
  }

  // Group entries by date
  const grouped = groupByDate(entries);

  return (
    <div className="space-y-4">
      {/* Clear all button */}
      <div className="flex justify-end">
        <button
          onClick={handleClearAll}
          className="text-xs text-foreground-muted hover:text-red-400 transition-colors"
        >
          Clear All
        </button>
      </div>

      {/* Grouped entries */}
      {Object.entries(grouped).map(([date, items]) => (
        <div key={date}>
          <h3 className="text-xs font-medium uppercase tracking-wider text-foreground-muted mb-2">
            {date}
          </h3>
          <div className="space-y-1">
            {items.map((entry) => (
              <HistoryItem
                key={entry.id}
                entry={entry}
                onDelete={() => handleDelete(entry.id)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Single history item
 */
function HistoryItem({
  entry,
  onDelete,
}: {
  entry: HistoryEntry;
  onDelete: () => void;
}) {
  const loadRequest = useRequestStore((state) => state.loadRequest);
  const setResponse = useRequestStore((state) => state.setResponse);

  const handleClick = () => {
    // Load request into builder
    loadRequest({
      method: entry.request.method,
      url: entry.request.url,
      headers: entry.request.headers,
      body: entry.request.body ? { type: 'raw', content: entry.request.body } : null,
      auth: null,
      timeout: 30000,
    });

    // Also load the response if it exists
    if (entry.response) {
      setResponse({
        status: entry.response.status,
        statusText: entry.response.statusText,
        headers: entry.response.headers,
        body: entry.response.body,
        bodyTruncated: entry.response.bodyTruncated,
        size: entry.response.size,
        timing: entry.timing,
        error: entry.error,
        loading: false,
      });
    }
  };

  const methodColor = getMethodColor(entry.request.method as HttpMethod);
  const statusColor = getStatusColor(entry.response?.status);
  const time = formatTime(entry.timestamp);
  const urlDisplay = truncateUrl(entry.request.url);

  return (
    <div
      className="group flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-surface cursor-pointer transition-colors"
      onClick={handleClick}
    >
      {/* Method badge */}
      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${methodColor}`}>
        {entry.request.method}
      </span>

      {/* URL and details */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground truncate">{urlDisplay}</p>
        <div className="flex items-center gap-2 text-[10px] text-foreground-muted">
          {entry.response ? (
            <span className={statusColor}>{entry.response.status}</span>
          ) : entry.error ? (
            <span className="text-red-400">Error</span>
          ) : null}
          <span>{entry.timing.total}ms</span>
          <span>{time}</span>
        </div>
      </div>

      {/* Delete button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="opacity-0 group-hover:opacity-100 p-1 text-foreground-muted hover:text-red-400 transition-all"
        aria-label="Delete"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M3 3L9 9M9 3L3 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}

// ============================================================================
// Utilities
// ============================================================================

function groupByDate(entries: HistoryEntry[]): Record<string, HistoryEntry[]> {
  const groups: Record<string, HistoryEntry[]> = {};
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  for (const entry of entries) {
    const date = new Date(entry.timestamp);
    let label: string;

    if (isSameDay(date, today)) {
      label = 'Today';
    } else if (isSameDay(date, yesterday)) {
      label = 'Yesterday';
    } else {
      label = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    }

    if (!groups[label]) {
      groups[label] = [];
    }
    groups[label]!.push(entry);
  }

  return groups;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

function truncateUrl(url: string): string {
  try {
    const parsed = new URL(url);
    const path = parsed.pathname + parsed.search;
    if (path.length > 30) {
      return parsed.host + path.slice(0, 27) + '...';
    }
    return parsed.host + path;
  } catch {
    return url.length > 40 ? url.slice(0, 37) + '...' : url;
  }
}

function getStatusColor(status: number | undefined): string {
  if (!status) return '';
  if (status >= 200 && status < 300) return 'text-emerald-400';
  if (status >= 300 && status < 400) return 'text-blue-400';
  if (status >= 400 && status < 500) return 'text-amber-400';
  if (status >= 500) return 'text-red-400';
  return 'text-foreground-muted';
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 7V12L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
