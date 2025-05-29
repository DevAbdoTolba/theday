import { useEffect, useRef } from 'react';

interface UseSearchShortcutProps {
  onOpen: () => void;
  isInputFocused?: boolean;
}

/**
 * A hook to handle keyboard shortcuts for search functionality
 * Listens for Ctrl+K or / keys to open search
 */
export default function useSearchShortcut({ onOpen, isInputFocused = false }: UseSearchShortcutProps) {
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // If we're already in an input field or textarea, don't trigger the shortcut
      const activeElement = document.activeElement as HTMLElement;
      const isAlreadyTyping = ['INPUT', 'TEXTAREA'].includes(activeElement?.tagName || '');
      
      // Only trigger if user presses Ctrl+K or / when not already typing
      if (
        ((e.ctrlKey && e.key === 'k') || e.key === '/') && 
        !isAlreadyTyping && 
        !isInputFocused
      ) {
        e.preventDefault();
        previouslyFocused.current = activeElement;
        onOpen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpen, isInputFocused]);

  const restoreFocus = () => {
    if (previouslyFocused.current && 'focus' in previouslyFocused.current) {
      previouslyFocused.current.focus();
    }
  };

  return { restoreFocus };
}
