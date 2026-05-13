/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import SplashScreen from './components/SplashScreen';
import Dashboard from './components/Dashboard';
import AIAnalysis from './components/AIAnalysis';
import AdminPanel from './components/AdminPanel';

export type View = 'home' | 'analysis' | 'admin';

export default function App() {
  const [isSplashComplete, setIsSplashComplete] = useState(false);
  const [currentView, setCurrentView] = useState<View>('home');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentView]);

  if (!isSplashComplete) {
    return <SplashScreen onComplete={() => setIsSplashComplete(true)} />;
  }

  return (
    <div className="min-h-screen bg-[#050505]">
      {currentView === 'home' ? (
        <Dashboard onNavigate={setCurrentView} />
      ) : currentView === 'analysis' ? (
        <AIAnalysis onBack={() => setCurrentView('home')} />
      ) : (
        <AdminPanel onBack={() => setCurrentView('home')} />
      )}
    </div>
  );
}

