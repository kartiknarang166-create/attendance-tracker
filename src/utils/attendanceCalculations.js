export const calculateStats = (records, timetable, startDate) => {
  if (!timetable) return { percentage: 0, attended: 0, missed: 0, totalLogged: 0 };

  // Build a set of all valid subjects from the current timetable
  const validSubjects = new Set();
  Object.values(timetable).forEach(classes => {
    classes.forEach(item => {
      if (typeof item === 'string') {
        validSubjects.add(item);
      } else if (item && typeof item === 'object' && item.subject) {
        validSubjects.add(item.subject);
      }
    });
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

  // Filter out any classes marked as 'canceled' so they don't affect stats
  const validRelevantValues = relevantValues.filter(status => status !== 'canceled');

  const totalLogged = validRelevantValues.length;
  if (totalLogged === 0) return { percentage: 0, attended: 0, missed: 0, totalLogged: 0 };

  const attended = validRelevantValues.filter(status => status === 'attended').length;
  const missed = validRelevantValues.filter(status => status === 'missed').length;
  const percentage = Math.round((attended / totalLogged) * 100);

  return { percentage, attended, missed, totalLogged };
};

export const calculateSubjectStats = (records, timetable, startDate) => {
  if (!timetable) return [];

  // 1. Find all valid subjects
  const validSubjects = new Set();
  Object.values(timetable).forEach(classes => {
    classes.forEach(item => {
      if (typeof item === 'string') {
        validSubjects.add(item);
      } else if (item && typeof item === 'object' && item.subject) {
        validSubjects.add(item.subject);
      }
    });
  });

  // 2. Initialize stats object for each subject
  const subjectStatsMap = {};
  validSubjects.forEach(subject => {
    subjectStatsMap[subject] = { attended: 0, missed: 0, canceled: 0, totalLogged: 0 };
  });

  // 3. Process records
  Object.entries(records).forEach(([key, status]) => {
    const dateStr = key.substring(0, 10);
    const subjectWithSlot = key.substring(11);
    const baseSubject = subjectWithSlot.replace(/__\d+$/, '');

    const isDateFormat = /^\d{4}-\d{2}-\d{2}$/.test(dateStr);

    if (isDateFormat && validSubjects.has(baseSubject)) {
      const isAfterStart = !startDate || dateStr >= startDate;
      if (isAfterStart) {
        if (status === 'attended') {
          subjectStatsMap[baseSubject].attended++;
          subjectStatsMap[baseSubject].totalLogged++;
        } else if (status === 'missed') {
          subjectStatsMap[baseSubject].missed++;
          subjectStatsMap[baseSubject].totalLogged++;
        } else if (status === 'canceled') {
          subjectStatsMap[baseSubject].canceled++;
          // Canceled doesn't add to totalLogged
        }
      }
    }
  });

  // 4. Convert map to array and calculate percentage
  const result = Object.entries(subjectStatsMap).map(([subject, stats]) => {
    const percentage = stats.totalLogged === 0 
      ? 0 
      : Math.round((stats.attended / stats.totalLogged) * 100);
      
    return {
      subject,
      percentage,
      ...stats
    };
  });

  // Sort by lowest percentage first, so users can focus on classes they are failing
  return result.sort((a, b) => a.percentage - b.percentage);
};