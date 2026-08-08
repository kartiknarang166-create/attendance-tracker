import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const AttendanceContext = createContext();

// We accept the session directly from App.jsx!
export const AttendanceProvider = ({ children, session }) => {
  const [timetable, setTimetable] = useState({
    Monday: ['Engineering Science', 'C Programming Lab'],
    Tuesday: ['Mathematics', 'Communication Skills'],
    Wednesday: ['Engineering Science', 'Physics'],
    Thursday: ['C Programming', 'Mathematics'],
    Friday: ['Physics Lab', 'Communication Skills']
  });

  const [records, setRecords] = useState({});
  
  // Instantly lock in the user ID
  const userId = session?.user?.id;

  useEffect(() => {
    if (!userId) return;

    const fetchAttendance = async () => {
      const { data, error } = await supabase
        .from('attendance_records')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.error("Error fetching data:", error);
      } else if (data) {
        const loadedRecords = {};
        data.forEach(row => {
          loadedRecords[`${row.day}-${row.subject}`] = row.status;
        });
        setRecords(loadedRecords);
      }
    };

    fetchAttendance();
  }, [userId]);

  const markAttendance = async (day, subject, status) => {
    if (!userId) {
      console.error("FAILED: No user ID found!");
      return;
    }

    setRecords(prev => ({
      ...prev,
      [`${day}-${subject}`]: status
    }));

    const { error } = await supabase
      .from('attendance_records')
      .insert([
        { 
          user_id: userId, 
          day: day, 
          subject: subject, 
          status: status 
        }
      ]);

    if (error) {
      console.error("Error saving to Supabase:", error);
    } else {
      console.log("Success! Data saved to Supabase.");
    }
  };

  return (
    <AttendanceContext.Provider value={{ timetable, setTimetable, records, markAttendance }}>
      {children}
    </AttendanceContext.Provider>
  );
};

export const useAttendance = () => useContext(AttendanceContext);