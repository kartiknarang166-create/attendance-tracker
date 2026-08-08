import React from 'react';
import { AttendanceProvider } from './context/AttendanceContext';
import StatsCard from './components/Dashboard/StatsCard';
import TimetableUpload from './components/Timetable/TimetableUpload';
import DailyLogger from './components/Logger/DailyLogger';

const App = () => {
  return (
    <AttendanceProvider>
      <div className="min-h-screen bg-gray-100 p-8 font-sans text-gray-900">
        <div className="max-w-3xl mx-auto">
          
          <header className="mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900">Attendance Tracker</h1>
            <p className="text-gray-500">Manage your weekly schedule and track your percentage.</p>
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