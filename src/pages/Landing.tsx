import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '../lib/auth';

export default function Landing() {
  const { signIn, user } = useAuth();

  return (
    <div className="min-h-[calc(100vh-120px)] w-full flex items-center justify-center relative">
      {/* Main Content */}
      <div className="relative z-10 text-center px-6 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          <p className="text-white/60 text-sm md:text-base font-black uppercase tracking-[0.6em] mb-4">
            Animal Rescue Network
          </p>

          <h1 className="text-5xl sm:text-7xl md:text-9xl font-black tracking-[calc(-0.06em)] leading-[0.85] text-white uppercase text-glow">
            STRAY<span className="text-primary italic font-serif">SAFE</span>
          </h1>

          <p className="max-w-xl mx-auto text-base sm:text-xl md:text-2xl font-medium text-white/60 leading-relaxed mb-8 md:mb-12">
            The world's first decentralized neural network for stray animal protection and rapid rescue response.
          </p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            {user ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center gap-4 w-full sm:w-auto px-10 sm:px-16 py-5 sm:py-7 bg-white text-black rounded-full font-black text-lg sm:text-xl hover:bg-primary hover:text-white transition-all duration-500 hover:shadow-[0_0_80px_rgba(217,119,6,0.6)] group"
              >
                ACCESS CONSOLE
                <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-2 transition-transform" />
              </Link>
            ) : (
              <button
                onClick={signIn}
                className="inline-flex items-center justify-center gap-4 w-full sm:w-auto px-10 sm:px-16 py-5 sm:py-7 bg-primary text-white rounded-full font-black text-lg sm:text-xl hover:scale-105 transition-all duration-500 hover:shadow-[0_0_80px_rgba(217,119,6,0.6)] group"
              >
                INITIALIZE LINK
                <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-2 transition-transform" />
              </button>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
