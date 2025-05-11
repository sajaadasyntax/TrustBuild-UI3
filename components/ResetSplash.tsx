"use client";

import { Button } from "@/components/ui/button";

export default function ResetSplash() {
  const handleReset = () => {
    try {
      localStorage.removeItem("hasSeenSplashSteps");
      console.log("Splash screen reset!");
      // Force refresh the page
      window.location.reload();
    } catch (error) {
      console.error("Error resetting splash screen:", error);
    }
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleReset}
      className="fixed bottom-4 right-4 z-50 text-xs"
    >
      Reset Splash
    </Button>
  );
} 