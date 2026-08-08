import React, { useState, useEffect } from 'react';
import { AttendanceProvider } from './context/AttendanceContext';
import StatsCard from './components/Dashboard/StatsCard';
import TimetableUpload from './components/Timetable/TimetableUpload';
import DailyLogger from './components/Logger/DailyLogger';
import Auth from './components/Auth/Auth';
import { supabase } from './supabaseClient';

const App = () => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!session) {
    return <Auth />;
  }

  return (
    <AttendanceProvider>
      <div className="min-h-screen bg-gray-100 p-8 font-sans text-gray-900">
        <div className="max-w-3xl mx-auto">
          
          <header className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900">Attendance Tracker</h1>
              <p className="text-gray-500">Manage your weekly schedule and track your percentage.</p>
            </div>
            <button
              onClick={() => supabase.auth.signOut()}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Sign Out
            </button>
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