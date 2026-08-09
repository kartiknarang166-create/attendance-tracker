import React from 'react';
import { useAttendance } from '../../context/AttendanceContext';
import { calculateStats } from '../../utils/attendanceCalculations';

const StatsCard = () => {
  const { records, timetable, startDate } = useAttendance();
  const { percentage, attended, missed } = calculateStats(records, timetable, startDate);

  return (
    <div className="mb-8 animate-fade-in-up">
      <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.35rem', marginBottom: '1rem', color: '#1E293B' }}>
        Current Attendance
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Percentage — Blue */}
        <div className="card-blue p-5 text-center animate-pop-in delay-1">
          <p style={{ fontFamily: 'var(--font-heading)', fontWeight: 500, fontSize: '0.85rem', opacity: 0.85 }}>
            Overall Percentage:
          </p>
          <p style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '3rem', lineHeight: 1.1 }}>
            {percentage}%
          </p>
        </div>

        {/* Attended — Yellow */}
        <div className="card-yellow p-5 text-center animate-pop-in delay-2">
          <p style={{ fontFamily: 'var(--font-heading)', fontWeight: 500, fontSize: '0.85rem', opacity: 0.7 }}>
            Classes Attended:
          </p>
          <p style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '3rem', lineHeight: 1.1 }}>
            {attended}
          </p>
        </div>

        {/* Missed — Pink */}
        <div className="card-pink p-5 text-center animate-pop-in delay-3">
          <p style={{ fontFamily: 'var(--font-heading)', fontWeight: 500, fontSize: '0.85rem', opacity: 0.85 }}>
            Classes Missed:
          </p>
          <p style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '3rem', lineHeight: 1.1 }}>
            {missed}
          </p>
        </div>

      </div>
    </div>
  );
};

export default StatsCard;