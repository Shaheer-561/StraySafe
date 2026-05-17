import React, { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { Report, ReportStatus, AnimalType } from '../types';
import { formatDate } from '../lib/utils';
import { Link } from 'react-router-dom';
import { Search, Filter, Calendar, MapPin, ChevronRight, PawPrint, Zap, Target, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ReportList() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<ReportStatus | 'All'>('All');

  useEffect(() => {
    const q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setReports(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Report)));
      setLoading(false);
    }, (err) => {
      console.error('Error fetching reports:', err);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         report.location.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || report.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-12">
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
        <div className="space-y-4">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.3em] border border-primary/20"
          >
            <Zap className="w-3 h-3 fill-primary" /> Global Intake
          </motion.div>
          <h1 className="text-6xl font-black tracking-tighter text-glow uppercase italic text-white">RESCUE FEED</h1>
          <p className="text-white/30 font-black uppercase tracking-[0.2em] text-[10px]">Scanning active sectors for signals.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 group-focus-within:text-primary transition-colors" />
            <input
              placeholder="Filter by coordinates..."
              className="pl-14 pr-6 py-5 glass-input rounded-[24px] w-full sm:w-80 font-bold text-white placeholder:text-white/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative group">
            <Filter className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 group-focus-within:text-primary transition-colors" />
            <select
              className="pl-14 pr-10 py-5 glass-input rounded-[24px] appearance-none font-black uppercase tracking-widest text-[10px] text-white w-full sm:w-56 [&>option]:bg-[#111] [&>option]:text-white"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
            >
              <option value="All">All Status</option>
              {Object.values(ReportStatus).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </header>

      <div className="grid gap-6">
        <AnimatePresence mode="popLayout">
          {filteredReports.map((report, idx) => (
            <motion.div
              layout
              key={report.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Link 
                to={`/reports/${report.id}`}
                className="group block glass p-8 rounded-[48px] border border-white/5 transition-all hover:border-primary/40 hover:bg-white/5"
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-10">
                  <div className={`w-24 h-24 rounded-[32px] glass-strong flex items-center justify-center shrink-0 border border-white/10 group-hover:scale-110 transition-transform overflow-hidden ${
                    report.animalType === AnimalType.DOG ? 'text-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)]' :
                    report.animalType === AnimalType.CAT ? 'text-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.2)]' :
                    'text-primary shadow-[0_0_20px_rgba(255,92,0,0.2)]'
                  }`}>
                    {report.imageUrl ? (
                      <img src={report.imageUrl} alt={report.animalType} className="w-full h-full object-cover" />
                    ) : (
                      <Target className="w-10 h-10" />
                    )}
                  </div>

                  <div className="flex-1 space-y-3 min-w-0">
                    <div className="flex items-center gap-4 flex-wrap">
                      <h3 className="text-3xl font-black tracking-tighter uppercase group-hover:text-primary transition-colors font-serif italic text-white">{report.title}</h3>
                      {report.isEmergency ? (
                        <div className="flex items-center gap-2 bg-red-500/10 text-red-500 border border-red-500/20 px-3 py-1 rounded-full animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                          <AlertTriangle className="w-3 h-3" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Emergency Alert</span>
                        </div>
                      ) : report.priority ? (
                        <div className={`flex items-center gap-2 border px-3 py-1 rounded-full ${
                          report.priority === 'High' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.1)]' :
                          report.priority === 'Medium' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20 shadow-[0_0_15px_rgba(234,179,8,0.1)]' :
                          'bg-blue-500/10 text-blue-500 border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]'
                        }`}>
                          <span className="text-[10px] font-black uppercase tracking-widest">Priority: {report.priority}</span>
                        </div>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap items-center gap-6 text-[10px] text-white/30 font-black uppercase tracking-[0.2em]">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-primary" />
                        {report.location.address}
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-primary" />
                        {formatDate(report.createdAt)}
                      </div>
                      <div className="flex items-center gap-2">
                        <PawPrint className="w-4 h-4 text-primary" />
                        {report.animalType}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 justify-between lg:justify-end">
                    <div className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border ${
                      report.status === ReportStatus.PENDING ? 'bg-orange-500/10 text-orange-500 border-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.1)]' :
                      report.status === ReportStatus.IN_PROGRESS ? 'bg-blue-500/10 text-blue-500 border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]' :
                      'bg-green-500/10 text-green-500 border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.1)]'
                    }`}>
                      {report.status}
                    </div>
                    <div className="w-16 h-16 rounded-3xl glass-strong flex items-center justify-center text-white/30 group-hover:bg-primary group-hover:text-white group-hover:shadow-[0_0_30px_rgba(255,92,0,0.5)] border border-white/10 transition-all">
                      <ChevronRight className="w-8 h-8" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>

        {!loading && filteredReports.length === 0 && (
          <div className="text-center py-32 glass rounded-[60px] border-2 border-dashed border-white/5 shadow-2xl">
            <motion.div
              animate={{ opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Target className="w-20 h-20 mx-auto mb-8 text-white/10" />
            </motion.div>
            <p className="text-xl font-black italic font-serif text-white/20 uppercase tracking-widest">NO SIGNALS DETECTED.</p>
          </div>
        )}
      </div>
    </div>
  );
}
