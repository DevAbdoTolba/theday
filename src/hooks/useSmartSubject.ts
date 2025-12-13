import { useState, useEffect } from 'react';
import { useIndexedContext } from '../context/IndexedContext';
import { SubjectMaterials } from '../utils/types';

interface UseSmartSubjectReturn {
  data: SubjectMaterials | null;
  loading: boolean;
  fetching: boolean; // True while background fetch is running
  newItems: string[]; // Array of IDs that are new
  error: string | null;
}

export function useSmartSubject(
  subject: string,
  initialStaticData: SubjectMaterials | null
): UseSmartSubjectReturn {
  const [data, setData] = useState<SubjectMaterials | null>(initialStaticData);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [newItems, setNewItems] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const { getSubjectByName, addOrUpdateSubject } = useIndexedContext();

  useEffect(() => {
    // --- FIX: Stop execution if subject is undefined/null ---
    if (!subject) return;

    let isMounted = true;
    const abortController = new AbortController();

    const loadData = async () => {
      try {
        // Step 1: Try to load from IndexedDB immediately
        const cachedSubject = await getSubjectByName(subject);
        
        if (cachedSubject && cachedSubject.folders) {
          if (isMounted) {
            setData(cachedSubject.folders);
            setLoading(false);
          }
        } else {
          // If no cached data, use the initial static data
          if (isMounted && initialStaticData) {
            setData(initialStaticData);
            setLoading(false);
          }
        }

        // Step 2: Fetch fresh data in the background
        if (isMounted) {
          setFetching(true);
        }

        const response = await fetch(
          `/api/subjects/${encodeURIComponent(subject)}`,
          { signal: abortController.signal }
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch subject data');
        }

        const freshData: SubjectMaterials = await response.json();

        if (!isMounted) return;

        // Step 3: Compare and update
        const result = await addOrUpdateSubject(subject, freshData);

        if (isMounted) {
          setData(freshData);
          setNewItems(result.newItems || []);
          setFetching(false);
        }
      } catch (err) {
        // Ignore abort errors (component unmounted)
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
        
        console.error('Error in useSmartSubject:', err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Unknown error');
          setFetching(false);
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [subject, initialStaticData, getSubjectByName, addOrUpdateSubject]);

  return {
    data,
    loading,
    fetching,
    newItems,
    error,
  };
}