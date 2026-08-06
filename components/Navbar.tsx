'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { 
  Compass, 
  Brain, 
  Network, 
  LogIn, 
  LogOut, 
  User, 
  Milestone, 
  Lightbulb, 
  Menu, 
  X as CloseIcon,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Navbar: React.FC = () => {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Dropdown states for desktop
  const [activeDropdown, setActiveDropdown] = useState<'brain' | 'create' | null>(null);

  const brainItems = [
    { name: 'Second Brain', href: '/second-brain', icon: Brain, protected: true },
    { name: 'Knowledge Graph', href: '/knowledge-graph', icon: Network, protected: true },
  ];

  const createItems = [
    { name: 'Roadmaps', href: '/roadmaps', icon: Milestone, protected: true },
    { name: 'Ideas', href: '/ideas', icon: Lightbulb, protected: true },
  ];

  const handleDropdownToggle = (dropdown: 'brain' | 'create') => {
    setActiveDropdown(prev => prev === dropdown ? null : dropdown);
  };

  const isBrainActive = brainItems.some(item => pathname === item.href);
  const isCreateActive = createItems.some(item => pathname === item.href);

  return (
    <header className="sticky top-4 z-40 max-w-5xl mx-auto w-[calc(100%-2rem)] my-4">
      {/* Main Navbar Panel */}
      <nav className="px-6 py-3 rounded-xl glass-node-card bg-white/80 backdrop-blur-md border border-slate-200/80 shadow-md flex items-center justify-between transition-all duration-300">
        
        {/* Zone 1: Brand logo (Left) */}
        <Link href="/" className="flex items-center gap-2 group" onClick={() => setIsOpen(false)}>
          <span className="font-sans font-bold text-base tracking-wide text-slate-900 group-hover:text-indigo-600 transition-colors">
            Jack<span className="font-display italic font-normal text-indigo-650 mx-0.5">&</span>Trades
          </span>
        </Link>

        {/* Zone 2: Primary Nav Links (Center) */}
        <div className="hidden md:flex items-center gap-6">
          {/* Core Explorer link */}
          <Link
            href="/"
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
              pathname === '/'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-100'
                : 'text-slate-655 hover:text-slate-950 hover:bg-slate-100/60'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Explorer</span>
          </Link>

          {/* Dropdown 1: My Brain */}
          <div 
            className="relative"
            onMouseEnter={() => setActiveDropdown('brain')}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <button
              onClick={() => handleDropdownToggle('brain')}
              className={`flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                isBrainActive
                  ? 'bg-indigo-50 border border-indigo-200/50 text-indigo-750'
                  : 'text-slate-655 hover:text-slate-955 hover:bg-slate-100/60'
              }`}
            >
              <Brain className="w-3.5 h-3.5" />
              <span>My Brain</span>
              <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${activeDropdown === 'brain' ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {activeDropdown === 'brain' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 mt-1.5 w-48 bg-slate-50 border border-slate-900 shadow-[3px_3px_0px_#11161B] rounded-lg p-1.5 z-50 flex flex-col gap-0.5"
                >
                  {brainItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    const targetHref = item.protected && !session ? '/login' : item.href;

                    return (
                      <Link
                        key={item.href}
                        href={targetHref}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                          isActive
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'text-slate-650 hover:bg-slate-100 hover:text-slate-950'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Dropdown 2: Create */}
          <div 
            className="relative"
            onMouseEnter={() => setActiveDropdown('create')}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <button
              onClick={() => handleDropdownToggle('create')}
              className={`flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                isCreateActive
                  ? 'bg-indigo-50 border border-indigo-200/50 text-indigo-750'
                  : 'text-slate-655 hover:text-slate-955 hover:bg-slate-100/60'
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5" />
              <span>Create</span>
              <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${activeDropdown === 'create' ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {activeDropdown === 'create' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 mt-1.5 w-48 bg-slate-50 border border-slate-900 shadow-[3px_3px_0px_#11161B] rounded-lg p-1.5 z-50 flex flex-col gap-0.5"
                >
                  {createItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    const targetHref = item.protected && !session ? '/login' : item.href;

                    return (
                      <Link
                        key={item.href}
                        href={targetHref}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                          isActive
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'text-slate-650 hover:bg-slate-100 hover:text-slate-950'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Zone 3: Account/Auth Controls (Right) & Hamburger (Mobile) */}
        <div className="flex items-center gap-3">
          {/* Hamburger button visible only on mobile */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-150 text-slate-600 hover:text-slate-950 md:hidden cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {isOpen ? <CloseIcon className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {session ? (
            <div className="hidden md:flex items-center gap-3">
              {/* User profile identifier */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700">
                <User className="w-3.5 h-3.5 text-indigo-500" />
                <span className="max-w-[120px] truncate" title={session.user.email}>
                  {session.user.email.split('@')[0]}
                </span>
              </div>

              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-red-50 hover:text-red-650 hover:border-red-200 text-slate-600 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="hidden md:flex px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold uppercase tracking-wider items-center gap-1.5 transition-all shadow-sm shadow-indigo-100"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Login</span>
            </Link>
          )}
        </div>
      </nav>

      {/* Mobile Menu Panel (Framer Motion Drawer) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="absolute top-[100%] left-0 right-0 mt-2 px-6 py-5 rounded-2xl bg-white border border-slate-200 shadow-xl md:hidden z-50 flex flex-col gap-4"
          >
            {/* Explorer link */}
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                pathname === '/'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100/60'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Explorer</span>
            </Link>

            {/* Group 1: My Brain */}
            <div className="space-y-1">
              <span className="block px-4 text-[9px] font-extrabold uppercase tracking-widest text-slate-400">
                My Brain
              </span>
              {brainItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                const targetHref = item.protected && !session ? '/login' : item.href;

                return (
                  <Link
                    key={item.href}
                    href={targetHref}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100/60'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* Group 2: Create */}
            <div className="space-y-1">
              <span className="block px-4 text-[9px] font-extrabold uppercase tracking-widest text-slate-400">
                Create
              </span>
              {createItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                const targetHref = item.protected && !session ? '/login' : item.href;

                return (
                  <Link
                    key={item.href}
                    href={targetHref}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100/60'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>

            <hr className="border-slate-100 my-0.5" />

            {session ? (
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 border border-slate-150 text-xs font-semibold text-slate-700">
                  <User className="w-4 h-4 text-indigo-500" />
                  <span className="truncate">{session.user.email}</span>
                </div>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    signOut({ callbackUrl: '/' });
                  }}
                  className="w-full text-left px-4 py-3 rounded-xl border border-red-200 bg-red-50/50 hover:bg-red-50 hover:text-red-600 text-red-600 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="w-full flex justify-center py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold uppercase tracking-wider items-center gap-2 transition-all shadow-sm"
              >
                <LogIn className="w-4 h-4" />
                <span>Login</span>
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
