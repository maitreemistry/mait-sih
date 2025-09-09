import type { PostgrestError } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { BaseService } from "../../services/database";

interface UseQueryOptions {
  enabled?: boolean;
  refetchOnMount?: boolean;
}

interface UseQueryResult<T> {
  data: T | null;
  loading: boolean;
  error: PostgrestError | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook for querying data from Supabase
 */
export function useQuery<T>(
  queryFn: () => Promise<{ data: T | null; error: PostgrestError | null }>,
  options: UseQueryOptions = {}
): UseQueryResult<T> {
  const { enabled = true, refetchOnMount = true } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<PostgrestError | null>(null);

  const executeQuery = async () => {
    if (!enabled) return;

    setLoading(true);
    setError(null);

    try {
      const result = await queryFn();
      setData(result.data);
      setError(result.error);
    } catch (err) {
      setError(err as PostgrestError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (refetchOnMount) {
      executeQuery();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, refetchOnMount]);

  return {
    data,
    loading,
    error,
    refetch: executeQuery,
  };
}

interface UseMutationResult<T, TVariables> {
  mutate: (
    variables: TVariables
  ) => Promise<{ data: T | null; error: PostgrestError | null }>;
  loading: boolean;
  error: PostgrestError | null;
  data: T | null;
}

/**
 * Custom hook for mutations (create, update, delete)
 */
export function useMutation<T, TVariables>(
  mutationFn: (
    variables: TVariables
  ) => Promise<{ data: T | null; error: PostgrestError | null }>
): UseMutationResult<T, TVariables> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<PostgrestError | null>(null);

  const mutate = async (variables: TVariables) => {
    setLoading(true);
    setError(null);

    try {
      const result = await mutationFn(variables);
      setData(result.data);
      setError(result.error);
      return result;
    } catch (err) {
      const error = err as PostgrestError;
      setError(error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  return {
    mutate,
    loading,
    error,
    data,
  };
}

/**
 * Custom hook for paginated data
 */
export function usePaginatedQuery<T>(service: BaseService, limit: number = 10) {
  const [page, setPage] = useState(0);
  const [allData, setAllData] = useState<T[]>([]);
  const [hasMore, setHasMore] = useState(true);

  const { data, loading, error, refetch } = useQuery(() =>
    service.getPaginated(page, limit)
  );

  useEffect(() => {
    if (data && Array.isArray(data)) {
      if (page === 0) {
        setAllData(data);
      } else {
        setAllData((prev) => [...prev, ...data]);
      }
      setHasMore(data.length === limit);
    }
  }, [data, page, limit]);

  const loadMore = () => {
    if (!loading && hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  const reset = () => {
    setPage(0);
    setAllData([]);
    setHasMore(true);
  };

  return {
    data: allData,
    loading,
    error,
    hasMore,
    loadMore,
    reset,
    refetch: () => {
      reset();
      refetch();
    },
  };
}
