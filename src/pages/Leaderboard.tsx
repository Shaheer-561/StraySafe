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
    const height = isFirst ? 'h-72' : rank === 2 ? 'h-60' : 'h-48';
    const Icon = isFirst ? Crown : rank === 2 ? Medal : Star;
    const color = isFirst ? 'text-amber-400' : rank === 2 ? 'text-slate-400' : 'text-primary';
    const glow = isFirst ? 'shadow-[0_0_50px_rgba(251,191,36,0.3)]' : rank === 2 ? 'shadow-[0_0_50px_rgba(255,255,255,0.1)]' : 'shadow-[0_0_50px_rgba(255,92,0,0.2)]';

    return (
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 1, type: 'spring' }}
        className="flex flex-col items-center gap-8 w-full max-w-[240px] group"
      >
        <div className="relative">
          <motion.div 
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className={`w-32 h-32 glass-strong rounded-[40px] flex items-center justify-center border-2 border-white/10 shadow-2xl overflow-hidden relative z-10 ${glow}`}
          >
             <img src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.displayName}`} alt="avatar" className="w-full h-full object-cover" />
          </motion.div>
          <div className={`absolute -top-12 left-1/2 -translate-x-1/2 ${color} z-20`}>
            <Icon className="w-12 h-12 fill-current filter drop-shadow-[0_0_20px_rgba(0,0,0,0.5)]" />
          </div>
        </div>
        <div className="text-center space-y-3 relative z-10">
          <p className="font-black text-2xl tracking-tighter truncate w-48 uppercase italic font-serif text-white">{user.displayName}</p>
          <div className="px-6 py-2 glass-strong rounded-full border border-white/10 shadow-xl">
             <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">{user.gradePoints} MERIT</p>
          </div>
        </div>
        <div className={`w-full ${height} glass-strong rounded-t-[56px] border-x border-t border-white/10 flex items-start justify-center pt-12 shadow-2xl group-hover:bg-white/5 transition-all`}>
          <span className="text-7xl font-black text-white/5 italic">#{rank}</span>
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
        <h1 className="text-8xl font-black tracking-tighter text-glow text-white uppercase italic leading-none">ELITE NODES</h1>
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
        <div className="flex items-end justify-center gap-8 sm:gap-16 pt-24 px-4 overflow-x-auto pb-12 sm:overflow-visible">
          <PodiumItem user={topUsers[1]} rank={2} delay={0.2} />
          <PodiumItem user={topUsers[0]} rank={1} delay={0} />
          <PodiumItem user={topUsers[2]} rank={3} delay={0.4} />
        </div>
      )}

      {/* List */}
      <div className="glass rounded-[64px] border border-white/5 overflow-hidden shadow-2xl relative">
        <div className="absolute inset-0 bg-primary/5 opacity-20" />
        <div className="relative z-10">
          <div className="grid grid-cols-12 p-10 border-b border-white/5 text-[10px] font-black uppercase tracking-[0.4em] text-white/20">
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
                className="grid grid-cols-12 p-10 items-center hover:bg-white/5 transition-all group"
              >
                <div className="col-span-2 font-black text-5xl text-white/5 italic text-center group-hover:text-primary transition-colors">#{idx + 1}</div>
                <div className="col-span-6 flex items-center gap-8">
                  <div className="w-16 h-16 rounded-[24px] glass-strong border border-white/10 overflow-hidden shrink-0 group-hover:scale-110 transition-transform shadow-2xl">
                     <img src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.displayName}`} alt="avatar" className="w-full h-full object-cover" />
                  </div>
                  <div className="space-y-2">
                    <p className="font-black text-2xl tracking-tighter uppercase italic font-serif text-white group-hover:text-primary transition-colors">{user.displayName}</p>
                    <p className="text-[10px] text-white/30 font-black uppercase tracking-[0.3em]">{user.role} UNIT</p>
                  </div>
                </div>
                <div className="col-span-2 text-center">
                  <span className="bg-primary/10 text-primary text-[10px] font-black px-6 py-2 rounded-full uppercase tracking-widest border border-primary/20 shadow-[0_0_20px_rgba(255,92,0,0.1)]">
                    GRADE {user.grade}
                  </span>
                </div>
                <div className="col-span-2 text-right font-black text-4xl flex items-center justify-end gap-4 text-white tracking-tighter italic font-serif">
                  {user.gradePoints}
                  <Target className="w-6 h-6 text-primary" />
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
