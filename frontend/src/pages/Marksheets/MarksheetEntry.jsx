import React, { useState, useEffect, useCallback } from 'react';
import { Save, Calculator } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

const getGrade = (percentage) => {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B';
    if (percentage >= 60) return 'C';
    if (percentage >= 50) return 'D';
    return 'F';
};

export default function MarksheetEntry() {
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedExam, setSelectedExam] = useState('');
  const [marks, setMarks] = useState({});
  const [total, setTotal] = useState(0);
  const [percentage, setPercentage] = useState(0);
  const [subjects, setSubjects] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const { api } = useAuth();
  const { addToast } = useNotification();


  const selectedStudent = students.find(s => s._id === selectedStudentId);

  useEffect(() => {
    const fetchStudents = async () => {
        try {
            const data = await api('/api/students');
            setStudents(data);
        } catch (error) {
            console.error("Failed to fetch students", error);
        }
    };
    fetchStudents();
  }, [api]);

  useEffect(() => {
    const fetchSubjectsForStudent = async () => {
        if (!selectedStudent || !selectedStudent.stream || !selectedStudent.currentSemester) {
            setSubjects([]);
            return;
        }
        setLoadingSubjects(true);
        try {
            // Fetch subjects for the student's specific stream and semester
            const subjectsData = await api(`/api/streams/${encodeURIComponent(selectedStudent.stream)}/${selectedStudent.currentSemester}/subjects`);
            setSubjects(subjectsData.map(s => ({ ...s, maxMarks: 100 }))); // Assuming max marks is 100
        } catch (error) {
            console.error("Failed to fetch subjects for stream/semester", error);
            setSubjects([]);
        } finally {
            setLoadingSubjects(false);
        }
    };

    fetchSubjectsForStudent();
    setMarks({}); // Reset marks when student changes
  }, [selectedStudent, api]);

  const fetchMarksheet = useCallback(async () => {
      if (selectedStudentId && selectedExam && selectedStudent?.currentSemester) {
          try {
              const data = await api(`/api/marksheet/${selectedStudentId}/${selectedExam}/${selectedStudent.currentSemester}`);
              if (data) {
                  const newMarks = {};
                  data.marks.forEach(m => {
                      newMarks[m.subjectName] = m.marksObtained;
                  });
                  setMarks(newMarks);
              } else {
                  setMarks({});
              }
          } catch (error) {
              console.error("Failed to fetch marksheet", error);
              setMarks({});
          }
      }
  }, [selectedStudentId, selectedExam, selectedStudent, api]);
  
  useEffect(() => {
    fetchMarksheet();
  }, [fetchMarksheet]);


  useEffect(() => {
    if (subjects.length > 0) {
      const currentTotal = subjects.reduce((acc, subject) => acc + (Number(marks[subject.name]) || 0), 0);
      const maxTotal = subjects.reduce((acc, subject) => acc + subject.maxMarks, 0);
      setTotal(currentTotal);
      setPercentage(maxTotal > 0 ? ((currentTotal / maxTotal) * 100).toFixed(2) : 0);
    } else {
        setTotal(0);
        setPercentage(0);
    }
  }, [marks, subjects]);

  const handleMarkChange = (subjectName, value, maxMarks) => {
    const numericValue = Math.max(0, Math.min(maxMarks, Number(value)));
    setMarks(prev => ({ ...prev, [subjectName]: numericValue }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if(!selectedStudentId || !selectedExam || !selectedStudent?.currentSemester) {
        addToast("Please select a student and an exam.", "error");
        return;
    }

    const marksheetData = {
        student: selectedStudentId,
        exam: selectedExam,
        semester: selectedStudent.currentSemester,
        marks: subjects.map(s => ({
            subjectName: s.name,
            marksObtained: marks[s.name] || 0,
            maxMarks: s.maxMarks
        })),
        total,
        percentage,
        grade: getGrade(percentage)
    };

    try {
        await api('/api/marksheet', {
            method: 'POST',
            body: JSON.stringify(marksheetData)
        });
        console.log("Marksheet submitted:", marksheetData);
        addToast("Marksheet saved successfully!", "success");
    } catch(err) {
        addToast("Error saving marksheet.", "error");
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">Student Marksheet Entry</h1>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div>
            <label htmlFor="student-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Select Student</label>
            <select id="student-select" value={selectedStudentId} onChange={e => { setSelectedStudentId(e.target.value); }} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md">
              <option value="">-- Select a Student --</option>
              {students.map(s => <option key={s._id} value={s._id}>{s.firstName} {s.lastName} ({s.stream})</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="exam-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Select Exam</label>
            <select id="exam-select" value={selectedExam} onChange={e => setSelectedExam(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md">
              <option value="">-- Select an Exam --</option>
              <option value="mid-term">Mid-Term</option>
              <option value="final">Final Exam</option>
              <option value="unit-test-1">Unit Test 1</option>
            </select>
          </div>
        </div>
        
        {selectedStudent && selectedExam && (
            <div>
                <h2 className="text-xl font-semibold mb-4">Enter Marks for {selectedStudent.firstName} (Semester {selectedStudent.currentSemester})</h2>
                {loadingSubjects ? <p>Loading subjects...</p> : subjects.length > 0 ? (
                <div className="space-y-4">
                    {subjects.map(subject => (
                        <div key={subject._id} className="grid grid-cols-3 items-center gap-4">
                            <label className="font-medium text-gray-700 dark:text-gray-300">{subject.name} ({subject.code})</label>
                            <input 
                                type="number"
                                value={marks[subject.name] || ''}
                                onChange={(e) => handleMarkChange(subject.name, e.target.value, subject.maxMarks)}
                                placeholder="Enter marks"
                                className="p-2 border rounded-md"
                                max={subject.maxMarks}
                                min="0"
                            />
                            <span className="text-sm text-gray-500">/ {subject.maxMarks}</span>
                        </div>
                    ))}
                </div>
                ) : <p className="text-gray-500">No subjects found for this student's current semester. Please add subjects in the Streams & Curriculum manager.</p>}
                
                {subjects.length > 0 && (
                <>
                    <div className="mt-8 p-6 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-200">
                        <h3 className="text-lg font-bold text-primary-800 dark:text-primary-300 flex items-center mb-4"><Calculator size={20} className="mr-2"/> Automatic Calculations</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                            <div>
                                <p className="text-sm text-gray-600">Total Marks</p>
                                <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{total} / {subjects.reduce((a, b) => a + b.maxMarks, 0)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Percentage</p>
                                <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{percentage}%</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Grade</p>
                                <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{getGrade(percentage)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end mt-8">
                        <button type="submit" className="flex items-center px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold">
                            <Save size={18} className="mr-2" /> Save Marksheet
                        </button>
                    </div>
                </>
                )}
            </div>
        )}
      </form>
    </div>
  );
}