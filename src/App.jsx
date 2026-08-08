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
      <div className="min-h-screen bg-gray-100 p-8 font-sans text-gray-900">
        <div className="max-w-3xl mx-auto">

          <header className="mb-8 flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900">Attendance Tracker</h1>
              <p className="text-gray-500">Manage your weekly schedule and track your percentage.</p>
            </div>
            <button
              onClick={() => supabase.auth.signOut()}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded text-sm font-semibold hover:bg-red-500 hover:text-white transition"
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