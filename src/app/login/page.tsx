'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  GlassCard,
  GlassCardHeader,
  GlassCardTitle,
  GlassCardDescription,
  GlassCardContent,
} from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { UserCheck, KeyRound, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuth();

  const [email, setEmail] = useState('user@2026');
  const [password, setPassword] = useState('user@123');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in both email/username and password');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email, password);
      toast.success('Welcome back!', {
        description: 'Successfully signed in to Salt & Light Fund Tracker.',
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
    toast.info('Filled Demo User credentials');
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-[#090e17] overflow-hidden p-4">
      {/* Aesthetic Cinematic Church Cathedral Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-90 scale-100 transition-transform duration-1000"
        style={{
          backgroundImage: `url('/church_background.jpg')`,
        }}
      />

      {/* Subtle Soft Vignette Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/50 pointer-events-none" />

      {/* GlassCard Login Container */}
      <GlassCard className="relative z-10 w-full max-w-md bg-slate-950/85 border-white/25 backdrop-blur-2xl shadow-[0_25px_60px_rgba(0,0,0,0.8)] rounded-3xl p-3 sm:p-5">
        <GlassCardHeader className="text-center flex flex-col items-center pb-2">
          {/* Logo */}
          <div className="w-14 h-14 rounded-2xl shadow-xl overflow-hidden mb-2 border border-white/10">
            <Image
              src="/logo.png"
              alt="Salt and Light Logo"
              width={56}
              height={56}
              priority
              className="w-full h-full object-cover"
            />
          </div>

          <GlassCardTitle className="text-2xl font-black text-white tracking-tight">
            Salt & Light Fund Tracker
          </GlassCardTitle>
          
        </GlassCardHeader>

        <GlassCardContent className="pt-2">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold text-slate-200">
                Email / Username
              </Label>
              <Input
                id="email"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@2026"
                required
                className="bg-black/40 border-white/20 text-white placeholder-slate-400 focus-visible:ring-[#0F766E]"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-semibold text-slate-200">
                  Password
                </Label>
                <span className="text-[11px] text-slate-400">
                  Secured Access
                </span>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="bg-black/40 border-white/20 text-white placeholder-slate-400 focus-visible:ring-[#0F766E]"
              />
            </div>

            {/* Clean Full-Width Demo Credentials Box */}
            <div className="p-3.5 rounded-2xl bg-[#0F766E]/20 border border-[#0F766E]/40 backdrop-blur-md space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-300 flex items-center gap-1.5 uppercase tracking-wider">
                  <KeyRound size={13} />
                  Demo Credentials
                </span>
                <span className="text-[10px] text-teal-200/80">Click card to auto-fill</span>
              </div>

              <button
                type="button"
                onClick={handleFillDemoUser}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 transition cursor-pointer text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <UserCheck size={16} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-white">user@2026</span>
                      <span className="text-[10px] text-emerald-300 font-medium bg-emerald-500/20 px-1.5 py-0.5 rounded">User</span>
                    </div>
                    <p className="font-mono text-[11px] text-slate-300 mt-0.5">Password: user@123</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-300 group-hover:translate-x-0.5 transition-transform">
                  <span>Auto Fill</span>
                  <ArrowRight size={12} />
                </div>
              </button>
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="w-full h-11 rounded-2xl bg-[#0F766E] hover:bg-[#115E59] active:scale-[0.99] text-white font-bold shadow-lg shadow-teal-950/50 text-sm transition"
            >
              {isSubmitting ? 'Logging in...' : 'Log In'}
            </Button>
          </form>
        </GlassCardContent>
      </GlassCard>
    </div>
  );
}
