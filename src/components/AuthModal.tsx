import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Lock, User, AlertCircle, X } from 'lucide-react';
import { api } from '../lib/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: any) => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
      const data = await api.post(endpoint, { username, password });
      localStorage.setItem('mktai_token', data.token);
      onSuccess(data.user);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-[#020202]/90 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-[#0d0d0d] border border-[#F27D26]/20 rounded-2xl p-8 shadow-2xl terminal-border-glow"
          >
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white">
              <X size={20} />
            </button>

            <div className="flex flex-col items-center text-center space-y-6">
              <div className="w-16 h-16 bg-[#F27D26]/5 rounded-2xl flex items-center justify-center border border-[#F27D26]/20">
                <ShieldCheck className="text-[#F27D26]" size={32} />
              </div>
              
              <div className="space-y-1">
                <h3 className="text-xl font-black tracking-tight uppercase">
                  {isLogin ? 'Member Login' : 'Create Account'}
                </h3>
                <p className="text-[9px] text-gray-500 font-bold uppercase tracking-[0.2em]">
                  {isLogin ? 'Access your automated assets' : 'Initialize your trading identity'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="w-full space-y-4">
                <div className="space-y-2">
                  <label className="text-[8px] text-[#F27D26] uppercase font-black block text-left">Internal ID</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-700" size={14} />
                    <input 
                      required
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-black/50 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white text-sm outline-none focus:border-[#F27D26]/50 transition-all"
                      placeholder="USERNAME"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[8px] text-[#F27D26] uppercase font-black block text-left">Cipher Key</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-700" size={14} />
                    <input 
                      required
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-black/50 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white text-sm outline-none focus:border-[#F27D26]/50 transition-all"
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
                  disabled={loading}
                  className="w-full py-4 bg-[#F27D26] text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-lg hover:bg-[#FF8C00] transition-all disabled:opacity-50"
                >
                  {loading ? 'Processing...' : isLogin ? 'Authenticate Access' : 'Register'}
                </button>
              </form>

              <div className="pt-4 border-t border-white/5 w-full">
                <button 
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-[11px] text-gray-400 hover:text-[#F27D26] uppercase font-bold tracking-[0.15em] transition-colors"
                >
                  {isLogin ? "No account? Register" : "Existing identity? Terminal Access"}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
