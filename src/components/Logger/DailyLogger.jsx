import React from 'react';
import { useAttendance } from '../../context/AttendanceContext';

const DailyLogger = () => {
  const { timetable, records, markAttendance, isLoadingTimetable } = useAttendance();

  if (isLoadingTimetable) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!timetable || Object.keys(timetable).length === 0) {
    return null; // Don't show logger if they haven't uploaded a timetable
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Log This Week's Classes</h2>
      
      <div className="space-y-6">
        {Object.entries(timetable).map(([day, subjects]) => (
          <div key={day} className="border-b pb-4 last:border-0">
            <h3 className="font-semibold text-lg text-gray-700 mb-3">{day}</h3>
            <div className="space-y-2">
              {subjects.map((subject, index) => {
                const recordKey = `${day}-${subject}`;
                const currentStatus = records[recordKey];

                return (
                  <div key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded">
                    <span className="font-medium text-gray-800">{subject}</span>
                    <div className="space-x-2">
                      <button 
                        onClick={() => markAttendance(day, subject, 'attended')}
                        className={`px-4 py-1 rounded text-sm ${currentStatus === 'attended' ? 'bg-green-500 text-white' : 'bg-gray-200 hover:bg-green-100'}`}
                      >
                        Attended
                      </button>
                      <button 
                        onClick={() => markAttendance(day, subject, 'missed')}
                        className={`px-4 py-1 rounded text-sm ${currentStatus === 'missed' ? 'bg-red-500 text-white' : 'bg-gray-200 hover:bg-red-100'}`}
                      >
                        Missed
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DailyLogger;