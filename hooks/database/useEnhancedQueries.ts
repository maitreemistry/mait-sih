/**
 * Enhanced database hooks following industrial standard practices
 * Works with ServiceResponse pattern and enhanced services
 */

import { useCallback, useEffect, useState } from "react";
import type { ServiceError, ServiceResponse } from "../../services/types";

// Base entity interface with id property
interface BaseEntity {
  id: string;
  [key: string]: any;
}

/**
 * Hook for handling async operations with ServiceResponse pattern
 */
export function useAsyncOperation<T>() {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ServiceError | null>(null);

  const execute = useCallback(
    async (
      operation: () => Promise<ServiceResponse<T>>
    ): Promise<ServiceResponse<T>> => {
      setLoading(true);
      setError(null);

      try {
        const result = await operation();

        if (result.error) {
          setError(result.error);
        } else {
          setData(result.data);
        }

        return result;
      } catch (err) {
        const serviceError: ServiceError = {
          code: "OPERATION_ERROR",
          message: err instanceof Error ? err.message : "Operation failed",
          details: { originalError: err },
          timestamp: new Date().toISOString(),
        };

        setError(serviceError);
        return { data: null, error: serviceError, success: false };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    reset,
  };
}

/**
 * Hook for handling CRUD operations with caching
 */
export function useCrudOperations<
  T extends BaseEntity,
  TCreateData = Partial<T>,
  TUpdateData = Partial<T>
>(service: {
  getAll: () => Promise<ServiceResponse<T[]>>;
  getById: (id: string) => Promise<ServiceResponse<T>>;
  create: (data: TCreateData) => Promise<ServiceResponse<T>>;
  update: (id: string, data: TUpdateData) => Promise<ServiceResponse<T>>;
  delete: (id: string) => Promise<ServiceResponse<boolean>>;
}) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ServiceError | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await service.getAll();

      if (result.error) {
        setError(result.error);
      } else {
        setItems(result.data || []);
      }

      return result;
    } catch (err) {
      const serviceError: ServiceError = {
        code: "FETCH_ERROR",
        message: "Failed to fetch items",
        details: { originalError: err },
        timestamp: new Date().toISOString(),
      };

      setError(serviceError);
      return { data: null, error: serviceError, success: false };
    } finally {
      setLoading(false);
    }
  }, [service]);

  const createItem = useCallback(
    async (data: TCreateData) => {
      setLoading(true);
      setError(null);

      try {
        const result = await service.create(data);

        if (result.error) {
          setError(result.error);
        } else if (result.data) {
          setItems((prev) => [...prev, result.data!]);
        }

        return result;
      } catch (err) {
        const serviceError: ServiceError = {
          code: "CREATE_ERROR",
          message: "Failed to create item",
          details: { originalError: err },
          timestamp: new Date().toISOString(),
        };

        setError(serviceError);
        return { data: null, error: serviceError, success: false };
      } finally {
        setLoading(false);
      }
    },
    [service]
  );

  const updateItem = useCallback(
    async (id: string, data: TUpdateData) => {
      setLoading(true);
      setError(null);

      try {
        const result = await service.update(id, data);

        if (result.error) {
          setError(result.error);
        } else if (result.data) {
          setItems((prev) =>
            prev.map((item) => (item.id === id ? result.data! : item))
          );
        }

        return result;
      } catch (err) {
        const serviceError: ServiceError = {
          code: "UPDATE_ERROR",
          message: "Failed to update item",
          details: { originalError: err },
          timestamp: new Date().toISOString(),
        };

        setError(serviceError);
        return { data: null, error: serviceError, success: false };
      } finally {
        setLoading(false);
      }
    },
    [service]
  );

  const deleteItem = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);

      try {
        const result = await service.delete(id);

        if (result.error) {
          setError(result.error);
        } else {
          setItems((prev) => prev.filter((item) => item.id !== id));
        }

        return result;
      } catch (err) {
        const serviceError: ServiceError = {
          code: "DELETE_ERROR",
          message: "Failed to delete item",
          details: { originalError: err },
          timestamp: new Date().toISOString(),
        };

        setError(serviceError);
        return { data: null, error: serviceError, success: false };
      } finally {
        setLoading(false);
      }
    },
    [service]
  );

  const refresh = useCallback(() => {
    return fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return {
    items,
    loading,
    error,
    createItem,
    updateItem,
    deleteItem,
    refresh,
    fetchAll,
  };
}

/**
 * Hook for handling filtered data with search and sorting
 */
export function useFilteredData<T>(
  fetchFunction: () => Promise<ServiceResponse<T[]>>,
  filterFunction?: (items: T[], filter: string) => T[],
  sortFunction?: (items: T[], sortBy: string, sortOrder: "asc" | "desc") => T[]
) {
  const [allItems, setAllItems] = useState<T[]>([]);
  const [filteredItems, setFilteredItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ServiceError | null>(null);
  const [filter, setFilter] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await fetchFunction();

      if (result.error) {
        setError(result.error);
      } else {
        setAllItems(result.data || []);
      }

      return result;
    } catch (err) {
      const serviceError: ServiceError = {
        code: "FETCH_ERROR",
        message: "Failed to fetch data",
        details: { originalError: err },
        timestamp: new Date().toISOString(),
      };

      setError(serviceError);
      return { data: null, error: serviceError, success: false };
    } finally {
      setLoading(false);
    }
  }, [fetchFunction]);

  // Apply filters and sorting whenever data or filter/sort params change
  useEffect(() => {
    let result = [...allItems];

    // Apply filter
    if (filter && filterFunction) {
      result = filterFunction(result, filter);
    }

    // Apply sorting
    if (sortBy && sortFunction) {
      result = sortFunction(result, sortBy, sortOrder);
    }

    setFilteredItems(result);
  }, [allItems, filter, sortBy, sortOrder, filterFunction, sortFunction]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    items: filteredItems,
    allItems,
    loading,
    error,
    filter,
    setFilter,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    refresh: fetchData,
  };
}

/**
 * Hook for optimistic updates
 */
export function useOptimisticUpdates<T extends BaseEntity>(
  initialData: T[],
  updateFunction: (id: string, data: Partial<T>) => Promise<ServiceResponse<T>>
) {
  const [items, setItems] = useState<T[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ServiceError | null>(null);

  const optimisticUpdate = useCallback(
    async (id: string, updates: Partial<T>, rollbackData?: T) => {
      // Apply optimistic update immediately
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
      );

      setLoading(true);
      setError(null);

      try {
        const result = await updateFunction(id, updates);

        if (result.error) {
          // Rollback on error
          if (rollbackData) {
            setItems((prev) =>
              prev.map((item) => (item.id === id ? rollbackData : item))
            );
          }
          setError(result.error);
        } else if (result.data) {
          // Update with server response
          setItems((prev) =>
            prev.map((item) => (item.id === id ? result.data! : item))
          );
        }

        return result;
      } catch (err) {
        // Rollback on exception
        if (rollbackData) {
          setItems((prev) =>
            prev.map((item) => (item.id === id ? rollbackData : item))
          );
        }

        const serviceError: ServiceError = {
          code: "OPTIMISTIC_UPDATE_ERROR",
          message: "Failed to apply update",
          details: { originalError: err },
          timestamp: new Date().toISOString(),
        };

        setError(serviceError);
        return { data: null, error: serviceError, success: false };
      } finally {
        setLoading(false);
      }
    },
    [updateFunction]
  );

  return {
    items,
    loading,
    error,
    optimisticUpdate,
    setItems,
  };
}

/**
 * Hook for real-time data with auto-refresh
 */
export function useRealTimeData<T>(
  fetchFunction: () => Promise<ServiceResponse<T[]>>,
  refreshInterval: number = 30000 // 30 seconds default
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ServiceError | null>(null);
  const [isAutoRefreshEnabled, setIsAutoRefreshEnabled] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await fetchFunction();

      if (result.error) {
        setError(result.error);
      } else {
        setData(result.data || []);
      }

      return result;
    } catch (err) {
      const serviceError: ServiceError = {
        code: "REALTIME_FETCH_ERROR",
        message: "Failed to fetch real-time data",
        details: { originalError: err },
        timestamp: new Date().toISOString(),
      };

      setError(serviceError);
      return { data: null, error: serviceError, success: false };
    } finally {
      setLoading(false);
    }
  }, [fetchFunction]);

  // Auto-refresh effect
  useEffect(() => {
    if (!isAutoRefreshEnabled) return;

    const interval = setInterval(() => {
      fetchData();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [fetchData, refreshInterval, isAutoRefreshEnabled]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refresh: fetchData,
    isAutoRefreshEnabled,
    setIsAutoRefreshEnabled,
  };
}
