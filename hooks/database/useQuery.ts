import type { PostgrestError } from "@supabase/supabase-js";
import { useCallback, useEffect, useState } from "react";
import type { ServiceError, ServiceResponse } from "../../services/types";

interface UseQueryOptions {
  enabled?: boolean;
  refetchOnMount?: boolean;
}

interface UseQueryResult<T> {
  data: T | null;
  loading: boolean;
  error: ServiceError | null;
  refetch: () => Promise<void>;
}

interface UseServiceQueryResult<T> {
  data: T | null;
  loading: boolean;
  error: ServiceError | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook for querying data using ServiceResponse pattern
 */
export function useServiceQuery<T>(
  queryFn: () => Promise<ServiceResponse<T>>,
  options: UseQueryOptions = {}
): UseServiceQueryResult<T> {
  const { enabled = true, refetchOnMount = true } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ServiceError | null>(null);

  const executeQuery = async () => {
    if (!enabled) return;

    setLoading(true);
    setError(null);

    try {
      const result = await queryFn();
      setData(result.data);
      setError(result.error);
    } catch (err) {
      setError({
        code: "UNKNOWN_ERROR",
        message:
          err instanceof Error ? err.message : "An unexpected error occurred",
        details: { originalError: err },
        timestamp: new Date().toISOString(),
      });
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

/**
 * Custom hook for querying data from Supabase (legacy support)
 * @deprecated Use useServiceQuery instead for new ServiceResponse pattern
 */
export function useQuery<T>(
  queryFn: () => Promise<{ data: T | null; error: PostgrestError | null }>,
  options: UseQueryOptions = {}
): UseQueryResult<T> {
  const { enabled = true, refetchOnMount = true } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ServiceError | null>(null);

  const executeQuery = async () => {
    if (!enabled) return;

    setLoading(true);
    setError(null);

    try {
      const result = await queryFn();
      setData(result.data);

      if (result.error) {
        setError({
          code: "DATABASE_ERROR",
          message: result.error.message,
          details: { code: result.error.code, hint: result.error.hint },
          timestamp: new Date().toISOString(),
        });
      }
    } catch (err) {
      setError({
        code: "UNKNOWN_ERROR",
        message:
          err instanceof Error ? err.message : "An unexpected error occurred",
        details: { originalError: err },
        timestamp: new Date().toISOString(),
      });
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

/**
 * Custom hook for mutations using ServiceResponse pattern
 */
export function useServiceMutation<TData, TVariables = void>() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ServiceError | null>(null);

  const mutate = async (
    mutationFn: (variables: TVariables) => Promise<ServiceResponse<TData>>,
    variables: TVariables
  ): Promise<ServiceResponse<TData>> => {
    setLoading(true);
    setError(null);

    try {
      const result = await mutationFn(variables);
      setError(result.error);
      return result;
    } catch (err) {
      const serviceError: ServiceError = {
        code: "MUTATION_ERROR",
        message: err instanceof Error ? err.message : "Mutation failed",
        details: { originalError: err },
        timestamp: new Date().toISOString(),
      };
      setError(serviceError);
      return { data: null, error: serviceError, success: false };
    } finally {
      setLoading(false);
    }
  };

  return {
    mutate,
    loading,
    error,
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
 * Custom hook for paginated data using ServiceResponse pattern
 */
export function useServicePaginatedQuery<T>(
  queryFn: (page: number, limit: number) => Promise<ServiceResponse<T[]>>,
  limit: number = 10
) {
  const [page, setPage] = useState(0);
  const [allData, setAllData] = useState<T[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ServiceError | null>(null);

  const loadPage = useCallback(
    async (pageNumber: number) => {
      setLoading(true);
      setError(null);

      try {
        const result = await queryFn(pageNumber, limit);

        if (result.error) {
          setError(result.error);
          return;
        }

        const newData = result.data || [];

        if (pageNumber === 0) {
          setAllData(newData);
        } else {
          setAllData((prev) => [...prev, ...newData]);
        }

        setHasMore(newData.length === limit);
      } catch (err) {
        setError({
          code: "PAGINATION_ERROR",
          message: err instanceof Error ? err.message : "Failed to load page",
          details: { originalError: err },
          timestamp: new Date().toISOString(),
        });
      } finally {
        setLoading(false);
      }
    },
    [queryFn, limit]
  );

  useEffect(() => {
    loadPage(page);
  }, [page, loadPage]);

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

  const refetch = () => {
    reset();
  };

  return {
    data: allData,
    loading,
    error,
    hasMore,
    loadMore,
    reset,
    refetch,
  };
}

/**
 * Custom hook for paginated data (legacy support)
 * @deprecated Use useServicePaginatedQuery instead
 */
export function usePaginatedQuery<T>(service: any, limit: number = 10) {
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
