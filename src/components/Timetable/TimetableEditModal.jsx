import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

/* ── Helpers ─────────────────────────────────────────── */
const DAY_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const DAY_COLORS = {
  Monday:    { pill: 'var(--blue)',  bg: '#EFF6FF', border: '#93C5FD' },
  Tuesday:   { pill: 'var(--pink)',  bg: '#FCE7F3', border: '#F9A8D4' },
  Wednesday: { pill: '#7C3AED',      bg: '#EDE9FE', border: '#C4B5FD' },
  Thursday:  { pill: 'var(--green)', bg: '#F0FDF4', border: '#86EFAC' },
  Friday:    { pill: '#F97316',      bg: '#FFF7ED', border: '#FED7AA' },
  Saturday:  { pill: '#06B6D4',      bg: '#ECFEFF', border: '#A5F3FC' },
  Sunday:    { pill: '#DC2626',      bg: '#FEF2F2', border: '#FCA5A5' },
};

function deepClone(obj) { return JSON.parse(JSON.stringify(obj)); }
function makeId() { return Math.random().toString(36).slice(2, 9); }

function injectIds(timetable) {
  const result = {};
  for (const day of Object.keys(timetable)) {
    result[day] = (timetable[day] || []).map(s => ({ ...s, _id: makeId() }));
  }
  return result;
}

function stripIds(timetable) {
  const result = {};
  for (const day of Object.keys(timetable)) {
    result[day] = timetable[day].map(({ _id, ...rest }) => rest);
  }
  return result;
}

const emptySubject = () => ({
  _id: makeId(), subject: '', timeFrom: '', timeTo: '', faculty: '', time: '',
});

/* ── Sub-component: AddSubjectRow ────────────────────── */
function AddSubjectRow({ daySubjects, onAdd, onCancel }) {
  const [draft, setDraft] = useState(emptySubject());
  const [insertAt, setInsertAt] = useState(daySubjects.length);
  const nameRef = useRef(null);
  useEffect(() => { nameRef.current?.focus(); }, []);
  const set = (field, val) => setDraft(d => ({ ...d, [field]: val }));

  const handleAdd = () => {
    if (!draft.subject.trim()) { nameRef.current?.focus(); return; }
    const time = draft.timeFrom && draft.timeTo
      ? `${draft.timeFrom} - ${draft.timeTo}`
      : draft.timeFrom || draft.timeTo || '';
    onAdd({ ...draft, time }, insertAt);
  };

  return (
    <div className="animate-pop-in" style={{
      border: '2.5px dashed var(--green)', borderRadius: 16,
      padding: '1rem 1.1rem', background: '#F0FDF4',
      marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.6rem',
    }}>
      <input ref={nameRef} className="input-notebook" placeholder="Subject name *"
        value={draft.subject} onChange={e => set('subject', e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') onCancel(); }}
      />
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.8rem', color: '#475569', whiteSpace: 'nowrap' }}>🕐 Time</span>
        <input type="time" className="input-notebook" style={{ flex: 1, minWidth: 100 }}
          value={draft.timeFrom} onChange={e => set('timeFrom', e.target.value)} />
        <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, color: '#94A3B8' }}>→</span>
        <input type="time" className="input-notebook" style={{ flex: 1, minWidth: 100 }}
          value={draft.timeTo} onChange={e => set('timeTo', e.target.value)} />
      </div>
      <input className="input-notebook" placeholder="👨‍🏫 Faculty name (optional)"
        value={draft.faculty} onChange={e => set('faculty', e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') onCancel(); }}
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
        <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.8rem', color: '#475569', whiteSpace: 'nowrap' }}>📍 Insert at position</span>
        <select className="input-notebook" style={{ flex: 1, minWidth: 120 }}
          value={insertAt} onChange={e => setInsertAt(Number(e.target.value))}>
          <option value={0}>🔝 Top (slot 1)</option>
          {daySubjects.map((s, i) => (
            <option key={s._id} value={i + 1}>After slot {i + 1}: {s.subject || '(unnamed)'}</option>
          ))}
        </select>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.2rem' }}>
        <button className="btn-pill btn-white" style={{ fontSize: '0.8rem', padding: '0.3rem 0.9rem' }} onClick={onCancel}>Cancel</button>
        <button className="btn-pill btn-green" style={{ fontSize: '0.8rem', padding: '0.3rem 0.9rem' }} onClick={handleAdd}>✅ Add</button>
      </div>
    </div>
  );
}

/* ── Sub-component: SubjectCard ──────────────────────── */
function SubjectCard({ subject, index, total, onUpdate, onDelete, onMove }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ ...subject });
  const [deleting, setDeleting] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);

  const set = (field, val) => setDraft(d => ({ ...d, [field]: val }));

  const save = () => {
    const time = draft.timeFrom && draft.timeTo
      ? `${draft.timeFrom} - ${draft.timeTo}` : draft.time || '';
    onUpdate({ ...draft, time });
    setEditing(false);
  };
  const cancel = () => { setDraft({ ...subject }); setEditing(false); };

  const handleDelete = () => {
    setDeleting(true);
    // actual removal is triggered by onAnimationEnd on the card div
    // so the timing is always perfectly synced to the animation
  };

  const parseTime = (t) => {
    if (!t) return { from: '', to: '' };
    const parts = t.split(/[-–—]/);
    if (parts.length === 2) return { from: parts[0].trim(), to: parts[1].trim() };
    return { from: t, to: '' };
  };
  const { from: dispFrom, to: dispTo } = parseTime(subject.time);

  return (
    <div
      className="subject-card"
      onAnimationEnd={() => { if (deleting) onDelete(); }}
      style={{
        flexDirection: 'column', alignItems: 'stretch', gap: '0.4rem', padding: '0.85rem 1rem',
        animation: deleting ? 'deleteSlide 0.19s cubic-bezier(0.4,0,1,1) forwards' : 'fadeInUp 0.3s ease-out both',
        willChange: 'transform, opacity',
        transform: 'translateZ(0)',          /* force GPU layer from mount */
        overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{
          fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '0.7rem',
          background: '#F1F5F9', border: '2px solid var(--border)', borderRadius: 8,
          padding: '0.1rem 0.5rem', color: '#475569', flexShrink: 0
        }}>#{index + 1}</span>

        <button onClick={() => onMove(index, index - 1)} disabled={index === 0} title="Move up"
          style={{
            width: 26, height: 26, borderRadius: 6, border: '2px solid var(--border)',
            background: index === 0 ? '#F1F5F9' : 'white', cursor: index === 0 ? 'not-allowed' : 'pointer',
            fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: index === 0 ? '#CBD5E1' : '#475569', transition: 'all 0.15s'
          }}>▲</button>
        <button onClick={() => onMove(index, index + 1)} disabled={index === total - 1} title="Move down"
          style={{
            width: 26, height: 26, borderRadius: 6, border: '2px solid var(--border)',
            background: index === total - 1 ? '#F1F5F9' : 'white', cursor: index === total - 1 ? 'not-allowed' : 'pointer',
            fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: index === total - 1 ? '#CBD5E1' : '#475569', transition: 'all 0.15s'
          }}>▼</button>

        <div style={{ flex: 1 }} />

        {!editing && (
          <button className="btn-pill" onClick={() => { setDraft({ ...subject, timeFrom: dispFrom, timeTo: dispTo }); setEditing(true); }}
            style={{ fontSize: '0.72rem', padding: '0.2rem 0.7rem', background: '#EFF6FF', color: 'var(--blue)', borderColor: 'var(--blue)' }}>
            ✏️ Edit
          </button>
        )}
        <button className="btn-pill btn-red" onClick={handleDelete} disabled={deleting} title="Remove this subject"
          style={{ fontSize: '0.72rem', padding: '0.2rem 0.65rem' }}>🗑️</button>
      </div>

      {editing ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.3rem' }}>
          <input ref={inputRef} className="input-notebook" placeholder="Subject name"
            value={draft.subject} onChange={e => set('subject', e.target.value)} />
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.8rem', color: '#475569', whiteSpace: 'nowrap' }}>🕐</span>
            <input type="time" className="input-notebook" style={{ flex: 1, minWidth: 90 }}
              value={draft.timeFrom || ''} onChange={e => set('timeFrom', e.target.value)} />
            <span style={{ color: '#94A3B8', fontWeight: 700 }}>→</span>
            <input type="time" className="input-notebook" style={{ flex: 1, minWidth: 90 }}
              value={draft.timeTo || ''} onChange={e => set('timeTo', e.target.value)} />
          </div>
          <input className="input-notebook" placeholder="👨‍🏫 Faculty (optional)"
            value={draft.faculty || ''} onChange={e => set('faculty', e.target.value)} />
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <button className="btn-pill btn-white" style={{ fontSize: '0.78rem', padding: '0.25rem 0.8rem' }} onClick={cancel}>Cancel</button>
            <button className="btn-pill btn-blue" style={{ fontSize: '0.78rem', padding: '0.25rem 0.8rem' }} onClick={save}>💾 Save</button>
          </div>
        </div>
      ) : (
        <div>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1rem', color: '#1E293B' }}>
            {subject.subject || <span style={{ color: '#94A3B8' }}>Unnamed subject</span>}
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
            {subject.time && <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>🕐 {subject.time}</span>}
            {subject.faculty && <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>👨‍🏫 {subject.faculty}</span>}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Main Modal ───────────────────────────────────────── */
const TimetableEditModal = ({ parsedTimetable, onSave, onCancel, isSaving }) => {
  const [schedule, setSchedule] = useState(() => injectIds(deepClone(parsedTimetable)));
  // history stack: array of serialized schedule snapshots for undo
  const [history, setHistory] = useState([]);
  const [activeDay, setActiveDay] = useState(() => {
    const days = DAY_ORDER.filter(d => parsedTimetable[d]?.length > 0);
    return days[0] || Object.keys(parsedTimetable)[0] || 'Monday';
  });
  const [showAddRow, setShowAddRow] = useState(false);
  const bodyRef = useRef(null);

  // Helper: push current schedule to history then apply mutation
  const mutate = (mutatorFn) => {
    setHistory(h => [...h, deepClone(schedule)]);
    setSchedule(prev => mutatorFn(deepClone(prev)));
  };

  const undo = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setSchedule(prev);
    setHistory(h => h.slice(0, -1));
  };

  const activeDays = DAY_ORDER.filter(d => d in schedule);
  const currentSubjects = schedule[activeDay] || [];

  const updateSubject = (day, id, updated) =>
    mutate(s => ({ ...s, [day]: s[day].map(sub => sub._id === id ? { ...sub, ...updated } : sub) }));

  const deleteSubject = (day, id) =>
    mutate(s => ({ ...s, [day]: s[day].filter(sub => sub._id !== id) }));

  const addSubject = (day, newSub, position) => {
    mutate(s => {
      const arr = [...(s[day] || [])];
      arr.splice(position, 0, { ...newSub, _id: makeId() });
      return { ...s, [day]: arr };
    });
    setShowAddRow(false);
  };

  const moveSubject = (day, fromIdx, toIdx) => {
    if (toIdx < 0 || toIdx >= (schedule[day] || []).length) return;
    mutate(s => {
      const arr = [...s[day]];
      const [item] = arr.splice(fromIdx, 1);
      arr.splice(toIdx, 0, item);
      return { ...s, [day]: arr };
    });
  };

  const handleSave = () => {
    const clean = stripIds(schedule);
    Object.keys(clean).forEach(d => { if (clean[d].length === 0) delete clean[d]; });
    onSave(clean);
  };

  const subjectCount = Object.values(schedule).reduce((acc, arr) => acc + (arr?.length || 0), 0);
  const canUndo = history.length > 0;

  // ── Keyboard shortcut: Ctrl+Z / Cmd+Z for undo ──
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); undo(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [history]);

  // ── Portal: render directly into document.body to escape all stacking contexts ──
  return createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(15, 23, 42, 0.7)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div
        className="animate-pop-in"
        role="dialog"
        aria-modal="true"
        aria-label="Edit Timetable"
        style={{
          background: 'white',
          border: '3px solid var(--border)',
          borderRadius: 20,
          width: '100%',
          maxWidth: 680,
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* ── Header ── */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '3px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: '0.75rem', background: 'white',
          borderRadius: '20px 20px 0 0', flexShrink: 0,
        }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.4rem', margin: 0, color: '#1E293B' }}>
              ✏️ Edit Timetable
            </h2>
            <p style={{ margin: '0.2rem 0 0', color: '#64748B', fontSize: '0.85rem', fontWeight: 600 }}>
              {subjectCount} subjects across {Object.values(schedule).filter(a => a?.length > 0).length} days
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Undo */}
            <button
              className="btn-pill"
              onClick={undo}
              disabled={!canUndo || isSaving}
              title="Undo last change (Ctrl+Z)"
              style={{
                fontSize: '0.85rem',
                background: canUndo ? '#FEF9C3' : '#F1F5F9',
                color: canUndo ? '#92400E' : '#94A3B8',
                borderColor: canUndo ? '#F59E0B' : '#E2E8F0',
                opacity: canUndo ? 1 : 0.6,
                transition: 'all 0.2s',
              }}
            >
              ↩ Undo {canUndo && <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>({history.length})</span>}
            </button>

            {/* Discard */}
            <button className="btn-pill btn-white" onClick={onCancel} disabled={isSaving} style={{ fontSize: '0.85rem' }}>
              ✕ Discard
            </button>

            {/* Save */}
            <button className="btn-pill btn-green" onClick={handleSave} disabled={isSaving}
              style={{ fontSize: '0.85rem', minWidth: 130 }}>
              {isSaving ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <div className="spinner-notebook" style={{ width: 14, height: 14, borderWidth: 2.5 }} />
                  Saving...
                </span>
              ) : '💾 Save Changes'}
            </button>
          </div>
        </div>

        {/* ── Day Tabs ── */}
        <div style={{
          display: 'flex', gap: '0.5rem', padding: '0.9rem 1.5rem',
          overflowX: 'auto', borderBottom: '2.5px solid #E2E8F0',
          flexShrink: 0, background: '#F8FAFC',
        }}>
          {activeDays.map(day => {
            const col = DAY_COLORS[day] || DAY_COLORS.Monday;
            const count = (schedule[day] || []).length;
            const isActive = day === activeDay;
            return (
              <button
                key={day}
                onClick={() => { setActiveDay(day); setShowAddRow(false); }}
                style={{
                  fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.82rem',
                  padding: '0.4rem 1rem', borderRadius: 999,
                  border: `2.5px solid ${isActive ? 'var(--border)' : col.border}`,
                  background: isActive ? col.pill : col.bg,
                  color: isActive ? 'white' : col.pill,
                  cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s',
                  transform: isActive ? 'translateY(-1px)' : 'none',
                  boxShadow: isActive ? '3px 3px 0 var(--border)' : 'none', flexShrink: 0,
                }}
              >
                {day.slice(0, 3)}{' '}
                <span style={{
                  background: isActive ? 'rgba(255,255,255,0.3)' : col.pill,
                  color: 'white', borderRadius: 999, padding: '0 0.35rem', fontSize: '0.72rem',
                }}>{count}</span>
              </button>
            );
          })}
        </div>

        {/* ── Day Body ── */}
        <div ref={bodyRef} style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem' }}>
          {/* Day header row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{
                width: 12, height: 12, borderRadius: '50%',
                background: DAY_COLORS[activeDay]?.pill || 'var(--blue)',
                border: '2.5px solid var(--border)',
              }} />
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.1rem', color: '#1E293B' }}>
                {activeDay}
              </span>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: '#94A3B8', fontWeight: 600 }}>
                {currentSubjects.length} {currentSubjects.length === 1 ? 'class' : 'classes'}
              </span>
            </div>
            {!showAddRow && (
              <button className="btn-pill btn-green"
                style={{ fontSize: '0.8rem', padding: '0.35rem 0.9rem' }}
                onClick={() => setShowAddRow(true)}>
                ➕ Add Subject
              </button>
            )}
          </div>

          {currentSubjects.length === 0 && !showAddRow && (
            <div style={{
              textAlign: 'center', padding: '2rem 1rem',
              border: '2.5px dashed #CBD5E1', borderRadius: 16,
              color: '#94A3B8', fontFamily: 'var(--font-heading)', fontWeight: 700
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📭</div>
              No classes on {activeDay}. Add one!
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {currentSubjects.map((sub, idx) => (
              <SubjectCard
                key={sub._id}
                subject={sub}
                index={idx}
                total={currentSubjects.length}
                onUpdate={(updated) => updateSubject(activeDay, sub._id, updated)}
                onDelete={() => deleteSubject(activeDay, sub._id)}
                onMove={(from, to) => moveSubject(activeDay, from, to)}
              />
            ))}
          </div>

          {showAddRow && (
            <AddSubjectRow
              daySubjects={currentSubjects}
              onAdd={(newSub, pos) => addSubject(activeDay, newSub, pos)}
              onCancel={() => setShowAddRow(false)}
            />
          )}
        </div>

      </div>
    </div>,
    document.body   // ← portal target: escapes ALL stacking contexts
  );
};

export default TimetableEditModal;
