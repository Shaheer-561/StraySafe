import React, { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { UserProfile } from '../lib/auth';
import { Trophy, Medal, Crown, Star, ArrowUp, Loader2, Sparkles, Target } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Leaderboard() {
  const [topUsers, setTopUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const q = query(collection(db, 'users'), orderBy('gradePoints', 'desc'), limit(10));
        const snapshot = await getDocs(q);
        setTopUsers(snapshot.docs.map(doc => doc.data() as UserProfile));
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchLeaderboard();
  }, []);

  const PodiumItem = ({ user, rank, delay }: { user: UserProfile, rank: number, delay: number }) => {
    const isFirst = rank === 1;
    const height = isFirst ? 'h-48 sm:h-72' : rank === 2 ? 'h-40 sm:h-60' : 'h-32 sm:h-48';
    const Icon = isFirst ? Crown : rank === 2 ? Medal : Star;
    const color = isFirst ? 'text-amber-400' : rank === 2 ? 'text-slate-400' : 'text-primary';
    const glow = isFirst ? 'shadow-[0_0_50px_rgba(251,191,36,0.3)]' : rank === 2 ? 'shadow-[0_0_50px_rgba(255,255,255,0.1)]' : 'shadow-[0_0_50px_rgba(255,92,0,0.2)]';

    return (
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 1, type: 'spring' }}
        className="flex flex-col items-center gap-4 sm:gap-8 w-full max-w-[120px] sm:max-w-[240px] group"
      >
        <div className="relative">
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className={`w-20 h-20 sm:w-32 sm:h-32 glass-strong rounded-2xl sm:rounded-[40px] flex items-center justify-center border border-white/10 sm:border-2 shadow-2xl overflow-hidden relative z-10 ${glow}`}
          >
             <img src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.displayName}`} alt="avatar" className="w-full h-full object-cover" />
          </motion.div>
          <div className={`absolute -top-6 sm:-top-12 left-1/2 -translate-x-1/2 ${color} z-20`}>
            <Icon className="w-8 h-8 sm:w-12 sm:h-12 fill-current filter drop-shadow-[0_0_20px_rgba(0,0,0,0.5)]" />
          </div>
        </div>
        <div className="text-center space-y-2 sm:space-y-3 relative z-10 w-full">
          <p className="font-black text-sm sm:text-2xl tracking-tighter truncate w-full uppercase italic font-serif text-white px-2">{user.displayName}</p>
          <div className="px-2 sm:px-6 py-1 sm:py-2 glass-strong rounded-full border border-white/10 shadow-xl inline-block">
             <p className="text-[8px] sm:text-[10px] font-black text-primary uppercase tracking-[0.1em] sm:tracking-[0.3em]">{user.gradePoints} MERIT</p>
          </div>
        </div>
        <div className={`w-full ${height} glass-strong rounded-t-[32px] sm:rounded-t-[56px] border-x border-t border-white/10 flex items-start justify-center pt-6 sm:pt-12 shadow-2xl group-hover:bg-white/5 transition-all`}>
          <span className="text-4xl sm:text-7xl font-black text-white/5 italic">#{rank}</span>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-24">
      <header className="text-center space-y-8">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 bg-primary/10 text-primary px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.4em] border border-primary/20 shadow-[0_0_30px_rgba(255,92,0,0.2)]"
        >
          <Trophy className="w-5 h-5" /> HALL OF VALOR
        </motion.div>
        <h1 className="text-5xl sm:text-6xl md:text-8xl font-black tracking-tighter text-glow text-white uppercase italic leading-none">ELITE NODES</h1>
        <p className="text-white/30 font-black max-w-xl mx-auto uppercase tracking-[0.3em] text-[10px] leading-relaxed">
          Commemorating high-clearance responders maintaining the planetary rescue grid through dedicated frontline service.
        </p>
      </header>

      {/* Podium */}
      {loading ? (
        <div className="h-[500px] flex items-center justify-center">
          <Loader2 className="w-16 h-16 text-primary animate-spin" />
        </div>
      ) : topUsers.length >= 3 && (
        <div className="flex items-end justify-center gap-2 sm:gap-16 pt-16 sm:pt-24 px-2 overflow-x-auto pb-12 sm:overflow-visible">
          <PodiumItem user={topUsers[1]} rank={2} delay={0.2} />
          <PodiumItem user={topUsers[0]} rank={1} delay={0} />
          <PodiumItem user={topUsers[2]} rank={3} delay={0.4} />
        </div>
      )}

      {/* List */}
      <div className="glass rounded-[64px] border border-white/5 overflow-hidden shadow-2xl relative">
        <div className="absolute inset-0 bg-primary/5 opacity-20" />
        <div className="relative z-10">
          <div className="hidden md:grid grid-cols-12 p-10 border-b border-white/5 text-[10px] font-black uppercase tracking-[0.4em] text-white/20">
            <div className="col-span-2 text-center">Protocol</div>
            <div className="col-span-6">Responder Segment</div>
            <div className="col-span-2 text-center">Clearance</div>
            <div className="col-span-2 text-right">Merit</div>
          </div>
          <div className="divide-y divide-white/5">
            {topUsers.map((user, idx) => (
              <motion.div
                key={user.uid}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 + idx * 0.05 }}
                className="flex flex-col md:grid md:grid-cols-12 p-6 md:p-10 gap-4 md:gap-0 items-center hover:bg-white/5 transition-all group"
              >
                <div className="md:col-span-2 font-black text-4xl md:text-5xl text-white/5 italic text-center group-hover:text-primary transition-colors">#{idx + 1}</div>
                <div className="md:col-span-6 flex flex-col md:flex-row items-center gap-4 md:gap-8 w-full text-center md:text-left">
                  <div className="w-16 h-16 md:w-16 md:h-16 rounded-[24px] glass-strong border border-white/10 overflow-hidden shrink-0 group-hover:scale-110 transition-transform shadow-2xl">
                     <img src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.displayName}`} alt="avatar" className="w-full h-full object-cover" />
                  </div>
                  <div className="space-y-1 md:space-y-2">
                    <p className="font-black text-xl md:text-2xl tracking-tighter uppercase italic font-serif text-white group-hover:text-primary transition-colors">{user.displayName}</p>
                    <p className="text-[10px] text-white/30 font-black uppercase tracking-[0.3em]">{user.role} UNIT</p>
                  </div>
                </div>
                <div className="md:col-span-2 flex items-center justify-center w-full">
                  <span className="bg-primary/10 text-primary text-[10px] font-black px-6 py-2 rounded-full uppercase tracking-widest border border-primary/20 shadow-[0_0_20px_rgba(255,92,0,0.1)]">
                    GRADE {user.grade}
                  </span>
                </div>
                <div className="md:col-span-2 text-center md:text-right font-black text-3xl md:text-4xl flex items-center justify-center md:justify-end gap-2 md:gap-4 text-white tracking-tighter italic font-serif w-full">
                  {user.gradePoints}
                  <Target className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="text-center pt-12">
        <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.5em]">Grid synchronization complete • Records updated in real-time</p>
      </div>
    </div>
  );
}
