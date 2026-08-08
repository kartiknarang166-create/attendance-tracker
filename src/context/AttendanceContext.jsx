import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const AttendanceContext = createContext();

export const AttendanceProvider = ({ children, session }) => {
  const [timetable, setTimetable] = useState(null);
  const [records, setRecords] = useState({});
  const [isLoadingTimetable, setIsLoadingTimetable] = useState(true);
  
  const userId = session?.user?.id;

  useEffect(() => {
    if (!userId) {
      setIsLoadingTimetable(false);
      return;
    }

    const fetchData = async () => {
      // 1. Fetch Attendance Records
      const { data: recordsData, error: recordsError } = await supabase
        .from('attendance_records')
        .select('*')
        .order('created_at', { ascending: true });

      if (recordsError) {
        console.error("Error fetching records:", recordsError);
      } else if (recordsData) {
        const loadedRecords = {};
        recordsData.forEach(row => {
          loadedRecords[`${row.day}-${row.subject}`] = row.status;
        });
        setRecords(loadedRecords);
      }

      // 2. Fetch User Timetable
      const { data: timetableData, error: timetableError } = await supabase
        .from('timetables')
        .select('schedule')
        .eq('user_id', userId)
        .single();

      if (timetableError && timetableError.code !== 'PGRST116') {
        // PGRST116 is "Results contain 0 rows" which is fine for new users
        console.error("Error fetching timetable:", timetableError);
      } else if (timetableData && timetableData.schedule) {
        setTimetable(timetableData.schedule);
      }
      
      setIsLoadingTimetable(false);
    };

    fetchData();
  }, [userId]);

  const updateTimetable = async (newTimetable) => {
    if (!userId) return;
    
    // Update local UI immediately
    setTimetable(newTimetable);

    // Save to Supabase (upsert based on user_id)
    const { error } = await supabase
      .from('timetables')
      .upsert([
        { 
          user_id: userId, 
          schedule: newTimetable 
        }
      ], { onConflict: 'user_id' });

    if (error) {
      console.error("Error saving timetable to Supabase:", error);
      throw new Error(`Failed to save to database: ${error.message || 'Check your Supabase logs.'}`);
    }
  };

  const markAttendance = async (day, subject, status) => {
    if (!userId) return;

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
    }
  };

  return (
    <AttendanceContext.Provider value={{ timetable, updateTimetable, records, markAttendance, isLoadingTimetable }}>
      {children}
    </AttendanceContext.Provider>
  );
};

export const useAttendance = () => useContext(AttendanceContext);