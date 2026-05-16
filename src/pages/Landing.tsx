import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, Shield, Target, Award } from 'lucide-react';
import { useAuth } from '../lib/auth';

export default function Landing() {
  const { signIn, user } = useAuth();

  useEffect(() => {
    if (!document.querySelector('script[src="https://unpkg.com/@splinetool/viewer@1.9.90/build/spline-viewer.js"]')) {
      const script = document.createElement('script');
      script.type = 'module';
      script.src = 'https://unpkg.com/@splinetool/viewer@1.9.90/build/spline-viewer.js';
      document.head.appendChild(script);
    }
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Spline 3D Background */}
      <div className="absolute inset-0 z-0 scale-[1.2] origin-center opacity-80">
        <spline-viewer style={{ width: '100%', height: '100%' }} url="https://prod.spline.design/Y-O11MVMFkC-JOv1/scene.splinecode"></spline-viewer>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-6 min-h-screen flex flex-col justify-center relative z-10 pointer-events-none">
        <div className="max-w-5xl mx-auto text-center space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-3 px-6 py-2 rounded-full border border-white/10 bg-black/40 backdrop-blur-md shadow-2xl pointer-events-auto"
          >
            <Zap className="w-4 h-4 text-primary fill-primary animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/80">
              Protocol StraySafe v2.0
            </span>
          </motion.div>

          <div className="space-y-4">
            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="heading-huge text-glow"
            >
              EVERY SIGNAL <br />
              <span className="shimmer-text">SAVES A LIFE</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="max-w-2xl mx-auto text-lg md:text-xl font-bold text-white/50 uppercase tracking-[0.1em] leading-relaxed"
            >
              The world's first decentralized neural network for <br className="hidden md:block" />
              stray animal protection and rapid rescue response.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-12 pointer-events-auto"
          >
            {user ? (
              <Link
                to="/dashboard"
                className="w-full sm:w-auto px-16 py-6 bg-white text-black rounded-[32px] font-black text-xl hover:bg-primary hover:text-white transition-all hover:shadow-[0_0_60px_rgba(255,92,0,0.4)] flex items-center justify-center gap-3 group"
              >
                ACCESS CONSOLE
                <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </Link>
            ) : (
              <button
                onClick={signIn}
                className="w-full sm:w-auto px-16 py-6 bg-primary text-white rounded-[32px] font-black text-xl border border-primary/20 hover:scale-105 transition-all hover:shadow-[0_0_60px_rgba(255,92,0,0.5)] flex items-center justify-center gap-3 group"
              >
                INITIALIZE LINK
                <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </button>
            )}
          </motion.div>

          {/* Features Preview */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-20 max-w-4xl mx-auto"
          >
            {[
              { icon: Shield, label: "Neural Security", val: "Grade A" },
              { icon: Target, label: "Rescue Range", val: "Global" },
              { icon: Award, label: "Hero Registry", val: "Verified" }
            ].map((f, i) => (
              <div key={i} className="flex flex-col items-center gap-3">
                <f.icon className="w-6 h-6 text-primary/60" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">{f.label}</span>
                <span className="text-sm font-bold text-white/60">{f.val}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
