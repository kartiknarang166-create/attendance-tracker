export const calculateStats = (records) => {
  const values = Object.values(records);
  const totalLogged = values.length;
  
  if (totalLogged === 0) return { percentage: 0, attended: 0, missed: 0, totalLogged: 0 };

  const attended = values.filter(status => status === 'attended').length;
  const missed = values.filter(status => status === 'missed').length;
  const percentage = Math.round((attended / totalLogged) * 100);

  return { percentage, attended, missed, totalLogged };
};