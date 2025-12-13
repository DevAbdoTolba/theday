import React, { createContext, useContext, useState, useEffect } from "react";
import Dexie, { type EntityTable } from "dexie";
import LinearProgress from "@mui/material/LinearProgress";

// Types
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

// Model
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

// Create a Context
const IndexedContext = createContext<any>(null);

export function useIndexedContext() {
  return useContext(IndexedContext);
}

export default function IndexedProvider({
  name,
  folders,
  children,
}: IndexedContextProps) {
  const [loading, setLoading] = useState(false);
  const [updatedItems, setUpdatedItems] = useState<string[]>([]);

  const getSubjectByName = async (name: string) => {
    // --- FIX: Add Guard Clause Here ---
    if (!name || typeof name !== 'string') return null; 
    
    const data = await db.subjects.where("name").equals(name).first();
    console.log("Fetched data:", data);
    return data;
  };

  const addOrUpdateSubject = async (name: string, folders: DataMap) => {
    if (!name) return; // Safety check

    const existingSubject = await getSubjectByName(name);

    if (existingSubject) {
      // Compare the fetched data with the existing data
      const updateResult = compareAndUpdate(
        existingSubject.folders,
        folders,
        name
      );
      return updateResult;
    } else {
      // Always save folders as an object
      await db.subjects.add({ name, folders: folders || {} });
      return {
        msg: "Subject added",
        newItems: Object.keys(folders || {}).flatMap((key) =>
          (folders?.[key] || []).map((item) => item.id)
        ),
      };
    }
  };

  const compareAndUpdate = (
    existingFolders: DataMap = {},
    newFolders: DataMap = {},
    name: string
  ) => {
    let addedItems: string[] = [];
    let removedItems: string[] = [];

    // Ensure we have valid objects to work with
    const safeExistingFolders = existingFolders || {};
    const safeNewFolders = newFolders || {};

    const allKeys = new Set([
      ...Object.keys(safeExistingFolders),
      ...Object.keys(safeNewFolders),
    ]);

    allKeys.forEach((key) => {
      const existingItems = safeExistingFolders[key] || [];
      const newItems = safeNewFolders[key] || [];

      const existingIds = existingItems.map((item) => item.id);
      const newIds = newItems.map((item) => item.id);

      removedItems = [
        ...removedItems,
        ...existingIds.filter((id) => !newIds.includes(id)),
      ];
      addedItems = [
        ...addedItems,
        ...newIds.filter((id) => !existingIds.includes(id)),
      ];

      // Update the existing folder with new items
      if (newItems.length > 0) {
        safeExistingFolders[key] = newItems;
      } else {
        // If the new folder has 0 length, delete the key
        delete safeExistingFolders[key];
      }
    });

    if (addedItems.length || removedItems.length) {
      // @ts-ignore
      const res = db.subjects
        .where({ name: name })
        .modify({ folders: safeExistingFolders });

      setUpdatedItems(addedItems);
      return {
        msg: `${
          addedItems.length > 0 ? `${addedItems.length} new items, ` : ""
        }${removedItems.length > 0 ? `${removedItems.length} removed` : ""}`,
        newItems: addedItems,
      };
    }

    return { msg: "No changes", newItems: [] };
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