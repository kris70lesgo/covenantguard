
'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TextScrambleProps {
  children: string;
  as?: React.ElementType;
  className?: string;
  duration?: number;
  speed?: number;
  trigger?: boolean;
}

const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+';

export const TextScramble: React.FC<TextScrambleProps> = ({
  children,
  as: Component = 'span',
  className,
  duration = 1.2,
  speed = 0.05,
  trigger = true,
}) => {
  const [displayText, setDisplayText] = useState(children);
  const [isAnimating, setIsAnimating] = useState(false);
  const iterationRef = useRef(0);
  const intervalRef = useRef<number | null>(null);

  const scramble = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    iterationRef.current = 0;

    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = window.setInterval(() => {
      setDisplayText((prev) =>
        children
          .split('')
          .map((char, index) => {
            if (index < iterationRef.current) {
              return children[index];
            }
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join('')
      );

      if (iterationRef.current >= children.length) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setIsAnimating(false);
      }

      iterationRef.current += 1 / ((duration / speed) / children.length);
    }, speed * 1000);
  }, [children, duration, isAnimating, speed]);

  useEffect(() => {
    if (trigger) {
      scramble();
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [trigger, scramble]);

  return (
    <Component className={className}>
      {displayText}
    </Component>
  );
};
