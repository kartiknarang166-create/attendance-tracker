import React, { useState } from 'react';
import { useAttendance } from '../../context/AttendanceContext';
import { extractTimetableFromImage } from '../../utils/aiAgent';

const TimetableUpload = ({ variant = 'full' }) => {
  const { updateTimetable, timetable } = useAttendance(); 
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setError(null);
    setIsProcessing(true);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64String = reader.result.split(',')[1];
          const parsedData = await extractTimetableFromImage(base64String, file.type);
          
          await updateTimetable(parsedData);
        } catch (err) {
          setError(err.message);
        } finally {
          setIsProcessing(false);
        }
      };
      
      reader.readAsDataURL(file);
    } catch (err) {
      setError("Failed to read file.");
      setIsProcessing(false);
    }
  };

  if (variant === 'minimal') {
    return (
      <div className="relative flex items-center">
        <input 
          type="file" 
          accept="image/*,application/pdf"
          onChange={handleFileUpload}
          disabled={isProcessing}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
          title="Upload new screenshot or PDF"
        />
        <div className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${isProcessing ? 'bg-indigo-100 text-indigo-400' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-200'}`}>
          {isProcessing ? (
            <span className="flex items-center gap-1">
              <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              Updating...
            </span>
          ) : 'New Timetable'}
        </div>
      </div>
    );
  }

  if (variant === 'full' && timetable && Object.keys(timetable).length > 0) {
    return null; // Hide the full uploader if a timetable already exists
  }

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 mb-8 text-center relative overflow-hidden">
      
      {isProcessing && (
        <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center z-10">
          <svg className="animate-spin h-10 w-10 text-indigo-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-indigo-600 font-semibold animate-pulse">AI is extracting your timetable...</p>
        </div>
      )}

      <div className="mx-auto w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>

      <h3 className="text-xl font-bold text-gray-900 mb-2">Upload Timetable</h3>
      <p className="text-gray-500 mb-6 text-sm max-w-sm mx-auto">
        Upload a screenshot or PDF of your college timetable. Our AI will automatically extract your classes and build your dashboard.
      </p>

      {error && (
        <div className="mb-6 p-3 bg-red-50 text-red-600 text-sm font-medium rounded-lg border border-red-100">
          {error}
        </div>
      )}

      <div className="relative group cursor-pointer inline-block">
        <input 
          type="file" 
          accept="image/*,application/pdf"
          onChange={handleFileUpload}
          disabled={isProcessing}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          title="Upload screenshot or PDF"
        />
        <div className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-xl transition-all shadow-md shadow-indigo-200 group-hover:shadow-lg group-hover:shadow-indigo-300">
          Select File
        </div>
      </div>
    </div>
  );
};

export default TimetableUpload;