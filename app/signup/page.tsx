'use client';

import React, { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Compass, Mail, Lock, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { NetworkBackground } from '@/components/NetworkBackground';
import { track } from '@vercel/analytics';

export default function SignupPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (session) {
      router.push('/');
      router.refresh();
    }
  }, [session, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed.');
      }

      setSuccess(true);
      track('signup_completed', { method: 'credentials' });
      
      // Auto sign in user after successful signup
      await signIn('credentials', {
        email,
        password,
        callbackUrl: '/',
      });
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <NetworkBackground />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <div className="mb-6">
          <Link href="/" className="font-sans font-bold text-2xl tracking-tight text-slate-900">
            Jack<span className="font-display italic font-normal text-indigo-650 mx-0.5">&</span>Trades
          </Link>
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 font-display">
          Create your account
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Begin building your connected web of knowledge
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-slate-50 py-8 px-6 border border-slate-900 rounded-xl shadow-[4px_4px_0px_#11161B] sm:px-10">
          {success ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-14 h-14 bg-white text-indigo-655 rounded-lg border border-slate-900 flex items-center justify-center mx-auto shadow-[1.5px_1.5px_0px_#11161B]">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-950 font-display">Account Registered!</h3>
              <p className="text-slate-600 text-xs">Signing you in automatically...</p>
            </div>
          ) : (
            <form className="space-y-5" onSubmit={handleSubmit}>
              {error && (
                <div className="p-4 bg-[#FFF5F5] border border-slate-900 rounded-lg flex items-start gap-2.5 text-slate-800 text-xs font-medium shadow-[2px_2px_0px_#11161B]">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Email Address
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-slate-900 rounded-lg placeholder-slate-400 focus:outline-none focus:shadow-[2px_2px_0px_#11161B] text-sm bg-white font-medium"
                    placeholder="name@example.com"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Password (min 6 chars)
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-slate-900 rounded-lg placeholder-slate-400 focus:outline-none focus:shadow-[2px_2px_0px_#11161B] text-sm bg-white font-medium"
                    placeholder="••••••••"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Confirm Password
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="confirmPassword"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-slate-900 rounded-lg placeholder-slate-400 focus:outline-none focus:shadow-[2px_2px_0px_#11161B] text-sm bg-white font-medium"
                    placeholder="••••••••"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-slate-900 rounded-lg text-xs font-bold uppercase tracking-wider text-white bg-indigo-600 hover:bg-indigo-755 focus:outline-none focus:shadow-[2px_2px_0px_#11161B] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-[2px_2px_0px_#11161B] hover:shadow-[3.5px_3.5px_0px_#11161B] active:translate-y-0.5 transition-all"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Creating account...</span>
                    </>
                  ) : (
                    <span>Register</span>
                  )}
                </button>
              </div>
            </form>
          )}

          {!success && (
            <div className="mt-6 text-center">
              <span className="text-sm text-slate-500">
                Already have an account?{' '}
                <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
                  Sign in
                </Link>
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
