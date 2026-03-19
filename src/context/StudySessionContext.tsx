import React, {
  createContext, useContext, useState, useEffect,
  useCallback, useRef, ReactNode,
} from 'react';
import { useRouter } from 'next/router';
import { SessionItem } from '../utils/types';
import { selectionStore } from '../utils/selectionStore';

interface StudySessionContextValue {
  isActive: boolean;
  items: SessionItem[];
  itemCount: number;
  currentSubject: string | null;
  toggleMode: () => void;
  addItem: (item: SessionItem) => boolean;
  removeItem: (id: string) => void;
  toggleItem: (item: SessionItem) => boolean;
  clearAll: () => void;
  isSelected: (id: string) => boolean;
}

const StudySessionContext = createContext<StudySessionContextValue | null>(null);

const STORAGE_KEY_ACTIVE = 'studyModeActive';
const STORAGE_PREFIX = 'studySession:';
const MAX_ITEMS = 50;

function getStorageKey(subject: string | null): string | null {
  return subject ? `${STORAGE_PREFIX}${subject}` : null;
}

function loadItems(key: string | null): SessionItem[] {
  if (!key || typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem(key);
    return saved ? (JSON.parse(saved) as SessionItem[]) : [];
  } catch {
    return [];
  }
}

export function StudySessionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [isActive, setIsActive] = useState(false);
  const [items, setItems] = useState<SessionItem[]>([]);

  // Current subject derived from route
  const currentSubject = router.isReady
    ? (router.query.subject as string | undefined) ?? null
    : null;
  const storageKey = getStorageKey(currentSubject);
  const storageKeyRef = useRef<string | null>(null);

  // Ref updated synchronously during render — always current, no useEffect delay
  const itemsRef = useRef<SessionItem[]>([]);
  itemsRef.current = items;
  // Set for O(1) membership checks — rebuilt only when items changes
  const itemIdSet = React.useMemo(() => new Set(items.map(i => i.id)), [items]);
  const itemIdSetRef = useRef(itemIdSet);
  itemIdSetRef.current = itemIdSet;

  // Helper: update items + persist + update selection store
  const commitItems = useCallback((next: SessionItem[]) => {
    setItems(next);
    itemsRef.current = next;
    selectionStore.setAll(next.map(i => i.id));
    const key = storageKeyRef.current;
    if (key) localStorage.setItem(key, JSON.stringify(next));
  }, []);

  // Hydrate isActive on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const savedActive = localStorage.getItem(STORAGE_KEY_ACTIVE);
    if (savedActive === 'true') setIsActive(true);
  }, []);

  // Load items when subject changes
  useEffect(() => {
    storageKeyRef.current = storageKey;
    const loaded = loadItems(storageKey);
    setItems(loaded);
    itemsRef.current = loaded;
    selectionStore.setAll(loaded.map(i => i.id));
  }, [storageKey]);

  // Persist isActive
  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY_ACTIVE, String(isActive));
  }, [isActive]);

  // Cross-tab sync via storage event
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY_ACTIVE) {
        setIsActive(e.newValue === 'true');
      }
      if (e.key && e.key === storageKeyRef.current && e.newValue !== null) {
        try {
          const parsed = JSON.parse(e.newValue) as SessionItem[];
          setItems(parsed);
          itemsRef.current = parsed;
          selectionStore.setAll(parsed.map((i: SessionItem) => i.id));
        } catch {
          // ignore
        }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const toggleMode = useCallback(() => setIsActive(prev => !prev), []);

  const addItem = useCallback((item: SessionItem): boolean => {
    const current = itemsRef.current;
    if (current.length >= MAX_ITEMS || current.some(i => i.id === item.id)) {
      return false;
    }
    commitItems([...current, item]);
    return true;
  }, [commitItems]);

  const removeItem = useCallback((id: string) => {
    commitItems(itemsRef.current.filter(i => i.id !== id));
  }, [commitItems]);

  const toggleItem = useCallback((item: SessionItem): boolean => {
    const current = itemsRef.current;
    const exists = current.some(i => i.id === item.id);
    if (!exists && current.length >= MAX_ITEMS) {
      return false;
    }
    commitItems(exists ? current.filter(i => i.id !== item.id) : [...current, item]);
    return true;
  }, [commitItems]);

  const clearAll = useCallback(() => {
    commitItems([]);
  }, [commitItems]);

  // Stable reference forever — reads from ref which is always current
  const isSelected = useCallback((id: string): boolean => {
    return itemIdSetRef.current.has(id);
  }, []);

  return (
    <StudySessionContext.Provider value={{
      isActive, items, itemCount: items.length, currentSubject,
      toggleMode, addItem, removeItem, toggleItem, clearAll, isSelected,
    }}>
      {children}
    </StudySessionContext.Provider>
  );
}

export function useStudySession(): StudySessionContextValue {
  const ctx = useContext(StudySessionContext);
  if (!ctx) throw new Error('useStudySession must be used within StudySessionProvider');
  return ctx;
}
