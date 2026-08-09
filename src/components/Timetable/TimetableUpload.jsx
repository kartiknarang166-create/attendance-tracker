import React, { useState } from 'react';
import { useAttendance } from '../../context/AttendanceContext';
import { extractTimetableFromImage } from '../../utils/aiAgent';

const TimetableUpload = ({ variant = 'full' }) => {
  const { updateTimetable, timetable } = useAttendance(); 
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setError(null);
    setIsProcessing(true);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64String = reader.result.split(',')[1];
          const parsedData = await extractTimetableFromImage(base64String, file.type);
          
          await updateTimetable(parsedData);
        } catch (err) {
          setError(err.message);
        } finally {
          setIsProcessing(false);
        }
      };
      
      reader.readAsDataURL(file);
    } catch (err) {
      setError("Failed to read file.");
      setIsProcessing(false);
    }
  };

  /* ── Minimal Variant: Small pill button ────────── */
  if (variant === 'minimal') {
    return (
      <div className="relative flex items-center">
        <input 
          type="file" 
          accept="image/*,application/pdf"
          onChange={handleFileUpload}
          disabled={isProcessing}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
          title="Upload new screenshot or PDF"
        />
        <div className={`btn-pill ${isProcessing ? 'btn-yellow' : 'btn-blue'}`} style={{ fontSize: '0.75rem', padding: '0.35rem 0.85rem' }}>
          {isProcessing ? (
            <span className="flex items-center gap-1.5">
              <div className="spinner-notebook" style={{ width: 14, height: 14, borderWidth: 2.5 }}></div>
              Updating...
            </span>
          ) : '📤 New Timetable'}
        </div>
      </div>
    );
  }

  /* ── Hide full uploader if timetable exists ────── */
  if (variant === 'full' && timetable && Object.keys(timetable).length > 0) {
    return null;
  }

  /* ── Full Variant: Big upload card ─────────────── */
  return (
    <div className="card-notebook mb-8 text-center relative overflow-hidden animate-pop-in">
      
      {/* Processing Overlay */}
      {isProcessing && (
        <div 
          className="absolute inset-0 flex flex-col items-center justify-center z-10"
          style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(4px)' }}
        >
          <div className="spinner-notebook mb-4" style={{ width: 48, height: 48, borderWidth: 5 }}></div>
          <p style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--blue)', fontSize: '1.1rem' }} className="animate-pulse">
            🤖 AI is extracting your timetable...
          </p>
        </div>
      )}

      {/* Icon */}
      <div className="animate-float inline-block mb-4">
        <div 
          className="mx-auto flex items-center justify-center"
          style={{ 
            width: 72, height: 72, 
            background: 'var(--yellow)', 
            border: '3px solid var(--border)', 
            borderRadius: '50%',
            fontSize: '2rem'
          }}
        >
          📸
        </div>
      </div>

      <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.4rem', color: '#1E293B', marginBottom: '0.5rem' }}>
        Upload Timetable
      </h3>
      <p style={{ color: '#64748B', fontWeight: 600, fontSize: '0.9rem', maxWidth: '360px', margin: '0 auto 1.5rem' }}>
        Upload a screenshot or PDF of your college timetable. Our AI will automatically extract your classes!
      </p>

      {/* Error */}
      {error && (
        <div 
          className="mb-5 animate-pop-in"
          style={{ 
            padding: '0.75rem 1rem',
            borderRadius: '12px',
            border: '2.5px solid var(--border)',
            background: '#FEE2E2',
            color: 'var(--red-dark)',
            fontWeight: 700,
            fontSize: '0.85rem',
            fontFamily: 'var(--font-heading)',
            textAlign: 'left'
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {/* Upload Button */}
      <div className="relative group cursor-pointer inline-block">
        <input 
          type="file" 
          accept="image/*,application/pdf"
          onChange={handleFileUpload}
          disabled={isProcessing}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          title="Upload screenshot or PDF"
        />
        <div className="btn-pill btn-blue" style={{ padding: '0.7rem 1.75rem', fontSize: '1rem' }}>
          📁 Select File
        </div>
      </div>
    </div>
  );
};

export default TimetableUpload;