/**
 * Tiny external store for study-mode selection IDs.
 *
 * Used with React's useSyncExternalStore so each FileCard subscribes
 * independently — only the specific card that was selected/deselected
 * re-renders. Nothing else in the tree is touched.
 */
type Listener = () => void;

let selectedIds = new Set<string>();
const listeners = new Set<Listener>();

export const selectionStore = {
  subscribe(cb: Listener) {
    listeners.add(cb);
    return () => { listeners.delete(cb); };
  },
  setAll(ids: string[]) {
    selectedIds = new Set(ids);
    listeners.forEach(l => l());
  },
  isSelected(id: string): boolean {
    return selectedIds.has(id);
  },
};
