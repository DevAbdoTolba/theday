import React, {
  createContext, useContext, useState, useEffect,
  useCallback, useRef, ReactNode,
} from 'react';
import { SessionItem } from '../utils/types';

interface StudySessionContextValue {
  isActive: boolean;
  items: SessionItem[];
  itemCount: number;
  toggleMode: () => void;
  addItem: (item: SessionItem) => boolean;
  removeItem: (id: string) => void;
  toggleItem: (item: SessionItem) => boolean;
  clearAll: () => void;
  isSelected: (id: string) => boolean;
}

const StudySessionContext = createContext<StudySessionContextValue | null>(null);

const STORAGE_KEY_ACTIVE = 'studyModeActive';
const STORAGE_KEY_ITEMS = 'studySessionItems';
const MAX_ITEMS = 50;

export function StudySessionProvider({ children }: { children: ReactNode }) {
  const [isActive, setIsActive] = useState(false);
  const [items, setItems] = useState<SessionItem[]>([]);
  // Ref for synchronous reads in callbacks (avoids stale closure issues)
  const itemsRef = useRef<SessionItem[]>([]);

  // Keep ref in sync with state
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  // Hydrate from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const savedActive = localStorage.getItem(STORAGE_KEY_ACTIVE);
    const savedItems = localStorage.getItem(STORAGE_KEY_ITEMS);
    if (savedActive === 'true') setIsActive(true);
    if (savedItems) {
      try {
        const parsed = JSON.parse(savedItems) as SessionItem[];
        setItems(parsed);
        itemsRef.current = parsed;
      } catch {
        // ignore malformed JSON
      }
    }
  }, []);

  // Cross-tab sync via storage event
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY_ACTIVE) {
        setIsActive(e.newValue === 'true');
      }
      if (e.key === STORAGE_KEY_ITEMS && e.newValue !== null) {
        try {
          const parsed = JSON.parse(e.newValue) as SessionItem[];
          setItems(parsed);
          itemsRef.current = parsed;
        } catch {
          // ignore
        }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Persist isActive
  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY_ACTIVE, String(isActive));
  }, [isActive]);

  // Persist items
  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(items));
  }, [items]);

  const toggleMode = useCallback(() => setIsActive(prev => !prev), []);

  const addItem = useCallback((item: SessionItem): boolean => {
    const current = itemsRef.current;
    if (current.length >= MAX_ITEMS || current.some(i => i.id === item.id)) {
      return false;
    }
    setItems(prev => [...prev, item]);
    return true;
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  }, []);

  const toggleItem = useCallback((item: SessionItem): boolean => {
    const current = itemsRef.current;
    const exists = current.some(i => i.id === item.id);
    if (!exists && current.length >= MAX_ITEMS) {
      return false; // blocked at limit
    }
    setItems(prev =>
      prev.some(i => i.id === item.id)
        ? prev.filter(i => i.id !== item.id)
        : [...prev, item]
    );
    return true;
  }, []);

  const clearAll = useCallback(() => setItems([]), []);

  const isSelected = useCallback((id: string): boolean => {
    return items.some(i => i.id === id);
  }, [items]);

  return (
    <StudySessionContext.Provider value={{
      isActive, items, itemCount: items.length,
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
