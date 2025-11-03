import { useEffect, useRef } from "react";
import { useAuthStore } from "../store/auth.store";

/**
 * Custom hook to periodically refresh user profile to get fresh presigned URLs
 * Google Cloud Storage presigned URLs expire after 1 hour, so this hook
 * refreshes the user profile every 50 minutes to ensure photos don't expire
 */
export function useUserPhotoRefresh() {
  const { user, fetchCurrentUser } = useAuthStore();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Only run if user is authenticated
    if (!user) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Refresh immediately on mount to get fresh URLs
    fetchCurrentUser();

    // Refresh every 50 minutes (3000000ms)
    // This is 10 minutes before the 1-hour expiration to ensure URLs don't expire
    const REFRESH_INTERVAL = 50 * 60 * 1000; // 50 minutes in milliseconds

    intervalRef.current = setInterval(() => {
      fetchCurrentUser();
    }, REFRESH_INTERVAL);

    // Cleanup interval on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [user?.id, fetchCurrentUser]); // Re-run when user changes

  return null;
}
