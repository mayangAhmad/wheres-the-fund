"use client";

import * as React from "react";

interface AnimatedProgressBarProps {
  currentAmount: number;
  targetAmount: number;
  // 1. Updated to allow null or optional to match your database/context
  status?: string | null; 
}

// 2. Destructure 'status' from props here
export function AmountProgress({ currentAmount, targetAmount, status }: AnimatedProgressBarProps) {
  const [progress, setProgress] = React.useState(0);
  
  // Prevent division by zero
  const validTarget = targetAmount > 0 ? targetAmount : 1; 
  const targetPercentage = Math.min((currentAmount / validTarget) * 100, 100);

  // 3. Logic for the color change
  const isFinished = status === 'Completed' || status === 'Closed';

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
    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
      <div 
        // 4. Added conditional color: bg-orange-700 for finished, bg-orange-500 for active
        className={`h-full transition-all ease-out rounded-full ${
          isFinished ? 'bg-orange-700' : 'bg-orange-500'
        }`} 
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}