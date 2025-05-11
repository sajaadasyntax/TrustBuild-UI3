"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Add a delay before starting the fade out animation
    const timer = setTimeout(() => {
      setFadeOut(true);
    }, 2000);

    // After the fade animation completes, call onComplete
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 2500);

    return () => {
      clearTimeout(timer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div 
      className={cn(
        "fixed inset-0 z-50 flex flex-col items-center justify-center bg-background",
        "transition-opacity duration-500 ease-in-out",
        fadeOut ? "opacity-0" : "opacity-100"
      )}
    >
      <motion.div 
        className="flex flex-col items-center space-y-8 px-4 sm:px-0"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Logo with pulse animation */}
        <div className="relative h-24 w-24 md:h-32 md:w-32">
          <Image 
            src="/images/Logo.svg" 
            alt="TrustBuild Logo" 
            fill
            className="object-contain animate-pulse"
            priority
          />
        </div>
        
        {/* Heading with staggered animation */}
        <div className="text-center">
          <motion.h1 
            className="text-3xl md:text-4xl font-bold tracking-tight text-primary mb-2"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            TrustBuild
          </motion.h1>
          <motion.p 
            className="text-lg md:text-xl text-muted-foreground"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Connect. Build. Grow.
          </motion.p>
        </div>
        
        {/* Loading indicator */}
        <motion.div 
          className="mt-8 w-full max-w-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className="h-1.5 w-full bg-muted overflow-hidden rounded-full">
            <div className="h-full bg-primary animate-progress-bar" />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
} 