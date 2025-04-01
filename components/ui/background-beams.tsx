"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

export const BackgroundBeams = ({ className }: { className?: string }) => {
  // Use state to store client-side generated random values
  const [beams, setBeams] = useState<{lines: any[], orbs: any[]}>({lines: [], orbs: []});
  
  // Generate all random values on the client side only
  useEffect(() => {
    // Lines
    const lines = Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      width: `${Math.random() * 40 + 60}%`,
      left: `${Math.random() * 50}%`,
      top: `${Math.random() * 100}%`,
      opacity: 0.1 + Math.random() * 0.3,
      x: [
        `${-Math.random() * 50}%`,
        `${Math.random() * 50}%`,
        `${-Math.random() * 50}%`,
      ],
      duration: Math.random() * 20 + 10,
    }));
    
    // Orbs
    const orbs = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      width: `${Math.random() * 40 + 10}px`,
      height: `${Math.random() * 40 + 10}px`,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      opacity: 0.1 + Math.random() * 0.2,
      scale: [1, 1.1, 1],
      opacityAnim: [0.1, 0.2, 0.1],
      duration: Math.random() * 10 + 5,
    }));
    
    setBeams({ lines, orbs });
  }, []);

  return (
    <div className={cn("absolute inset-0 overflow-hidden", className)}>
      <div className="absolute inset-0 bg-gradient-to-b from-blue-600 to-blue-800 dark:from-gray-900 dark:to-black" />
      
      {/* Animated elements - rendered only after client-side effect runs */}
      <div className="absolute inset-0">
        {beams.lines.map((line) => (
          <motion.div
            key={line.id}
            className="absolute h-px bg-gradient-to-r from-transparent via-blue-400 dark:via-gray-500 to-transparent"
            style={{
              width: line.width,
              left: line.left,
              top: line.top,
              opacity: line.opacity,
            }}
            animate={{
              x: line.x,
            }}
            transition={{
              duration: line.duration,
              ease: "linear",
              repeat: Infinity,
            }}
          />
        ))}
      </div>
      
      {/* Glowing orbs - rendered only after client-side effect runs */}
      <div className="absolute inset-0">
        {beams.orbs.map((orb) => (
          <motion.div
            key={`orb-${orb.id}`}
            className="absolute rounded-full bg-blue-300 dark:bg-gray-700"
            style={{
              width: orb.width,
              height: orb.height,
              left: orb.left,
              top: orb.top,
              opacity: orb.opacity,
              filter: "blur(10px)",
            }}
            animate={{
              scale: orb.scale,
              opacity: orb.opacityAnim,
            }}
            transition={{
              duration: orb.duration,
              ease: "easeInOut",
              repeat: Infinity,
            }}
          />
        ))}
      </div>
    </div>
  )
} 