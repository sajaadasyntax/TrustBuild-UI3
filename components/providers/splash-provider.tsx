"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { StepSplashScreen } from "@/components/StepSplashScreen";

type SplashContextType = {
  isSplashComplete: boolean;
};

const SplashContext = createContext<SplashContextType>({ isSplashComplete: false });

export const useSplash = () => useContext(SplashContext);

export function SplashProvider({ children }: { children: React.ReactNode }) {
  const [isSplashComplete, setIsSplashComplete] = useState(false);
  const [shouldShowSplash, setShouldShowSplash] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // This effect handles hydration - only runs on client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // This effect handles the splash screen logic
  useEffect(() => {
    if (!isClient) return;
    
    try {
      // Force show splash for testing by setting initial value to true
      setShouldShowSplash(true);
      
      // Check if this is the first visit using localStorage for persistence
      const hasSeenSplashSteps = localStorage.getItem("hasSeenSplashSteps");
      
      if (hasSeenSplashSteps === "true") {
        // Skip splash if user has already seen it
        setShouldShowSplash(false);
        setIsSplashComplete(true);
      }
    } catch (error) {
      // Handle localStorage errors (e.g., in incognito mode)
      console.error("Error accessing localStorage:", error);
      // Default to showing splash in case of error
      setShouldShowSplash(true);
    }
  }, [isClient]);

  const handleSplashComplete = () => {
    setIsSplashComplete(true);
    // Ensure we also set the localStorage value when complete
    try {
      localStorage.setItem("hasSeenSplashSteps", "true");
    } catch (error) {
      console.error("Error setting localStorage:", error);
    }
  };

  return (
    <SplashContext.Provider value={{ isSplashComplete }}>
      {isClient && shouldShowSplash && !isSplashComplete ? (
        <StepSplashScreen onComplete={handleSplashComplete} />
      ) : null}
      <div
        style={{
          opacity: !isClient || isSplashComplete ? 1 : 0,
          transition: "opacity 300ms ease-in-out",
          visibility: !isClient || isSplashComplete ? "visible" : "hidden"
        }}
      >
        {children}
      </div>
    </SplashContext.Provider>
  );
} 