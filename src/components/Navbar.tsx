import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { PawPrint, Flag, BookOpen, Trophy, User, LogOut, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Navbar() {
  const { user, profile, logout, signIn } = useAuth();
  const location = useLocation();

  const navItems = [
    { name: 'Home', path: '/', icon: PawPrint },
    { name: 'Reports', path: '/reports', icon: Flag },
    { name: 'AI Guide', path: '/guides', icon: BookOpen },
    { name: 'Heroes', path: '/leaderboard', icon: Trophy },
  ];

  if (profile?.email === 'shaheerirfan928@gmail.com' || profile?.role === 'admin') {
    navItems.push({ name: 'Admin', path: '/admin', icon: Shield });
  }

  const isActive = (path: string) => {
    if (path === '/' && location.pathname !== '/') return false;
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 px-6 py-4 glass-strong rounded-[40px] flex items-center gap-4 max-w-[95vw] sm:max-w-none border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
      <div className="flex items-center gap-2">
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`relative px-5 py-2.5 rounded-2xl text-sm font-black transition-all flex items-center gap-2 ${
                active ? 'text-white' : 'text-white/40 hover:text-white'
              }`}
            >
              <item.icon className={`w-4 h-4 ${active ? 'text-primary' : ''}`} />
              <span className="hidden sm:inline uppercase tracking-widest text-[10px]">{item.name}</span>
              {active && (
                <motion.div
                  layoutId="nav-active"
                  className="absolute inset-0 bg-white/5 rounded-2xl -z-10 border border-white/10"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
            </Link>
          );
        })}
      </div>

      <div className="w-px h-6 bg-white/10 mx-2" />

      <div className="flex items-center gap-3">
        {user ? (
          <>
            <Link 
              to="/profile" 
              className={`w-12 h-12 rounded-2xl border border-white/10 flex items-center justify-center bg-white/5 hover:bg-white/10 transition-all hover:scale-110 group overflow-hidden ${location.pathname === '/profile' ? 'border-primary shadow-[0_0_15px_rgba(255,92,0,0.3)]' : ''}`}
            >
              <User className={`w-5 h-5 ${location.pathname === '/profile' ? 'text-primary' : 'text-white/40 group-hover:text-white'}`} />
            </Link>
            <button
              onClick={() => logout()}
              className="p-3 text-white/40 hover:text-red-500 transition-all hover:scale-110"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </>
        ) : (
          <button
            onClick={signIn}
            className="px-6 py-2.5 bg-primary text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,92,0,0.3)]"
          >
            Authorize
          </button>
        )}
      </div>
    </nav>
  );
}
