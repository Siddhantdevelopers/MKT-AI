import React from 'react';
import { motion } from 'motion/react';
import { TrendingUp, BarChart3, Shield, Zap, Bell, User, ChevronRight } from 'lucide-react';

interface CardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
  buttonText: string;
  onClick?: () => void;
  isLoading?: boolean;
}

function AnalysisCard({ title, description, icon, features, buttonText, onClick, isLoading }: CardProps) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative group bg-[#0d0d0d] border border-white/10 p-8 rounded-[2rem] overflow-hidden transition-all hover:bg-[#111] hover:border-white/20"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#F27D26]/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="relative z-10">
        <div className="w-14 h-14 bg-gradient-to-br from-[#1a1a1a] to-black border border-white/10 rounded-2xl flex items-center justify-center mb-8 text-[#F27D26] shadow-2xl group-hover:scale-110 transition-transform duration-500">
          {icon}
        </div>
        
        <h3 className="text-2xl font-bold text-white mb-4 tracking-tight">{title}</h3>
        <p className="text-gray-400 text-sm mb-8 leading-relaxed font-medium">
          {description}
        </p>

        <ul className="space-y-4 mb-10">
          {features.map((feature, idx) => (
            <li key={idx} className="flex items-center text-xs text-gray-400 font-semibold uppercase tracking-wider">
              <div className="w-1.5 h-1.5 rounded-full bg-[#F27D26] mr-4 shadow-[0_0_8px_rgba(242,125,38,0.6)]" />
              {feature}
            </li>
          ))}
        </ul>

        <button
          onClick={onClick}
          className="group/btn w-full py-4 px-6 bg-white text-black font-extrabold rounded-2xl flex items-center justify-center gap-3 hover:bg-[#F27D26] hover:text-black transition-all active:scale-[0.98] disabled:opacity-50"
        >
          {isLoading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full"
            />
          ) : (
            <>
              {buttonText}
              <motion.div
                animate={{ x: [0, 4, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <ChevronRight size={18} />
              </motion.div>
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}

import { View } from '../App';

interface DashboardProps {
  onNavigate: (view: View) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-[#F27D26] selection:text-black">
      {/* Navbar */}
      <header className="sticky top-0 z-40 bg-[#050505]/80 backdrop-blur-xl border-b border-white/5 p-4 md:px-12 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#F27D26] to-[#FF8C00] p-[1px] shadow-[0_0_15px_rgba(242,125,38,0.3)]">
            <div className="w-full h-full bg-black rounded-xl flex items-center justify-center overflow-hidden">
               <img 
                 src="https://i.ibb.co/kVH7mzvR/IMG-8546.jpg" 
                 alt="MKT AI" 
                 className="w-full h-full object-cover"
                 referrerPolicy="no-referrer"
               />
            </div>
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm font-black tracking-tighter uppercase leading-none">MKT AI</h1>
            <span className="text-[10px] text-[#F27D26] font-bold uppercase tracking-widest mt-1">Market Terminal</span>
          </div>
        </div>
        
        <nav className="hidden lg:flex items-center gap-10 text-[11px] font-bold text-gray-500 uppercase tracking-widest">
          <a href="#" className="hover:text-white transition-colors flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#F27D26]" /> View Market
          </a>
          <a href="#" className="hover:text-white transition-colors">Signals</a>
          <a href="#" className="hover:text-white transition-colors">Strategies</a>
        </nav>

        <div className="flex items-center gap-4">
          <button className="p-2 text-gray-400 hover:text-white transition-colors relative">
            <Bell size={20} />
            <div className="absolute top-2 right-2 w-2 h-2 bg-[#F27D26] rounded-full border-2 border-[#050505]" />
          </button>
          <div className="flex items-center gap-3 pl-4 border-l border-white/10">
            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
              <User size={18} className="text-gray-400" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 md:px-12 md:py-20 flex flex-col items-center justify-center min-h-[calc(100vh-80px)]">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-4">
            SELECT <span className="text-[#F27D26]">TERMINAL</span>
          </h2>
          <p className="text-gray-500 uppercase tracking-[0.3em] text-[10px] font-black">Choose an analysis module to begin</p>
        </motion.div>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 relative w-full">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#F27D26]/5 rounded-full blur-[100px] pointer-events-none" />
          
          <AnalysisCard
            title="AI Chart Analysis"
            description="Our advanced vision neural networks scan your uploaded charts for patterns, support levels, and momentum oscillators."
            icon={<BarChart3 size={28} />}
            features={[
              "Instant Pattern Recognition",
              "Dynamic Support & Resistance",
              "AI-Generated Trade Insights"
            ]}
            buttonText="Analysis Chart"
            onClick={() => onNavigate('analysis')}
          />
          
          <AnalysisCard
            title="Global Market Signals"
            description="Aggregated data from major exchanges across Forex, Crypto, and Equities to provide actionable real-time signals."
            icon={<TrendingUp size={28} />}
            features={[
              "Cross-Market Correlation",
              "Volume Profile Heatmaps",
              "Institutional Flow Tracker"
            ]}
            buttonText="Launch Signal Hub"
          />
        </section>
      </main>

      <footer className="border-t border-white/5 py-12 px-6 md:px-12 bg-black/50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-4">
            <span className="text-xl font-black uppercase tracking-tighter">MKT AI</span>
            <div className="w-[1px] h-6 bg-white/10" />
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">© 2024 MKT AI Systems</p>
          </div>
          <div className="flex gap-10 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
            <a href="#" className="hover:text-white transition-colors">API Docs</a>
            <a href="#" className="hover:text-white transition-colors">Risk Disclosure</a>
            <button onClick={() => onNavigate('admin')} className="hover:text-[#F27D26] transition-colors">Admin Terminal</button>
          </div>
        </div>
      </footer>
    </div>
  );
}

