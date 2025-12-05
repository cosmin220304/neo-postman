/**
 * Main App component - application layout with sidebar and main panel
 *
 * @module App
 */

import { useEffect } from 'react';
import { useUIStore, useEnvironmentStore } from './stores';
import { Tabs, TabsList, TabsTrigger, TabsContent, Button } from './components/ui';
import { RequestBuilder } from './components/request-builder';
import { ResponseViewer } from './components/response-viewer';
import { HistoryList } from './components/sidebar/HistoryList';
import { useRequest } from './hooks';

/**
 * Main application component
 * Layout: Header + Sidebar + Main Panel (Request Builder + Response Viewer)
 */
function App() {
  const { sidebarTab, setSidebarTab, sidebarCollapsed, toggleSidebar } = useUIStore();
  const { loadEnvironments, activeEnvironment, environments } = useEnvironmentStore();
  const { sendRequest, loading } = useRequest();

  // Load environments on mount
  useEffect(() => {
    loadEnvironments();
  }, [loadEnvironments]);

  return (
    <div className="flex h-screen flex-col bg-bg-base text-foreground">
      {/* Header */}
      <Header
        activeEnvironment={activeEnvironment}
        environments={environments}
        onToggleSidebar={toggleSidebar}
        sidebarCollapsed={sidebarCollapsed}
      />

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`
            flex-shrink-0 border-r border-border bg-bg-elevated
            transition-all duration-200 ease-expo-out
            ${sidebarCollapsed ? 'w-0 overflow-hidden' : 'w-72'}
          `}
        >
          <div className="flex h-full flex-col">
            {/* Sidebar tabs */}
            <Tabs value={sidebarTab} onValueChange={(v) => setSidebarTab(v as 'collections' | 'history')}>
              <TabsList className="px-2">
                <TabsTrigger value="collections">Collections</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>

              <TabsContent value="collections" className="flex-1 overflow-auto p-3">
                <CollectionsPlaceholder />
              </TabsContent>

              <TabsContent value="history" className="flex-1 overflow-auto p-3">
                <HistoryList />
              </TabsContent>
            </Tabs>
          </div>
        </aside>

        {/* Main panel */}
        <main className="flex flex-1 flex-col gap-4 overflow-auto p-4">
          {/* Request Builder Card */}
          <section className="rounded-2xl border border-border bg-gradient-card p-6 shadow-card">
            <RequestBuilder onSend={sendRequest} loading={loading} />
          </section>

          {/* Response Viewer Card */}
          <section className="flex-1 min-h-[300px] rounded-2xl border border-border bg-gradient-card p-6 shadow-card">
            <ResponseViewer />
          </section>
        </main>
      </div>
    </div>
  );
}

/**
 * Header component with environment selector and sync status
 */
function Header({
  activeEnvironment,
  onToggleSidebar,
  sidebarCollapsed,
}: {
  activeEnvironment: { name: string } | null;
  environments: { id: string; name: string }[];
  onToggleSidebar: () => void;
  sidebarCollapsed: boolean;
}) {
  return (
    <header className="flex h-12 items-center justify-between border-b border-border bg-bg-deep px-4">
      {/* Left: Logo and sidebar toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 text-foreground-muted hover:text-foreground transition-colors"
          aria-label={sidebarCollapsed ? 'Show sidebar' : 'Hide sidebar'}
        >
          <MenuIcon />
        </button>
        <h1 className="bg-gradient-to-b from-white to-white/70 bg-clip-text text-lg font-semibold text-transparent">
          Neo-Postman
        </h1>
      </div>

      {/* Center: Environment selector */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium uppercase tracking-wider text-foreground-muted">
          Environment:
        </span>
        <Button variant="ghost" size="sm" className="gap-2">
          <span className={activeEnvironment ? 'text-foreground' : 'text-foreground-muted'}>
            {activeEnvironment?.name ?? 'No Environment'}
          </span>
          <ChevronDownIcon />
        </Button>
      </div>

      {/* Right: Sync status */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 text-xs text-foreground-muted">
          <div className="h-2 w-2 rounded-full bg-emerald-500" />
          <span>Local</span>
        </div>
      </div>
    </header>
  );
}

// ============================================================================
// Placeholder Components (to be replaced in later phases)
// ============================================================================

function CollectionsPlaceholder() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
      <FolderIcon className="h-10 w-10 text-foreground-muted/50" />
      <div>
        <p className="text-sm font-medium text-foreground">No Collections</p>
        <p className="text-xs text-foreground-muted">Create a collection to organize your requests</p>
      </div>
      <Button variant="secondary" size="sm">
        New Collection
      </Button>
    </div>
  );
}



// ============================================================================
// Icons
// ============================================================================

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 5H17M3 10H17M3 15H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3.5 5.25L7 8.75L10.5 5.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FolderIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 7V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V9C21 7.89543 20.1046 7 19 7H12L10 5H5C3.89543 5 3 5.89543 3 7Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default App;
