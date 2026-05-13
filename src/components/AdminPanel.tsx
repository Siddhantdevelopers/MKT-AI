import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { LayoutDashboard, Users, Key, Clock, ShieldCheck, ArrowLeft, Plus, Trash2, CheckCircle2 } from 'lucide-react';

interface License {
  id: string;
  key: string;
  days: number;
  maxClaims: number;
  claims: number;
  createdAt: string;
}

interface AdminPanelProps {
  onBack: () => void;
}

export default function AdminPanel({ onBack }: AdminPanelProps) {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [newKey, setNewKey] = useState('');
  const [days, setDays] = useState(30);
  const [maxClaims, setMaxClaims] = useState(1);
  const [activeTab, setActiveTab] = useState<'overview' | 'licenses'>('overview');

  useEffect(() => {
    const saved = localStorage.getItem('mkt_licenses');
    if (saved) setLicenses(JSON.parse(saved));
  }, []);

  const saveLicenses = (updated: License[]) => {
    setLicenses(updated);
    localStorage.setItem('mkt_licenses', JSON.stringify(updated));
  };

  const generateKey = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'MKT-';
    for (let i = 0; i < 12; i++) {
        if (i > 0 && i % 4 === 0) result += '-';
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewKey(result);
  };

  const addLicense = () => {
    if (!newKey) return;
    const license: License = {
      id: crypto.randomUUID(),
      key: newKey,
      days,
      maxClaims,
      claims: 0,
      createdAt: new Date().toISOString()
    };
    saveLicenses([license, ...licenses]);
    setNewKey('');
  };

  const deleteLicense = (id: string) => {
    saveLicenses(licenses.filter(l => l.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#020202] text-white font-mono selection:bg-[#F27D26]/30">
      {/* Grid Background */}
      <div className="fixed inset-0 pointer-events-none terminal-grid opacity-[0.03]" />

      <header className="sticky top-0 z-40 bg-[#020202]/80 backdrop-blur-xl border-b border-[#F27D26]/10 p-4 md:px-12 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <button 
            onClick={onBack}
            className="w-10 h-10 flex items-center justify-center hover:bg-white/5 rounded-full transition-colors text-gray-400 hover:text-white border border-white/5"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex flex-col">
            <h1 className="text-[10px] font-black tracking-tight uppercase leading-none text-[#F27D26]">SYSTEM CORE</h1>
            <span className="text-[7px] text-gray-500 font-bold uppercase tracking-[0.2em] mt-1">ADMINISTRATION TERMINAL</span>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-12 md:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Navigation Sidebar */}
          <div className="space-y-2">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg border transition-all text-[10px] uppercase font-black tracking-widest ${activeTab === 'overview' ? 'bg-[#F27D26]/10 border-[#F27D26]/30 text-[#F27D26]' : 'border-transparent text-gray-500 hover:text-white'}`}
            >
              <LayoutDashboard size={16} /> Dashboard
            </button>
            <button 
              onClick={() => setActiveTab('licenses')}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg border transition-all text-[10px] uppercase font-black tracking-widest ${activeTab === 'licenses' ? 'bg-[#F27D26]/10 border-[#F27D26]/30 text-[#F27D26]' : 'border-transparent text-gray-500 hover:text-white'}`}
            >
              <Key size={16} /> License Management
            </button>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl space-y-4">
                  <div className="flex justify-between items-start">
                    <Users size={20} className="text-[#F27D26]" />
                  </div>
                  <div>
                    <p className="text-[8px] text-gray-500 uppercase font-black tracking-widest">Active Users</p>
                    <p className="text-3xl font-black">0</p>
                  </div>
                </div>
                <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl space-y-4">
                  <div className="flex justify-between items-start">
                    <Key size={20} className="text-[#F27D26]" />
                  </div>
                  <div>
                    <p className="text-[8px] text-gray-500 uppercase font-black tracking-widest">Total Licenses</p>
                    <p className="text-3xl font-black">{licenses.length}</p>
                  </div>
                </div>
                <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl space-y-4">
                  <div className="flex justify-between items-start">
                    <ShieldCheck size={20} className="text-[#F27D26]" />
                  </div>
                  <div>
                    <p className="text-[8px] text-gray-500 uppercase font-black tracking-widest">Cloud Sync</p>
                    <p className="text-3xl font-black">OK</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'licenses' && (
              <div className="space-y-8">
                {/* Generation Card */}
                <div className="bg-white/[0.02] border border-white/5 p-8 rounded-2xl space-y-6">
                  <h3 className="text-xs font-black uppercase tracking-[0.3em] flex items-center gap-3">
                    <Plus size={14} className="text-[#F27D26]" /> 
                    Generate Neural Access Code
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                       <label className="text-[7px] text-gray-500 uppercase font-black">Access Duration (Days)</label>
                       <input 
                         type="number" 
                         value={days} 
                         onChange={(e) => setDays(Number(e.target.value))}
                         className="w-full bg-[#111] border border-white/10 rounded px-3 py-2 text-xs focus:border-[#F27D26]/50 outline-none"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[7px] text-gray-500 uppercase font-black">Max Unit Claims</label>
                       <input 
                         type="number" 
                         value={maxClaims} 
                         onChange={(e) => setMaxClaims(Number(e.target.value))}
                         className="w-full bg-[#111] border border-white/10 rounded px-3 py-2 text-xs focus:border-[#F27D26]/50 outline-none"
                       />
                    </div>
                    <div className="flex items-end">
                       <button onClick={generateKey} className="w-full h-10 border border-[#F27D26]/30 bg-[#F27D26]/5 text-[#F27D26] text-[8px] font-black uppercase tracking-widest rounded hover:bg-[#F27D26]/10 transition-all">
                         Randomize Hash
                       </button>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-1 bg-black border border-white/10 rounded-lg p-3 flex items-center justify-between">
                       <span className={`text-[10px] font-black tracking-widest ${newKey ? 'text-white' : 'text-gray-700'}`}>
                         {newKey || 'HASH_NOT_GENERATED'}
                       </span>
                    </div>
                    <button 
                      onClick={addLicense}
                      disabled={!newKey}
                      className="px-8 bg-[#F27D26] text-black text-[9px] font-black uppercase tracking-[0.2em] rounded hover:bg-[#FF8C00] disabled:opacity-20 transition-all shadow-lg shadow-[#F27D26]/20"
                    >
                      Provision Key
                    </button>
                  </div>
                </div>

                {/* Table */}
                <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden">
                  <div className="p-4 border-b border-white/5 bg-white/[0.02]">
                    <h3 className="text-[8px] font-black uppercase tracking-[0.4em] text-gray-500">Active Access Tokens</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-white/5 text-[7px] text-gray-500 uppercase font-black tracking-widest">
                          <th className="p-4">Neural Token</th>
                          <th className="p-4">Duration</th>
                          <th className="p-4">Usage</th>
                          <th className="p-4">Created</th>
                          <th className="p-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {licenses.map((l) => (
                          <tr key={l.id} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors">
                            <td className="p-4">
                               <div className="flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-green-500/50" />
                                  <span className="text-[10px] font-bold text-white tracking-widest">{l.key}</span>
                               </div>
                            </td>
                            <td className="p-4 text-[9px] text-gray-400">{l.days} Days</td>
                            <td className="p-4 text-[9px]">
                               <span className={l.claims >= l.maxClaims ? 'text-red-400' : 'text-green-400'}>
                                 {l.claims} / {l.maxClaims}
                               </span>
                            </td>
                            <td className="p-4 text-[8px] text-gray-600">{new Date(l.createdAt).toLocaleDateString()}</td>
                            <td className="p-4 text-right">
                               <button onClick={() => deleteLicense(l.id)} className="text-red-500/50 hover:text-red-500 transition-colors">
                                 <Trash2 size={14} />
                               </button>
                            </td>
                          </tr>
                        ))}
                        {licenses.length === 0 && (
                          <tr>
                            <td colSpan={5} className="p-12 text-center text-gray-700 text-[8px] uppercase tracking-[0.4em] font-black">
                               No Tokens Initialized
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
