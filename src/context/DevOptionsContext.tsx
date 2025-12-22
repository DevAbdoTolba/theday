import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Feature flags - add new options here
export interface DevOptions {
  stickySearchBar: boolean;
  progressiveLoading: boolean;
}

// Default values for all dev options (all disabled by default)
const defaultDevOptions: DevOptions = {
  stickySearchBar: false,
  progressiveLoading: false,
};

interface DevOptionsContextType {
  options: DevOptions;
  setOption: <K extends keyof DevOptions>(key: K, value: DevOptions[K]) => void;
  toggleOption: (key: keyof DevOptions) => void;
  isDev: boolean;
}

const DevOptionsContext = createContext<DevOptionsContextType | null>(null);

const STORAGE_KEY = 'dev-options';

export function DevOptionsProvider({ children }: { children: ReactNode }) {
  const isDev = process.env.NODE_ENV === 'development';
  const [options, setOptions] = useState<DevOptions>(defaultDevOptions);

  // Load from localStorage on mount (dev only)
  useEffect(() => {
    if (isDev && typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setOptions({ ...defaultDevOptions, ...parsed });
        } catch (e) {
          console.warn('[DevOptions] Failed to parse stored options');
        }
      }
    }
  }, [isDev]);

  // Persist to localStorage when options change (dev only)
  useEffect(() => {
    if (isDev && typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(options));
    }
  }, [options, isDev]);

  const setOption = <K extends keyof DevOptions>(key: K, value: DevOptions[K]) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  const toggleOption = (key: keyof DevOptions) => {
    setOptions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // In production, always return default (disabled) options
  const contextValue: DevOptionsContextType = {
    options: isDev ? options : defaultDevOptions,
    setOption,
    toggleOption,
    isDev,
  };

  return (
    <DevOptionsContext.Provider value={contextValue}>
      {children}
    </DevOptionsContext.Provider>
  );
}

export function useDevOptions(): DevOptionsContextType {
  const context = useContext(DevOptionsContext);
  if (!context) {
    // Return safe defaults if used outside provider
    return {
      options: defaultDevOptions,
      setOption: () => {},
      toggleOption: () => {},
      isDev: false,
    };
  }
  return context;
}
