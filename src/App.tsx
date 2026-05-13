/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import SplashScreen from './components/SplashScreen';
import Dashboard from './components/Dashboard';
import AIAnalysis from './components/AIAnalysis';
import AdminPanel from './components/AdminPanel';
import AdminLogin from './components/AdminLogin';

export type View = 'home' | 'analysis' | 'admin';

export default function App() {
  const [isSplashComplete, setIsSplashComplete] = useState(false);
  const [currentView, setCurrentView] = useState<View>('home');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#adminpanel-mktai') {
        setCurrentView('admin');
      } else if (window.location.hash === '#home' || window.location.hash === '') {
        setCurrentView('home');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    // Initial check
    handleHashChange();

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentView]);

  if (!isSplashComplete) {
    return <SplashScreen onComplete={() => setIsSplashComplete(true)} />;
  }

  const renderView = () => {
    if (currentView === 'analysis') {
      return <AIAnalysis onBack={() => {
        window.location.hash = 'home';
        setCurrentView('home');
      }} />;
    }

    if (currentView === 'admin') {
      if (!isAdminAuthenticated) {
        return <AdminLogin onLogin={() => setIsAdminAuthenticated(true)} />;
      }
      return <AdminPanel onBack={() => {
        window.location.hash = 'home';
        setCurrentView('home');
      }} />;
    }

    return <Dashboard onNavigate={(view) => {
      window.location.hash = view === 'home' ? 'home' : view === 'admin' ? 'adminpanel-mktai' : view;
      setCurrentView(view);
    }} />;
  };

  return (
    <div className="min-h-screen bg-[#050505]">
      {renderView()}
    </div>
  );
}

