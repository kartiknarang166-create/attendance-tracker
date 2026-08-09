export const calculateStats = (records, timetable, startDate) => {
  if (!timetable) return { percentage: 0, attended: 0, missed: 0, totalLogged: 0 };

  // Build a set of all valid subjects from the current timetable
  const validSubjects = new Set();
  Object.values(timetable).forEach(subjects => {
    subjects.forEach(subject => validSubjects.add(subject));
  });

  const relevantValues = [];

  Object.entries(records).forEach(([key, status]) => {
    // Key format: "YYYY-MM-DD-SubjectName__slotIndex"
    const dateStr = key.substring(0, 10);
    const subjectWithSlot = key.substring(11);
    // Strip the __N slot index suffix to get the base subject name
    const baseSubject = subjectWithSlot.replace(/__\d+$/, '');

    const isDateFormat = /^\d{4}-\d{2}-\d{2}$/.test(dateStr);

    if (isDateFormat && validSubjects.has(baseSubject)) {
      const isAfterStart = !startDate || dateStr >= startDate;
      if (isAfterStart) {
        relevantValues.push(status);
      }
    }
  });

  const totalLogged = relevantValues.length;
  if (totalLogged === 0) return { percentage: 0, attended: 0, missed: 0, totalLogged: 0 };

  const attended = relevantValues.filter(status => status === 'attended').length;
  const missed = relevantValues.filter(status => status === 'missed').length;
  const percentage = Math.round((attended / totalLogged) * 100);

  return { percentage, attended, missed, totalLogged };
};