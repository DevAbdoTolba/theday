import React, { createContext, useContext, useState } from "react";
import Dexie, { type EntityTable } from "dexie";

// --- Types ---
interface Data {
  id: string;
  mimeType: string;
  name: string;
  parents: string[];
  size: number;
}

interface DataMap {
  [key: string]: Data[];
}

interface IndexedContextProps {
  name?: string;
  folders?: DataMap;
  children: React.ReactNode;
}

interface SubjectType {
  id: number;
  name: string;
  folders: DataMap;
}

// --- Model ---
export class SubjectModel extends Dexie {
  subjects!: EntityTable<SubjectType, "id">;

  constructor() {
    super("subjects");
    this.version(1).stores({
      subjects: "++id, &name",
    });
  }
}

export const db = new SubjectModel();
const IndexedContext = createContext<any>(null);

export function useIndexedContext() {
  return useContext(IndexedContext);
}

export default function IndexedProvider({
  children,
}: IndexedContextProps) {
  const [loading, setLoading] = useState(false);
  const [updatedItems, setUpdatedItems] = useState<string[]>([]);

  // Internal logging helper
  const traceFlow = (steps: any[]) => {
    console.log("📊 Flow Debug Trace:");
    console.table(steps);
  };

  const getSubjectByName = async (name: string) => {
    const startTime = performance.now();
    const steps: any[] = [];

    steps.push({ 
      step: "Validation", 
      detail: `Checking name: "${name}"`, 
      status: (!name || typeof name !== 'string') ? "❌ FAIL" : "✅ PASS",
      timeMS: (performance.now() - startTime).toFixed(2)
    });

    if (!name || typeof name !== 'string') {
      traceFlow(steps);
      return null;
    }

    try {
      const data = await db.subjects.where("name").equals(name).first();
      steps.push({ 
        step: "Dexie Query", 
        detail: `Querying table 'subjects' for name: ${name}`, 
        status: data ? "🎯 HIT" : "💨 MISS", 
        timeMS: (performance.now() - startTime).toFixed(2)
      });
      traceFlow(steps);
      return data;
    } catch (err: any) {
      steps.push({ step: "Dexie Query", detail: err.message, status: "🔥 ERROR", timeMS: (performance.now() - startTime).toFixed(2) });
      traceFlow(steps);
      return null;
    }
  };

  const addOrUpdateSubject = async (name: string, folders: DataMap) => {
    const startTime = performance.now();
    const steps: any[] = [];
    setLoading(true);

    steps.push({ 
        step: "Entry Check", 
        detail: `Incoming data for "${name}"`, 
        status: "INFO", 
        timeMS: "0.00" 
    });

    const existingSubject = await getSubjectByName(name);

    if (existingSubject) {
      steps.push({ 
        step: "Decision", 
        detail: "Subject exists. Proceeding to Diffing.", 
        status: "🔄 UPDATE", 
        timeMS: (performance.now() - startTime).toFixed(2) 
      });
      const result = await compareAndUpdate(existingSubject.folders, folders, name, steps, startTime);
      setLoading(false);
      return result;
    } else {
      steps.push({ 
        step: "Decision", 
        detail: "Subject not found in DB. Creating new entry.", 
        status: "➕ ADD", 
        timeMS: (performance.now() - startTime).toFixed(2) 
      });
      
      await db.subjects.add({ name, folders: folders || {} });
      
      const newIdsCount = Object.keys(folders || {}).flatMap((key) => (folders?.[key] || [])).length;
      steps.push({ 
        step: "DB Write", 
        detail: `Added ${newIdsCount} items to new subject`, 
        status: "✅ SUCCESS", 
        timeMS: (performance.now() - startTime).toFixed(2) 
      });
      
      traceFlow(steps);
      setLoading(false);
      return { msg: "Subject added", newItems: [] };
    }
  };

  const compareAndUpdate = async (
    existingFolders: DataMap = {},
    newFolders: DataMap = {},
    name: string,
    steps: any[],
    startTime: number
  ) => {
    let addedItems: string[] = [];
    let removedItems: string[] = [];

    const safeExistingFolders = { ...existingFolders };
    const safeNewFolders = newFolders || {};
    const allKeys = new Set([...Object.keys(safeExistingFolders), ...Object.keys(safeNewFolders)]);

    allKeys.forEach((key) => {
      const existingIds = (safeExistingFolders[key] || []).map((item) => item.id);
      const newIds = (safeNewFolders[key] || []).map((item) => item.id);

      const removed = existingIds.filter((id) => !newIds.includes(id));
      const added = newIds.filter((id) => !existingIds.includes(id));

      removedItems.push(...removed);
      addedItems.push(...added);

      if (safeNewFolders[key] && safeNewFolders[key].length > 0) {
        safeExistingFolders[key] = safeNewFolders[key];
      } else {
        delete safeExistingFolders[key];
      }
    });

    const hasChanges = addedItems.length > 0 || removedItems.length > 0;

    steps.push({ 
      step: "Diffing", 
      detail: `Found ${addedItems.length} new, ${removedItems.length} removed items.`, 
      status: hasChanges ? "⚠️ CHANGES" : "⚖️ STABLE", 
      timeMS: (performance.now() - startTime).toFixed(2) 
    });

    if (hasChanges) {
      await db.subjects.where({ name: name }).modify({ folders: safeExistingFolders });
      setUpdatedItems(addedItems);
      steps.push({ 
        step: "DB Sync", 
        detail: "DB updated with merged folders.", 
        status: "✅ DONE", 
        timeMS: (performance.now() - startTime).toFixed(2) 
      });
    }

    traceFlow(steps);
    return { 
        msg: hasChanges ? "Updated" : "No changes", 
        newItems: addedItems 
    };
  };

  return (
    <IndexedContext.Provider
      value={{
        loading,
        updatedItems,
        setLoading,
        getSubjectByName,
        addOrUpdateSubject,
      }}
    >
      {children}
    </IndexedContext.Provider>
  );
}