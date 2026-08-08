import React from 'react';
import { useAttendance } from '../../context/AttendanceContext';

const TimetableUpload = () => {
  const { setTimetable } = useAttendance();

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    // In a full app, you would use a FileReader here to parse a CSV or JSON file
    console.log("File uploaded ready for parsing:", file.name);
    alert("File parsing logic goes here!");
  };

  return (
    <div className="bg-gray-50 p-6 rounded-lg border-2 border-dashed border-gray-300 mb-8 text-center">
      <h3 className="text-lg font-semibold mb-2">Upload Timetable</h3>
      <p className="text-gray-500 mb-4 text-sm">Upload a JSON or CSV file containing your weekly schedule.</p>
      <input 
        type="file" 
        accept=".json,.csv"
        onChange={handleFileUpload}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />
    </div>
  );
};

export default TimetableUpload;