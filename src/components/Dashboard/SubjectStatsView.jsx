import React, { useMemo } from 'react';
import { useAttendance } from '../../context/AttendanceContext';
import { calculateSubjectStats } from '../../utils/attendanceCalculations';

const SubjectStatsView = () => {
  const { records, timetable, startDate } = useAttendance();

  const stats = useMemo(() => {
    return calculateSubjectStats(records, timetable, startDate);
  }, [records, timetable, startDate]);

  if (stats.length === 0) {
    return (
      <div className="card-notebook text-center py-12 animate-pop-in">
        <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>📭</span>
        <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.25rem', color: '#1E293B', marginBottom: '0.5rem' }}>
          No Classes Found
        </h3>
        <p style={{ color: '#64748B', fontWeight: 600, fontSize: '0.95rem' }}>
          Upload a timetable to see your individual class statistics.
        </p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up delay-2">
      <div className="flex justify-between items-center mb-5">
        <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.35rem', color: '#1E293B' }}>
          Class Statistics
        </h2>
      </div>

      <div className="space-y-4">
        {stats.map((stat, index) => {
          // Determine color based on percentage
          let progressColor = 'var(--blue)';
          let progressBg = '#DBEAFE'; // blue-100
          
          if (stat.totalLogged > 0) {
            if (stat.percentage >= 75) {
              progressColor = 'var(--green)';
              progressBg = '#DCFCE7'; // green-100
            } else if (stat.percentage >= 60) {
              progressColor = 'var(--yellow)';
              progressBg = '#FEF9C3'; // yellow-100
            } else {
              progressColor = 'var(--red)';
              progressBg = '#FEE2E2'; // red-100
            }
          } else {
            progressColor = '#CBD5E1'; // slate-300
            progressBg = '#F1F5F9'; // slate-100
          }

          return (
            <div 
              key={stat.subject}
              className="card-notebook p-5 animate-slide-left"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3">
                <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.1rem', color: '#1E293B' }}>
                  {stat.subject}
                </h3>
                
                <div 
                  className="px-3 py-1 rounded-full"
                  style={{ 
                    background: progressBg, 
                    border: `2px solid ${progressColor}`,
                    fontFamily: 'var(--font-heading)', 
                    fontWeight: 800, 
                    color: progressColor !== 'var(--yellow)' ? progressColor : 'var(--border)'
                  }}
                >
                  {stat.totalLogged > 0 ? `${stat.percentage}%` : 'No Data'}
                </div>
              </div>

              {/* Progress Bar */}
              <div 
                className="w-full rounded-full overflow-hidden mb-3"
                style={{ height: '16px', background: progressBg, border: '2px solid var(--border)' }}
              >
                <div 
                  className="h-full rounded-full transition-all duration-1000 ease-out relative"
                  style={{ 
                    width: `${Math.max(stat.percentage, 0)}%`, 
                    background: progressColor,
                    borderRight: stat.percentage > 0 && stat.percentage < 100 ? '2px solid var(--border)' : 'none'
                  }}
                >
                  {/* Glossy reflection effect */}
                  <div className="absolute top-0 left-0 right-0 h-1/3 bg-white opacity-30 rounded-full"></div>
                </div>
              </div>

              {/* Stats Footer */}
              <div className="flex justify-between items-center text-xs sm:text-sm font-semibold" style={{ color: '#64748B' }}>
                <span className="flex items-center gap-1">
                  <span style={{ color: 'var(--green)' }}>✓</span> {stat.attended} Attended
                </span>
                <span className="flex items-center gap-1">
                  <span style={{ color: 'var(--red)' }}>✕</span> {stat.missed} Missed
                </span>
                {stat.canceled > 0 && (
                  <span className="flex items-center gap-1">
                    <span style={{ color: '#F97316' }}>➖</span> {stat.canceled} Canceled
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SubjectStatsView;
