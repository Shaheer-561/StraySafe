import React, { useEffect, useState } from 'react';
import { useAuth, Grade } from '../lib/auth';
import { db, storage } from '../lib/firebase';
import { collection, query, where, orderBy, getDocs, limit, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { ActivityLog, UserRole } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Award, Shield, History, Settings, Loader2, CheckCircle, Camera, Edit3, X, Save, BadgeCheck } from 'lucide-react';
import { calculateGrade, handleFirestoreError, OperationType, formatYear, formatDate, compressImage, blobToBase64 } from '../lib/utils';

export default function Profile() {
  const { profile } = useAuth();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Edit State
  const [editName, setEditName] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;
    
    setUploadingImage(true);
    try {
      const compressedBlob = await compressImage(file);
      const base64String = await blobToBase64(compressedBlob);
      
      await updateDoc(doc(db, 'users', profile.uid), {
        photoURL: base64String,
        updatedAt: serverTimestamp()
      });
      
      setEditAvatar(base64String);
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setUploadingImage(false);
    }
  };

  useEffect(() => {
    if (profile) {
      setEditName(profile.displayName);
      setEditAvatar(profile.photoURL || '');
    }
  }, [profile]);

  useEffect(() => {
    async function fetchLogs() {
      if (!profile) return;
      try {
        const q = query(
          collection(db, 'activityLogs'),
          where('userId', '==', profile.uid),
          orderBy('timestamp', 'desc'),
          limit(10)
        );
        const snapshot = await getDocs(q);
        setLogs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ActivityLog)));
      } catch (err) {
        console.error('Error fetching logs:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchLogs();
  }, [profile]);

  const updateProfile = async () => {
    if (!profile || updating) return;
    setUpdating(true);
    try {
      const userRef = doc(db, 'users', profile.uid);
      await updateDoc(userRef, {
        displayName: editName,
        photoURL: editAvatar,
        updatedAt: serverTimestamp(),
      });
      setIsEditing(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${profile.uid}`);
    } finally {
      setUpdating(false);
    }
  };

  const updateRole = async (newRole: UserRole) => {
    if (!profile || updating) return;
    setUpdating(true);
    try {
      const userRef = doc(db, 'users', profile.uid);
      await updateDoc(userRef, {
        role: newRole,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${profile.uid}`);
    } finally {
      setUpdating(false);
    }
  };

  if (!profile) return null;

  const thresholds: Record<Grade, number> = {
    [Grade.E]: 0,
    [Grade.D]: 50,
    [Grade.C]: 200,
    [Grade.B]: 500,
    [Grade.A]: 1000,
    [Grade.S]: 1500,
  };

  const nextGrade = (p: number) => {
    if (p >= 1500) return 'MAX';
    if (p >= 1000) return 'S';
    if (p >= 500) return 'A';
    if (p >= 200) return 'B';
    if (p >= 50) return 'C';
    return 'D';
  };

  const nextThreshold = thresholds[nextGrade(profile.gradePoints) as Grade] || 1500;
  const progress = Math.min((profile.gradePoints / nextThreshold) * 100, 100);

  return (
    <div className="max-w-6xl mx-auto space-y-24">
      <header className="flex flex-col md:flex-row items-center gap-16">
        <div className="relative group">
          <div className="w-56 h-56 glass-strong rounded-[64px] border-4 border-white/10 shadow-[0_0_60px_rgba(255,92,0,0.2)] flex items-center justify-center overflow-hidden transition-all group-hover:scale-105 duration-700">
             <img 
               src={profile.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.displayName}`} 
               alt="avatar" 
               className="w-full h-full object-cover" 
             />
          </div>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-primary text-white rounded-[32px] flex items-center justify-center font-black text-4xl border-[8px] border-[#050505] shadow-2xl italic font-serif">
            {profile.grade}
          </div>
          <button 
            onClick={() => setIsEditing(true)}
            className="absolute top-2 right-2 p-4 glass-strong border border-white/10 rounded-[24px] opacity-0 group-hover:opacity-100 transition-all hover:text-primary"
          >
            <Camera className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 text-center md:text-left space-y-8">
          <div className="space-y-4">
            <div className="flex items-center justify-center md:justify-start gap-6">
              <h1 className="text-7xl md:text-8xl font-black tracking-tighter text-glow text-white uppercase italic leading-none">{profile.displayName}</h1>
              <button 
                onClick={() => setIsEditing(true)}
                className="p-3 text-white/20 hover:text-primary transition-all hover:scale-110"
              >
                <Edit3 className="w-8 h-8" />
              </button>
            </div>
            <p className="text-primary font-black uppercase tracking-[0.4em] text-[10px]">{profile.role} PROTOCOL • ACTIVATED {formatYear(profile.createdAt)}</p>
          </div>
          <div className="flex flex-wrap justify-center md:justify-start gap-6">
             <div className="px-8 py-4 glass-strong rounded-[24px] flex items-center gap-4 text-white font-black text-[10px] uppercase tracking-[0.3em] border border-white/10 shadow-2xl">
              <Award className="w-6 h-6 text-primary" />
              {profile.gradePoints} Merit Points
            </div>
            <div className="px-8 py-4 glass-strong rounded-[24px] flex items-center gap-4 text-white font-black text-[10px] uppercase tracking-[0.3em] border border-white/10 shadow-2xl">
              <Shield className="w-6 h-6 text-blue-500" />
              Verified Node
            </div>
            {profile.role === UserRole.VET && profile.isVerifiedVet && (
              <div className="px-8 py-4 bg-green-500/10 border border-green-500/20 rounded-[24px] flex items-center gap-4 text-green-400 font-black text-[10px] uppercase tracking-[0.3em] shadow-[0_0_30px_rgba(34,197,94,0.2)]">
                <BadgeCheck className="w-6 h-6" />
                Specialist Rank
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="grid lg:grid-cols-2 gap-20">
        {/* Progression */}
        <section className="space-y-10">
          <h2 className="text-3xl font-black tracking-tighter uppercase italic text-white/90">System Rank</h2>
          <div className="glass p-12 rounded-[56px] space-y-12 border border-white/5 relative overflow-hidden group shadow-2xl">
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex justify-between items-end relative z-10">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 mb-3">Clearance Level</p>
                <p className="text-7xl font-black text-primary tracking-tighter italic font-serif">Grade {profile.grade}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 mb-3">Escalation: {nextGrade(profile.gradePoints)}</p>
                <p className="font-black text-3xl tracking-tighter text-white uppercase italic">{profile.gradePoints} / {nextThreshold}</p>
              </div>
            </div>

            <div className="h-6 w-full bg-white/5 rounded-full overflow-hidden p-1.5 border border-white/10 shadow-inner relative">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-primary rounded-full shadow-[0_0_30px_rgba(255,92,0,0.6)]"
                transition={{ duration: 1.5, ease: 'easeOut' }}
              />
            </div>

            <p className="text-xs text-white/30 font-black uppercase tracking-widest leading-relaxed opacity-80">
              Neural analysis indicates {nextThreshold - profile.gradePoints} merit units required for Grade {nextGrade(profile.gradePoints)} escalation.
            </p>
          </div>
        </section>

        {/* Settings & Activity */}
        <section className="space-y-16">
          <div className="space-y-10">
            <h2 className="text-3xl font-black tracking-tighter uppercase italic text-white/90 flex items-center gap-6">
               <Settings className="w-8 h-8 text-primary" /> Configuration
            </h2>
            <div className="glass p-12 rounded-[56px] space-y-10 border border-white/5 shadow-2xl">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 mb-6">Operational Segment</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {[UserRole.REPORTER, UserRole.VOLUNTEER, UserRole.VET].map((r) => (
                    <button
                      key={r}
                      onClick={() => updateRole(r)}
                      disabled={updating || profile.role === r}
                      className={`p-6 rounded-[32px] border transition-all flex items-center justify-between group ${
                        profile.role === r 
                          ? 'bg-primary text-white shadow-[0_0_40px_rgba(255,92,0,0.4)] border-transparent' 
                          : 'bg-white/5 border-white/5 text-white/30 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <span className="font-black text-[10px] tracking-[0.3em] uppercase">{r}</span>
                      {profile.role === r ? <CheckCircle className="w-5 h-5" /> : <Shield className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />}
                    </button>
                  ))}
                </div>
                {profile.role === UserRole.VET && !profile.isVerifiedVet && (
                   <button 
                     onClick={async () => {
                       if (!profile) return;
                       setUpdating(true);
                       try {
                         await updateDoc(doc(db, 'users', profile.uid), { 
                           verificationPending: true,
                           updatedAt: serverTimestamp()
                         });
                       } catch (e) {
                         console.error("Verification failed:", e);
                         alert("Verification failed. Please check Firestore Rules.");
                       } finally {
                         setUpdating(false);
                       }
                     }}
                     disabled={updating || profile.verificationPending}
                     className={`mt-8 w-full p-6 rounded-[32px] border ${profile.verificationPending ? 'border-yellow-500/20 text-yellow-500 bg-yellow-500/5' : 'border-green-500/20 text-green-500 bg-green-500/5 hover:bg-green-500 hover:text-white'} font-black text-[10px] uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-4 disabled:opacity-50`}
                   >
                     {updating ? <Loader2 className="animate-spin w-6 h-6" /> : <BadgeCheck className="w-6 h-6" />}
                     {profile.verificationPending ? 'Pending Audit' : 'Request Credentials Verification'}
                   </button>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-10">
            <h2 className="text-3xl font-black tracking-tighter uppercase italic text-white/90 flex items-center gap-6">
               <History className="w-8 h-8 text-primary" /> Ledger
            </h2>
            <div className="glass rounded-[56px] border border-white/5 overflow-hidden shadow-2xl">
              {loading ? (
                <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-primary w-12 h-12" /></div>
              ) : logs.length > 0 ? (
                <div className="divide-y divide-white/5">
                  {logs.map((log) => (
                    <div key={log.id} className="p-8 flex items-center justify-between hover:bg-white/5 transition-all group">
                      <div className="space-y-2">
                        <p className="font-black text-[10px] tracking-[0.2em] text-white uppercase group-hover:text-primary transition-colors">{log.action}</p>
                        <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">{formatDate(log.timestamp)}</p>
                      </div>
                      <span className="text-3xl font-black text-green-500 italic font-serif">+{log.pointsEarned}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-20 text-center text-white/10 font-black uppercase tracking-[0.5em] text-[10px]">No ledger entries detected.</div>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditing(false)}
              className="absolute inset-0 bg-[#050505]/80 backdrop-blur-3xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="glass-strong w-full max-w-2xl rounded-[64px] border border-white/10 p-16 relative z-10 shadow-[0_0_100px_rgba(0,0,0,0.5)] space-y-12"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-4xl font-black tracking-tighter uppercase italic text-white">Segment Identity</h2>
                <button onClick={() => setIsEditing(false)} className="text-white/20 hover:text-white transition-all hover:rotate-90">
                  <X className="w-10 h-10" />
                </button>
              </div>

              <div className="space-y-10">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Identity Alias</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full glass-input p-6 rounded-3xl text-white font-black text-2xl outline-none transition-all"
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Biometric Visualization</label>
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <div className="flex items-center gap-8">
                    {editAvatar && <img src={editAvatar} alt="preview" className="w-24 h-24 rounded-[32px] object-cover border-2 border-white/10 shadow-2xl" />}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingImage}
                      className="flex-1 glass-input p-6 rounded-3xl text-white font-black text-[10px] uppercase tracking-[0.4em] hover:border-primary transition-all flex items-center justify-center gap-4 disabled:opacity-50"
                    >
                      {uploadingImage ? <Loader2 className="animate-spin w-6 h-6" /> : <Camera className="w-6 h-6" />}
                      {uploadingImage ? 'Uploading Data...' : 'Initialize Data Stream'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-6 pt-6">
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex-1 glass-input p-6 rounded-3xl font-black text-[10px] uppercase tracking-[0.4em] hover:bg-white/10 transition-all text-white"
                >
                  Abort
                </button>
                <button
                  onClick={updateProfile}
                  disabled={updating}
                  className="flex-[2] bg-primary text-white p-6 rounded-3xl font-black text-[10px] uppercase tracking-[0.5em] flex items-center justify-center gap-4 hover:shadow-[0_0_50px_rgba(255,92,0,0.5)] transition-all"
                >
                  {updating ? <Loader2 className="animate-spin w-6 h-6" /> : <Save className="w-6 h-6" />}
                  SYNC SEGMENT
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
