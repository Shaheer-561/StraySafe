import { motion } from 'framer-motion';
import { useAuth } from '../lib/auth';
import { PawPrint, Heart, Zap, Award, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  const { signIn } = useAuth();

  const features = [
    {
      title: "Rapid Reporting",
      desc: "Report strays in seconds with location and urgency details.",
      icon: Zap,
      color: "bg-blue-50 text-blue-500"
    },
    {
      title: "Community Rescue",
      desc: "Connect with local volunteers and vets for immediate help.",
      icon: Heart,
      color: "bg-red-50 text-red-500"
    },
    {
      title: "Earn Rewards",
      desc: "Get Grade Points for every rescue and climb the leaderboard.",
      icon: Award,
      color: "bg-orange-50 text-orange-500"
    }
  ];

  return (
    <div className="flex flex-col gap-24 py-12 overflow-hidden">
      {/* Hero Section */}
      <section className="relative">
        <div className="max-w-4xl mx-auto text-center space-y-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 bg-orange-50 text-orange-600 px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider"
          >
            <PawPrint className="w-4 h-4" />
            Empowering Rescuers
          </motion.div>
          
          <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-[0.9] text-balance">
            Every Stray Deserves a <span className="text-orange-500 italic serif">Life.</span>
          </h1>
          
          <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
            StraySafe is a community-driven platform for reporting, tracking, and rescuing stray and injured animals. Join us in making a difference.
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={signIn}
              className="w-full md:w-auto bg-orange-500 text-white px-10 py-5 rounded-2xl text-xl font-black hover:bg-orange-600 transition-all shadow-2xl shadow-orange-200 flex items-center justify-center gap-2"
            >
              Start Rescuing Now
              <ArrowRight className="w-6 h-6" />
            </button>
            <a href="#features" className="text-slate-400 font-bold hover:text-slate-900 transition-colors">
              Explore Features
            </a>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-orange-100/30 rounded-full blur-3xl -z-10" />
      </section>

      {/* Features Grid */}
      <section id="features" className="grid md:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="bg-white p-8 rounded-[40px] border border-orange-50 hover:border-orange-200 transition-all hover:shadow-xl group"
          >
            <div className={`w-14 h-14 ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
              <feature.icon className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black mb-3">{feature.title}</h3>
            <p className="text-slate-500 font-medium leading-relaxed">{feature.desc}</p>
          </motion.div>
        ))}
      </section>

      {/* Social Proof / Stats */}
      <section className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-[50px] p-12 md:p-24 text-slate-900 relative overflow-hidden border border-orange-100">
        <div className="grid md:grid-cols-3 gap-12 text-center">
          <div className="space-y-2">
            <p className="text-5xl font-black text-orange-500">1.2k+</p>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">Animals Rescued</p>
          </div>
          <div className="space-y-2">
            <p className="text-5xl font-black text-orange-500">500+</p>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">Active Volunteers</p>
          </div>
          <div className="space-y-2">
            <p className="text-5xl font-black text-orange-500">15 min</p>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">Avg Response Time</p>
          </div>
        </div>
        
        {/* Background texture */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      </section>
    </div>
  );
}
