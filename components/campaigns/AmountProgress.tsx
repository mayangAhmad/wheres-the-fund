"use client";

import * as React from "react";

interface AnimatedProgressBarProps {
  currentAmount: number;
  targetAmount: number;
}

export function AmountProgress({ currentAmount, targetAmount }: AnimatedProgressBarProps) {
  const [progress, setProgress] = React.useState(0);
  // Prevent division by zero
  const validTarget = targetAmount > 0 ? targetAmount : 1; 
  const targetPercentage = Math.min((currentAmount / validTarget) * 100, 100);

  React.useEffect(() => {
    const startTime = Date.now();
    const duration = 1500; // Animation duration in ms

    const animationFrame = () => {
      const elapsedTime = Date.now() - startTime;
      const progressFraction = Math.min(elapsedTime / duration, 1); 
      const newValue = progressFraction * targetPercentage;
      
      setProgress(newValue);

      if (progressFraction < 1) {
        requestAnimationFrame(animationFrame); 
      }
    };

    requestAnimationFrame(animationFrame); 
  }, [targetPercentage]); 

  return (
    <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
      <div 
        className="bg-orange-500 h-full transition-all ease-out" 
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}