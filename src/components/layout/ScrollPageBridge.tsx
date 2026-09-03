'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LucideIcon, ChevronDown, Check } from 'lucide-react';

interface ScrollPageBridgeProps {
  targetRoute: string;
  targetTitle: string;
  targetSubtitle?: string;
  readyText: string;
  icon: LucideIcon;
  onTransitionStart?: () => void;
}

export const ScrollPageBridge: React.FC<ScrollPageBridgeProps> = ({
  targetRoute,
  targetTitle,
  targetSubtitle,
  readyText,
  icon: Icon,
  onTransitionStart,
}) => {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    let accumulatedDelta = 0;
    let resetTimer: NodeJS.Timeout | null = null;
    let touchStartY = 0;
    const THRESHOLD = 800; // Deliberate smooth scroll distance

    const triggerTransition = () => {
      if (isNavigating) return;
      setIsNavigating(true);
      setIsReady(true);
      setProgress(100);

      if (onTransitionStart) {
        onTransitionStart();
      }

      // Brief gentle pause showing "Dashboard Ready" state before smooth slide
      setTimeout(() => {
        router.push(targetRoute);
      }, 300);
    };

    const handleWheel = (e: WheelEvent) => {
      if (isNavigating) return;

      // Check if user is scrolled to the bottom of the page
      const isAtBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 60;

      if (isAtBottom && e.deltaY > 0) {
        accumulatedDelta = Math.min(THRESHOLD, accumulatedDelta + e.deltaY);
        const currentPercent = Math.round((accumulatedDelta / THRESHOLD) * 100);
        setProgress(currentPercent);

        if (resetTimer) clearTimeout(resetTimer);
        resetTimer = setTimeout(() => {
          accumulatedDelta = 0;
          setProgress(0);
        }, 320);

        if (accumulatedDelta >= THRESHOLD) {
          if (resetTimer) clearTimeout(resetTimer);
          triggerTransition();
        }
      } else if (e.deltaY < 0 && accumulatedDelta > 0) {
        accumulatedDelta = Math.max(0, accumulatedDelta - Math.abs(e.deltaY) * 1.5);
        setProgress(Math.round((accumulatedDelta / THRESHOLD) * 100));
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isNavigating) return;
      const isAtBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 60;
      const touchCurrentY = e.touches[0].clientY;
      const pullDistance = touchStartY - touchCurrentY;

      if (isAtBottom && pullDistance > 0) {
        const pullPercent = Math.min(100, Math.round((pullDistance / 150) * 100));
        setProgress(pullPercent);
        if (pullDistance > 150) {
          triggerTransition();
        }
      }
    };

    const handleTouchEnd = () => {
      if (!isNavigating) {
        setProgress(0);
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      if (resetTimer) clearTimeout(resetTimer);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [router, targetRoute, isNavigating, onTransitionStart]);

  const handleManualClick = () => {
    if (isNavigating) return;
    setIsNavigating(true);
    setIsReady(true);
    setProgress(100);

    if (onTransitionStart) {
      onTransitionStart();
    }

    setTimeout(() => {
      router.push(targetRoute);
    }, 250);
  };

  return (
    <div
      onClick={handleManualClick}
      className="mt-8 mb-4 max-w-sm mx-auto p-4 rounded-2xl bg-white border border-slate-200/80 shadow-card hover:shadow-card-hover hover:border-slate-300/80 transition-all duration-200 select-none cursor-pointer group"
      title="Click or scroll down to navigate"
    >
      <div className="flex flex-col items-center text-center">
        
        {/* 1. Small subtle dashboard/grid icon */}
        <div
          className="mb-2 transition-transform duration-200"
          style={{ transform: `scale(${1 + (progress / 100) * 0.15})` }}
        >
          {isReady ? (
            <div className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center shadow-xs">
              <Check size={16} className="stroke-[2.5]" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-xl bg-slate-100 group-hover:bg-primary-50 text-slate-700 group-hover:text-primary flex items-center justify-center transition-colors">
              <Icon
                size={16}
                className={`transition-colors ${
                  progress > 0 ? 'text-primary' : 'text-slate-600 group-hover:text-primary'
                }`}
              />
            </div>
          )}
        </div>

        {/* 2. Primary text */}
        <h4 className="text-xs sm:text-sm font-semibold text-slate-900 group-hover:text-primary transition-colors tracking-tight">
          {isReady ? (
            <span className="text-primary font-bold">{readyText}</span>
          ) : (
            targetTitle
          )}
        </h4>

        {/* 3. Secondary text */}
        {targetSubtitle && (
          <p className="text-[11px] text-slate-500 mt-0.5 font-normal">
            {isReady ? 'Opening view...' : targetSubtitle}
          </p>
        )}

        {/* 4. Thin horizontal progress indicator & subtle percentage */}
        <div className="w-48 sm:w-56 mt-3 space-y-1">
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-75"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-[10px] text-slate-400">
            <span className="group-hover:text-slate-600 transition-colors">Click to switch</span>
            <span
              className={`font-mono tabular-nums transition-colors ${
                progress > 0 ? 'text-primary font-semibold' : 'text-slate-400'
              }`}
            >
              {progress}%
            </span>
          </div>
        </div>

        {/* 5. Small downward arrow */}
        <div
          className="mt-1 transition-transform"
          style={{ transform: `translateY(${(progress / 100) * 4}px)` }}
        >
          <ChevronDown
            size={13}
            className={`transition-colors ${
              progress > 0
                ? 'text-primary animate-bounce'
                : 'text-slate-400 group-hover:text-slate-600'
            }`}
          />
        </div>

      </div>
    </div>
  );
};
