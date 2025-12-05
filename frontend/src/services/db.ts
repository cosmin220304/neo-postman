/**
 * IndexedDB database setup using Dexie
 * Provides offline-first storage for all Neo-Postman data
 *
 * @module services/db
 */

import Dexie, { type EntityTable } from 'dexie';
import type {
  Environment,
  Collection,
  Folder,
  SavedRequest,
  HistoryEntry,
} from '../types';

/**
 * Neo-Postman database schema
 * All entities are stored locally in IndexedDB for offline-first operation
 */
export class NeoPostmanDB extends Dexie {
  environments!: EntityTable<Environment, 'id'>;
  collections!: EntityTable<Collection, 'id'>;
  folders!: EntityTable<Folder, 'id'>;
  requests!: EntityTable<SavedRequest, 'id'>;
  history!: EntityTable<HistoryEntry, 'id'>;

  constructor() {
    super('neo-postman');

    this.version(1).stores({
      // Environment: indexed by id, searchable by name and sync project
      environments: 'id, name, isActive, syncProjectId',

      // Collection: indexed by id, searchable by name and sync project
      collections: 'id, name, sortOrder, syncProjectId',

      // Folder: indexed by id, searchable by collection and parent
      folders: 'id, collectionId, parentFolderId, sortOrder',

      // SavedRequest: indexed by id, searchable by collection, folder, and name
      requests: 'id, collectionId, folderId, name, sortOrder',

      // History: indexed by id, searchable by timestamp, method, and status
      // Compound index [timestamp] for date-based queries
      history: 'id, timestamp, request.method, response.status, savedRequestId',
    });
  }
}

/** Singleton database instance */
export const db = new NeoPostmanDB();

// ============================================================================
// Environment Operations
// ============================================================================

/**
 * Get all environments
 * @returns Promise resolving to array of environments
 */
export async function getAllEnvironments(): Promise<Environment[]> {
  return db.environments.toArray();
}

/**
 * Get the currently active environment
 * @returns Promise resolving to active environment or undefined
 */
export async function getActiveEnvironment(): Promise<Environment | undefined> {
  return db.environments.where('isActive').equals(1).first();
}

/**
 * Create a new environment
 * @param environment - Environment data (id and timestamps will be generated)
 * @returns Promise resolving to the created environment's id
 */
export async function createEnvironment(
  environment: Omit<Environment, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  await db.environments.add({
    ...environment,
    id,
    createdAt: now,
    updatedAt: now,
  });

  return id;
}

/**
 * Update an existing environment
 * @param id - Environment id
 * @param updates - Partial environment data to update
 */
export async function updateEnvironment(
  id: string,
  updates: Partial<Omit<Environment, 'id' | 'createdAt'>>
): Promise<void> {
  await db.environments.update(id, {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Set the active environment (deactivates all others)
 * @param id - Environment id to activate, or null to deactivate all
 */
export async function setActiveEnvironment(id: string | null): Promise<void> {
  await db.transaction('rw', db.environments, async () => {
    // Deactivate all environments
    await db.environments.toCollection().modify({ isActive: false });

    // Activate the selected one
    if (id) {
      await db.environments.update(id, { isActive: true });
    }
  });
}

/**
 * Delete an environment
 * @param id - Environment id
 */
export async function deleteEnvironment(id: string): Promise<void> {
  await db.environments.delete(id);
}

// ============================================================================
// Collection Operations
// ============================================================================

/**
 * Get all collections ordered by sortOrder
 * @returns Promise resolving to array of collections
 */
export async function getAllCollections(): Promise<Collection[]> {
  return db.collections.orderBy('sortOrder').toArray();
}

/**
 * Get a collection by id
 * @param id - Collection id
 * @returns Promise resolving to collection or undefined
 */
export async function getCollection(id: string): Promise<Collection | undefined> {
  return db.collections.get(id);
}

/**
 * Create a new collection
 * @param collection - Collection data
 * @returns Promise resolving to the created collection's id
 */
export async function createCollection(
  collection: Omit<Collection, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  await db.collections.add({
    ...collection,
    id,
    createdAt: now,
    updatedAt: now,
  });

  return id;
}

/**
 * Update an existing collection
 * @param id - Collection id
 * @param updates - Partial collection data to update
 */
export async function updateCollection(
  id: string,
  updates: Partial<Omit<Collection, 'id' | 'createdAt'>>
): Promise<void> {
  await db.collections.update(id, {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Delete a collection and all its contents (folders and requests)
 * @param id - Collection id
 */
export async function deleteCollection(id: string): Promise<void> {
  await db.transaction('rw', [db.collections, db.folders, db.requests], async () => {
    // Delete all requests in this collection
    await db.requests.where('collectionId').equals(id).delete();

    // Delete all folders in this collection
    await db.folders.where('collectionId').equals(id).delete();

    // Delete the collection itself
    await db.collections.delete(id);
  });
}

// ============================================================================
// Folder Operations
// ============================================================================

/**
 * Get all folders in a collection
 * @param collectionId - Collection id
 * @returns Promise resolving to array of folders
 */
export async function getFoldersByCollection(collectionId: string): Promise<Folder[]> {
  return db.folders.where('collectionId').equals(collectionId).sortBy('sortOrder');
}

/**
 * Get child folders of a parent folder
 * @param parentFolderId - Parent folder id
 * @returns Promise resolving to array of child folders
 */
export async function getChildFolders(parentFolderId: string): Promise<Folder[]> {
  return db.folders.where('parentFolderId').equals(parentFolderId).sortBy('sortOrder');
}

/**
 * Get folder nesting depth (max 3 levels allowed)
 * @param folderId - Folder id to check
 * @returns Promise resolving to nesting depth (0 = root level)
 */
export async function getFolderDepth(folderId: string | null): Promise<number> {
  if (!folderId) return 0;

  let depth = 0;
  let currentId: string | null = folderId;

  while (currentId && depth < 4) {
    const foundFolder: Folder | undefined = await db.folders.get(currentId);
    if (!foundFolder) break;
    depth++;
    currentId = foundFolder.parentFolderId;
  }

  return depth;
}

/**
 * Create a new folder
 * @param folder - Folder data
 * @returns Promise resolving to the created folder's id
 * @throws Error if max nesting depth (3) would be exceeded
 */
export async function createFolder(
  folder: Omit<Folder, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  // Check nesting depth
  const parentDepth = await getFolderDepth(folder.parentFolderId);
  if (parentDepth >= 3) {
    throw new Error('Maximum folder nesting depth (3 levels) exceeded');
  }

  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  await db.folders.add({
    ...folder,
    id,
    createdAt: now,
    updatedAt: now,
  });

  return id;
}

/**
 * Update an existing folder
 * @param id - Folder id
 * @param updates - Partial folder data to update
 */
export async function updateFolder(
  id: string,
  updates: Partial<Omit<Folder, 'id' | 'createdAt'>>
): Promise<void> {
  // If changing parent, check nesting depth
  if (updates.parentFolderId !== undefined) {
    const parentDepth = await getFolderDepth(updates.parentFolderId);
    if (parentDepth >= 3) {
      throw new Error('Maximum folder nesting depth (3 levels) exceeded');
    }
  }

  await db.folders.update(id, {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Delete a folder and all its contents (subfolders and requests)
 * @param id - Folder id
 */
export async function deleteFolder(id: string): Promise<void> {
  await db.transaction('rw', [db.folders, db.requests], async () => {
    // Recursively get all descendant folder ids
    const descendantIds = await getDescendantFolderIds(id);
    const allFolderIds = [id, ...descendantIds];

    // Delete all requests in these folders
    for (const folderId of allFolderIds) {
      await db.requests.where('folderId').equals(folderId).delete();
    }

    // Delete all folders
    await db.folders.bulkDelete(allFolderIds);
  });
}

/**
 * Get all descendant folder ids recursively
 * @param folderId - Parent folder id
 * @returns Promise resolving to array of descendant folder ids
 */
async function getDescendantFolderIds(folderId: string): Promise<string[]> {
  const children = await db.folders.where('parentFolderId').equals(folderId).toArray();
  const childIds = children.map((f) => f.id);

  const descendantIds: string[] = [];
  for (const childId of childIds) {
    descendantIds.push(childId);
    const grandchildren = await getDescendantFolderIds(childId);
    descendantIds.push(...grandchildren);
  }

  return descendantIds;
}

// ============================================================================
// Request Operations
// ============================================================================

/**
 * Get all requests in a collection (including those in folders)
 * @param collectionId - Collection id
 * @returns Promise resolving to array of requests
 */
export async function getRequestsByCollection(collectionId: string): Promise<SavedRequest[]> {
  return db.requests.where('collectionId').equals(collectionId).sortBy('sortOrder');
}

/**
 * Get requests in a specific folder (or root level if folderId is null)
 * @param collectionId - Collection id
 * @param folderId - Folder id or null for root level
 * @returns Promise resolving to array of requests
 */
export async function getRequestsByFolder(
  collectionId: string,
  folderId: string | null
): Promise<SavedRequest[]> {
  if (folderId === null) {
    return db.requests
      .where('collectionId')
      .equals(collectionId)
      .filter((r) => r.folderId === null)
      .sortBy('sortOrder');
  }

  return db.requests.where('folderId').equals(folderId).sortBy('sortOrder');
}

/**
 * Get a request by id
 * @param id - Request id
 * @returns Promise resolving to request or undefined
 */
export async function getRequest(id: string): Promise<SavedRequest | undefined> {
  return db.requests.get(id);
}

/**
 * Create a new saved request
 * @param request - Request data
 * @returns Promise resolving to the created request's id
 */
export async function createRequest(
  request: Omit<SavedRequest, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  await db.requests.add({
    ...request,
    id,
    createdAt: now,
    updatedAt: now,
  });

  return id;
}

/**
 * Update an existing request
 * @param id - Request id
 * @param updates - Partial request data to update
 */
export async function updateRequest(
  id: string,
  updates: Partial<Omit<SavedRequest, 'id' | 'createdAt'>>
): Promise<void> {
  await db.requests.update(id, {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Delete a request
 * @param id - Request id
 */
export async function deleteRequest(id: string): Promise<void> {
  await db.requests.delete(id);
}

// ============================================================================
// History Operations
// ============================================================================

/**
 * Get history entries, most recent first
 * @param limit - Maximum number of entries to return (default 100)
 * @returns Promise resolving to array of history entries
 */
export async function getHistory(limit = 100): Promise<HistoryEntry[]> {
  return db.history.orderBy('timestamp').reverse().limit(limit).toArray();
}

/**
 * Search history by URL pattern
 * @param urlPattern - URL substring to search for
 * @param limit - Maximum number of entries to return
 * @returns Promise resolving to array of matching history entries
 */
export async function searchHistory(urlPattern: string, limit = 100): Promise<HistoryEntry[]> {
  const lowerPattern = urlPattern.toLowerCase();
  return db.history
    .orderBy('timestamp')
    .reverse()
    .filter((entry) => entry.request.url.toLowerCase().includes(lowerPattern))
    .limit(limit)
    .toArray();
}

/**
 * Filter history by method
 * @param method - HTTP method to filter by
 * @param limit - Maximum number of entries to return
 * @returns Promise resolving to array of matching history entries
 */
export async function filterHistoryByMethod(
  method: string,
  limit = 100
): Promise<HistoryEntry[]> {
  return db.history
    .where('request.method')
    .equals(method)
    .reverse()
    .limit(limit)
    .toArray();
}

/**
 * Filter history by status code range
 * @param minStatus - Minimum status code (inclusive)
 * @param maxStatus - Maximum status code (inclusive)
 * @param limit - Maximum number of entries to return
 * @returns Promise resolving to array of matching history entries
 */
export async function filterHistoryByStatus(
  minStatus: number,
  maxStatus: number,
  limit = 100
): Promise<HistoryEntry[]> {
  return db.history
    .orderBy('timestamp')
    .reverse()
    .filter((entry) => {
      const status = entry.response?.status;
      return status !== undefined && status >= minStatus && status <= maxStatus;
    })
    .limit(limit)
    .toArray();
}

/**
 * Add a new history entry
 * @param entry - History entry data (id and timestamp will be generated if not provided)
 * @returns Promise resolving to the created entry's id
 */
export async function addHistoryEntry(
  entry: Omit<HistoryEntry, 'id' | 'timestamp'> & { timestamp?: string }
): Promise<string> {
  const id = crypto.randomUUID();
  const timestamp = entry.timestamp ?? new Date().toISOString();

  await db.history.add({
    ...entry,
    id,
    timestamp,
  });

  return id;
}

/**
 * Get a history entry by id
 * @param id - History entry id
 * @returns Promise resolving to history entry or undefined
 */
export async function getHistoryEntry(id: string): Promise<HistoryEntry | undefined> {
  return db.history.get(id);
}

/**
 * Delete a history entry
 * @param id - History entry id
 */
export async function deleteHistoryEntry(id: string): Promise<void> {
  await db.history.delete(id);
}

/**
 * Clear all history entries
 */
export async function clearHistory(): Promise<void> {
  await db.history.clear();
}

/**
 * Get history entries for a specific saved request
 * @param savedRequestId - Saved request id
 * @param limit - Maximum number of entries to return
 * @returns Promise resolving to array of history entries
 */
export async function getHistoryByRequest(
  savedRequestId: string,
  limit = 50
): Promise<HistoryEntry[]> {
  return db.history
    .where('savedRequestId')
    .equals(savedRequestId)
    .reverse()
    .limit(limit)
    .toArray();
}
