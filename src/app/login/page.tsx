'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { KeyRound, Eye, EyeOff } from 'lucide-react';

const BACKGROUND_IMAGES = [
  '/cathedral_background.jpg',
  '/church_sanctuary.jpg',
  '/modern_chapel_background.jpg',
];

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuth();

  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  const [email, setEmail] = useState('user@2026');
  const [password, setPassword] = useState('user@123');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Smoothly cycle through all church sanctuary backgrounds one by one
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBgIndex((prev) => (prev + 1) % BACKGROUND_IMAGES.length);
    }, 5000); // Changes image smoothly every 7 seconds

    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email/username and password');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email, password);
      toast.success('Welcome back!', {
        description: 'Successfully signed in to Salt and Light Fund Tracker.',
      });
      router.push('/');
    } catch (err: any) {
      toast.error('Sign in failed', {
        description: err?.message || 'Invalid credentials. Try using demo login.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFillDemoUser = () => {
    setEmail('user@2026');
    setPassword('user@123');
    toast.info('Demo credentials loaded');
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-[#070B11] overflow-hidden p-4 select-none">
      
      {/* 1. Cinematic Church Sanctuary Backgrounds Cycling One by One with Smooth Cross-Fade */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {BACKGROUND_IMAGES.map((imgSrc, index) => {
          const isActive = index === currentBgIndex;
          return (
            <div 
              key={imgSrc}
              className={`absolute -inset-[6%] bg-cover bg-center will-change-transform transition-opacity duration-1000 ease-in-out ${
                isActive ? 'opacity-85 animate-slow-zoom z-1' : 'opacity-0 z-0 pointer-events-none'
              }`}
              style={{
                backgroundImage: `url('${imgSrc}')`,
              }}
            />
          );
        })}

        {/* Ambient Dark Overlay with Radial Vignette for Center Focus */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/25 to-black/65 backdrop-brightness-[0.88] z-2" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.65)_100%)] z-2" />
      </div>

      {/* 2. Refined Cinematic Glass Login Modal */}
      <div className="relative z-10 w-full max-w-[410px] rounded-[28px] bg-[#0A101A]/90 border border-white/[0.12] backdrop-blur-xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] p-6 sm:p-8 transition-all duration-300">

        {/* Modal Header */}
        <div className="text-center flex flex-col items-center pb-5">
          {/* Logo container */}
          <div className="w-12 h-12 rounded-2xl bg-[#141C28] border border-white/15 p-1 shadow-md shadow-black/40 overflow-hidden mb-3.5">
            <Image
              src="/logo.png"
              alt="Salt and Light Logo"
              width={48}
              height={48}
              priority
              className="w-full h-full object-cover rounded-xl"
            />
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-[#F7F7F5] tracking-tight">
            Salt and Light Fund Tracker
          </h1>
          <p className="text-xs text-[#9DA2AD] mt-1 font-medium">
            Youth Financial Management
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Email / Username */}
          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-xs font-semibold text-[#D2D5DC]">
              Email or Username
            </label>
            <input
              id="email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@2026"
              required
              className="w-full px-3.5 py-2.5 bg-black/40 border border-white/[0.12] rounded-xl text-xs sm:text-sm text-[#F7F7F5] placeholder-[#767C88] focus:outline-none focus:border-[#0F766E]/60 focus:ring-2 focus:ring-[#0F766E]/20 focus:bg-black/50 transition-all duration-200"
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-xs font-semibold text-[#D2D5DC]">
                Password
              </label>
            </div>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-3.5 pr-10 py-2.5 bg-black/40 border border-white/[0.12] rounded-xl text-xs sm:text-sm text-[#F7F7F5] placeholder-[#767C88] focus:outline-none focus:border-[#0F766E]/60 focus:ring-2 focus:ring-[#0F766E]/20 focus:bg-black/50 transition-all duration-200"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#7C818C] hover:text-[#E2E4E9] hover:bg-white/5 transition-colors p-1.5 rounded-lg cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Integrated Clean Demo Credentials Section */}
          <div 
            onClick={handleFillDemoUser}
            className="p-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.1] hover:border-slate-500/40 flex items-center justify-between gap-2 transition-all duration-200 cursor-pointer group"
            title="Click to fill demo credentials"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-300">
                <KeyRound size={13} className="text-slate-400" />
                <span>Demo Account</span>
              </div>
              <p className="text-xs text-slate-400 font-mono tracking-wide mt-0.5 truncate">
                user@2026 · user@123
              </p>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleFillDemoUser();
              }}
              className="shrink-0 text-xs font-medium text-slate-200 hover:text-white bg-white/10 hover:bg-white/20 border border-white/15 px-3 py-1.5 rounded-lg transition-all active:scale-95 cursor-pointer"
            >
              Fill
            </button>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={isSubmitting || isLoading}
            className="w-full h-11 mt-1 rounded-xl bg-[#238B6F] hover:bg-[#1e785f] active:scale-[0.99] text-[#FAFAF8] text-xs sm:text-sm font-semibold shadow-lg shadow-teal-950/30 hover:shadow-teal-950/50 transition-all duration-200 disabled:opacity-50 cursor-pointer flex items-center justify-center"
          >
            {isSubmitting ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        {/* Subtle Background Slide Indicators */}
        <div className="flex items-center justify-center gap-1.5 pt-4">
          {BACKGROUND_IMAGES.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentBgIndex(idx)}
              className={`h-1 rounded-full transition-all duration-300 cursor-pointer ${
                idx === currentBgIndex ? 'w-5 bg-amber-400/80' : 'w-1.5 bg-white/20 hover:bg-white/40'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

      </div>
    </div>
  );
}
