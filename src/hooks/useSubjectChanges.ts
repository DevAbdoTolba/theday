import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "./useAuth";
import { ChangeType, ISubjectChangeRequest } from "../utils/types";

interface SubjectEntry {
  name: string;
  abbreviation: string;
  shared: boolean;
  semesterIndex: number;
}

interface SubjectsApiResponse {
  className: string;
  subjects: SubjectEntry[];
  pendingChanges: ISubjectChangeRequest[];
}

interface CreateChangeData {
  changeType: ChangeType;
  subjectName: string;
  subjectAbbreviation: string;
  shared?: boolean;
  semesterIndex: number;
  originalSubjectName?: string;
}

interface UpdateChangeData {
  subjectName?: string;
  subjectAbbreviation?: string;
  shared?: boolean;
  semesterIndex?: number;
}

export interface UseSubjectChangesReturn {
  className: string;
  subjects: SubjectEntry[];
  pendingChanges: ISubjectChangeRequest[];
  loading: boolean;
  error: string | null;
  createChange: (data: CreateChangeData) => Promise<void>;
  updateChange: (id: string, data: UpdateChangeData) => Promise<void>;
  cancelChange: (id: string) => Promise<void>;
  dismissRejection: (id: string) => void;
  refetch: () => Promise<void>;
}

function getDismissedRejections(firebaseUid: string): string[] {
  try {
    const raw = localStorage.getItem(`dismissed_rejections_${firebaseUid}`);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.every((v) => typeof v === "string")) {
      return parsed as string[];
    }
    return [];
  } catch {
    return [];
  }
}

function saveDismissedRejections(firebaseUid: string, ids: string[]): void {
  localStorage.setItem(
    `dismissed_rejections_${firebaseUid}`,
    JSON.stringify(ids)
  );
}

export function useSubjectChanges(
  classId: string | null | undefined
): UseSubjectChangesReturn {
  const { user, getIdToken } = useAuth();

  const [className, setClassName] = useState("");
  const [subjects, setSubjects] = useState<SubjectEntry[]>([]);
  const [pendingChanges, setPendingChanges] = useState<
    ISubjectChangeRequest[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);

  // Keep a ref to dismissedIds so the fetch callback always sees the latest
  const dismissedIdsRef = useRef(dismissedIds);
  dismissedIdsRef.current = dismissedIds;

  // Load dismissed rejections from localStorage when user changes
  useEffect(() => {
    if (user?.firebaseUid) {
      setDismissedIds(getDismissedRejections(user.firebaseUid));
    }
  }, [user?.firebaseUid]);

  const fetchData = useCallback(async () => {
    if (!classId) return;

    const token = await getIdToken();
    if (!token) return;

    const response = await fetch(
      `/api/admin/subjects?classId=${encodeURIComponent(classId)}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (response.status === 403) {
      setClassName("");
      setSubjects([]);
      setPendingChanges([]);
      throw new Error(
        "You do not have access to this class. It may have been unassigned."
      );
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch subjects (${response.status})`);
    }

    const data: SubjectsApiResponse = await response.json();

    setClassName(data.className);
    setSubjects(data.subjects);

    // Filter out dismissed rejected items
    const currentDismissed = dismissedIdsRef.current;
    const filtered = data.pendingChanges.filter(
      (change) =>
        !(change.status === "rejected" && currentDismissed.includes(change._id))
    );
    setPendingChanges(filtered);
    setError(null);
  }, [classId, getIdToken]);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      await fetchData();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "An unexpected error occurred";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [fetchData]);

  // Initial fetch and polling
  useEffect(() => {
    if (!classId) {
      setClassName("");
      setSubjects([]);
      setPendingChanges([]);
      setError(null);
      setLoading(false);
      return;
    }

    let isMounted = true;

    const load = async () => {
      setLoading(true);
      try {
        await fetchData();
      } catch (err) {
        if (isMounted) {
          const message =
            err instanceof Error ? err.message : "An unexpected error occurred";
          setError(message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    load();

    const intervalId = setInterval(() => {
      fetchData().catch((err) => {
        if (isMounted) {
          const message =
            err instanceof Error ? err.message : "An unexpected error occurred";
          setError(message);
        }
      });
    }, 30000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [classId, fetchData]);

  const createChange = useCallback(
    async (data: CreateChangeData): Promise<void> => {
      const token = await getIdToken();
      if (!token) throw new Error("Not authenticated");

      const response = await fetch("/api/admin/subjects", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...data, classId }),
      });

      if (response.status === 403) {
        throw new Error(
          "You do not have access to this class. It may have been unassigned."
        );
      }

      if (!response.ok) {
        const body: { error?: string } = await response.json().catch(() => ({}));
        throw new Error(body.error ?? `Failed to create change (${response.status})`);
      }

      await refetch();
    },
    [classId, getIdToken, refetch]
  );

  const updateChange = useCallback(
    async (id: string, data: UpdateChangeData): Promise<void> => {
      const token = await getIdToken();
      if (!token) throw new Error("Not authenticated");

      const response = await fetch(`/api/admin/subjects?id=${encodeURIComponent(id)}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.status === 403) {
        throw new Error(
          "You do not have access to this class. It may have been unassigned."
        );
      }

      if (!response.ok) {
        const body: { error?: string } = await response.json().catch(() => ({}));
        throw new Error(body.error ?? `Failed to update change (${response.status})`);
      }

      await refetch();
    },
    [getIdToken, refetch]
  );

  const cancelChange = useCallback(
    async (id: string): Promise<void> => {
      const token = await getIdToken();
      if (!token) throw new Error("Not authenticated");

      const response = await fetch(`/api/admin/subjects?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 403) {
        throw new Error(
          "You do not have access to this class. It may have been unassigned."
        );
      }

      if (!response.ok) {
        const body: { error?: string } = await response.json().catch(() => ({}));
        throw new Error(body.error ?? `Failed to cancel change (${response.status})`);
      }

      await refetch();
    },
    [getIdToken, refetch]
  );

  const dismissRejection = useCallback(
    (id: string): void => {
      if (!user?.firebaseUid) return;

      const updated = [...dismissedIds, id];
      setDismissedIds(updated);
      saveDismissedRejections(user.firebaseUid, updated);

      // Immediately filter out the dismissed item from current state
      setPendingChanges((prev) =>
        prev.filter(
          (change) =>
            !(change.status === "rejected" && change._id === id)
        )
      );
    },
    [user?.firebaseUid, dismissedIds]
  );

  return {
    className,
    subjects,
    pendingChanges,
    loading,
    error,
    createChange,
    updateChange,
    cancelChange,
    dismissRejection,
    refetch,
  };
}
