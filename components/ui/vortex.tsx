"use client";

import { cn } from "@/lib/utils";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface VortexProps {
  children?: React.ReactNode;
  className?: string;
  containerClassName?: string;
  backgroundColor?: string;
  baseHue?: number;
}

export const Vortex = ({
  children,
  className,
  containerClassName,
  backgroundColor = "#000000",
  baseHue = 220
}: VortexProps) => {
  // Use state to store client-side generated random values
  const [particles, setParticles] = useState<any[]>([]);
  const [lines, setLines] = useState<any[]>([]);
  
  // Generate all random values on client-side only
  useEffect(() => {
    // Generate particles
    const newParticles = Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      width: `${Math.random() * 4 + 1}px`,
      height: `${Math.random() * 4 + 1}px`,
      color: `hsl(${baseHue + Math.random() * 60}, 100%, 60%, ${0.5 + Math.random() * 0.5})`,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      xAnimation: [
        Math.random() * 100 - 50,
        Math.random() * 100 - 50,
        Math.random() * 100 - 50
      ],
      yAnimation: [
        Math.random() * 100 - 50,
        Math.random() * 100 - 50,
        Math.random() * 100 - 50
      ],
      scaleAnimation: [
        1, 
        Math.random() + 0.5, 
        1
      ],
      opacityAnimation: [0.7, 1, 0.7],
      duration: Math.random() * 20 + 10
    }));
    
    // Generate lines
    const newLines = Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      width: `${Math.random() * 30 + 20}%`,
      left: `${Math.random() * 70}%`,
      top: `${Math.random() * 100}%`,
      background: `linear-gradient(90deg, transparent, hsl(${baseHue + Math.random() * 40}, 100%, 70%, 0.7), transparent)`,
      scaleXAnimation: [1, 1.5, 1],
      opacityAnimation: [0.2, 0.5, 0.2],
      duration: Math.random() * 10 + 5
    }));
    
    setParticles(newParticles);
    setLines(newLines);
  }, [baseHue]);
  
  return (
    <div className={cn("relative h-full w-full overflow-hidden", containerClassName)}
         style={{ background: backgroundColor }}>
      {/* Animated particles - rendered only after client-side effect runs */}
      <div className="absolute inset-0">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full"
            style={{
              width: particle.width,
              height: particle.height,
              backgroundColor: particle.color,
              left: particle.left,
              top: particle.top,
            }}
            animate={{
              x: particle.xAnimation,
              y: particle.yAnimation,
              scale: particle.scaleAnimation,
              opacity: particle.opacityAnimation
            }}
            transition={{
              duration: particle.duration,
              ease: "linear",
              repeat: Infinity,
            }}
          />
        ))}
      </div>
      
      {/* Animated lines - rendered only after client-side effect runs */}
      <div className="absolute inset-0">
        {lines.map((line) => (
          <motion.div
            key={`line-${line.id}`}
            className="absolute h-px"
            style={{
              width: line.width,
              left: line.left,
              top: line.top,
              background: line.background,
            }}
            animate={{
              scaleX: line.scaleXAnimation,
              opacity: line.opacityAnimation
            }}
            transition={{
              duration: line.duration,
              ease: "easeInOut",
              repeat: Infinity,
            }}
          />
        ))}
      </div>
      
      {/* Content */}
      <div className={cn("relative z-10", className)}>
        {children}
      </div>
    </div>
  );
}; 