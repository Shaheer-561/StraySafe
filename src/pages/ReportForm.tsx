import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { db, storage } from '../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore';
import { AnimalType, ReportPriority, ReportStatus } from '../types';
import { handleFirestoreError, OperationType, calculateGrade, compressImage, blobToBase64 } from '../lib/utils';
import { Flag, AlertCircle, MapPin, Loader2, CheckCircle, Stethoscope, Camera } from 'lucide-react';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const customIcon = L.divIcon({
  className: 'custom-icon',
  html: `<div style="background-color: #ff5c00; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.5);"></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

function LocationPicker({ position, setPosition }: { position: any, setPosition: any }) {
  useMapEvents({
    click(e) {
      setPosition({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return position ? <Marker position={position} icon={customIcon} /> : null;
}

export default function ReportForm() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    animalType: AnimalType.DOG,
    priority: ReportPriority.MEDIUM,
    isEmergency: false,
    requiresMedicalHelp: false,
    address: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [position, setPosition] = useState<{lat: number, lng: number} | null>(null);

  React.useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (!position) {
            setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          }
        },
        () => {
          if (!position) {
            setPosition({ lat: 51.505, lng: -0.09 }); // Fallback
          }
        }
      );
    } else {
      setPosition({ lat: 51.505, lng: -0.09 });
    }
  }, []);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;

    setLoading(true);
    try {
      let uploadedImageUrl = '';
      if (imageFile) {
        const compressedBlob = await compressImage(imageFile);
        uploadedImageUrl = await blobToBase64(compressedBlob);
      }

      const reportsRef = collection(db, 'reports');
      const newReport = {
        title: formData.title,
        description: formData.description,
        animalType: formData.animalType,
        priority: formData.isEmergency ? ReportPriority.HIGH : formData.priority,
        isEmergency: formData.isEmergency,
        requiresMedicalHelp: formData.requiresMedicalHelp,
        imageUrl: uploadedImageUrl,
        location: {
          address: formData.address,
          lat: position?.lat || 0,
          lng: position?.lng || 0,
        },
        status: ReportStatus.PENDING,
        reporterId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(reportsRef, newReport);

      // Award points for reporting (+10)
      const newPoints = (profile.gradePoints || 0) + 10;
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        gradePoints: newPoints,
        grade: calculateGrade(newPoints),
        updatedAt: serverTimestamp(),
      });

      // Log activity
      await addDoc(collection(db, 'activityLogs'), {
        userId: user.uid,
        action: 'Submitted a report',
        pointsEarned: 10,
        timestamp: serverTimestamp(),
      });

      setSubmitted(true);
      setTimeout(() => navigate(`/reports/${docRef.id}`), 2000);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'reports');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-md mx-auto text-center py-24 space-y-8">
        <div className="w-24 h-24 bg-green-500/10 text-green-500 rounded-3xl flex items-center justify-center mx-auto border border-green-500/20 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
          <CheckCircle className="w-12 h-12" />
        </div>
        <h2 className="text-4xl font-black text-glow uppercase italic text-white">Report Submitted!</h2>
        <p className="text-white/40 font-black uppercase tracking-widest text-xs"> kindness detected. <span className="text-primary">+10 Grade Points</span>. <br/> Redirecting to console...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-12">
      <header className="space-y-4">
        <h1 className="text-5xl font-black tracking-tighter uppercase italic text-white text-glow">DEPLOY SIGNAL</h1>
        <p className="text-white/30 font-black uppercase tracking-[0.2em] text-[10px]">Initialize a new rescue protocol in the neural network.</p>
      </header>

      <form onSubmit={handleSubmit} className="glass p-12 rounded-[56px] border border-white/10 shadow-2xl space-y-10">
        {/* Title */}
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Mission Title</label>
          <input
            required
            placeholder="e.g. Injured stray dog near central park"
            className="w-full text-xl font-bold p-6 glass-input rounded-3xl text-white placeholder:text-white/10"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
        </div>

        {/* Description */}
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Tactical Intel</label>
          <textarea
            required
            rows={4}
            placeholder="Describe the animal's behavior, injuries, or exact spot..."
            className="w-full text-lg font-medium p-6 glass-input rounded-3xl text-white placeholder:text-white/10 resize-none"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        {/* Animal Type & Priority */}
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Subject Classification</label>
            <select
              className="w-full p-6 glass-input rounded-3xl font-black uppercase tracking-widest text-[10px] text-white appearance-none [&>option]:bg-[#111] [&>option]:text-white"
              value={formData.animalType}
              onChange={(e) => setFormData({ ...formData, animalType: e.target.value as AnimalType })}
            >
              {Object.values(AnimalType).map(type => <option key={type} value={type}>{type}</option>)}
            </select>
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Priority Level</label>
            <select
              disabled={formData.isEmergency}
              className="w-full p-6 glass-input rounded-3xl font-black uppercase tracking-widest text-[10px] text-white appearance-none disabled:opacity-30 [&>option]:bg-[#111] [&>option]:text-white"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as ReportPriority })}
            >
              {Object.values(ReportPriority).map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>

        {/* Location */}
        <div className="space-y-6">
          <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Geospatial Coordinates</label>
          <div className="relative">
            <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-primary w-5 h-5" />
            <input
              required
              placeholder="Enter address or landmark..."
              className="w-full text-lg font-medium p-6 pl-14 glass-input rounded-3xl text-white placeholder:text-white/10"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>

          <div className="h-72 w-full rounded-[40px] overflow-hidden border border-white/10 relative z-0">
            <div className="absolute top-6 left-6 z-[1000] glass-strong px-6 py-2 rounded-full text-white text-[10px] font-black uppercase tracking-[0.2em] pointer-events-none border border-white/10">
              Pin Location
            </div>
            {position ? (
              <MapContainer center={position} zoom={13} style={{ height: '100%', width: '100%' }} zoomControl={false}>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationPicker position={position} setPosition={setPosition} />
              </MapContainer>
            ) : (
              <div className="w-full h-full bg-white/5 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            )}
          </div>
        </div>

        {/* Toggles */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Emergency Toggle */}
          <div 
            onClick={() => setFormData({ ...formData, isEmergency: !formData.isEmergency })}
            className={`cursor-pointer p-8 rounded-[32px] border-2 transition-all flex items-center gap-6 ${
              formData.isEmergency ? 'bg-red-500/10 border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.2)]' : 'bg-white/5 border-white/5 hover:border-white/10'
            }`}
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${formData.isEmergency ? 'bg-red-500 text-white' : 'bg-white/5 text-white/20'}`}>
              <AlertCircle className="w-7 h-7" />
            </div>
            <div className="flex-1">
              <p className="font-black text-lg text-white uppercase italic">Emergency</p>
              <p className="text-[10px] text-white/30 font-black uppercase tracking-widest">Critical</p>
            </div>
            <div className={`w-12 h-6 rounded-full p-1 transition-colors ${formData.isEmergency ? 'bg-red-500' : 'bg-white/10'}`}>
              <motion.div 
                animate={{ x: formData.isEmergency ? 24 : 0 }}
                className="w-4 h-4 bg-white rounded-full shadow-sm" 
              />
            </div>
          </div>

          {/* Medical Help Toggle */}
          <div 
            onClick={() => setFormData({ ...formData, requiresMedicalHelp: !formData.requiresMedicalHelp })}
            className={`cursor-pointer p-8 rounded-[32px] border-2 transition-all flex items-center gap-6 ${
              formData.requiresMedicalHelp ? 'bg-primary/10 border-primary shadow-[0_0_30px_rgba(255,92,0,0.2)]' : 'bg-white/5 border-white/5 hover:border-white/10'
            }`}
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${formData.requiresMedicalHelp ? 'bg-primary text-white' : 'bg-white/5 text-white/20'}`}>
              <Stethoscope className="w-7 h-7" />
            </div>
            <div className="flex-1">
              <p className="font-black text-lg text-white uppercase italic">Medical Aid</p>
              <p className="text-[10px] text-white/30 font-black uppercase tracking-widest">Vet Required</p>
            </div>
            <div className={`w-12 h-6 rounded-full p-1 transition-colors ${formData.requiresMedicalHelp ? 'bg-primary' : 'bg-white/10'}`}>
              <motion.div 
                animate={{ x: formData.requiresMedicalHelp ? 24 : 0 }}
                className="w-4 h-4 bg-white rounded-full shadow-sm" 
              />
            </div>
          </div>
        </div>

        {/* Photo Upload */}
        <div className="space-y-4">
          <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Visual Evidence</label>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageSelect}
            className="hidden"
          />
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {imagePreview && <img src={imagePreview} alt="preview" className="w-24 h-24 rounded-[32px] object-cover border-2 border-white/10" />}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full sm:flex-1 glass-input p-6 rounded-3xl text-white font-black text-[10px] uppercase tracking-[0.3em] hover:border-primary transition-all flex items-center justify-center gap-4 group"
            >
              <Camera className="w-6 h-6 group-hover:text-primary transition-colors" />
              {imagePreview ? 'Re-upload Link' : 'Initialize Capture'}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-white p-8 rounded-[32px] text-xl font-black uppercase tracking-[0.1em] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_20px_50px_rgba(255,92,0,0.3)] disabled:opacity-50 flex items-center justify-center gap-4"
        >
          {loading ? <Loader2 className="animate-spin" /> : <Flag className="w-7 h-7" />}
          Deploy Protocol
        </button>
      </form>
    </div>
  );
}
