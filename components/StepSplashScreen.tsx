"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  CheckCheck, 
  ClipboardList, 
  UserCheck, 
  CreditCard,
  ChevronRight,
  ChevronLeft
} from "lucide-react";

interface StepSplashScreenProps {
  onComplete: () => void;
}

export function StepSplashScreen({ onComplete }: StepSplashScreenProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [fadeOut, setFadeOut] = useState(false);
  const router = useRouter();
  
  const steps = [
    {
      id: 1,
      title: "Post Your Job",
      description: "Describe your project and location to find the right contractors",
      icon: <ClipboardList className="h-16 w-16 text-primary" />
    },
    {
      id: 2,
      title: "Match with Contractors",
      description: "Get matched with qualified contractors for your specific project",
      icon: <UserCheck className="h-16 w-16 text-primary" />
    },
    {
      id: 3,
      title: "Track & Pay Securely",
      description: "Monitor progress and make secure payments through our platform",
      icon: <CreditCard className="h-16 w-16 text-primary" />
    }
  ];

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      // Final step - fade out and complete
      setFadeOut(true);
      setTimeout(() => {
        onComplete();
        // localStorage is now handled in the provider
      }, 500);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div 
      className={cn(
        "fixed inset-0 z-50 flex flex-col items-center justify-center bg-background",
        "transition-opacity duration-500 ease-in-out",
        fadeOut ? "opacity-0" : "opacity-100"
      )}
    >
      <div className="w-full max-w-lg px-4 sm:px-0">
        {/* Progress indicators */}
        <div className="flex justify-center mb-8 space-x-2">
          {steps.map((step) => (
            <div
              key={step.id}
              className={cn(
                "h-2 w-12 rounded-full transition-all duration-300",
                currentStep >= step.id ? "bg-primary" : "bg-muted"
              )}
            />
          ))}
        </div>
        
        {/* Step content */}
        <div className="relative h-[320px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 flex flex-col items-center text-center"
            >
              <div className="mb-6">
                {steps[currentStep - 1].icon}
              </div>
              
              <h2 className="text-2xl font-bold mb-3">
                Step {currentStep}: {steps[currentStep - 1].title}
              </h2>
              
              <p className="text-muted-foreground mb-6 max-w-md">
                {steps[currentStep - 1].description}
              </p>
              
              {currentStep === 3 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <CheckCheck className="h-8 w-8 text-green-500 mb-2" />
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
        
        {/* Navigation buttons */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="flex items-center"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          
          <Button
            onClick={handleNext}
            className="flex items-center"
          >
            {currentStep === 3 ? "Get Started" : "Next"}
            {currentStep < 3 && <ChevronRight className="ml-2 h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
} 