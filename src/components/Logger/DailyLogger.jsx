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

  const handlePrevWeek = () => setCurrentDate(prev => {
    const d = new Date(prev);
    d.setDate(d.getDate() - 7);
    return getValidWeekday(d);
  });
  
  const handleNextWeek = () => setCurrentDate(prev => {
    const d = new Date(prev);
    d.setDate(d.getDate() + 7);
    return getValidWeekday(d);
  });
  
  const goToToday = () => setCurrentDate(getValidWeekday(new Date()));

  const dayName = getDayName(currentDate);
  const dateStr = formatDateForInput(currentDate);
  const subjectsToday = timetable[dayName] || [];

  // Generate the 5 days of the current week (Mon-Fri)
  const getWeekDays = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
    const monday = new Date(d.setDate(diff));
    
    const weekDays = [];
    for (let i = 0; i < 5; i++) {
      const nextDay = new Date(monday);
      nextDay.setDate(monday.getDate() + i);
      weekDays.push(nextDay);
    }
    return weekDays;
  };
  const currentWeekDays = getWeekDays(currentDate);

  // Future Date Check
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);
  const viewingDate = new Date(currentDate);
  viewingDate.setHours(0, 0, 0, 0);
  const isFutureDate = viewingDate > todayDate;

  // Format week range string (e.g. "Aug 10 - Aug 14, 2026")
  const startOfWeek = currentWeekDays[0];
  const endOfWeek = currentWeekDays[4];
  const weekRangeStr = `${startOfWeek.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} – ${endOfWeek.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`;

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
          {/* Week Navigator */}
          <div 
            className="flex items-center gap-2"
            style={{ 
              background: '#F8FAFC',
              border: '2.5px solid var(--border)',
              borderRadius: '999px',
              padding: '0.2rem 0.5rem',
            }}
          >
            <button onClick={handlePrevWeek} className="px-2 py-1 font-bold text-[var(--border)] hover:text-[var(--blue)] transition-colors">{'<'}</button>
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.8rem', color: '#1E293B', padding: '0 0.5rem' }}>
              📅 {weekRangeStr}
            </span>
            <button onClick={handleNextWeek} className="px-2 py-1 font-bold text-[var(--border)] hover:text-[var(--blue)] transition-colors">{'>'}</button>
          </div>
          
          <button onClick={goToToday} className="btn-pill btn-white" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}>
            Today
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4 flex-wrap">
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
            <span>🏁 Start Date:</span>
            <input 
              type="date" 
              value={startDate || ''}
              onChange={(e) => updateStartDate(e.target.value)}
              style={{ 
                border: 'none', 
                background: 'transparent', 
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
                fontSize: '0.8rem',
                color: '#1E293B',
                outline: 'none',
                cursor: 'pointer'
              }}
            />
          </div>

          <TimetableUpload variant="minimal" />
      </div>
      
      {/* Horizontal Week Day Selector */}
      <div className="flex justify-between items-stretch gap-2 mb-6">
        {currentWeekDays.map(day => {
          const isSelected = day.toDateString() === currentDate.toDateString();
          return (
            <button
              key={day.toISOString()}
              onClick={() => setCurrentDate(day)}
              className={`flex-1 flex flex-col items-center py-2 px-1 rounded-xl border-[2.5px] border-[var(--border)] transition-all ${
                isSelected 
                  ? 'bg-[var(--blue)] text-white shadow-[3px_3px_0_var(--border)] transform -translate-y-1' 
                  : 'bg-white text-[var(--border)] hover:bg-gray-50 hover:shadow-[2px_2px_0_var(--border)]'
              }`}
            >
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.7rem', opacity: 0.9, textTransform: 'uppercase', marginBottom: '0.1rem' }}>
                {getDayName(day).substring(0, 3)}
              </span>
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.25rem' }}>
                {day.getDate()}
              </span>
            </button>
          );
        })}
      </div>

      {/* Future Date Warning */}
      {isFutureDate && (
        <div className="mb-6 p-4 rounded-xl border-[2.5px] border-[var(--border)] bg-slate-50 flex items-center gap-3 animate-pop-in">
          <span className="text-xl">ℹ️</span>
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '0.9rem', color: '#64748B' }}>
            You are viewing a future date. Attendance marking is disabled.
          </span>
        </div>
      )}
      
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
          subjectsToday.map((item, index) => {
            const isObject = typeof item === 'object';
            const subject = isObject ? item.subject : item;
            const time = isObject ? item.time : '';
            const faculty = isObject ? item.faculty : '';

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
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span style={{ fontSize: '1.2rem' }}>📘</span>
                      <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.95rem', color: '#1E293B' }}>
                        {subject}
                      </span>
                    </div>
                    {(time || faculty) && (
                      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1" style={{ paddingLeft: '1.7rem', fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '0.8rem', color: '#64748B' }}>
                        {time && <span className="flex items-center gap-1">⏰ {time}</span>}
                        {faculty && <span className="flex items-center gap-1">👨‍🏫 {faculty}</span>}
                      </div>
                    )}
                  </div>
                  
                  <div className="toggle-group">
                    <button 
                      onClick={() => markAttendance(dateStr, `${subject}__${index}`, 'attended')}
                      disabled={isFutureDate}
                      className={`toggle-btn ${currentStatus === 'attended' ? 'active-green' : ''} ${isFutureDate ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      ✓ Attended
                    </button>
                    <button 
                      onClick={() => markAttendance(dateStr, `${subject}__${index}`, 'missed')}
                      disabled={isFutureDate}
                      className={`toggle-btn ${currentStatus === 'missed' ? 'active-red' : ''} ${isFutureDate ? 'opacity-50 cursor-not-allowed' : ''}`}
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