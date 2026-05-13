import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Lock, User, AlertCircle } from 'lucide-react';

interface AdminLoginProps {
  onLogin: () => void;
}

export default function AdminLogin({ onLogin }: AdminLoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'mktaibot' && password === 'mktaibot@1') {
      onLogin();
    } else {
      setError('Invalid credentials. Access Denied.');
    }
  };

  return (
    <div className="min-h-screen bg-[#020202] flex items-center justify-center p-6 font-mono">
      <div className="fixed inset-0 pointer-events-none terminal-grid opacity-[0.03]" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md bg-[#0d0d0d] border border-[#F27D26]/20 rounded-2xl p-8 shadow-2xl"
      >
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#F27D26] to-transparent opacity-30" />
        
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="w-16 h-16 bg-[#F27D26]/5 rounded-2xl flex items-center justify-center border border-[#F27D26]/20">
            <ShieldCheck className="text-[#F27D26]" size={32} />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-black tracking-tight uppercase">Core Administration</h3>
            <p className="text-[9px] text-gray-500 font-bold uppercase tracking-[0.2em]">Authorized Access Only</p>
          </div>

          <form onSubmit={handleSubmit} className="w-full space-y-4">
            <div className="space-y-2">
              <label className="text-[8px] text-[#F27D26] uppercase font-black block text-left">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-700" size={14} />
                <input 
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white text-sm outline-none focus:border-[#F27D26]/50"
                  placeholder="ID_NODE"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[8px] text-[#F27D26] uppercase font-black block text-left">Security Phrase</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-700" size={14} />
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white text-sm outline-none focus:border-[#F27D26]/50"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 bg-red-950/20 border border-red-500/20 rounded flex items-center gap-2 text-red-500 text-[8px] font-black uppercase tracking-widest">
                <AlertCircle size={12} /> {error}
              </motion.div>
            )}

            <button 
              type="submit"
              className="w-full py-4 bg-[#F27D26] text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-lg hover:bg-[#FF8C00] transition-all"
            >
              Initialize Command
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
