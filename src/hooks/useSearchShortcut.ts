import { useEffect, useRef } from 'react';

interface KeyCombination {
  key?: string;
  code?: string;  // Physical key code (e.g., 'KeyK', 'Slash')
  ctrlKey?: boolean;
  metaKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
}

interface UseSearchShortcutProps {
  onOpen: () => void;
  isInputFocused?: boolean;
  keyCombinations?: KeyCombination[];
}

/**
 * A hook to handle keyboard shortcuts for search functionality
 * Listens for physical key positions regardless of language settings
 */
export default function useSearchShortcut({ 
  onOpen, 
  isInputFocused = false, 
  keyCombinations = [
    { code: 'KeyK', ctrlKey: true },  // Ctrl+K (physical K key)
  ] 
}: UseSearchShortcutProps) {
  const previouslyFocused = useRef<HTMLElement | null>(null);
  
  useEffect(() => {
    // Capture and prevent ALL Ctrl+K combinations at the document level
    const preventDefaultHandler = (e: KeyboardEvent) => {
      // Check for Ctrl+K or Cmd+K
      if ((e.key.toLowerCase() === 'k' || e.code === 'KeyK') && 
          (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };
    
    // Handle the actual shortcut functionality
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if we're in an input element already
      const activeElement = document.activeElement as HTMLElement;
      const isAlreadyTyping = ['INPUT', 'TEXTAREA'].includes(activeElement?.tagName || '');
      
      // Handle Ctrl+K shortcut
      if ((e.key.toLowerCase() === 'k' || e.code === 'KeyK') && 
          (e.ctrlKey || e.metaKey) && 
          !isAlreadyTyping && 
          !isInputFocused) {
        e.preventDefault();
        previouslyFocused.current = activeElement;
        onOpen();
        return;
      }
      
      // Handle standalone slash key
      if ((e.key === '/' || e.key === 'ظ') && 
          !e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey &&
          !isAlreadyTyping && 
          !isInputFocused) {
        e.preventDefault();
        previouslyFocused.current = activeElement;
        onOpen();
      }
    };
    
    // Add handler at the highest possible level
    document.addEventListener('keydown', preventDefaultHandler, { capture: true, passive: false });
    
    // Add the browser-level event handlers to override default behavior
    window.addEventListener('keydown', preventDefaultHandler, { capture: true, passive: false });
    
    // Add our functional handler
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', preventDefaultHandler, { capture: true });
      window.removeEventListener('keydown', preventDefaultHandler, { capture: true });
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onOpen, isInputFocused, keyCombinations]);

  const restoreFocus = () => {
    if (previouslyFocused.current && 'focus' in previouslyFocused.current) {
      previouslyFocused.current.focus();
    }
  };

  return { restoreFocus };
}
