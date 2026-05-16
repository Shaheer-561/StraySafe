import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, storage } from '../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, getDoc, updateDoc, serverTimestamp, addDoc, collection } from 'firebase/firestore';
import { Report, ReportStatus, UserRole } from '../types';
import { useAuth } from '../lib/auth';
import { handleFirestoreError, OperationType, calculateGrade, formatDate, compressImage, blobToBase64 } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Calendar, User, Clock, CheckCircle, Shield, AlertCircle, Loader2, ArrowLeft, Camera, Send } from 'lucide-react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const customIcon = L.divIcon({
  className: 'custom-icon',
  html: `<div style="background-color: #ff5c00; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.5);"></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

export default function ReportDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showConfirmForm, setShowConfirmForm] = useState(false);
  
  // Rescue Form State
  const [rescueNotes, setRescueNotes] = useState('');
  const [rescueImage, setRescueImage] = useState('');
  const [freeHelpProvided, setFreeHelpProvided] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  useEffect(() => {
    async function fetchReport() {
      if (!id) return;
      try {
        const docRef = doc(db, 'reports', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setReport({ id: docSnap.id, ...docSnap.data() } as Report);
        }
      } catch (err) {
        console.error('Error fetching report:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchReport();
  }, [id]);

  const updateStatus = async (newStatus: ReportStatus) => {
    if (!report || !id || !profile) return;
    setUpdating(true);
    try {
      const reportRef = doc(db, 'reports', id);
      let finalImageUrl = rescueImage;

      if (newStatus === ReportStatus.RESOLVED && imageFile) {
        setUploadingImage(true);
        const compressedBlob = await compressImage(imageFile);
        finalImageUrl = await blobToBase64(compressedBlob);
        setUploadingImage(false);
      }

      const updateData: any = {
        status: newStatus,
        updatedAt: serverTimestamp(),
      };

      if (newStatus === ReportStatus.IN_PROGRESS) {
        updateData.assignedVolunteerId = profile.uid;
      }

      if (newStatus === ReportStatus.RESOLVED) {
        updateData.rescueDetails = {
          notes: rescueNotes,
          image: finalImageUrl,
          freeHelpProvided,
          completedAt: serverTimestamp(),
        };
      }

      await updateDoc(reportRef, updateData);
      
      // If resolved, award points to the volunteer/staff (+25)
      if (newStatus === ReportStatus.RESOLVED) {
        const pointsToAward = freeHelpProvided ? 50 : 25;
        const newPoints = (profile.gradePoints || 0) + pointsToAward;
        const userRef = doc(db, 'users', profile.uid);
        await updateDoc(userRef, {
          gradePoints: newPoints,
          grade: calculateGrade(newPoints),
          updatedAt: serverTimestamp(),
        });

        await addDoc(collection(db, 'activityLogs'), {
          userId: profile.uid,
          action: `Resolved report: ${report.title}`,
          pointsEarned: pointsToAward,
          timestamp: serverTimestamp(),
        });
        setShowConfirmForm(false);
      }

      setReport({ ...report, ...updateData, status: newStatus });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `reports/${id}`);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary w-12 h-12" /></div>;
  if (!report) return <div className="text-center py-24"><p className="text-xl font-bold">Report not found.</p></div>;

  const isStaff = profile?.role !== UserRole.REPORTER;
  const isOwner = report.reporterId === profile?.uid;
  const isAssigned = report.assignedVolunteerId === profile?.uid;

  const timeline = [
    { label: 'Reported', status: ReportStatus.PENDING, icon: Clock },
    { label: 'Rescue Active', status: ReportStatus.IN_PROGRESS, icon: Shield },
    { label: 'Completed', status: ReportStatus.RESOLVED, icon: CheckCircle },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white/30 font-black uppercase tracking-[0.2em] text-[10px] hover:text-white transition-all group mb-8">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-2 transition-transform" /> Back to Intelligence
      </button>

      <div className="grid lg:grid-cols-3 gap-16">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-16">
          <header className="space-y-8">
            <div className="flex flex-wrap items-center gap-4">
              <div className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] shadow-xl ${
                report.status === ReportStatus.PENDING ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' :
                report.status === ReportStatus.IN_PROGRESS ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' :
                'bg-green-500/10 text-green-500 border border-green-500/20'
              }`}>
                {report.status}
              </div>
              <div className="glass-strong text-white/40 text-[10px] font-black px-5 py-2 rounded-full uppercase tracking-[0.3em] border border-white/10">
                {report.animalType}
              </div>
              {report.isEmergency && (
                <div className="bg-red-500/10 text-red-500 text-[10px] font-black px-5 py-2 rounded-full uppercase tracking-[0.3em] border border-red-500/30 animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                  Priority Directive
                </div>
              )}
            </div>
            <h1 className="text-7xl md:text-8xl font-black tracking-tighter text-glow text-white uppercase italic leading-none">{report.title}</h1>
            <div className="flex flex-wrap items-center gap-8 text-white/30 font-black uppercase tracking-[0.3em] text-[10px]">
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-primary" />
                {report.location.address}
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-primary" />
                {formatDate(report.createdAt)}
              </div>
            </div>
          </header>

          {report.imageUrl && (
            <div className="rounded-[56px] overflow-hidden border border-white/10 h-[500px] w-full relative mb-12 shadow-2xl">
              <img src={report.imageUrl} alt="Reported Animal" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>
          )}

          <div className="glass p-12 rounded-[56px] space-y-8 border border-white/5">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Mission Brief</h3>
            <p className="text-2xl leading-relaxed text-white/80 font-medium whitespace-pre-wrap">{report.description}</p>
          </div>

          {report.location?.lat && report.location?.lng ? (
            <div className="h-80 w-full rounded-[56px] overflow-hidden border border-white/10 relative z-0 shadow-2xl">
              <MapContainer center={[report.location.lat, report.location.lng]} zoom={15} style={{ height: '100%', width: '100%' }} zoomControl={false} dragging={false} scrollWheelZoom={false} doubleClickZoom={false} touchZoom={false}>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[report.location.lat, report.location.lng]} icon={customIcon} />
              </MapContainer>
            </div>
          ) : null}

          {/* Rescue Timeline */}
          <section className="space-y-8">
            <h2 className="text-3xl font-black tracking-tighter uppercase italic text-white/90">Rescue Timeline</h2>
            <div className="glass p-12 rounded-[56px] relative overflow-hidden shadow-2xl border border-white/5">
               <div className="relative flex justify-between">
                <div className="absolute top-12 left-[15%] right-[15%] h-[2px] bg-white/5 -z-0" />
                
                {timeline.map((step, idx) => {
                  const isPast = report.status === step.status || 
                                (report.status === ReportStatus.RESOLVED) || 
                                (report.status === ReportStatus.IN_PROGRESS && step.status === ReportStatus.PENDING);

                  return (
                    <div key={idx} className="relative z-10 flex flex-col items-center gap-6 text-center w-1/3">
                      <div className={`w-24 h-24 rounded-[36px] flex items-center justify-center transition-all duration-700 ${
                        isPast ? 'bg-primary text-white scale-110 shadow-[0_0_50px_rgba(255,92,0,0.4)]' : 'bg-white/5 text-white/10 border border-white/5'
                      }`}>
                        <step.icon className="w-10 h-10" />
                      </div>
                      <p className={`text-[10px] font-black uppercase tracking-[0.3em] ${isPast ? 'text-white' : 'text-white/10'}`}>
                        {step.label}
                      </p>
                    </div>
                  );
                })}
               </div>
            </div>
          </section>

          {/* Rescue Completion Info */}
          {report.status === ReportStatus.RESOLVED && report.rescueDetails && (
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <h2 className="text-3xl font-black tracking-tighter uppercase italic">Resolution Report</h2>
              <div className="glass p-12 rounded-[56px] border-l-8 border-l-green-500 space-y-8 shadow-2xl border border-white/5">
                {report.rescueDetails.image && (
                  <img src={report.rescueDetails.image} alt="Rescue" className="w-full h-96 object-cover rounded-[40px] mb-8 shadow-xl" />
                )}
                <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-green-500 flex items-center gap-3">
                    <CheckCircle className="w-5 h-5" /> Mission Accomplished
                  </p>
                  <p className="text-3xl text-white font-medium leading-relaxed italic">
                    "{report.rescueDetails.notes}"
                  </p>
                </div>
              </div>
            </motion.section>
          )}
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-12">
           <section className="glass-strong p-12 rounded-[56px] shadow-2xl relative overflow-hidden group border border-white/10">
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10 space-y-10">
                <div className="flex items-center gap-5 border-b border-white/5 pb-8">
                  <Shield className="w-8 h-8 text-primary" />
                  <h2 className="text-2xl font-black tracking-tighter uppercase italic text-white">Consensus</h2>
                </div>

                <AnimatePresence mode="wait">
                  {!showConfirmForm ? (
                    <motion.div 
                      key="actions"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-8"
                    >
                      {report.status === ReportStatus.PENDING && isStaff && !isOwner && (
                        report.requiresMedicalHelp && !(profile.role === UserRole.VET && profile.isVerifiedVet) ? (
                          <div className="glass p-8 rounded-[40px] border border-red-500/20 bg-red-500/5 text-center space-y-4">
                             <AlertCircle className="w-8 h-8 text-red-500 mx-auto animate-pulse" />
                             <p className="text-red-400 font-black text-sm uppercase tracking-widest">Medical Lock</p>
                             <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest leading-relaxed">Only Verified Vets can authorize this rescue.</p>
                          </div>
                        ) : (
                          <button
                            onClick={() => updateStatus(ReportStatus.IN_PROGRESS)}
                            disabled={updating}
                            className="w-full bg-white text-black p-8 rounded-[32px] font-black text-xl hover:bg-primary hover:text-white transition-all hover:shadow-[0_0_50px_rgba(255,92,0,0.4)] flex items-center justify-center gap-4 disabled:opacity-50"
                          >
                            {updating ? <Loader2 className="animate-spin w-8 h-8" /> : <Clock className="w-8 h-8" />}
                            INITIALIZE
                          </button>
                        )
                      )}

                      {report.status === ReportStatus.IN_PROGRESS && isAssigned && (
                        <button
                          onClick={() => setShowConfirmForm(true)}
                          disabled={updating}
                          className="w-full bg-primary text-white p-8 rounded-[32px] font-black text-xl hover:shadow-[0_0_50px_rgba(255,92,0,0.5)] transition-all flex items-center justify-center gap-4 disabled:opacity-50"
                        >
                          <CheckCircle className="w-8 h-8" />
                          RESOLVE
                        </button>
                      )}

                      {report.status === ReportStatus.RESOLVED ? (
                        <div className="p-8 bg-green-500/10 border border-green-500/20 rounded-[40px] flex items-center gap-6 text-green-500 shadow-xl">
                          <CheckCircle className="w-10 h-10 shrink-0" />
                          <p className="font-black text-xs uppercase tracking-[0.3em]">Neural Link Secure</p>
                        </div>
                      ) : (
                        <div className="glass p-8 rounded-[40px] border border-white/5 space-y-6 shadow-xl">
                           <div className="flex items-center gap-4">
                            <AlertCircle className="w-6 h-6 text-primary" />
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Status</p>
                           </div>
                           <p className="text-xs font-bold text-white/30 leading-relaxed uppercase tracking-widest">
                            {report.status === ReportStatus.PENDING 
                              ? "Awaiting node deployment."
                              : "Rescue link active. Dispatch confirmed."}
                           </p>
                        </div>
                      )}
                      
                      {!isStaff && !isOwner && report.status !== ReportStatus.RESOLVED && (
                        <p className="text-white/20 font-black text-[10px] uppercase tracking-[0.3em] text-center mt-6">
                          Elevate rank to contribute
                        </p>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="confirm-form"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-8"
                    >
                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Mission Outcome</label>
                        <textarea
                          value={rescueNotes}
                          onChange={(e) => setRescueNotes(e.target.value)}
                          placeholder="Initialize resolution notes..."
                          className="w-full glass-input p-6 rounded-3xl text-white placeholder:text-white/10 outline-none h-40 resize-none font-medium shadow-2xl"
                        />
                      </div>
                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Visual Confirmation</label>
                        <input
                          type="file"
                          accept="image/*"
                          ref={fileInputRef}
                          onChange={handleImageSelect}
                          className="hidden"
                        />
                        <div className="flex flex-col gap-6">
                          {imagePreview && <img src={imagePreview} alt="preview" className="w-full h-48 rounded-[32px] object-cover border-2 border-white/10 shadow-2xl" />}
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploadingImage}
                            className="w-full glass-input p-6 rounded-3xl text-white font-black text-[10px] uppercase tracking-[0.4em] hover:border-primary transition-all flex items-center justify-center gap-4 disabled:opacity-50"
                          >
                            {uploadingImage ? <Loader2 className="animate-spin w-6 h-6" /> : <Camera className="w-6 h-6" />}
                            {uploadingImage ? 'Uploading...' : (imagePreview ? 'Re-link Capture' : 'Initialize Capture')}
                          </button>
                        </div>
                      </div>
                      
                      {profile.role === UserRole.VET && report.requiresMedicalHelp && (
                        <div 
                          onClick={() => setFreeHelpProvided(!freeHelpProvided)}
                          className={`cursor-pointer p-6 rounded-[32px] border-2 transition-all flex items-center gap-4 shadow-xl ${
                            freeHelpProvided ? 'bg-green-500/10 border-green-500 text-green-500' : 'bg-white/5 border-white/5 text-white/20'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${freeHelpProvided ? 'bg-green-500 text-white' : 'bg-white/10'}`}>
                            {freeHelpProvided && <CheckCircle className="w-6 h-6" />}
                          </div>
                          <p className="text-[10px] font-black uppercase tracking-widest">Medical Relief (+50 Grade)</p>
                        </div>
                      )}

                      <div className="flex gap-4 pt-6">
                        <button
                          onClick={() => setShowConfirmForm(false)}
                          className="flex-1 glass-input p-6 rounded-3xl font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all text-white"
                        >
                          Abort
                        </button>
                        <button
                          onClick={() => updateStatus(ReportStatus.RESOLVED)}
                          disabled={!rescueNotes || updating}
                          className="flex-[2] bg-primary text-white p-6 rounded-3xl font-black text-[10px] uppercase tracking-[0.4em] hover:shadow-[0_0_40px_rgba(255,92,0,0.4)] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                          {updating ? <Loader2 className="animate-spin w-6 h-6" /> : <Send className="w-6 h-6" />}
                          Finalize
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
           </section>

           <section className="glass p-12 rounded-[56px] space-y-8 border border-white/5 shadow-2xl">
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30">Node Identity</h3>
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 glass-strong rounded-[24px] flex items-center justify-center text-primary border border-white/10 shadow-2xl">
                  <User className="w-10 h-10" />
                </div>
                <div>
                  <p className="font-black text-2xl tracking-tighter text-white uppercase italic">Observer Unit</p>
                  <p className="text-[10px] text-primary font-black uppercase tracking-[0.3em] mt-2">Verified Segment</p>
                </div>
              </div>
           </section>
        </div>
      </div>
    </div>
  );
}
