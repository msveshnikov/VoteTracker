import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface VoteOptionProps {
  text: string;
  percentage: number;
  isSelected?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}

export function VoteOption({ 
  text, 
  percentage, 
  isSelected = false, 
  onClick, 
  disabled = false 
}: VoteOptionProps) {
  const [animatedWidth, setAnimatedWidth] = useState(0);

  useEffect(() => {
    // Start animation after component mounts
    const timer = setTimeout(() => {
      setAnimatedWidth(percentage);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [percentage]);

  return (
    <div 
      className={cn(
        "relative bg-gray-100 rounded-lg overflow-hidden transition-all",
        isSelected && "ring-2 ring-primary",
        !disabled && "cursor-pointer hover:shadow-md"
      )}
      onClick={!disabled ? onClick : undefined}
    >
      <div 
        className="absolute top-0 left-0 bottom-0 bg-primary bg-opacity-20 transition-all duration-1000"
        style={{ width: `${animatedWidth}%` }}
      />
      <div className="relative p-3 flex items-center justify-between">
        <span className="font-medium text-gray-700">{text}</span>
        <span className="text-primary font-semibold">{percentage}%</span>
      </div>
    </div>
  );
}
