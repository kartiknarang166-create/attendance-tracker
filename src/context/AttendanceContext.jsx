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

    // Subscribe to real-time changes on the attendance_records table
    const subscription = supabase
      .channel('attendance_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'attendance_records', filter: `user_id=eq.${userId}` }, 
        () => {
          // Re-fetch only the records to stay perfectly in sync across tabs/devices
          supabase
            .from('attendance_records')
            .select('*')
            .order('created_at', { ascending: true })
            .then(({ data }) => {
              if (data) {
                const loadedRecords = {};
                data.forEach(row => {
                  loadedRecords[`${row.day}-${row.subject}`] = row.status;
                });
                setRecords(loadedRecords);
              }
            });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [userId]);

  const updateTimetable = async (newTimetable) => {
    if (!userId) return;

    setTimetable(newTimetable);

    // Clear all old attendance records so the percentage resets to 0
    setRecords({});
    const { error: deleteError } = await supabase
      .from('attendance_records')
      .delete()
      .eq('user_id', userId);

    if (deleteError) {
      console.error("Error clearing old attendance records:", deleteError);
    }

    // Upsert timetable (preserves existing start_date if any)
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

    // Optimistic UI update
    setRecords(prev => ({
      ...prev,
      [`${dateStr}-${subject}`]: status
    }));

    // Try to update existing record first
    const { data: updateData, error: updateError } = await supabase
      .from('attendance_records')
      .update({ status: status })
      .eq('user_id', userId)
      .eq('day', dateStr)
      .eq('subject', subject)
      .select();

    if (updateError) {
      console.error("Error updating record:", updateError);
    } else if (!updateData || updateData.length === 0) {
      // If no row was updated, it doesn't exist yet, so we insert it
      const { error: insertError } = await supabase
        .from('attendance_records')
        .insert([{ user_id: userId, day: dateStr, subject: subject, status: status }]);
        
      if (insertError) console.error("Error inserting record:", insertError);
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