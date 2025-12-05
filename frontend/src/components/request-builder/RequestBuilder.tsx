/**
 * Request Builder - main container for building HTTP requests
 *
 * @module components/request-builder/RequestBuilder
 */

import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui';
import { UrlBar } from './UrlBar';
import { HeadersEditor } from './HeadersEditor';
import { BodyEditor } from './BodyEditor';
import { useRequestStore } from '../../stores';

interface RequestBuilderProps {
  /** Callback when send is clicked */
  onSend: () => void;
  /** Loading state */
  loading?: boolean;
}

/**
 * Complete request builder with URL bar, headers, body, and auth tabs
 *
 * @example
 * ```tsx
 * <RequestBuilder onSend={handleSend} loading={isLoading} />
 * ```
 */
export function RequestBuilder({ onSend, loading = false }: RequestBuilderProps) {
  const {
    method,
    url,
    headers,
    body,
    setMethod,
    setUrl,
    setHeaders,
    setBody,
  } = useRequestStore();

  return (
    <div className="space-y-4">
      {/* URL Bar */}
      <UrlBar
        method={method}
        url={url}
        loading={loading}
        onMethodChange={setMethod}
        onUrlChange={setUrl}
        onSend={onSend}
      />

      {/* Request configuration tabs */}
      <Tabs defaultValue="headers">
        <TabsList>
          <TabsTrigger value="params">
            Params
            <ParamCount url={url} />
          </TabsTrigger>
          <TabsTrigger value="headers">
            Headers
            <HeaderCount headers={headers} />
          </TabsTrigger>
          <TabsTrigger value="body">Body</TabsTrigger>
          <TabsTrigger value="auth">Auth</TabsTrigger>
        </TabsList>

        <TabsContent value="params" className="pt-4">
          <QueryParamsEditor url={url} onUrlChange={setUrl} disabled={loading} />
        </TabsContent>

        <TabsContent value="headers" className="pt-4">
          <HeadersEditor headers={headers} onChange={setHeaders} disabled={loading} />
        </TabsContent>

        <TabsContent value="body" className="pt-4">
          <BodyEditor body={body} onChange={setBody} disabled={loading} />
        </TabsContent>

        <TabsContent value="auth" className="pt-4">
          <AuthPlaceholder />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/**
 * Badge showing count of enabled items
 */
function CountBadge({ count }: { count: number }) {
  if (count === 0) return null;

  return (
    <span className="ml-1.5 px-1.5 py-0.5 text-[10px] font-medium bg-accent/20 text-accent rounded">
      {count}
    </span>
  );
}

/**
 * Count query params in URL
 */
function ParamCount({ url }: { url: string }) {
  try {
    const urlObj = new URL(url);
    const count = Array.from(urlObj.searchParams).length;
    return <CountBadge count={count} />;
  } catch {
    return null;
  }
}

/**
 * Count enabled headers
 */
function HeaderCount({ headers }: { headers: Array<{ enabled: boolean; key: string }> }) {
  const count = headers.filter((h) => h.enabled && h.key.trim()).length;
  return <CountBadge count={count} />;
}

/**
 * Query params editor - extracts params from URL for easy editing
 */
function QueryParamsEditor({
  url,
  onUrlChange,
  disabled,
}: {
  url: string;
  onUrlChange: (url: string) => void;
  disabled?: boolean;
}) {
  // Parse URL params
  let baseUrl = url;
  let params: Array<{ key: string; value: string }> = [];

  try {
    const urlObj = new URL(url);
    baseUrl = `${urlObj.origin}${urlObj.pathname}`;
    params = Array.from(urlObj.searchParams).map(([key, value]) => ({ key, value }));
  } catch {
    // Invalid URL, show empty params
  }

  const updateParams = (newParams: Array<{ key: string; value: string }>) => {
    try {
      const urlObj = new URL(baseUrl);
      urlObj.search = '';
      newParams.forEach(({ key, value }) => {
        if (key.trim()) {
          urlObj.searchParams.append(key, value);
        }
      });
      onUrlChange(urlObj.toString());
    } catch {
      // Keep URL as-is if base is invalid
    }
  };

  const addParam = () => {
    updateParams([...params, { key: '', value: '' }]);
  };

  const updateParam = (index: number, updates: { key?: string; value?: string }) => {
    const newParams = params.map((p, i) => (i === index ? { ...p, ...updates } : p));
    updateParams(newParams);
  };

  const removeParam = (index: number) => {
    updateParams(params.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      {/* Params table */}
      <div className="space-y-2">
        {/* Header row */}
        {params.length > 0 && (
          <div className="grid grid-cols-[1fr_1fr_auto] gap-2 px-1">
            <span className="text-xs font-medium uppercase tracking-wider text-foreground-muted">
              Key
            </span>
            <span className="text-xs font-medium uppercase tracking-wider text-foreground-muted">
              Value
            </span>
            <div className="w-8" />
          </div>
        )}

        {/* Param rows */}
        {params.map((param, index) => (
          <div key={index} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
            <input
              type="text"
              value={param.key}
              onChange={(e) => updateParam(index, { key: e.target.value })}
              placeholder="Parameter name"
              disabled={disabled}
              className="
                h-9 px-3
                text-sm
                bg-[#0F0F12] text-foreground
                border border-border rounded-lg
                focus:outline-none focus:border-accent
                disabled:opacity-50
              "
            />
            <input
              type="text"
              value={param.value}
              onChange={(e) => updateParam(index, { value: e.target.value })}
              placeholder="Value"
              disabled={disabled}
              className="
                h-9 px-3
                text-sm
                bg-[#0F0F12] text-foreground
                border border-border rounded-lg
                focus:outline-none focus:border-accent
                disabled:opacity-50
              "
            />
            <button
              type="button"
              onClick={() => removeParam(index)}
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

        {/* Empty state */}
        {params.length === 0 && (
          <div className="py-4 text-center text-sm text-foreground-muted">
            No query parameters. Add them to the URL or click below.
          </div>
        )}
      </div>

      {/* Add param button */}
      <button
        type="button"
        onClick={addParam}
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
        Add Parameter
      </button>
    </div>
  );
}

/**
 * Auth placeholder - to be implemented in Phase 7
 */
function AuthPlaceholder() {
  return (
    <div className="py-8 text-center">
      <p className="text-sm text-foreground-muted">
        Authentication options coming soon.
      </p>
      <p className="text-xs text-foreground-muted/70 mt-1">
        Bearer Token, API Key, Basic Auth
      </p>
    </div>
  );
}

export { UrlBar } from './UrlBar';
export { MethodSelector } from './MethodSelector';
export { HeadersEditor } from './HeadersEditor';
export { BodyEditor } from './BodyEditor';
