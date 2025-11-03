import { useState, useEffect } from "react";

/**
 * Custom hook to detect if the device is mobile based on screen width
 * @param breakpoint - The width breakpoint in pixels (default: 1024px for lg breakpoint)
 * @returns boolean indicating if the screen width is below the breakpoint
 */
export function useIsMobile(breakpoint: number = 1024): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    // Function to check if screen is mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    // Initial check
    checkMobile();

    // Add event listener for window resize
    window.addEventListener("resize", checkMobile);

    // Cleanup event listener on unmount
    return () => window.removeEventListener("resize", checkMobile);
  }, [breakpoint]);

  return isMobile;
}
