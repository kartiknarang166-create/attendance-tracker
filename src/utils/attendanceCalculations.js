export const calculateStats = (records, timetable, startDate) => {
  if (!timetable) return { percentage: 0, attended: 0, missed: 0, totalLogged: 0 };

  const relevantValues = [];

  Object.entries(records).forEach(([key, status]) => {
    // Handle the new date-based format: "YYYY-MM-DD-Subject"
    const dateStr = key.substring(0, 10);
    
    // Quick regex check to ensure it's a valid date string from the new system
    const isDateFormat = /^\d{4}-\d{2}-\d{2}$/.test(dateStr);
    
    if (isDateFormat) {
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