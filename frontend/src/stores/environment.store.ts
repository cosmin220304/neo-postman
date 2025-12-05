/**
 * Environment store - manages environments and active environment selection
 *
 * @module stores/environment.store
 */

import { create } from 'zustand';
import type { Environment, Variable } from '../types';
import {
  getAllEnvironments,
  getActiveEnvironment,
  createEnvironment,
  updateEnvironment,
  deleteEnvironment,
  setActiveEnvironment as setActiveEnvironmentInDB,
} from '../services/db';

interface EnvironmentState {
  /** All available environments */
  environments: Environment[];
  /** Currently active environment */
  activeEnvironment: Environment | null;
  /** Loading state */
  loading: boolean;
  /** Error message if any */
  error: string | null;
}

interface EnvironmentActions {
  /** Load all environments from IndexedDB */
  loadEnvironments: () => Promise<void>;
  /** Create a new environment */
  createEnvironment: (name: string, variables?: Variable[]) => Promise<string>;
  /** Update an existing environment */
  updateEnvironment: (id: string, updates: Partial<Environment>) => Promise<void>;
  /** Delete an environment */
  deleteEnvironment: (id: string) => Promise<void>;
  /** Set the active environment */
  setActiveEnvironment: (id: string | null) => Promise<void>;
  /** Get a variable value from the active environment */
  getVariable: (key: string) => string | undefined;
  /** Get all variables from the active environment as a map */
  getVariablesMap: () => Map<string, string>;
}

type EnvironmentStore = EnvironmentState & EnvironmentActions;

/**
 * Environment store for managing environments and variables
 *
 * @example
 * ```tsx
 * const { environments, activeEnvironment, loadEnvironments } = useEnvironmentStore();
 *
 * useEffect(() => {
 *   loadEnvironments();
 * }, []);
 * ```
 */
export const useEnvironmentStore = create<EnvironmentStore>((set, get) => ({
  // Initial state
  environments: [],
  activeEnvironment: null,
  loading: false,
  error: null,

  // Actions
  loadEnvironments: async () => {
    set({ loading: true, error: null });
    try {
      const [environments, activeEnvironment] = await Promise.all([
        getAllEnvironments(),
        getActiveEnvironment(),
      ]);
      set({
        environments,
        activeEnvironment: activeEnvironment ?? null,
        loading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load environments',
        loading: false,
      });
    }
  },

  createEnvironment: async (name, variables = []) => {
    set({ error: null });
    try {
      const id = await createEnvironment({
        name,
        variables,
        isActive: false,
        syncProjectId: null,
      });

      // Reload environments
      await get().loadEnvironments();
      return id;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to create environment',
      });
      throw error;
    }
  },

  updateEnvironment: async (id, updates) => {
    set({ error: null });
    try {
      await updateEnvironment(id, updates);

      // Update local state
      set((state) => ({
        environments: state.environments.map((env) =>
          env.id === id ? { ...env, ...updates, updatedAt: new Date().toISOString() } : env
        ),
        activeEnvironment:
          state.activeEnvironment?.id === id
            ? { ...state.activeEnvironment, ...updates, updatedAt: new Date().toISOString() }
            : state.activeEnvironment,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update environment',
      });
      throw error;
    }
  },

  deleteEnvironment: async (id) => {
    set({ error: null });
    try {
      await deleteEnvironment(id);

      // Update local state
      set((state) => ({
        environments: state.environments.filter((env) => env.id !== id),
        activeEnvironment:
          state.activeEnvironment?.id === id ? null : state.activeEnvironment,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete environment',
      });
      throw error;
    }
  },

  setActiveEnvironment: async (id) => {
    set({ error: null });
    try {
      await setActiveEnvironmentInDB(id);

      // Update local state
      const newActive = id ? get().environments.find((env) => env.id === id) ?? null : null;
      set((state) => ({
        environments: state.environments.map((env) => ({
          ...env,
          isActive: env.id === id,
        })),
        activeEnvironment: newActive ? { ...newActive, isActive: true } : null,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to set active environment',
      });
      throw error;
    }
  },

  getVariable: (key) => {
    const { activeEnvironment } = get();
    if (!activeEnvironment) return undefined;

    const variable = activeEnvironment.variables.find(
      (v) => v.key === key && v.enabled
    );
    return variable?.value;
  },

  getVariablesMap: () => {
    const { activeEnvironment } = get();
    const map = new Map<string, string>();

    if (activeEnvironment) {
      for (const variable of activeEnvironment.variables) {
        if (variable.enabled) {
          map.set(variable.key, variable.value);
        }
      }
    }

    return map;
  },
}));
