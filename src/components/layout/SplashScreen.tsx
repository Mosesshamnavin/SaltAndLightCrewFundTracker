'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HandwritingText } from '@/components/ui/handwriting-text';

export const SplashScreen: React.FC = () => {
  const [isVisible, setIsVisible] = useState<boolean>(true);

  useEffect(() => {
    // Smooth cinematic hold for 3 seconds then fade out
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, filter: 'blur(10px)' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#09090b] text-white select-none px-6"
        >
          <div className="flex min-h-[360px] w-full max-w-3xl flex-col items-center justify-center text-center gap-2">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
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
                  className="text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.3)]"
                  height="34px"
                  duration={1.8}
                  strokeWidth={1.5}
                />
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
