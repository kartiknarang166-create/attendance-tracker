import React, { useState } from 'react';
import { useAttendance } from '../../context/AttendanceContext';
import TimetableUpload from '../Timetable/TimetableUpload';

const getDayName = (date) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
};

const formatDateForInput = (date) => {
  // Ensure we get the local date correctly formatted as YYYY-MM-DD
  const offset = date.getTimezoneOffset();
  const adjustedDate = new Date(date.getTime() - (offset*60*1000));
  return adjustedDate.toISOString().split('T')[0];
};

const getValidWeekday = (date, direction = 0) => {
  let newDate = new Date(date);
  if (direction !== 0) {
    newDate.setDate(newDate.getDate() + direction);
  }
  
  // Skip weekends (0 is Sunday, 6 is Saturday)
  while (newDate.getDay() === 0 || newDate.getDay() === 6) {
    newDate.setDate(newDate.getDate() + (direction >= 0 ? 1 : -1));
  }
  return newDate;
};

const DailyLogger = () => {
  const { timetable, records, markAttendance, isLoadingTimetable, startDate, updateStartDate } = useAttendance();
  
  const [currentDate, setCurrentDate] = useState(() => getValidWeekday(new Date()));

  if (isLoadingTimetable) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!timetable || Object.keys(timetable).length === 0) {
    return null;
  }

  const handlePrevDay = () => setCurrentDate(prev => getValidWeekday(prev, -1));
  const handleNextDay = () => setCurrentDate(prev => getValidWeekday(prev, 1));

  const dayName = getDayName(currentDate);
  const dateStr = formatDateForInput(currentDate);
  const subjectsToday = timetable[dayName] || [];

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-xl font-bold">Daily Attendance</h2>
        
        <div className="flex items-center space-x-2 text-sm bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
          <label className="text-gray-600 font-medium">Semester Start Date:</label>
          <input 
            type="date" 
            value={startDate || ''}
            onChange={(e) => updateStartDate(e.target.value)}
            className="border-b border-gray-300 bg-transparent px-1 py-0.5 text-gray-800 focus:outline-none focus:border-indigo-500 transition-colors"
          />
          <div className="pl-2 border-l border-gray-200">
            <TimetableUpload variant="minimal" />
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between bg-indigo-50 p-4 rounded-xl mb-6">
        <button onClick={handlePrevDay} className="p-2 bg-white rounded-full shadow hover:bg-gray-50 transition active:scale-95">
          <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
        </button>
        
        <div className="text-center">
          <h3 className="font-bold text-lg text-indigo-900">{dayName}</h3>
          <p className="text-sm text-indigo-600 font-medium">{currentDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
        </div>

        <button onClick={handleNextDay} className="p-2 bg-white rounded-full shadow hover:bg-gray-50 transition active:scale-95">
          <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
        </button>
      </div>
      
      <div className="space-y-4">
        {subjectsToday.length === 0 ? (
          <p className="text-center text-gray-500 py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">No classes scheduled for {dayName}. Enjoy your day!</p>
        ) : (
          subjectsToday.map((subject, index) => {
            const recordKey = `${dateStr}-${subject}`;
            const currentStatus = records[recordKey];

            return (
              <div key={index} className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-gray-50 p-4 rounded-lg border border-gray-100 gap-3">
                <span className="font-semibold text-gray-800">{subject}</span>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => markAttendance(dateStr, subject, 'attended')}
                    className={`flex-1 sm:flex-none px-5 py-2 rounded-lg text-sm font-semibold transition-all ${currentStatus === 'attended' ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20 ring-2 ring-emerald-500 ring-offset-1' : 'bg-white border border-gray-200 text-gray-600 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200'}`}
                  >
                    Attended
                  </button>
                  <button 
                    onClick={() => markAttendance(dateStr, subject, 'missed')}
                    className={`flex-1 sm:flex-none px-5 py-2 rounded-lg text-sm font-semibold transition-all ${currentStatus === 'missed' ? 'bg-red-500 text-white shadow-md shadow-red-500/20 ring-2 ring-red-500 ring-offset-1' : 'bg-white border border-gray-200 text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200'}`}
                  >
                    Missed
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default DailyLogger;