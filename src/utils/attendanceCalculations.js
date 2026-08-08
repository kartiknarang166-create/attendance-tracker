export const calculateStats = (records, timetable) => {
  if (!timetable) return { percentage: 0, attended: 0, missed: 0, totalLogged: 0 };

  const validKeys = new Set();
  Object.entries(timetable).forEach(([day, subjects]) => {
    subjects.forEach(subject => validKeys.add(`${day}-${subject}`));
  });

  const relevantValues = [];
  Object.entries(records).forEach(([key, status]) => {
    if (validKeys.has(key)) {
      relevantValues.push(status);
    }
  });

  const totalLogged = relevantValues.length;
  if (totalLogged === 0) return { percentage: 0, attended: 0, missed: 0, totalLogged: 0 };

  const attended = relevantValues.filter(status => status === 'attended').length;
  const missed = relevantValues.filter(status => status === 'missed').length;
  const percentage = Math.round((attended / totalLogged) * 100);

  return { percentage, attended, missed, totalLogged };
};