import React, { useState } from 'react';
import { useAttendance } from '../../context/AttendanceContext';
import TimetableUpload from '../Timetable/TimetableUpload';

const getDayName = (date) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
};

const formatDateForInput = (date) => {
  const offset = date.getTimezoneOffset();
  const adjustedDate = new Date(date.getTime() - (offset*60*1000));
  return adjustedDate.toISOString().split('T')[0];
};

const getValidWeekday = (date, direction = 0) => {
  let newDate = new Date(date);
  if (direction !== 0) {
    newDate.setDate(newDate.getDate() + direction);
  }
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
      <div className="card-notebook flex justify-center py-12">
        <div className="spinner-notebook"></div>
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

  // Alternating border colors for subject cards
  const borderColors = ['var(--blue)', 'var(--pink)', 'var(--yellow)', 'var(--green)', 'var(--blue)', 'var(--pink)'];

  return (
    <div className="animate-fade-in-up delay-2">
      {/* Section Header + Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 gap-3">
        <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.35rem', color: '#1E293B' }}>
          Daily Schedule
        </h2>
        
        <div className="flex items-center gap-2 flex-wrap">
          {/* Semester Start Date */}
          <div 
            className="flex items-center gap-2"
            style={{ 
              background: 'var(--yellow-bg)',
              border: '2.5px solid var(--border)',
              borderRadius: '999px',
              padding: '0.35rem 0.85rem',
              fontSize: '0.8rem',
              fontFamily: 'var(--font-heading)',
              fontWeight: 600
            }}
          >
            <span>📅</span>
            <input 
              type="date" 
              value={startDate || ''}
              onChange={(e) => updateStartDate(e.target.value)}
              style={{ 
                border: 'none', 
                background: 'transparent', 
                fontFamily: 'var(--font-heading)',
                fontWeight: 600,
                fontSize: '0.8rem',
                color: '#1E293B',
                outline: 'none',
                cursor: 'pointer'
              }}
            />
          </div>

          {/* New Timetable Button */}
          <TimetableUpload variant="minimal" />
        </div>
      </div>
      
      {/* Date Navigator */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={handlePrevDay} className="nav-arrow">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7"></path></svg>
        </button>

        <div className="date-badge flex-1">
          <div style={{ fontSize: '1.15rem' }}>{dayName},</div>
          <div style={{ fontSize: '0.95rem' }}>
            {currentDate.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
        </div>

        <button onClick={handleNextDay} className="nav-arrow">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7"></path></svg>
        </button>
      </div>
      
      {/* Class List — Timeline Style */}
      <div className="space-y-0">
        {subjectsToday.length === 0 ? (
          <div 
            className="text-center py-10 animate-pop-in" 
            style={{ 
              background: 'var(--yellow-bg)', 
              border: '3px dashed var(--border)', 
              borderRadius: '16px',
              fontFamily: 'var(--font-heading)',
              fontWeight: 600,
              color: '#64748B'
            }}
          >
            <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}>🏖️</span>
            No classes scheduled for {dayName}. Enjoy your day!
          </div>
        ) : (
          subjectsToday.map((subject, index) => {
            const recordKey = `${dateStr}-${subject}__${index}`;
            const currentStatus = records[recordKey];
            const borderColor = borderColors[index % borderColors.length];

            return (
              <div key={index} className="flex gap-3" style={{ animationDelay: `${index * 0.1}s` }}>
                {/* Timeline */}
                <div className="flex flex-col items-center pt-5">
                  <div className="timeline-dot" style={{ background: borderColor }}></div>
                  {index < subjectsToday.length - 1 && <div className="timeline-line flex-1"></div>}
                </div>

                {/* Subject Card */}
                <div 
                  className="subject-card flex-1 mb-3 animate-slide-left"
                  style={{ borderColor: borderColor, animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: '1.2rem' }}>📘</span>
                    <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.95rem' }}>
                      {subject}
                    </span>
                  </div>
                  
                  <div className="toggle-group">
                    <button 
                      onClick={() => markAttendance(dateStr, `${subject}__${index}`, 'attended')}
                      className={`toggle-btn ${currentStatus === 'attended' ? 'active-green' : ''}`}
                    >
                      ✓ Attended
                    </button>
                    <button 
                      onClick={() => markAttendance(dateStr, `${subject}__${index}`, 'missed')}
                      className={`toggle-btn ${currentStatus === 'missed' ? 'active-red' : ''}`}
                    >
                      ✕ Missed
                    </button>
                  </div>
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