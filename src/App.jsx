import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { AttendanceProvider } from './context/AttendanceContext';
import StatsCard from './components/Dashboard/StatsCard';
import TimetableUpload from './components/Timetable/TimetableUpload';
import DailyLogger from './components/Logger/DailyLogger';
import Auth from './components/Auth/Auth';

const App = () => {
  const [session, setSession] = useState(null);

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
          <header className="mb-8 animate-fade-in-up">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
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
          </header>

          <StatsCard />
          <TimetableUpload />
          <DailyLogger />

        </div>
      </div>
    </AttendanceProvider>
  );
};

export default App;