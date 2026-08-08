import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../supabaseClient'; // Importing your secure database connection

const AttendanceContext = createContext();

export const AttendanceProvider = ({ children }) => {
  const [timetable, setTimetable] = useState({
    Monday: ['Engineering Science', 'C Programming Lab'],
    Tuesday: ['Mathematics', 'Communication Skills'],
    Wednesday: ['Engineering Science', 'Physics'],
    Thursday: ['C Programming', 'Mathematics'],
    Friday: ['Physics Lab', 'Communication Skills']
  });

  const [records, setRecords] = useState({});

  // 1. Fetch data from Supabase when the website first loads
  useEffect(() => {
    const fetchAttendance = async () => {
      // Grab all records, ordered by time created so the newest clicks override older ones
      const { data, error } = await supabase
        .from('attendance_records')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.error("Error fetching data from Supabase:", error);
      } else if (data) {
        // Convert the SQL database rows back into the JS object format the UI needs
        const loadedRecords = {};
        data.forEach(row => {
          loadedRecords[`${row.day}-${row.subject}`] = row.status;
        });
        setRecords(loadedRecords);
      }
    };

    fetchAttendance();
  }, []);

  // 2. Push data to Supabase when you click a button
  const markAttendance = async (day, subject, status) => {
    // Instantly update the UI so it feels lightning fast to the user
    setRecords(prev => ({
      ...prev,
      [`${day}-${subject}`]: status
    }));

    // Send the record to the cloud database
    const { error } = await supabase
      .from('attendance_records')
      .insert([
        { day: day, subject: subject, status: status }
      ]);

    if (error) {
      console.error("Error saving to Supabase:", error);
    }
  };

  return (
    <AttendanceContext.Provider value={{ timetable, setTimetable, records, markAttendance }}>
      {children}
    </AttendanceContext.Provider>
  );
};

export const useAttendance = () => useContext(AttendanceContext);