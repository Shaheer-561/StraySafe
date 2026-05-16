import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '../lib/auth';

export default function Landing() {
  const { signIn, user } = useAuth();

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden">
      {/* Full-screen Background Video */}
      <div className="fixed inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
          poster="/images/hero-image.jpg"
        >
          <source src="/bg-video-2.mp4" type="video/mp4" />
        </video>
        {/* Cinematic Overlays */}
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0d0a] via-transparent to-[#0f0d0a]/60" />
      </div>

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

          <h1 className="text-7xl md:text-9xl font-black tracking-[calc(-0.06em)] leading-[0.8] text-white uppercase text-glow">
            STRAY<span className="text-primary italic font-serif">SAFE</span>
          </h1>

          <p className="max-w-xl mx-auto text-xl md:text-2xl font-medium text-white/60 leading-relaxed mb-12">
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
                className="inline-flex items-center gap-4 px-16 py-7 bg-white text-black rounded-full font-black text-xl hover:bg-primary hover:text-white transition-all duration-500 hover:shadow-[0_0_80px_rgba(217,119,6,0.6)] group"
              >
                ACCESS CONSOLE
                <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </Link>
            ) : (
              <button
                onClick={signIn}
                className="inline-flex items-center gap-4 px-16 py-7 bg-primary text-white rounded-full font-black text-xl hover:scale-105 transition-all duration-500 hover:shadow-[0_0_80px_rgba(217,119,6,0.6)] group"
              >
                INITIALIZE LINK
                <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </button>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
