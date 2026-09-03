'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HandwritingText } from '@/components/ui/handwriting-text';

export const SplashScreen: React.FC = () => {
  const [isVisible, setIsVisible] = useState<boolean>(true);

  useEffect(() => {
    // Only show splash screen once per tab session for better user experience
    const hasSeenSplash = sessionStorage.getItem('hasSeenSplash_v1');
    if (hasSeenSplash) {
      setIsVisible(false);
      return;
    }

    const timer = setTimeout(() => {
      setIsVisible(false);
      sessionStorage.setItem('hasSeenSplash_v1', 'true');
    }, 1800);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem('hasSeenSplash_v1', 'true');
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, filter: 'blur(12px)', transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }}
          onClick={handleDismiss}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#070B11] text-white select-none px-6 cursor-pointer"
        >
          <div className="flex min-h-[320px] w-full max-w-2xl flex-col items-center justify-center text-center gap-2">
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="text-center"
            >
              {/* Dark Teal Heading */}
              <h1 className="text-4xl font-black leading-tight tracking-tight sm:text-5xl md:text-6xl bg-gradient-to-r from-teal-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(15,118,110,0.6)]">
                Fund Tracker
              </h1>

              <p className="text-zinc-400 font-bold text-xl sm:text-2xl md:text-3xl mt-2 tracking-tight">
                A Salt And Light Crew Production
              </p>

              <div className="mt-4 flex items-center justify-center">
                <HandwritingText
                  text="Co-presented by Sham Souza"
                  fontUrl="/fonts/Caveat.ttf"
                  className="text-teal-400/90"
                  height="24px"
                  duration={1.4}
                  strokeWidth={1.2}
                />
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
