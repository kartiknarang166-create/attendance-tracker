import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const AttendanceContext = createContext();

export const AttendanceProvider = ({ children, session }) => {
  const [timetable, setTimetable] = useState(null);
  const [startDate, setStartDate] = useState(null);
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
        // Note: row.day now stores exact dates like '2026-08-08'
        recordsData.forEach(row => {
          loadedRecords[`${row.day}-${row.subject}`] = row.status;
        });
        setRecords(loadedRecords);
      }

      // 2. Fetch User Timetable and Start Date
      const { data: timetableData, error: timetableError } = await supabase
        .from('timetables')
        .select('schedule, start_date')
        .eq('user_id', userId)
        .single();

      if (timetableError && timetableError.code !== 'PGRST116') {
        console.error("Error fetching timetable:", timetableError);
      } else if (timetableData) {
        if (timetableData.schedule) setTimetable(timetableData.schedule);
        if (timetableData.start_date) setStartDate(timetableData.start_date);
      }
      
      setIsLoadingTimetable(false);
    };

    fetchData();
  }, [userId]);

  const updateTimetable = async (newTimetable) => {
    if (!userId) return;
    
    setTimetable(newTimetable);

    // Upsert timetable (preserves existing start_date if any)
    // Wait, upserting will overwrite unless we pull existing. But it's fine for now, we usually update specific columns.
    const { data: existing } = await supabase.from('timetables').select('start_date').eq('user_id', userId).single();
    const currentStartDate = existing?.start_date || startDate;

    const { error } = await supabase
      .from('timetables')
      .upsert([
        { 
          user_id: userId, 
          schedule: newTimetable,
          start_date: currentStartDate
        }
      ], { onConflict: 'user_id' });

    if (error) {
      console.error("Error saving timetable to Supabase:", error);
      throw new Error(`Failed to save to database: ${error.message || 'Check your Supabase logs.'}`);
    }
  };

  const updateStartDate = async (newStartDate) => {
    if (!userId) return;
    setStartDate(newStartDate);
    
    // Check if table exists/row exists by attempting update
    const { error } = await supabase
      .from('timetables')
      .update({ start_date: newStartDate })
      .eq('user_id', userId);

    if (error) {
      console.error("Error saving start date:", error);
    }
  };

  const markAttendance = async (dateStr, subject, status) => {
    if (!userId) return;

    setRecords(prev => ({
      ...prev,
      [`${dateStr}-${subject}`]: status
    }));

    // Delete existing record for this specific day and subject to prevent duplicates
    await supabase
      .from('attendance_records')
      .delete()
      .eq('user_id', userId)
      .eq('day', dateStr)
      .eq('subject', subject);

    // Insert the fresh status
    const { error } = await supabase
      .from('attendance_records')
      .insert([
        { 
          user_id: userId, 
          day: dateStr, 
          subject: subject, 
          status: status 
        }
      ]);

    if (error) {
      console.error("Error saving to Supabase:", error);
    }
  };

  return (
    <AttendanceContext.Provider value={{ 
      timetable, 
      updateTimetable, 
      startDate, 
      updateStartDate,
      records, 
      markAttendance, 
      isLoadingTimetable 
    }}>
      {children}
    </AttendanceContext.Provider>
  );
};

export const useAttendance = () => useContext(AttendanceContext);