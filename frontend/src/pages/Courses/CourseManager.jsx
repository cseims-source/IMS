import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, ChevronDown, Book, FileText } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const CourseForm = ({ course, onSave, onCancel }) => {
    const [formData, setFormData] = useState(course ? { name: course.name, duration: course.duration, credits: course.credits, description: course.description } : { name: '', duration: '', credits: '', description: '' });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-2xl w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">{course ? 'Edit Course' : 'Add New Course'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input name="name" value={formData.name} onChange={handleChange} placeholder="Course Name" className="w-full p-2 border rounded" required />
                    <input name="duration" value={formData.duration} onChange={handleChange} placeholder="Duration" className="w-full p-2 border rounded" />
                    <input name="credits" type="number" value={formData.credits} onChange={handleChange} placeholder="Total Credits" className="w-full p-2 border rounded" />
                    <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Description" className="w-full p-2 border rounded h-24" />
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const SubjectForm = ({ subject, onSave, onCancel }) => {
    const [formData, setFormData] = useState(subject || { name: '', code: '', credits: ''});
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-[60] p-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-2xl w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">{subject ? 'Edit Subject' : 'Add New Subject'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input name="name" value={formData.name} onChange={handleChange} placeholder="Subject Name" className="w-full p-2 border rounded" required />
                    <input name="code" value={formData.code} onChange={handleChange} placeholder="Subject Code" className="w-full p-2 border rounded" required />
                    <input name="credits" type="number" value={formData.credits} onChange={handleChange} placeholder="Credits" className="w-full p-2 border rounded" />
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default function CourseManager() {
  const [courses, setCourses] = useState([]);
  const [isCourseFormOpen, setIsCourseFormOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [openCourseId, setOpenCourseId] = useState(null);

  const [isSubjectFormOpen, setIsSubjectFormOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [currentCourseId, setCurrentCourseId] = useState(null);
  const { api } = useAuth();

  useEffect(() => {
    fetchCourses();
  }, [api]);

  const fetchCourses = async () => {
      try {
          const data = await api('/api/courses');
          setCourses(data);
      } catch (error) {
          console.error("Failed to fetch courses:", error);
      }
  };

  const handleAddCourse = () => {
    setEditingCourse(null);
    setIsCourseFormOpen(true);
  };
  
  const handleEditCourse = (course) => {
    setEditingCourse(course);
    setIsCourseFormOpen(true);
  };

  const handleDeleteCourse = async (courseId) => {
      if(window.confirm('Are you sure you want to delete this course?')) {
        await api(`/api/courses/${courseId}`, { method: 'DELETE' });
        fetchCourses();
      }
  };

  const handleSaveCourse = async (courseData) => {
    const method = editingCourse ? 'PUT' : 'POST';
    const url = editingCourse ? `/api/courses/${editingCourse._id}` : '/api/courses';
    await api(url, {
        method,
        body: JSON.stringify(courseData)
    });
    setIsCourseFormOpen(false);
    setEditingCourse(null);
    fetchCourses();
  };

  const handleAddSubject = (courseId) => {
    setCurrentCourseId(courseId);
    setEditingSubject(null);
    setIsSubjectFormOpen(true);
  }

  const handleEditSubject = (subject, courseId) => {
    setCurrentCourseId(courseId);
    setEditingSubject(subject);
    setIsSubjectFormOpen(true);
  }

  const handleDeleteSubject = async (subjectId, courseId) => {
    if(window.confirm('Are you sure you want to delete this subject?')){
        await api(`/api/courses/${courseId}/subjects/${subjectId}`, { method: 'DELETE' });
        fetchCourses();
    }
  }

  const handleSaveSubject = async (subjectData) => {
    const method = editingSubject ? 'PUT' : 'POST';
    const url = editingSubject 
        ? `/api/courses/${currentCourseId}/subjects/${editingSubject._id}`
        : `/api/courses/${currentCourseId}/subjects`;
    
    await api(url, {
        method,
        body: JSON.stringify(subjectData)
    });
    setIsSubjectFormOpen(false);
    setEditingSubject(null);
    setCurrentCourseId(null);
    fetchCourses();
  }

  const toggleCourse = (courseId) => {
      setOpenCourseId(openCourseId === courseId ? null : courseId);
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Course & Subject Manager</h1>
        <button onClick={handleAddCourse} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          <Plus size={20} className="mr-2" /> Add Course
        </button>
      </div>
      
      <div className="space-y-4">
        {courses.map(course => (
          <div key={course._id} className="border rounded-lg">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 cursor-pointer" onClick={() => toggleCourse(course._id)}>
              <div className="flex items-center">
                <Book className="mr-3 text-blue-500" />
                <div>
                  <h2 className="text-lg font-semibold">{course.name}</h2>
                  <p className="text-sm text-gray-500">{course.duration} &middot; {course.credits} Credits</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                 <div className="flex items-center gap-2">
                    <button onClick={(e) => { e.stopPropagation(); handleEditCourse(course); }} className="p-2 text-blue-600 hover:bg-blue-100 rounded-full"><Edit size={16}/></button>
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteCourse(course._id); }} className="p-2 text-red-600 hover:bg-red-100 rounded-full"><Trash2 size={16}/></button>
                 </div>
                 <ChevronDown className={`transition-transform ${openCourseId === course._id ? 'rotate-180' : ''}`} />
              </div>
            </div>
            {openCourseId === course._id && (
              <div className="p-4 border-t dark:border-gray-600">
                 <p className="text-gray-600 dark:text-gray-300 mb-4">{course.description}</p>
                 <h3 className="font-semibold mb-2">Subjects</h3>
                 <ul className="space-y-2">
                    {course.subjects.map(subject => (
                        <li key={subject._id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-600 rounded">
                            <div className="flex items-center">
                                <FileText size={16} className="mr-3 text-gray-500" />
                                <span>{subject.code} - {subject.name} ({subject.credits} credits)</span>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => handleEditSubject(subject, course._id)} className="p-1 text-blue-600 hover:bg-blue-100 rounded-full"><Edit size={14}/></button>
                                <button onClick={() => handleDeleteSubject(subject._id, course._id)} className="p-1 text-red-600 hover:bg-red-100 rounded-full"><Trash2 size={14}/></button>
                            </div>
                        </li>
                    ))}
                    {course.subjects.length === 0 && <p className="text-sm text-gray-500">No subjects added yet.</p>}
                 </ul>
                 <button onClick={() => handleAddSubject(course._id)} className="text-sm text-blue-600 mt-3 flex items-center"><Plus size={16} className="mr-1"/> Add Subject</button>
              </div>
            )}
          </div>
        ))}
      </div>

      {isCourseFormOpen && <CourseForm course={editingCourse} onSave={handleSaveCourse} onCancel={() => setIsCourseFormOpen(false)} />}
      {isSubjectFormOpen && <SubjectForm subject={editingSubject} onSave={handleSaveSubject} onCancel={() => setIsSubjectFormOpen(false)} />}
    </div>
  );
}