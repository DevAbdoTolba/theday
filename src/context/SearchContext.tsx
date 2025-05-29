import React, { createContext, useState, useContext, ReactNode } from 'react';

interface SearchContextProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const SearchContext = createContext<SearchContextProps>({
  searchQuery: '',
  setSearchQuery: () => {},
});

interface SearchProviderProps {
  children: ReactNode;
}

export function SearchProvider({ children }: SearchProviderProps) {
  const [searchQuery, setSearchQuery] = useState<string>('');

  return (
    <SearchContext.Provider value={{ searchQuery, setSearchQuery }}>
      {children}
    </SearchContext.Provider>
  );
}

export const useSearch = () => useContext(SearchContext);
