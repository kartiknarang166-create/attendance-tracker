import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { AttendanceProvider } from './context/AttendanceContext';
import StatsCard from './components/Dashboard/StatsCard';
import TimetableUpload from './components/Timetable/TimetableUpload';
import DailyLogger from './components/Logger/DailyLogger';
import Auth from './components/Auth/Auth';
import SubjectStatsView from './components/Dashboard/SubjectStatsView';

const App = () => {
  const [session, setSession] = useState(null);
  const [currentView, setCurrentView] = useState('home'); // 'home' or 'stats'

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!session) {
    return <Auth />;
  }

  return (
    <AttendanceProvider session={session}>
      <div className="min-h-screen p-4 sm:p-8" style={{ fontFamily: 'var(--font-body)' }}>
        <div className="max-w-3xl mx-auto">

          {/* Header */}
          <header className="mb-6 animate-fade-in-up">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <div>
                <h1 className="title-shadow" style={{ fontSize: 'clamp(2rem, 5vw, 2.75rem)', lineHeight: 1.1, marginBottom: '0.25rem' }}>
                  Attendance Tracker
                </h1>
                <p style={{ color: '#64748B', fontWeight: 600, fontSize: '0.95rem', fontFamily: 'var(--font-body)' }}>
                  Manage your classes and keep your streak alive! 🔥
                </p>
              </div>
              <button
                onClick={() => supabase.auth.signOut()}
                className="btn-pill btn-white"
              >
                👋 Sign Out
              </button>
            </div>
            
            {/* Top Navigation Menu */}
            <div className="flex gap-3 mt-4 border-b-2 border-slate-200 pb-2">
              <button 
                onClick={() => setCurrentView('home')}
                className={`px-4 py-2 font-heading font-bold rounded-t-xl transition-all ${currentView === 'home' ? 'bg-[var(--blue)] text-white border-3 border-b-0 border-[var(--border)] translate-y-[2px]' : 'bg-transparent text-slate-500 hover:text-slate-800'}`}
              >
                🏠 Home
              </button>
              <button 
                onClick={() => setCurrentView('stats')}
                className={`px-4 py-2 font-heading font-bold rounded-t-xl transition-all ${currentView === 'stats' ? 'bg-[var(--pink)] text-white border-3 border-b-0 border-[var(--border)] translate-y-[2px]' : 'bg-transparent text-slate-500 hover:text-slate-800'}`}
              >
                📊 Class Stats
              </button>
            </div>
          </header>

          {currentView === 'home' ? (
            <>
              <StatsCard />
              <TimetableUpload />
              <DailyLogger />
            </>
          ) : (
            <SubjectStatsView />
          )}

        </div>
      </div>
    </AttendanceProvider>
  );
};

export default App;