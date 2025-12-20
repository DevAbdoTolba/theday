import { useState, useEffect } from "react";
import { useIndexedContext } from "../context/IndexedContext";
import { SubjectMaterials } from "../utils/types";

interface UseSplitSubjectReturn {
  data: SubjectMaterials | null;
  folderStructure: Record<string, any> | null;
  loadingFolders: boolean;
  loadingFiles: boolean;
  error: string | null;
  newItems: string[];
}

/**
 * Hook that uses split API endpoints for better performance:
 * 1. First loads folder structure (fast ~2s) - Shows UI skeleton
 * 2. Then loads files in background (slow ~5-8s) - Populates data
 */
export function useSplitSubject(
  subject: string | undefined,
  initialStaticData: SubjectMaterials | null
): UseSplitSubjectReturn {
  const [data, setData] = useState<SubjectMaterials | null>(initialStaticData);
  const [folderStructure, setFolderStructure] = useState<Record<string, any> | null>(null);
  const [loadingFolders, setLoadingFolders] = useState(false);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [newItems, setNewItems] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const { getSubjectByName, addOrUpdateSubject } = useIndexedContext();

  useEffect(() => {
    if (!subject || typeof subject !== "string") return;

    let isMounted = true;

    const loadData = async () => {
      try {
        console.log("🚀 [useSplitSubject] Starting split load for:", subject);
        const overallStart = Date.now();

        // ========================================
        // PHASE 1: Check IndexedDB Cache
        // ========================================
        console.log("📦 [Phase 1] Checking IndexedDB cache...");
        const cacheStart = Date.now();
        
        const cachedSubject = await getSubjectByName(subject);
        
        console.log(`✅ [Phase 1] Cache check complete (${Date.now() - cacheStart}ms)`, {
          hasCachedData: !!cachedSubject,
          cachedFolders: cachedSubject?.folders ? Object.keys(cachedSubject.folders).length : 0
        });

        if (cachedSubject?.folders && Object.keys(cachedSubject.folders).length > 0) {
          // Cache hit - show cached data immediately
          if (isMounted) {
            console.log("🎯 [Phase 1] Cache HIT - Displaying cached data");
            setData(cachedSubject.folders);
          }
        } else if (initialStaticData) {
          // Use static data from SSG
          if (isMounted) {
            console.log("⚡ [Phase 1] Using SSG data");
            setData(initialStaticData);
          }
        }

        // ========================================
        // PHASE 2: Fetch Folder Structure (FAST)
        // ========================================
        console.log("📂 [Phase 2] Fetching folder structure...");
        const foldersStart = Date.now();
        setLoadingFolders(true);

        const foldersResponse = await fetch(
          `/api/subjects/folders/${encodeURIComponent(subject)}`
        );

        if (!foldersResponse.ok) {
          throw new Error(`Folders API failed: ${foldersResponse.status}`);
        }

        const foldersData = await foldersResponse.json();
        const foldersDuration = Date.now() - foldersStart;
        
        console.log(`✅ [Phase 2] Folder structure received (${foldersDuration}ms)`, {
          categories: Object.keys(foldersData.folderStructure || {}).length,
          apiTiming: foldersData.timings?.total
        });

        if (!isMounted) return;

        setFolderStructure(foldersData.folderStructure);
        setLoadingFolders(false);

        // ========================================
        // PHASE 3: Fetch Files (SLOW - Background)
        // ========================================
        console.log("📥 [Phase 3] Fetching files in background...");
        const filesStart = Date.now();
        setLoadingFiles(true);

        // Pass folder structure to optimize the files endpoint
        const filesResponse = await fetch(
          `/api/subjects/files/${encodeURIComponent(subject)}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              folderStructure: foldersData.folderStructure 
            }),
          }
        );

        if (!filesResponse.ok) {
          throw new Error(`Files API failed: ${filesResponse.status}`);
        }

        const filesData = await filesResponse.json();
        const filesDuration = Date.now() - filesStart;
        
        console.log(`✅ [Phase 3] Files received (${filesDuration}ms)`, {
          totalFiles: filesData.metadata?.totalFiles,
          categories: filesData.metadata?.categories,
          apiTiming: filesData.timings?.total
        });

        if (!isMounted) return;

        // ========================================
        // PHASE 4: Update UI and Cache
        // ========================================
        console.log("💾 [Phase 4] Updating cache and UI...");
        const updateStart = Date.now();

        // Compare with cached data
        const result = await addOrUpdateSubject(subject, filesData.filesData);

        if (result.msg !== "No changes") {
          console.log("🔄 [Phase 4] Data changed - Updating UI", {
            newItems: result.newItems?.length || 0
          });
          setData(filesData.filesData);
          setNewItems(result.newItems || []);
        } else {
          console.log("⚖️  [Phase 4] No changes detected");
        }

        setLoadingFiles(false);
        
        const updateDuration = Date.now() - updateStart;
        const totalDuration = Date.now() - overallStart;
        
        console.log("🎉 [Complete] Split load finished", {
          totalTime: `${totalDuration}ms`,
          breakdown: {
            cache: `${Date.now() - overallStart}ms`,
            folders: `${foldersDuration}ms`,
            files: `${filesDuration}ms`,
            update: `${updateDuration}ms`
          }
        });

      } catch (err) {
        console.error("❌ [Error] Split load failed:", err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Failed to load data");
          setLoadingFolders(false);
          setLoadingFiles(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [subject]);

  return {
    data,
    folderStructure,
    loadingFolders,
    loadingFiles,
    error,
    newItems,
  };
}