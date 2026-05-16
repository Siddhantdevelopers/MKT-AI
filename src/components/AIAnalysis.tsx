import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, X, BrainCircuit, ChevronRight, AlertCircle, TrendingDown, TrendingUp, ExternalLink, RefreshCcw, ArrowLeft, ShieldCheck, Zap, FileSearch } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { api } from '../lib/api';
import AuthModal from './AuthModal';

interface AIAnalysisProps {
  onBack: () => void;
}

interface AnalysisResult {
  signal: 'CALL' | 'PUT' | 'NEUTRAL';
  confidence: number;
  symbol: string;
  analysis: string;
  isTradingChart: boolean;
}

const steps = [
  "Inhibiting socket noise...",
  "Scanning price vectors...",
  "Extracting candle metadata...",
  "Calculating volatility skew...",
  "Running pattern correlation...",
  "Finalizing signal output..."
];

interface TypewriterTextProps {
  text: string;
  className?: string;
}

function TypewriterText({ text, className }: TypewriterTextProps) {
  const [displayedText, setDisplayedText] = useState("");
  
  useEffect(() => {
    setDisplayedText("");
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayedText(prev => text.substring(0, i + 1));
        i++;
      } else {
        clearInterval(timer);
      }
    }, 20); 
    
    return () => clearInterval(timer);
  }, [text]);

  return <span className={className}>{displayedText}</span>;
}

export default function AIAnalysis({ onBack }: AIAnalysisProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showLicensePopup, setShowLicensePopup] = useState(false);
  const [licenseKey, setLicenseKey] = useState('');
  const [isLicensed, setIsLicensed] = useState(false);
  const [licenseError, setLicenseError] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [user, setUser] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const data = await api.get('/api/auth/me');
      setUser(data.user);
      if (data.user?.license) {
        const expiry = new Date(data.user.license.expiry);
        if (expiry > new Date()) {
          setIsLicensed(true);
        }
      }
    } catch (err) {
      console.error('Not authenticated');
    }
  };

  const handleLicenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLicenseError('');
    
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    try {
      const data = await api.post('/api/license/activate', { key: licenseKey });
      setIsLicensed(true);
      setShowLicensePopup(false);
      setUser({ ...user, license: data.license });
    } catch (err: any) {
      setLicenseError(err.message);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 98) return prev;
          return prev + Math.random() * 8;
        });
      }, 50);
    }
    return () => clearInterval(interval);
  }, [loading]);

  useEffect(() => {
    if (loading) {
      const stepIdx = Math.min(
        Math.floor((progress / 100) * steps.length),
        steps.length - 1
      );
      setCurrentStep(stepIdx);
    }
  }, [progress, loading]);

  const handleFileClick = () => {
    if (loading) return;
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    if (!isLicensed) {
      setShowLicensePopup(true);
      return;
    }
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
      setResult(null);
      setError(null);
    }
  };

  const analyzeChart = async () => {
    if (!preview || !file) return;
    if (!isLicensed) {
      setShowLicensePopup(true);
      return;
    }

    setLoading(true);
    setProgress(15);
    setError(null);
    setResult(null);

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error("API Key configuration error.");

      const ai = new GoogleGenAI({ apiKey });
      const base64Data = preview.split(',')[1];

      const prompt = `Analyze this trading chart image.
      CRITICAL: Extract the EXACT trading symbol/ticker displayed (e.g., CADJPY, NAS100, BTCUSD). Look closely at the chart header or axis.
      
      Return ONLY the raw JSON object:
      {
        "signal": "CALL" | "PUT" | "NEUTRAL",
        "confidence": number,
        "symbol": "THE_EXACT_EXTRACTED_SYMBOL",
        "analysis": "A concise technical reason for the signal",
        "isTradingChart": boolean
      }`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: {
          parts: [
            { inlineData: { data: base64Data, mimeType: file.type } },
            { text: prompt }
          ]
        }
      });

      const text = response.text || "";
      
      const jsonStart = text.indexOf('{');
      const jsonEnd = text.lastIndexOf('}') + 1;
      const jsonStr = text.substring(jsonStart, jsonEnd);
      
      const parsed: AnalysisResult = JSON.parse(jsonStr);

      if (!parsed.isTradingChart) {
        throw new Error("Invalid Input: Data does not match a verified trading chart pattern. Please provide a clear market screenshot.");
      }

      setResult(parsed);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Extraction Failed. System unable to parse visual price vectors.");
    } finally {
      setLoading(false);
      setProgress(100);
    }
  };

  const getTradingViewUrl = (symbol: string) => {
    const cleanSymbol = symbol.replace(/[^a-zA-Z0-9]/g, '');
    return `https://www.tradingview.com/chart/?symbol=${cleanSymbol}`;
  };

  return (
    <div className="min-h-screen bg-[#020202] text-white overflow-x-hidden font-mono selection:bg-[#F27D26]/30">
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
        onSuccess={(userData) => {
          setUser(userData);
          if (userData.license) {
            setIsLicensed(true);
          }
        }}
      />
      {/* Scanline and Grid Effects */}
      <div className="fixed inset-0 pointer-events-none z-50 terminal-scanline opacity-[0.02]" />
      <div className="fixed inset-0 pointer-events-none terminal-grid opacity-[0.03]" />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#020202]/80 backdrop-blur-xl border-b border-[#F27D26]/10 p-4 md:px-12 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <button 
            onClick={onBack}
            className="w-10 h-10 flex items-center justify-center hover:bg-white/5 rounded-full transition-colors text-gray-400 hover:text-white border border-white/5"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#F27D26] to-[#FF8C00] p-[1px]">
              <div className="w-full h-full bg-black rounded-lg flex items-center justify-center overflow-hidden">
                <img 
                  src="https://i.ibb.co/kVH7mzvR/IMG-8546.jpg" 
                  alt="MKT AI" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
            <div className="flex flex-col">
              <h1 className="text-[10px] font-black tracking-tight uppercase leading-none text-[#F27D26]">MKT TERMINAL</h1>
              <span className="text-[7px] text-gray-500 font-bold uppercase tracking-[0.2em] mt-1">CORTEX NODE v4.2</span>
            </div>
          </div>
        </div>
        <div className="hidden sm:block">
           <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#F27D26]/5 border border-[#F27D26]/10 text-[7px] font-bold text-[#F27D26] uppercase tracking-widest">
              <Zap size={8} fill="currentColor" /> Neural Sync Active
           </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Data Intake */}
          <div className="lg:col-span-4 space-y-6">
            <div className="space-y-4">
              <div className="inline-block px-2 py-0.5 bg-[#F27D26]/10 border border-[#F27D26]/20 rounded text-[7px] font-bold text-[#F27D26] uppercase tracking-[0.3em]">Module_In</div>
              <h2 className="text-lg font-black uppercase tracking-tighter text-white/80">Market Data</h2>
            </div>

            <div 
              onClick={handleFileClick}
              className={`
                relative aspect-square border border-white/10 rounded-2xl flex flex-col items-center justify-center transition-all group overflow-hidden bg-black/50
                ${preview ? 'border-[#F27D26]/30' : 'hover:border-[#F27D26]/20'}
                ${loading ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {preview ? (
                <>
                  <img src={preview} alt="Preview" className="w-full h-full object-contain p-4 group-hover:scale-[1.02] transition-transform duration-700" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                     <span className="text-white text-[7px] font-black uppercase tracking-widest border border-white/20 px-3 py-1.5 rounded">Change Data</span>
                  </div>
                </>
              ) : (
                <div className="text-center p-6">
                  <div className="w-12 h-12 bg-white/2 border border-white/5 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-500">
                    <Upload className="text-gray-600 group-hover:text-[#F27D26] transition-colors" size={20} />
                  </div>
                  <h3 className="text-[9px] font-black uppercase tracking-widest text-gray-600">Drop Market Data</h3>
                </div>
              )}
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
            </div>

            {!result && (
              <button
                disabled={!file || loading}
                onClick={analyzeChart}
                className="w-full py-3.5 px-6 bg-[#F27D26] text-black font-black uppercase text-[9px] tracking-[0.2em] rounded flex items-center justify-center gap-3 transition-all hover:bg-[#FF8C00] active:scale-[0.98] disabled:opacity-20 shadow-lg shadow-[#F27D26]/10"
              >
                {loading ? "Decrypting..." : "Execute Scan"}
                {!loading && <ChevronRight size={14} />}
              </button>
            )}

            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 bg-red-950/20 border border-red-500/20 rounded text-red-400 text-[8px] font-bold uppercase tracking-widest flex gap-3">
                <AlertCircle size={12} className="shrink-0" />
                <p>{error}</p>
              </motion.div>
            )}
          </div>

          {/* Right Column: Terminal */}
          <div className="lg:col-span-8">
            <div className="bg-[#020202] border border-[#F27D26]/20 rounded-2xl min-h-[460px] relative overflow-hidden flex flex-col shadow-2xl terminal-border-glow">
              {/* Terminal Header */}
              <div className="h-6 bg-[#111] border-b border-white/10 flex items-center px-4 justify-between">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#333]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-[#333]" />
                </div>
                <div className="text-[7px] text-gray-700 tracking-widest font-mono uppercase">System_State: Valid</div>
              </div>

              <div className="flex-1 relative p-6 md:p-10 flex flex-col justify-center">
                <AnimatePresence mode="wait">
                  {loading ? (
                    <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full max-w-lg mx-auto space-y-6">
                      <div className="space-y-3">
                        <div className="flex justify-between items-end">
                          <p className="text-[8px] font-black text-[#F27D26] uppercase tracking-[0.2em]">Vectoring Chart...</p>
                          <span className="text-xl font-mono text-white/20">{Math.round(progress)}%</span>
                        </div>
                        <div className="h-0.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                          <motion.div className="h-full bg-[#F27D26]" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ ease: "linear" }} />
                        </div>
                      </div>
                      <div className="space-y-1.5 bg-white/[0.01] p-5 rounded-lg border border-white/5 font-mono">
                        {steps.map((step, idx) => (
                          <div key={idx} className="flex items-center gap-3" style={{ opacity: currentStep >= idx ? 1 : 0.05 }}>
                            <span className="text-[7px] text-gray-700">[{idx.toString().padStart(2, '0')}]</span>
                            <span className={`text-[8px] uppercase tracking-widest ${currentStep === idx ? 'text-[#F27D26]' : 'text-gray-500'}`}>
                              {currentStep === idx ? <TypewriterText text={step} /> : step}
                            </span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ) : result ? (
                    <motion.div key="result" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
                      <div className="flex justify-between items-end border-b border-white/5 pb-4">
                         <div className="space-y-1">
                            <div className="text-[7px] font-bold text-[#F27D26]/60 uppercase tracking-widest">Identified Symbol</div>
                            <h3 className="text-4xl font-black uppercase tracking-tighter text-white">{result.symbol}</h3>
                         </div>
                         <div className="text-right">
                            <p className="text-[7px] text-gray-600 uppercase mb-1">Conf_Ratio</p>
                            <span className="text-3xl font-black text-[#F27D26]">{result.confidence}<span className="text-base opacity-20">%</span></span>
                         </div>
                      </div>

                      <div className={`p-6 rounded-xl border-[1px] ${result.signal === 'CALL' ? 'border-green-500/30' : result.signal === 'PUT' ? 'border-red-500/30' : 'border-white/10'}`}>
                        <div className="flex justify-between items-center">
                          <div className="space-y-1">
                             <p className="text-[8px] font-bold text-gray-600 uppercase tracking-widest">Calculated Output</p>
                             <h3 className={`text-6xl md:text-7xl font-black tracking-tighter leading-none ${result.signal === 'CALL' ? 'text-green-500' : result.signal === 'PUT' ? 'text-red-500' : 'text-white/60'}`}>
                               {result.signal}
                             </h3>
                          </div>
                          <div className="shrink-0 flex items-center gap-6">
                             {result.signal === 'CALL' ? <TrendingUp size={40} className="text-green-500/80" /> : <TrendingDown size={40} className="text-red-500/80" />}
                          </div>
                        </div>
                      </div>

                      <p className="text-[9px] text-gray-500 font-bold leading-relaxed border-l border-[#F27D26] pl-4">
                        {result.analysis}
                      </p>

                      <div className="flex gap-4 pt-2">
                        <button onClick={() => { setResult(null); setFile(null); setPreview(null); }} className="flex-1 py-3 px-4 bg-white/5 border border-white/10 text-[8px] font-bold uppercase tracking-widest rounded hover:bg-white/10 flex items-center justify-center gap-2">
                          <RefreshCcw size={12} /> New Scan
                        </button>
                        <a href={getTradingViewUrl(result.symbol)} target="_blank" rel="noreferrer" className="flex-1 py-3 px-4 bg-[#F27D26] text-black text-[8px] font-bold uppercase tracking-widest rounded flex items-center justify-center gap-2">
                          Market Chart <ExternalLink size={12} />
                        </a>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="flex flex-col items-center justify-center space-y-6">
                      <div className="w-16 h-16 bg-white/2 border border-white/10 rounded-xl flex items-center justify-center opacity-20">
                         <BrainCircuit size={32} />
                      </div>
                      <div className="space-y-2 text-center">
                        <p className="text-xs font-black text-white/30 uppercase tracking-widest">Feed Required</p>
                        <p className="text-[8px] text-gray-700 font-bold uppercase tracking-[0.2em]">Upload Chart to Extract Neural Signal</p>
                      </div>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-12 border-t border-white/5 mt-12 flex flex-col items-center opacity-10">
         <p className="text-[7px] font-mono tracking-[0.8em] text-gray-500 uppercase">System_Channel: Secured // No Fees Applied</p>
      </footer>

      {/* License Protection Portal */}
      <AnimatePresence>
        {showLicensePopup && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLicensePopup(false)}
              className="absolute inset-0 bg-[#020202]/90 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-[#0d0d0d] border border-[#F27D26]/20 rounded-2xl p-8 shadow-2xl terminal-border-glow overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#F27D26] to-transparent opacity-30" />
              
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="w-16 h-16 bg-[#F27D26]/5 rounded-2xl flex items-center justify-center border border-[#F27D26]/20">
                  <ShieldCheck className="text-[#F27D26]" size={32} />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-xl font-black tracking-tight uppercase">Neural Access Grid</h3>
                  <p className="text-[9px] text-gray-500 font-bold uppercase tracking-[0.2em] px-8 leading-relaxed">
                    System decryption requires a valid access token. Please provide your license key to authenticate.
                  </p>
                </div>

                <form onSubmit={handleLicenseSubmit} className="w-full space-y-4">
                  <div className="space-y-2">
                    <label className="text-[8px] text-[#F27D26] uppercase font-black tracking-widest block text-left">Input Hash Key</label>
                    <input 
                      autoFocus
                      required
                      type="text"
                      value={licenseKey}
                      onChange={(e) => setLicenseKey(e.target.value.toUpperCase())}
                      placeholder="XXXX-XXXX-XXXX-XXXX"
                      className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white font-mono text-sm tracking-widest focus:border-[#F27D26]/50 outline-none transition-all placeholder:text-gray-800"
                    />
                  </div>

                  {licenseError && (
                    <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 text-red-500 text-[8px] font-black uppercase tracking-widest bg-red-500/5 p-2 rounded border border-red-500/20">
                      <AlertCircle size={10} /> {licenseError}
                    </motion.div>
                  )}

                  <div className="pt-2 text-center">
                    <a 
                      href="https://t.me/+1a7Mti90G7o0NWU1" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-block text-[12px] font-black uppercase tracking-[0.2em] text-[#F27D26] hover:text-[#FF8C00] transition-colors underline underline-offset-4"
                    >
                      Need Key? Get Access
                    </a>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button 
                      type="button"
                      onClick={() => setShowLicensePopup(false)}
                      className="flex-1 py-3 px-4 bg-white/5 border border-white/10 text-[8px] font-bold uppercase tracking-widest rounded hover:bg-white/10"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="flex-1 py-3 px-4 bg-[#F27D26] text-black text-[8px] font-bold uppercase tracking-widest rounded hover:bg-[#FF8C00] shadow-lg shadow-[#F27D26]/20"
                    >
                      Authenticate
                    </button>
                  </div>
                </form>

                <p className="text-[7px] text-gray-600 font-mono uppercase tracking-widest pt-4">
                  Session_Status: Awaiting_Auth // ID: {Math.random().toString(16).substring(2, 10)}
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
