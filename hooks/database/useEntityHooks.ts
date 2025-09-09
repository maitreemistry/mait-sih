/**
 * Entity-specific hooks for Krishi Sakhi application
 * Provides easy-to-use hooks for each entity with the enhanced service architecture
 */

import { useCallback } from "react";
import { authService } from "../../services/auth";
import {
  farmTaskService,
  orderService,
  productListingService,
  productService,
  profileService,
} from "../../services/entities";
import type {
  FarmTask,
  Order,
  Product,
  TaskStatus,
} from "../../types/supabase";
import {
  useAsyncOperation,
  useCrudOperations,
  useFilteredData,
  useOptimisticUpdates,
} from "./useEnhancedQueries";
import { useServiceQuery } from "./useQuery";

/**
 * Hook for managing user profiles
 */
export function useProfiles() {
  return useCrudOperations(profileService);
}

/**
 * Hook for getting profiles by role
 */
export function useProfilesByRole(role: string) {
  return useServiceQuery(() => profileService.getByRole(role), {
    enabled: !!role,
  });
}

/**
 * Hook for getting verified farmers
 */
export function useVerifiedFarmers() {
  return useServiceQuery(() => profileService.getVerifiedFarmers());
}

/**
 * Hook for managing products
 */
export function useProducts() {
  return useCrudOperations(productService);
}

/**
 * Hook for searching products
 */
export function useProductSearch() {
  const { execute, loading, error } = useAsyncOperation<Product[]>();

  const searchProducts = useCallback(
    (query: string) => {
      return execute(() => productService.searchProducts(query));
    },
    [execute]
  );

  return {
    searchProducts,
    loading,
    error,
  };
}

/**
 * Hook for getting products by category with filtering
 */
export function useProductsByCategory(category?: string) {
  const fetchFunction = useCallback(() => {
    if (category) {
      return productService.getByCategory(category);
    }
    return productService.getAll();
  }, [category]);

  const filterFunction = useCallback((items: Product[], filter: string) => {
    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(filter.toLowerCase()) ||
        (item.description &&
          item.description.toLowerCase().includes(filter.toLowerCase()))
    );
  }, []);

  const sortFunction = useCallback(
    (items: Product[], sortBy: string, sortOrder: "asc" | "desc") => {
      return [...items].sort((a, b) => {
        let valueA: any = "";
        let valueB: any = "";

        switch (sortBy) {
          case "name":
            valueA = a.name.toLowerCase();
            valueB = b.name.toLowerCase();
            break;
          case "category":
            valueA = a.category?.toLowerCase() || "";
            valueB = b.category?.toLowerCase() || "";
            break;
          case "created_at":
            valueA = new Date(a.created_at);
            valueB = new Date(b.created_at);
            break;
          default:
            return 0;
        }

        if (valueA < valueB) return sortOrder === "asc" ? -1 : 1;
        if (valueA > valueB) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
    },
    []
  );

  return useFilteredData(fetchFunction, filterFunction, sortFunction);
}

/**
 * Hook for managing product listings
 */
export function useProductListings() {
  return useCrudOperations(productListingService);
}

/**
 * Hook for getting available product listings
 */
export function useAvailableListings() {
  return useServiceQuery(() => productListingService.getAvailable());
}

/**
 * Hook for getting product listings by farmer
 */
export function useListingsByFarmer(farmerId?: string) {
  return useServiceQuery(() => productListingService.getByFarmer(farmerId!), {
    enabled: !!farmerId,
  });
}

/**
 * Hook for managing orders
 */
export function useOrders() {
  return useCrudOperations(orderService);
}

/**
 * Hook for getting orders by buyer
 */
export function useOrdersByBuyer(buyerId?: string) {
  return useServiceQuery(() => orderService.getByBuyer(buyerId!), {
    enabled: !!buyerId,
  });
}

/**
 * Hook for getting orders by status
 */
export function useOrdersByStatus(status: string) {
  return useServiceQuery(() => orderService.getByStatus(status), {
    enabled: !!status,
  });
}

/**
 * Hook for updating order status with optimistic updates
 */
export function useOrderStatusUpdates(orders: Order[]) {
  return useOptimisticUpdates(orders, (id: string, data: Partial<Order>) =>
    orderService.update(id, data)
  );
}

/**
 * Hook for managing farm tasks
 */
export function useFarmTasks() {
  return useCrudOperations(farmTaskService);
}

/**
 * Hook for getting farm tasks by farmer
 */
export function useFarmTasksByFarmer(farmerId?: string) {
  return useServiceQuery(() => farmTaskService.getByFarmer(farmerId!), {
    enabled: !!farmerId,
  });
}

/**
 * Hook for getting farm tasks by status
 */
export function useFarmTasksByStatus(farmerId: string, status: TaskStatus) {
  return useServiceQuery(() => farmTaskService.getByStatus(status), {
    enabled: !!farmerId && !!status,
  });
}

/**
 * Hook for getting overdue tasks
 */
export function useOverdueTasks() {
  return useServiceQuery(() => farmTaskService.getOverdue());
}

/**
 * Hook for updating task status with optimistic updates
 */
export function useTaskStatusUpdates(tasks: FarmTask[]) {
  return useOptimisticUpdates(tasks, (id: string, data: Partial<FarmTask>) =>
    farmTaskService.update(id, data)
  );
}

/**
 * Hook for authentication operations
 */
export function useAuth() {
  const {
    execute: signUp,
    loading: signUpLoading,
    error: signUpError,
  } = useAsyncOperation();
  const {
    execute: signIn,
    loading: signInLoading,
    error: signInError,
  } = useAsyncOperation();
  const {
    execute: signOut,
    loading: signOutLoading,
    error: signOutError,
  } = useAsyncOperation();
  const {
    execute: getCurrentUser,
    loading: userLoading,
    error: userError,
  } = useAsyncOperation();

  const handleSignUp = useCallback(
    (email: string, password: string) => {
      return signUp(() => authService.signUp({ email, password }));
    },
    [signUp]
  );

  const handleSignIn = useCallback(
    (email: string, password: string) => {
      return signIn(() => authService.signIn({ email, password }));
    },
    [signIn]
  );

  const handleSignOut = useCallback(() => {
    return signOut(() => authService.signOut());
  }, [signOut]);

  const getUser = useCallback(() => {
    return getCurrentUser(() => authService.getCurrentUser());
  }, [getCurrentUser]);

  return {
    signUp: handleSignUp,
    signIn: handleSignIn,
    signOut: handleSignOut,
    getCurrentUser: getUser,
    loading: signUpLoading || signInLoading || signOutLoading || userLoading,
    error: signUpError || signInError || signOutError || userError,
  };
}

/**
 * Hook for dashboard statistics
 */
export function useDashboardStats(userId?: string) {
  const { data: tasks } = useFarmTasksByFarmer(userId);
  const { data: listings } = useListingsByFarmer(userId);
  const { data: orders } = useOrdersByBuyer(userId);

  const stats = {
    totalTasks: tasks?.length || 0,
    pendingTasks:
      tasks?.filter((task) => task.status === "pending").length || 0,
    completedTasks:
      tasks?.filter((task) => task.status === "completed").length || 0,
    totalListings: listings?.length || 0,
    availableListings:
      listings?.filter((listing) => listing.status === "available").length || 0,
    totalOrders: orders?.length || 0,
    pendingOrders:
      orders?.filter((order) => order.status === "pending").length || 0,
    completedOrders:
      orders?.filter((order) => order.status === "delivered").length || 0,
  };

  return {
    stats,
    loading: false, // Since we're using already loaded data
    refresh: () => {
      // Trigger refresh of all related queries
      // This would be handled by the individual hooks
    },
  };
}

/**
 * Hook for application-wide notifications
 */
export function useNotifications() {
  const { data: overdueTasks } = useOverdueTasks();
  const { data: pendingOrders } = useOrdersByStatus("pending");

  const notifications = [
    ...(overdueTasks || []).map((task) => ({
      id: `task-${task.id}`,
      type: "warning" as const,
      title: "Overdue Task",
      message: `Task "${task.title}" is overdue`,
      timestamp: task.due_date || task.created_at,
    })),
    ...(pendingOrders || []).map((order) => ({
      id: `order-${order.id}`,
      type: "info" as const,
      title: "Pending Order",
      message: `Order #${order.id} is pending approval`,
      timestamp: order.created_at,
    })),
  ];

  return {
    notifications: notifications.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    ),
    unreadCount: notifications.length,
  };
}
