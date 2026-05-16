import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/auth';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import ReportForm from './pages/ReportForm';
import ReportList from './pages/ReportList';
import ReportDetail from './pages/ReportDetail';
import Guides from './pages/Guides';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import { Loader2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import CustomCursor from './components/CustomCursor';
import ParallaxBackground from './components/ParallaxBackground';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="h-screen w-full flex items-center justify-center bg-[#050505]"><Loader2 className="animate-spin text-primary w-12 h-12" /></div>;
  if (!user) return <Navigate to="/" />;
  return <>{children}</>;
}

function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

function AppContent() {
  const { user } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-primary/30">
      <CustomCursor />
      <ParallaxBackground />
      <Navbar />
      
      <main className="relative z-10">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageWrapper><Landing /></PageWrapper>} />
            <Route path="/dashboard" element={<ProtectedRoute><PageWrapper><div className="container mx-auto px-6 py-12 mb-32"><Dashboard /></div></PageWrapper></ProtectedRoute>} />
            <Route path="/report/new" element={<ProtectedRoute><PageWrapper><div className="container mx-auto px-6 py-12 mb-32"><ReportForm /></div></PageWrapper></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><PageWrapper><div className="container mx-auto px-6 py-12 mb-32"><ReportList /></div></PageWrapper></ProtectedRoute>} />
            <Route path="/reports/:id" element={<ProtectedRoute><PageWrapper><div className="container mx-auto px-6 py-12 mb-32"><ReportDetail /></div></PageWrapper></ProtectedRoute>} />
            <Route path="/guides" element={<ProtectedRoute><PageWrapper><div className="container mx-auto px-6 py-12 mb-32"><Guides /></div></PageWrapper></ProtectedRoute>} />
            <Route path="/leaderboard" element={<ProtectedRoute><PageWrapper><div className="container mx-auto px-6 py-12 mb-32"><Leaderboard /></div></PageWrapper></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><PageWrapper><div className="container mx-auto px-6 py-12 mb-32"><Profile /></div></PageWrapper></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><PageWrapper><div className="container mx-auto px-6 py-12 mb-32"><Admin /></div></PageWrapper></ProtectedRoute>} />
          </Routes>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}
