import { useEffect, useState } from "react";
import { Platform } from "react-native";

/**
 * Hook to determine if we're running on the client side (not during SSR)
 * This is useful for preventing hydration mismatches and SSR errors
 */
export function useIsClient(): boolean {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // This effect only runs on the client side
    setIsClient(true);
  }, []);

  // For native platforms, we're always on the client
  if (Platform.OS !== "web") {
    return true;
  }

  // For web, check if window is defined and we've mounted
  return typeof window !== "undefined" && isClient;
}

/**
 * Hook to safely access browser APIs only when available
 * Returns true if we can safely use browser APIs like localStorage, sessionStorage, etc.
 */
export function useCanUseBrowserAPIs(): boolean {
  const isClient = useIsClient();
  return isClient && typeof window !== "undefined";
}
