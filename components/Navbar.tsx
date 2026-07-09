'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Compass, Brain, Network, LogIn, LogOut, User } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { data: session } = useSession();
  const pathname = usePathname();

  const navItems = [
    { name: 'Explorer', href: '/', icon: Compass },
    { name: 'Second Brain', href: '/second-brain', icon: Brain, protected: true },
    { name: 'Knowledge Graph', href: '/knowledge-graph', icon: Network, protected: true },
  ];

  return (
    <nav className="sticky top-4 z-40 max-w-5xl mx-auto w-[calc(100%-2rem)] my-4 px-6 py-3 rounded-2xl glass-node-card bg-white/80 backdrop-blur-md border border-slate-200/80 shadow-md flex items-center justify-between transition-all duration-300">
      {/* Brand logo */}
      <Link href="/" className="flex items-center gap-2 group">
        <div className="p-1.5 bg-gradient-to-tr from-indigo-700 to-violet-600 text-white rounded-lg group-hover:rotate-6 transition-transform">
          <Compass className="w-5 h-5" />
        </div>
        <span className="font-display font-extrabold text-lg text-slate-900 group-hover:text-indigo-600 transition-colors">
          Jack<span className="text-indigo-600">&</span>Trades
        </span>
      </Link>

      {/* Nav Links */}
      <div className="hidden md:flex items-center gap-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          const isProtected = item.protected;

          // If protected and not logged in, don't show or render with limited access?
          // We can show it so they know it exists, but clicking it routes to login.
          return (
            <Link
              key={item.href}
              href={isProtected && !session ? '/login' : item.href}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-100'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>

      {/* Auth actions */}
      <div className="flex items-center gap-3">
        {session ? (
          <div className="flex items-center gap-3">
            {/* User profile identifier */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700">
              <User className="w-3.5 h-3.5 text-indigo-500" />
              <span className="max-w-[120px] truncate" title={session.user.email}>
                {session.user.email.split('@')[0]}
              </span>
            </div>

            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-slate-600 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm shadow-indigo-100"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Login</span>
          </Link>
        )}
      </div>
    </nav>
  );
};
