import React from 'react';
import { useAttendance } from '../../context/AttendanceContext';
import { calculateStats } from '../../utils/attendanceCalculations';

const StatsCard = () => {
  const { records } = useAttendance();
  const { percentage, attended, missed } = calculateStats(records);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
      <h2 className="text-xl font-bold mb-4">Current Attendance</h2>
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="bg-blue-50 p-4 rounded">
          <p className="text-sm text-gray-500">Percentage</p>
          <p className="text-3xl font-bold text-blue-600">{percentage}%</p>
        </div>
        <div className="bg-green-50 p-4 rounded">
          <p className="text-sm text-gray-500">Classes Attended</p>
          <p className="text-3xl font-bold text-green-600">{attended}</p>
        </div>
        <div className="bg-red-50 p-4 rounded">
          <p className="text-sm text-gray-500">Classes Missed</p>
          <p className="text-3xl font-bold text-red-600">{missed}</p>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;