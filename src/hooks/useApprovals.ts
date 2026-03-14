import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./useAuth";
import { PendingApproval } from "../utils/types";

export interface UseApprovalsReturn {
  pending: PendingApproval[];
  count: number;
  loading: boolean;
  error: string | null;
  approveChange: (id: string) => Promise<void>;
  rejectChange: (id: string) => Promise<void>;
  refetch: () => Promise<void>;
}

interface ApprovalsApiResponse {
  pending: PendingApproval[];
  count: number;
}

export function useApprovals(): UseApprovalsReturn {
  const { getIdToken } = useAuth();

  const [pending, setPending] = useState<PendingApproval[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    const token = await getIdToken();
    if (!token) return;

    const response = await fetch("/api/sudo/approvals", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch approvals (${response.status})`);
    }

    const data: ApprovalsApiResponse = await response.json();

    setPending(data.pending);
    setCount(data.count);
    setError(null);
  }, [getIdToken]);

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
  }, [fetchData]);

  const approveChange = useCallback(
    async (id: string): Promise<void> => {
      const token = await getIdToken();
      if (!token) throw new Error("Not authenticated");

      const response = await fetch("/api/sudo/approvals", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ changeRequestId: id, action: "approve" }),
      });

      if (!response.ok) {
        const body: { error?: string } = await response.json().catch(() => ({}));
        throw new Error(body.error ?? `Failed to approve change (${response.status})`);
      }

      await refetch();
    },
    [getIdToken, refetch]
  );

  const rejectChange = useCallback(
    async (id: string): Promise<void> => {
      const token = await getIdToken();
      if (!token) throw new Error("Not authenticated");

      const response = await fetch("/api/sudo/approvals", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ changeRequestId: id, action: "reject" }),
      });

      if (!response.ok) {
        const body: { error?: string } = await response.json().catch(() => ({}));
        throw new Error(body.error ?? `Failed to reject change (${response.status})`);
      }

      await refetch();
    },
    [getIdToken, refetch]
  );

  return {
    pending,
    count,
    loading,
    error,
    approveChange,
    rejectChange,
    refetch,
  };
}
