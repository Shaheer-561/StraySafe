import React, { useEffect, useState } from 'react';
import { useAuth, UserProfile } from '../lib/auth';
import { db } from '../lib/firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { Report } from '../types';
import { Shield, Trash2, CheckCircle, XCircle, Users, User, FileText, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function Admin() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'vets' | 'users' | 'reports'>('vets');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const isAdmin = profile?.email === 'shaheerirfan928@gmail.com' || profile?.role === 'admin';

  useEffect(() => {
    if (profile && !isAdmin) {
      navigate('/');
    }
  }, [profile, isAdmin, navigate]);

  useEffect(() => {
    async function fetchData() {
      if (!isAdmin) return;
      try {
        const usersSnap = await getDocs(collection(db, 'users'));
        setUsers(usersSnap.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile)));

        const reportsQuery = query(collection(db, 'reports'), orderBy('createdAt', 'desc'));
        const reportsSnap = await getDocs(reportsQuery);
        setReports(reportsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Report)));
      } catch (error) {
        console.error('Error fetching admin data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [isAdmin]);

  const approveVet = async (uid: string) => {
    setProcessingId(uid);
    try {
      await updateDoc(doc(db, 'users', uid), {
        isVerifiedVet: true,
        verificationPending: false
      });
      setUsers(users.map(u => u.uid === uid ? { ...u, isVerifiedVet: true, verificationPending: false } : u));
    } catch (e) {
      console.error(e);
      alert('Failed to approve vet.');
    } finally {
      setProcessingId(null);
    }
  };

  const rejectVet = async (uid: string) => {
    setProcessingId(uid);
    try {
      await updateDoc(doc(db, 'users', uid), {
        verificationPending: false
      });
      setUsers(users.map(u => u.uid === uid ? { ...u, verificationPending: false } : u));
    } catch (e) {
      console.error(e);
      alert('Failed to reject vet.');
    } finally {
      setProcessingId(null);
    }
  };

  const deleteUser = async (uid: string) => {
    if (!window.confirm('Are you sure you want to delete this user profile? They will lose access to the app.')) return;
    setProcessingId(uid);
    try {
      await deleteDoc(doc(db, 'users', uid));
      setUsers(users.filter(u => u.uid !== uid));
    } catch (e) {
      console.error(e);
      alert('Failed to delete user.');
    } finally {
      setProcessingId(null);
    }
  };

  const deleteReport = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this report?')) return;
    setProcessingId(id);
    try {
      await deleteDoc(doc(db, 'reports', id));
      setReports(reports.filter(r => r.id !== id));
    } catch (e) {
      console.error(e);
      alert('Failed to delete report.');
    } finally {
      setProcessingId(null);
    }
  };

  if (!isAdmin) return null;

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  const pendingVets = users.filter(u => u.verificationPending);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-12"
    >
      <header className="space-y-6">
        <div className="inline-block px-8 py-3 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 font-black text-[10px] uppercase tracking-[0.4em] shadow-[0_0_30px_rgba(239,68,68,0.1)]">
          Super Admin Console
        </div>
        <h1 className="text-7xl font-black tracking-tighter text-white uppercase italic text-glow leading-none">SYSTEM CONTROL</h1>
        <p className="text-white/20 font-black uppercase tracking-[0.3em] text-[10px]">High-clearance access granted. Monitor all nodes and protocols.</p>
      </header>

      <div className="flex gap-6 overflow-x-auto pb-6 hide-scrollbar">
        {[
          { id: 'vets', label: 'Clearance Requests', icon: Shield, count: pendingVets.length },
          { id: 'users', label: 'Node Network', icon: Users, count: users.length },
          { id: 'reports', label: 'Signal Log', icon: FileText, count: reports.length }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-shrink-0 flex items-center gap-4 px-10 py-6 rounded-[32px] font-black text-[10px] uppercase tracking-[0.3em] transition-all border ${
              activeTab === tab.id 
                ? 'bg-primary text-white shadow-[0_0_40px_rgba(255,92,0,0.4)] border-transparent' 
                : 'glass text-white/20 hover:text-white border-white/5 hover:border-white/10'
            }`}
          >
            <tab.icon className="w-6 h-6" />
            {tab.label}
            {tab.count > 0 && (
              <span className="bg-white/10 px-3 py-1 rounded-full text-[10px] ml-2">{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      <div className="glass p-12 rounded-[64px] border border-white/5 min-h-[60vh] shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 opacity-10 pointer-events-none" />
        <div className="relative z-10">
          {activeTab === 'vets' && (
            <div className="space-y-6">
              {pendingVets.length === 0 ? (
                <div className="text-center py-32 space-y-6">
                  <Shield className="w-20 h-20 text-white/5 mx-auto" />
                  <p className="text-white/20 font-black text-[10px] uppercase tracking-[0.5em]">No pending clearance requests detected.</p>
                </div>
              ) : (
                pendingVets.map(user => (
                  <div key={user.uid} className="glass-strong p-10 rounded-[40px] border border-white/5 flex flex-col lg:flex-row lg:items-center justify-between gap-10 hover:bg-white/5 transition-all shadow-xl">
                    <div className="flex items-center gap-8">
                      <div className="w-20 h-20 rounded-[24px] glass-strong border border-white/10 overflow-hidden shadow-2xl">
                         <img src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.displayName}`} alt="avatar" className="w-full h-full object-cover" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-black text-2xl text-white uppercase italic tracking-tighter">{user.displayName || 'Unknown Unit'}</h3>
                        <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.2em]">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <button
                        onClick={() => approveVet(user.uid)}
                        disabled={processingId === user.uid}
                        className="flex-1 lg:flex-none flex items-center justify-center gap-4 px-10 py-5 bg-green-500/10 text-green-500 border border-green-500/20 rounded-[24px] font-black text-[10px] uppercase tracking-[0.3em] hover:bg-green-500 hover:text-white transition-all disabled:opacity-50 shadow-xl"
                      >
                        {processingId === user.uid ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                        Authorize
                      </button>
                      <button
                        onClick={() => rejectVet(user.uid)}
                        disabled={processingId === user.uid}
                        className="flex-1 lg:flex-none flex items-center justify-center gap-4 px-10 py-5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-[24px] font-black text-[10px] uppercase tracking-[0.3em] hover:bg-red-500 hover:text-white transition-all disabled:opacity-50 shadow-xl"
                      >
                        {processingId === user.uid ? <Loader2 className="w-5 h-5 animate-spin" /> : <XCircle className="w-5 h-5" />}
                        Decline
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-6">
              {users.map(user => (
                <div key={user.uid} className="glass-strong p-10 rounded-[40px] border border-white/5 flex flex-col lg:flex-row lg:items-center justify-between gap-10 hover:bg-white/5 transition-all shadow-xl">
                  <div className="flex-1">
                    <h3 className="font-black text-2xl text-white uppercase italic tracking-tighter flex items-center gap-4">
                      {user.displayName || 'Unknown Unit'}
                      {user.role === 'admin' && <Shield className="w-6 h-6 text-primary" />}
                      {user.isVerifiedVet && <Shield className="w-6 h-6 text-green-500" />}
                    </h3>
                    <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.2em] mt-2">{user.email}</p>
                    <div className="flex gap-4 mt-6">
                      <span className="px-5 py-2 glass rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10 text-white/50">{user.role} Segment</span>
                      <span className="px-5 py-2 glass rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10 text-primary">Rank {user.grade}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteUser(user.uid)}
                    disabled={processingId === user.uid || user.email === 'shaheerirfan928@gmail.com'}
                    className="flex items-center justify-center gap-4 px-10 py-5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-[24px] font-black text-[10px] uppercase tracking-[0.3em] hover:bg-red-500 hover:text-white transition-all disabled:opacity-50 shadow-xl"
                  >
                    {processingId === user.uid ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                    Decommission
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="space-y-6">
              {reports.map(report => (
                <div key={report.id} className="glass-strong p-10 rounded-[40px] border border-white/5 flex flex-col lg:flex-row lg:items-center justify-between gap-10 hover:bg-white/5 transition-all shadow-xl">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <span className="px-5 py-2 glass rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10 text-primary">
                        {report.status}
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/20">
                        Signal: {new Date(report.createdAt?.toDate?.() || Date.now()).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="font-black text-2xl text-white uppercase italic tracking-tighter">{report.title}</h3>
                    <p className="text-white/30 text-sm font-medium mt-3 line-clamp-2 leading-relaxed">{report.description}</p>
                  </div>
                  <button
                    onClick={() => deleteReport(report.id)}
                    disabled={processingId === report.id}
                    className="flex-shrink-0 flex items-center justify-center gap-4 px-10 py-5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-[24px] font-black text-[10px] uppercase tracking-[0.3em] hover:bg-red-500 hover:text-white transition-all disabled:opacity-50 shadow-xl"
                  >
                    {processingId === report.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                    Purge Signal
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
