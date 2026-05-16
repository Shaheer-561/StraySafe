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
import PageBackground from './components/PageBackground';
import { Loader2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import CustomCursor from './components/CustomCursor';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="h-screen w-full flex items-center justify-center bg-[#0a0908]">
      <Loader2 className="animate-spin text-primary w-12 h-12" />
    </div>
  );
  if (!user) return <Navigate to="/" />;
  return <>{children}</>;
}

function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

const routeBackgrounds: Record<string, { type: 'video' | 'image'; src: string }> = {
  '/dashboard': { type: 'image', src: '/images/hero-image.jpg' },
  '/report/new': { type: 'image', src: '/images/scroll-img-1.jpg' },
  '/reports': { type: 'image', src: '/images/scroll-img-3.jpg' },
  '/guides': { type: 'video', src: '/bg-video-1.mp4' },
  '/leaderboard': { type: 'image', src: '/images/scroll-img-2.jpg' },
  '/profile': { type: 'image', src: '/images/hero-image.jpg' },
  '/admin': { type: 'image', src: '/images/scroll-img-1.jpg' },
};

function AppContent() {
  const location = useLocation();
  const bgKey = Object.keys(routeBackgrounds).find(key => location.pathname.startsWith(key));
  const bg = bgKey ? routeBackgrounds[bgKey] : null;
  const isLanding = location.pathname === '/';

  return (
    <div className="min-h-screen text-[#f5f2ed] bg-[#0a0908]">
      <CustomCursor />
      
      {/* Global Cinematic Texture */}
      <div className="fixed inset-0 pointer-events-none z-[100] opacity-[0.03] mix-blend-overlay" 
           style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }} />

      {/* Dynamic Backgrounds (Conditional) */}
      {!isLanding && bg && <PageBackground type={bg.type} src={bg.src} />}

      <Navbar />
      
      <main className="relative z-10 w-full overflow-x-hidden">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageWrapper><Landing /></PageWrapper>} />
            <Route path="/dashboard" element={<ProtectedRoute><PageWrapper><div className="container mx-auto px-6 py-12 md:py-20 mb-32"><Dashboard /></div></PageWrapper></ProtectedRoute>} />
            <Route path="/report/new" element={<ProtectedRoute><PageWrapper><div className="container mx-auto px-6 py-12 md:py-20 mb-32"><ReportForm /></div></PageWrapper></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><PageWrapper><div className="container mx-auto px-6 py-12 md:py-20 mb-32"><ReportList /></div></PageWrapper></ProtectedRoute>} />
            <Route path="/reports/:id" element={<ProtectedRoute><PageWrapper><div className="container mx-auto px-6 py-12 md:py-20 mb-32"><ReportDetail /></div></PageWrapper></ProtectedRoute>} />
            <Route path="/guides" element={<ProtectedRoute><PageWrapper><div className="container mx-auto px-6 py-12 md:py-20 mb-32"><Guides /></div></PageWrapper></ProtectedRoute>} />
            <Route path="/leaderboard" element={<ProtectedRoute><PageWrapper><div className="container mx-auto px-6 py-12 md:py-20 mb-32"><Leaderboard /></div></PageWrapper></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><PageWrapper><div className="container mx-auto px-6 py-12 md:py-20 mb-32"><Profile /></div></PageWrapper></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><PageWrapper><div className="container mx-auto px-6 py-12 md:py-20 mb-32"><Admin /></div></PageWrapper></ProtectedRoute>} />
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
