/**
 * UI state store - manages application-level UI state
 *
 * @module stores/ui.store
 */

import { create } from 'zustand';
import type { SidebarTab, RequestTab, ResponseTab } from '../types';

interface UIState {
  /** Currently active sidebar tab */
  sidebarTab: SidebarTab;
  /** Currently active request builder tab */
  requestTab: RequestTab;
  /** Currently active response viewer tab */
  responseTab: ResponseTab;
  /** Whether sidebar is collapsed (mobile) */
  sidebarCollapsed: boolean;
  /** ID of the currently selected request in sidebar */
  selectedRequestId: string | null;
  /** ID of the currently selected history entry */
  selectedHistoryId: string | null;
}

interface UIActions {
  /** Set the active sidebar tab */
  setSidebarTab: (tab: SidebarTab) => void;
  /** Set the active request builder tab */
  setRequestTab: (tab: RequestTab) => void;
  /** Set the active response viewer tab */
  setResponseTab: (tab: ResponseTab) => void;
  /** Toggle sidebar collapsed state */
  toggleSidebar: () => void;
  /** Set sidebar collapsed state */
  setSidebarCollapsed: (collapsed: boolean) => void;
  /** Set the selected request ID */
  setSelectedRequestId: (id: string | null) => void;
  /** Set the selected history entry ID */
  setSelectedHistoryId: (id: string | null) => void;
}

type UIStore = UIState & UIActions;

/**
 * UI state store for managing application-wide UI state
 *
 * @example
 * ```tsx
 * const sidebarTab = useUIStore((state) => state.sidebarTab);
 * const setSidebarTab = useUIStore((state) => state.setSidebarTab);
 * ```
 */
export const useUIStore = create<UIStore>((set) => ({
  // Initial state
  sidebarTab: 'collections',
  requestTab: 'params',
  responseTab: 'body',
  sidebarCollapsed: false,
  selectedRequestId: null,
  selectedHistoryId: null,

  // Actions
  setSidebarTab: (tab) => set({ sidebarTab: tab }),
  setRequestTab: (tab) => set({ requestTab: tab }),
  setResponseTab: (tab) => set({ responseTab: tab }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  setSelectedRequestId: (id) => set({ selectedRequestId: id }),
  setSelectedHistoryId: (id) => set({ selectedHistoryId: id }),
}));
