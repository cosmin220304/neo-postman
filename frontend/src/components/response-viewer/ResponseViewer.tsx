/**
 * Response Viewer - displays HTTP response with status, headers, and body
 *
 * @module components/response-viewer/ResponseViewer
 */

import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui';
import { useRequestStore } from '../../stores';
import type { ResponseState, Header } from '../../types';

/**
 * Complete response viewer with status bar and tabbed content
 */
export function ResponseViewer() {
  const { response, loading } = useRequestStore();

  if (loading) {
    return <LoadingState />;
  }

  if (!response) {
    return <EmptyState />;
  }

  if (response.error) {
    return <ErrorState error={response.error} timing={response.timing} />;
  }

  // Auto-select preview tab for HTML content
  const isHtml = isHtmlContent(response.body, response.headers);
  const defaultTab = isHtml ? 'preview' : 'body';

  return (
    <div className="flex h-full flex-col">
      {/* Status bar */}
      <StatusBar response={response} />

      {/* Response content tabs */}
      <Tabs key={defaultTab} defaultValue={defaultTab} className="flex-1 flex flex-col min-h-0">
        <TabsList>
          <TabsTrigger value="body">Body</TabsTrigger>
          <TabsTrigger value="headers">
            Headers
            <span className="ml-1.5 px-1.5 py-0.5 text-[10px] font-medium bg-surface text-foreground-muted rounded">
              {response.headers.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-hidden mt-4">
          <TabsContent value="body" className="h-full">
            <ResponseBody body={response.body} truncated={response.bodyTruncated} headers={response.headers} />
          </TabsContent>

          <TabsContent value="headers" className="h-full overflow-auto">
            <ResponseHeaders headers={response.headers} />
          </TabsContent>

          <TabsContent value="preview" className="h-full">
            <HtmlPreview body={response.body} headers={response.headers} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

/**
 * Status bar showing status code, time, and size
 */
function StatusBar({ response }: { response: ResponseState }) {
  const statusColor = getStatusColor(response.status);

  return (
    <div className="flex items-center gap-4 pb-4 border-b border-border mb-4">
      {/* Status code */}
      <div className={`flex items-center gap-2 ${statusColor}`}>
        <span className="text-lg font-semibold">{response.status}</span>
        <span className="text-sm">{response.statusText}</span>
      </div>

      {/* Timing */}
      <div className="flex items-center gap-1 text-sm text-foreground-muted">
        <ClockIcon />
        <span>{response.timing.total}ms</span>
      </div>

      {/* Size */}
      <div className="flex items-center gap-1 text-sm text-foreground-muted">
        <SizeIcon />
        <span>{formatSize(response.size)}</span>
      </div>

      {/* Truncation warning */}
      {response.bodyTruncated && (
        <div className="flex items-center gap-1 text-sm text-amber-400">
          <WarningIcon />
          <span>Response truncated</span>
        </div>
      )}
    </div>
  );
}

/**
 * Detect content type from headers
 */
function getContentType(headers: Header[]): string {
  const contentTypeHeader = headers.find(
    (h) => h.key.toLowerCase() === 'content-type'
  );
  return contentTypeHeader?.value.toLowerCase() ?? '';
}

/**
 * Check if content is JSON
 */
function isJsonContent(body: string, headers: Header[]): boolean {
  const contentType = getContentType(headers);
  if (contentType.includes('application/json')) return true;
  
  // Try parsing as JSON
  try {
    JSON.parse(body);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if content is HTML
 */
function isHtmlContent(body: string, headers: Header[]): boolean {
  const contentType = getContentType(headers);
  if (contentType.includes('text/html')) return true;
  
  // Check for HTML tags
  return body.trim().startsWith('<!') || body.trim().startsWith('<html');
}

/**
 * Response body with syntax highlighting
 */
function ResponseBody({ body, truncated, headers }: { body: string; truncated: boolean; headers: Header[] }) {
  if (!body) {
    return (
      <div className="h-full flex items-center justify-center text-foreground-muted text-sm">
        (empty response)
      </div>
    );
  }

  const isJson = isJsonContent(body, headers);
  const isHtml = isHtmlContent(body, headers);

  return (
    <div className="relative h-full">
      {/* Copy button */}
      <CopyButton text={body} className="absolute top-2 right-2 z-10" />

      {/* Body content */}
      <div className="h-full overflow-auto rounded-lg bg-[#0a0a0c] p-4">
        {isJson ? (
          <JsonHighlighter body={body} />
        ) : isHtml ? (
          <HtmlHighlighter body={body} />
        ) : (
          <pre className="text-sm font-mono text-foreground-muted whitespace-pre-wrap break-words">
            {body}
          </pre>
        )}
      </div>

      {truncated && (
        <div className="absolute bottom-4 left-0 right-0 text-center">
          <span className="px-3 py-1 text-xs bg-amber-500/20 text-amber-400 rounded">
            Response body truncated at 10MB
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * JSON syntax highlighter with proper tokenization
 */
function JsonHighlighter({ body }: { body: string }) {
  let formatted: string;
  try {
    const parsed = JSON.parse(body);
    formatted = JSON.stringify(parsed, null, 2);
  } catch {
    formatted = body;
  }

  // Recursive function to render JSON with colors
  const renderJson = (obj: unknown, indent = 0): string => {
    const spaces = '  '.repeat(indent);
    
    if (obj === null) {
      return '<span class="text-red-400">null</span>';
    }
    
    if (typeof obj === 'boolean') {
      return `<span class="text-violet-400">${obj}</span>`;
    }
    
    if (typeof obj === 'number') {
      return `<span class="text-amber-400">${obj}</span>`;
    }
    
    if (typeof obj === 'string') {
      return `<span class="text-emerald-400">"${escapeHtml(obj)}"</span>`;
    }
    
    if (Array.isArray(obj)) {
      if (obj.length === 0) return '[]';
      const items = obj.map(item => `${spaces}  ${renderJson(item, indent + 1)}`).join(',\n');
      return `[\n${items}\n${spaces}]`;
    }
    
    if (typeof obj === 'object') {
      const entries = Object.entries(obj);
      if (entries.length === 0) return '{}';
      const props = entries.map(([key, value]) => {
        const keyHtml = `<span class="text-blue-400">"${escapeHtml(key)}"</span>`;
        return `${spaces}  ${keyHtml}: ${renderJson(value, indent + 1)}`;
      }).join(',\n');
      return `{\n${props}\n${spaces}}`;
    }
    
    return String(obj);
  };

  let highlighted: string;
  try {
    const parsed = JSON.parse(body);
    highlighted = renderJson(parsed);
  } catch {
    // Fallback to plain text if parsing fails
    highlighted = escapeHtml(formatted);
  }

  return (
    <pre 
      className="text-sm font-mono leading-relaxed whitespace-pre-wrap break-words"
      dangerouslySetInnerHTML={{ __html: highlighted }}
    />
  );
}

/**
 * HTML syntax highlighter (basic)
 */
function HtmlHighlighter({ body }: { body: string }) {
  // Basic HTML highlighting
  const highlighted = escapeHtml(body)
    // Tags
    .replace(/&lt;(\/?[\w-]+)/g, '<span class="text-blue-400">&lt;$1</span>')
    .replace(/(\/?[\w-]+)&gt;/g, '<span class="text-blue-400">$1&gt;</span>')
    // Attributes
    .replace(/\s([\w-]+)=/g, ' <span class="text-amber-400">$1</span>=')
    // Attribute values
    .replace(/="([^"]*)"/g, '="<span class="text-emerald-400">$1</span>"')
    // Comments
    .replace(/(&lt;!--[\s\S]*?--&gt;)/g, '<span class="text-foreground-muted">$1</span>');

  return (
    <pre 
      className="text-sm font-mono leading-relaxed whitespace-pre-wrap break-words text-foreground-muted"
      dangerouslySetInnerHTML={{ __html: highlighted }}
    />
  );
}

/**
 * HTML Preview (rendered in iframe) - auto-shows for HTML content
 */
function HtmlPreview({ body, headers }: { body: string; headers: Header[] }) {
  const isHtml = isHtmlContent(body, headers);

  if (!isHtml) {
    return (
      <div className="h-full flex items-center justify-center text-foreground-muted text-sm">
        Preview is only available for HTML responses
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-2">
      <p className="text-xs text-foreground-muted/70">
        Note: External resources may not load due to security restrictions
      </p>
      <div className="flex-1 rounded-lg overflow-hidden bg-white">
        <iframe
          srcDoc={body}
          title="Response Preview"
          className="w-full h-full border-0"
          sandbox="allow-same-origin"
        />
      </div>
    </div>
  );
}

/**
 * Response headers table
 */
function ResponseHeaders({ headers }: { headers: Header[] }) {
  if (headers.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-foreground-muted">
        No response headers
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {headers.map((header, index) => (
        <div
          key={index}
          className="flex gap-4 px-3 py-2 rounded-lg hover:bg-surface transition-colors"
        >
          <span className="font-medium text-foreground min-w-[200px] shrink-0">{header.key}</span>
          <span className="text-foreground-muted font-mono text-sm break-all">
            {header.value}
          </span>
        </div>
      ))}
    </div>
  );
}



/**
 * Loading state
 */
function LoadingState() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-2 border-surface" />
        <div className="absolute top-0 left-0 w-12 h-12 rounded-full border-2 border-accent border-t-transparent animate-spin" />
      </div>
      <p className="text-sm text-foreground-muted">Sending request...</p>
    </div>
  );
}

/**
 * Empty state (no response yet)
 */
function EmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
      <SendIcon className="h-12 w-12 text-foreground-muted/30" />
      <div>
        <p className="text-sm font-medium text-foreground">No Response Yet</p>
        <p className="text-xs text-foreground-muted">Send a request to see the response here</p>
      </div>
    </div>
  );
}

/**
 * Error state
 */
function ErrorState({
  error,
  timing,
}: {
  error: { type: string; message: string };
  timing: { total: number };
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4">
      <div className="p-4 rounded-full bg-red-500/10">
        <ErrorIcon className="h-8 w-8 text-red-400" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-red-400 capitalize">{error.type} Error</p>
        <p className="text-xs text-foreground-muted mt-1">{error.message}</p>
        <p className="text-xs text-foreground-muted/70 mt-2">Time: {timing.total}ms</p>
      </div>
    </div>
  );
}

/**
 * Copy to clipboard button
 */
function CopyButton({ text, className }: { text: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`
        p-2 rounded-md
        text-foreground-muted hover:text-foreground
        bg-surface hover:bg-surface-hover
        transition-colors
        ${className}
      `}
      aria-label="Copy to clipboard"
    >
      {copied ? (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-emerald-400">
          <path d="M3 8L6 11L13 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <rect x="5" y="5" width="9" height="9" rx="1" stroke="currentColor" strokeWidth="1.5" />
          <path d="M3 11V3C3 2.44772 3.44772 2 4 2H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      )}
    </button>
  );
}

// ============================================================================
// Utilities
// ============================================================================

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getStatusColor(status: number): string {
  if (status >= 200 && status < 300) return 'text-emerald-400';
  if (status >= 300 && status < 400) return 'text-blue-400';
  if (status >= 400 && status < 500) return 'text-amber-400';
  if (status >= 500) return 'text-red-400';
  return 'text-foreground-muted';
}

function formatSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ============================================================================
// Icons
// ============================================================================

function ClockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 4V7L9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function SizeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path
        d="M2 10V11C2 11.5523 2.44772 12 3 12H11C11.5523 12 12 11.5523 12 11V10M7 2V9M7 9L4 6M7 9L10 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path
        d="M7 5V7.5M7 9.5V9.51M2.5 11.5H11.5L7 2.5L2.5 11.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SendIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path
        d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ErrorIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 8V12M12 16V16.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
