import React, { useEffect, useState } from 'react';
import { useAuth } from '../lib/auth';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { Report, ReportStatus } from '../types';
import { motion } from 'framer-motion';
import { Flag, CheckCircle, Plus, BookOpen, Trophy, ArrowRight, Zap, Target, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0 });
  const [recentReports, setRecentReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      if (!profile) return;
      
      try {
        const reportsRef = collection(db, 'reports');
        const qTotal = query(reportsRef);
        const qPending = query(reportsRef, where('status', '==', ReportStatus.PENDING));
        const qResolved = query(reportsRef, where('status', '==', ReportStatus.RESOLVED));

        const [sTotal, sPending, sResolved] = await Promise.all([
          getDocs(qTotal),
          getDocs(qPending),
          getDocs(qResolved)
        ]);

        setStats({
          total: sTotal.size,
          pending: sPending.size,
          resolved: sResolved.size
        });

        const qRecent = query(reportsRef, orderBy('createdAt', 'desc'), limit(5));
        const sRecent = await getDocs(qRecent);
        setRecentReports(sRecent.docs.map(doc => ({ id: doc.id, ...doc.data() } as Report)));
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [profile]);

  const statsCards = [
    { label: 'Active Signals', value: stats.pending, icon: Zap, color: 'text-orange-500', glow: 'shadow-[0_0_30px_rgba(255,92,0,0.2)]' },
    { label: 'Completed Missions', value: stats.resolved, icon: CheckCircle, color: 'text-green-500', glow: 'shadow-[0_0_30px_rgba(34,197,94,0.1)]' },
    { label: 'Total Node Load', value: stats.total, icon: Flag, color: 'text-blue-500', glow: 'shadow-[0_0_30px_rgba(59,130,246,0.1)]' },
  ];

  const quickActions = [
    { name: 'Deploy Signal', path: '/report/new', icon: Plus, color: 'bg-primary text-white shadow-[0_0_30px_rgba(255,92,0,0.3)]', desc: 'Alert the network' },
    { name: 'Rescue Intel', path: '/reports', icon: Target, color: 'glass text-white', desc: 'Scan active targets' },
    { name: 'Neural Guide', path: '/guides', icon: BookOpen, color: 'glass text-white', desc: 'Tactical advice' },
    { name: 'Hall of Valor', path: '/leaderboard', icon: Trophy, color: 'glass text-white', desc: 'Elite responder ranking' },
  ];

  return (
    <div className="space-y-16">
      {/* Welcome Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
             <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">System Online</span>
          </div>
          <h1 className="text-6xl md:text-7xl font-black tracking-tighter text-glow uppercase italic">
            HELLO, <span className="text-primary">{profile?.displayName?.split(' ')[0]}</span>
          </h1>
          <p className="text-white/30 font-black uppercase tracking-[0.3em] text-[10px]">
            Operational Clearance: <span className="text-white/80 px-2 border-l border-white/10 ml-2">Grade {profile?.grade}</span>
          </p>
        </div>
        <div className="flex items-center gap-8 glass p-8 rounded-[40px] border border-white/10">
          <div className="text-right">
             <p className="text-[10px] text-white/30 font-black uppercase tracking-[0.2em] mb-1">Merit Balance</p>
             <p className="text-5xl font-black text-white tracking-tighter italic font-serif leading-none">{profile?.gradePoints}</p>
          </div>
          <Link to="/profile" className="w-16 h-16 glass-strong rounded-2xl flex items-center justify-center hover:bg-primary transition-all hover:scale-110 group border border-white/10">
            <Target className="w-8 h-8 text-primary group-hover:text-white" />
          </Link>
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-16">
          {/* Stats Bar */}
          <section className="grid sm:grid-cols-3 gap-6">
            {statsCards.map((card, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`glass p-8 rounded-[40px] border border-white/5 space-y-6 hover-glow ${card.glow}`}
              >
                <div className={`${card.color} glass-strong w-14 h-14 rounded-2xl flex items-center justify-center border border-white/10 shadow-xl`}>
                  <card.icon className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-[10px] text-white/30 font-black uppercase tracking-[0.3em] mb-2">{card.label}</p>
                  <p className="text-5xl font-black italic font-serif text-white tracking-tighter">{card.value}</p>
                </div>
              </motion.div>
            ))}
          </section>

          {/* Quick Actions Grid */}
          <section className="space-y-8">
            <h2 className="text-3xl font-black tracking-tighter uppercase text-white/90 italic">Protocols</h2>
            <div className="grid sm:grid-cols-2 gap-6">
              {quickActions.map((action, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + idx * 0.05 }}
                >
                  <Link
                    to={action.path}
                    className={`group block p-10 rounded-[48px] border border-white/5 transition-all hover:border-primary/50 hover:-translate-y-2 ${action.color}`}
                  >
                    <div className="flex justify-between items-start mb-8">
                      <div className="w-16 h-16 rounded-[28px] bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform border border-white/10">
                        <action.icon className="w-8 h-8 text-white group-hover:text-primary transition-colors" />
                      </div>
                      <ArrowRight className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0" />
                    </div>
                    <h3 className="text-2xl font-black mb-2 tracking-tighter uppercase italic">{action.name}</h3>
                    <p className="text-[10px] font-black opacity-40 uppercase tracking-[0.3em]">{action.desc}</p>
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>
        </div>

        {/* Recent Feed Sidebar */}
        <aside className="space-y-8">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-3xl font-black tracking-tighter uppercase italic">Active Feed</h2>
            <Link to="/reports" className="text-primary text-[10px] font-black uppercase tracking-[0.3em] hover:text-white transition-all">Scan All</Link>
          </div>
          <div className="glass rounded-[56px] border border-white/10 overflow-hidden shadow-2xl">
            {recentReports.length > 0 ? (
              <div className="divide-y divide-white/5">
                {recentReports.map((report) => (
                  <Link
                    key={report.id}
                    to={`/reports/${report.id}`}
                    className="flex items-center gap-6 p-8 hover:bg-white/5 transition-all group"
                  >
                    <div className="w-14 h-14 rounded-2xl glass-strong flex items-center justify-center text-primary border border-white/10 group-hover:scale-110 transition-transform">
                      <Zap className="w-7 h-7 shadow-[0_0_15px_rgba(255,92,0,0.5)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black truncate text-xl tracking-tighter uppercase text-white group-hover:text-primary transition-colors italic">{report.title}</p>
                      <p className="text-[10px] text-white/30 font-black truncate uppercase tracking-[0.2em]">{report.location.address}</p>
                    </div>
                    <div className="shrink-0">
                      {report.status === ReportStatus.PENDING ? <div className="w-3 h-3 rounded-full bg-orange-500 animate-pulse shadow-[0_0_15px_rgba(249,115,22,0.8)]" /> :
                       report.status === ReportStatus.IN_PROGRESS ? <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)]" /> :
                       <CheckCircle className="w-6 h-6 text-green-500" />}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="p-24 text-center space-y-6">
                <Target className="w-16 h-16 mx-auto text-white/10" />
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Zero active signals detected.</p>
              </div>
            )}
          </div>
          
          <div className="glass p-10 rounded-[48px] border border-white/5 bg-primary/5">
             <div className="flex items-center gap-4 mb-6">
                <ShieldAlert className="w-7 h-7 text-primary" />
                <h3 className="font-black uppercase tracking-[0.3em] text-[10px] text-white/80">Priority Directive</h3>
             </div>
             <p className="text-xs font-bold text-white/40 leading-relaxed uppercase tracking-wider">
               Always verify animal behavior from a distance before approaching. Neural links updated 4ms ago.
             </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
