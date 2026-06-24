"use client";

/**
 * Local blob store for note file attachments, backed by IndexedDB (there's no
 * backend in v1). The note JSON keeps only a `ref` (the IndexedDB key); the
 * actual file lives here. Swaps cleanly to real object storage later.
 */
const DB_NAME = "mission-psc";
const STORE = "note-files";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function tx<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const store = db.transaction(STORE, mode).objectStore(STORE);
        const req = run(store);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      }),
  );
}

/** Store a file blob; returns the generated ref to save on the note. */
export async function putNoteFile(blob: Blob): Promise<string> {
  if (typeof indexedDB === "undefined") throw new Error("IndexedDB unavailable");
  const ref = crypto.randomUUID();
  await tx("readwrite", (store) => store.put(blob, ref));
  return ref;
}

/** Read a stored file blob, or null if missing / unavailable. */
export async function getNoteFileBlob(ref: string): Promise<Blob | null> {
  if (typeof indexedDB === "undefined") return null;
  try {
    const blob = await tx<Blob | undefined>("readonly", (store) => store.get(ref));
    return blob ?? null;
  } catch {
    return null;
  }
}

/** Delete a stored file blob (best effort). */
export async function deleteNoteFile(ref: string): Promise<void> {
  if (typeof indexedDB === "undefined") return;
  try {
    await tx("readwrite", (store) => store.delete(ref));
  } catch {
    // ignore
  }
}
