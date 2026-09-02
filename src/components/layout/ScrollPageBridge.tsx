'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LucideIcon, ChevronDown, Check } from 'lucide-react';

interface ScrollPageBridgeProps {
  targetRoute: string;
  targetTitle: string;
  targetSubtitle: string;
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
      className="mt-6 pb-2 flex flex-col items-center justify-center select-none cursor-pointer group"
      title="Scroll down or click to switch view"
    >
      <div className="flex flex-col items-center text-center max-w-xs transition-transform duration-200">
        
        {/* 1. Small subtle dashboard/grid icon */}
        <div
          className="mb-2 transition-transform duration-200"
          style={{ transform: `scale(${1 + (progress / 100) * 0.15})` }}
        >
          {isReady ? (
            <div className="w-7 h-7 rounded-full bg-[#238B6F] text-white flex items-center justify-center shadow-xs">
              <Check size={14} className="stroke-[3]" />
            </div>
          ) : (
            <div className="w-7 h-7 rounded-full bg-black/[0.04] group-hover:bg-black/[0.08] text-[#0D1522] flex items-center justify-center transition-colors">
              <Icon
                size={14}
                className={`transition-colors ${
                  progress > 0 ? 'text-[#238B6F]' : 'text-[#0D1522]'
                }`}
              />
            </div>
          )}
        </div>

        {/* 2. Primary text (Navy) */}
        <h4 className="text-xs sm:text-sm font-semibold text-[#0D1522] tracking-tight transition-colors">
          {isReady ? (
            <span className="text-[#238B6F] font-bold">{readyText}</span>
          ) : (
            targetTitle
          )}
        </h4>

        {/* 3. Secondary text (Subtle Gray) */}
        <p className="text-[11px] text-[#737373] mt-0.5 font-normal">
          {isReady ? 'Opening view...' : targetSubtitle}
        </p>

        {/* 4. Thin horizontal progress indicator & subtle percentage */}
        <div className="w-48 sm:w-56 mt-3 space-y-1">
          <div className="w-full h-1 bg-black/[0.06] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#238B6F] rounded-full transition-all duration-75"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex justify-end">
            <span
              className={`text-[10px] font-mono tabular-nums transition-colors ${
                progress > 0 ? 'text-[#238B6F] font-medium' : 'text-transparent group-hover:text-slate-400'
              }`}
            >
              {progress}%
            </span>
          </div>
        </div>

        {/* 5. Small downward arrow */}
        <div
          className="mt-0.5 transition-transform"
          style={{ transform: `translateY(${(progress / 100) * 4}px)` }}
        >
          <ChevronDown
            size={13}
            className={`transition-colors ${
              progress > 0
                ? 'text-[#238B6F] animate-bounce'
                : 'text-slate-400 group-hover:text-slate-600'
            }`}
          />
        </div>

      </div>
    </div>
  );
};
