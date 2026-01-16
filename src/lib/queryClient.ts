import { QueryClient } from "@tanstack/react-query";

/**
 * Configured QueryClient for local-first offline usage
 *
 * Since all data lives in IndexedDB (via Dexie) and there's no backend server:
 * - staleTime: Infinity - data is never considered stale (no server to refetch from)
 * - gcTime: Infinity - never garbage collect cached data
 * - retry: false - no network to retry against
 * - refetchOnWindowFocus: false - no point refetching local data
 * - refetchOnReconnect: false - reconnecting doesn't affect local data
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
      gcTime: Infinity,
      retry: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
    mutations: {
      retry: false,
    },
  },
});
