import { useEffect, useMemo, useState } from "react";
import {
  ACTIONS,
  CallBackProps,
  EVENTS,
  STATUS,
  type Step,
} from "react-joyride";

export default function useJoyrideTour() {
  const [runTour, setRunTour] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  const isDarkMode =
    typeof window !== "undefined" && localStorage.getItem("theme") === "dark";

  const steps = useMemo(
    () =>
      [
        {
          target: '[data-tour="chat-button"]',
          content:
            "Chat with AI Oracles to get predictions and insights before making a trade.",
          disableBeacon: true,
          placement: "right",
        },
        {
          target: '[data-tour="trade-button"]',
          content:
            "Start trading on this market. Use your XP from quests to place your first bet here.",
          placement: "right",
        },
      ] as Step[],
    [],
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const isNewUser = localStorage.getItem("isNewUser") === "true";
    console.log("isNewUser in useHook", isNewUser);
    if (isNewUser) {
      const timer = setTimeout(() => {
        setRunTour(true);
        setStepIndex(0);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { action, index, status, type } = data;

    if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
      setStepIndex(index + (action === ACTIONS.PREV ? -1 : 1));
    }

    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setRunTour(false);
      setStepIndex(0);
      localStorage.removeItem("isNewUser");
    }
  };

  // styles
  const joyrideStyles = useMemo(
    () => ({
      options: {
        zIndex: 9999,
        primaryColor: isDarkMode ? "#a78bfa" : "#7c3aed",
        backgroundColor: "#111827",
        textColor: "#f9fafb",
        arrowColor: "#111827",
        overlayColor: isDarkMode
          ? "rgba(0, 0, 0, 0.45)"
          : "rgba(15, 23, 42, 0.18)",
      },
      tooltip: {
        borderRadius: 16,
        padding: 20,
        boxShadow: isDarkMode
          ? "0 20px 60px rgba(0, 0, 0, 0.45)"
          : "0 12px 40px rgba(15, 23, 42, 0.18)",
      },
      tooltipContainer: {
        textAlign: "left" as const,
      },
      tooltipTitle: {
        fontSize: 16,
        fontWeight: 700,
        color: "#111827",
        marginBottom: 8,
      },
      tooltipContent: {
        fontSize: 14,
        lineHeight: 1.6,
        color: "#f9fafb",
      },
      buttonNext: {
        backgroundColor: isDarkMode ? "#8b5cf6" : "#7c3aed",
        color: "#ffffff",
        borderRadius: 10,
        padding: "8px 14px",
      },
      buttonBack: {
        color: "#f9fafb",
      },
      buttonSkip: {
        color: "#f9fafb",
      },
      buttonClose: {
        color: isDarkMode ? "#6b7280" : "#475569",
      },
      spotlight: {
        borderRadius: 12,
        boxShadow: isDarkMode
          ? "0 0 0 1px rgba(255, 255, 255, 0.9)"
          : "0 0 0 1px rgba(124,58,237,0.20)",
      },
    }),
    [isDarkMode],
  );

  return {
    runTour,
    stepIndex,
    steps,
    joyrideStyles,
    handleJoyrideCallback,
  };
}
