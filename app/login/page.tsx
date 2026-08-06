'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Compass, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { NetworkBackground } from '@/components/NetworkBackground';

function LoginForm() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // If already logged in, redirect to home
    if (session) {
      router.push('/');
      router.refresh();
    }
  }, [session, router]);

  useEffect(() => {
    // Catch default NextAuth errors from url query params
    const authError = searchParams.get('error');
    if (authError) {
      if (authError === 'CredentialsSignin') {
        setError('Invalid email or password.');
      } else {
        setError('Authentication failed. Please try again.');
      }
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError(res.error === 'CredentialsSignin' ? 'Invalid email or password.' : res.error);
      } else {
        router.push('/');
        router.refresh();
      }
    } catch (err: any) {
      setError('An unexpected error occurred.');
    } finally {
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
          Welcome back
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Access your personal persistent knowledge base
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-slate-50 py-8 px-6 border border-slate-900 rounded-xl shadow-[4px_4px_0px_#11161B] sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
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
                  name="email"
                  type="email"
                  autoComplete="email"
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
                Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
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
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-slate-900 rounded-lg text-xs font-bold uppercase tracking-wider text-white bg-indigo-600 hover:bg-indigo-750 focus:outline-none focus:shadow-[2px_2px_0px_#11161B] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-[2px_2px_0px_#11161B] hover:shadow-[3.5px_3.5px_0px_#11161B] active:translate-y-0.5 transition-all"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Sign in</span>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <span className="text-sm text-slate-500">
              Don't have an account?{' '}
              <Link href="/signup" className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
                Create one
              </Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col justify-center items-center bg-[#F8FAFC]">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
