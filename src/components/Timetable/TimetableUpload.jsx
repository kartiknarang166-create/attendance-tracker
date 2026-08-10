import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useAttendance } from '../../context/AttendanceContext';
import { extractTimetableFromImage } from '../../utils/aiAgent';
import TimetableEditModal from './TimetableEditModal';

/* ── Shared AI processing toast (shown for both variants) ── */
const AIProcessingToast = () => createPortal(
  <div
    style={{
      position: 'fixed',
      bottom: '1.5rem',
      left: 0,
      right: 0,
      margin: '0 auto',
      zIndex: 9998,
      background: 'white',
      border: '3px solid var(--border)',
      borderRadius: 20,
      boxShadow: '0 8px 32px rgba(15,23,42,0.18)',
      padding: '1rem 1.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      width: 'fit-content',
      maxWidth: '90vw',
      animation: 'fadeInUp 0.35s ease-out both',
    }}
  >
    <div className="spinner-notebook" style={{ width: 32, height: 32, borderWidth: 4, flexShrink: 0 }} />
    <div>
      <p style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--blue)', fontSize: '1rem', margin: 0 }}>
        🤖 AI is reading your timetable...
      </p>
      <p style={{ fontFamily: 'var(--font-body)', fontWeight: 600, color: '#64748B', fontSize: '0.8rem', margin: '0.2rem 0 0' }}>
        This might take 1–2 minutes. Please don't close the tab.
      </p>
    </div>
  </div>,
  document.body
);

const TimetableUpload = ({ variant = 'full' }) => {
  const { updateTimetable, timetable } = useAttendance();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [pendingTimetable, setPendingTimetable] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // Reset input so the same file can be re-uploaded if needed
    e.target.value = '';

    setError(null);
    setIsProcessing(true);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64String = reader.result.split(',')[1];
          const parsedData = await extractTimetableFromImage(base64String, file.type);

          // Show edit modal instead of saving immediately
          setPendingTimetable(parsedData);
          setShowEditModal(true);
        } catch (err) {
          setError(err.message);
        } finally {
          setIsProcessing(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError('Failed to read file.');
      setIsProcessing(false);
    }
  };

  const handleModalSave = async (editedTimetable) => {
    setIsSaving(true);
    try {
      await updateTimetable(editedTimetable);
      setShowEditModal(false);
      setPendingTimetable(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleModalCancel = () => {
    setShowEditModal(false);
    setPendingTimetable(null);
  };

  /* ── Minimal Variant: Small pill button ────────── */
  if (variant === 'minimal') {
    return (
      <>
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
                Reading timetable...
              </span>
            ) : '📤 New Timetable'}
          </div>
        </div>

        {/* AI toast visible to user while processing */}
        {isProcessing && <AIProcessingToast />}

        {showEditModal && pendingTimetable && (
          <TimetableEditModal
            parsedTimetable={pendingTimetable}
            onSave={handleModalSave}
            onCancel={handleModalCancel}
            isSaving={isSaving}
          />
        )}
      </>
    );
  }

  /* ── Hide full uploader if timetable exists ────── */
  if (variant === 'full' && timetable && Object.keys(timetable).length > 0) {
    return (
      <>
        {showEditModal && pendingTimetable && (
          <TimetableEditModal
            parsedTimetable={pendingTimetable}
            onSave={handleModalSave}
            onCancel={handleModalCancel}
            isSaving={isSaving}
          />
        )}
      </>
    );
  }

  /* ── Full Variant: Big upload card ─────────────── */
  return (
    <>
      <div className="card-notebook mb-8 text-center relative overflow-hidden animate-pop-in">

        {/* Processing Overlay */}
        {isProcessing && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center z-10"
            style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(4px)' }}
          >
            <div className="spinner-notebook mb-4" style={{ width: 48, height: 48, borderWidth: 5 }}></div>
            <p style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--blue)', fontSize: '1.1rem' }} className="animate-pulse">
              🤖 AI is reading your timetable...
            </p>
            <p style={{ fontFamily: 'var(--font-body)', fontWeight: 600, color: '#64748B', fontSize: '0.82rem', marginTop: '0.4rem' }}>
              This might take 1–2 minutes. Please don't close the tab.
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
          Upload a screenshot or PDF of your college timetable. Our AI will extract your classes — then you can review and edit before saving!
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

      {/* Edit Modal — rendered outside the card so it can be fullscreen */}
      {showEditModal && pendingTimetable && (
        <TimetableEditModal
          parsedTimetable={pendingTimetable}
          onSave={handleModalSave}
          onCancel={handleModalCancel}
          isSaving={isSaving}
        />
      )}
    </>
  );
};

export default TimetableUpload;