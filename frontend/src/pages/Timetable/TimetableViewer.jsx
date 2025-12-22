

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Calculator, FlaskConical, BookText, Palette, Atom, TestTube, Sigma, Download, Trash2, AlertCircle, Sparkles, Loader2 } from 'lucide-react';
import ConfirmationModal from '../../components/ConfirmationModal';


// --- Data and Constants ---
const timeSlots = ['8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM'];
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const ItemTypes = { CLASS: 'class' };

// Icon mapping to render icons based on string names
const icons = {
    Sigma: <Sigma size={16} />,
    Atom: <Atom size={16} />,
    TestTube: <TestTube size={16} />,
    FlaskConical: <FlaskConical size={16} />,
    BookText: <BookText size={16} />,
    Palette: <Palette size={16} />,
    Calculator: <Calculator size={16} />,
};
const getIconByName = (iconName) => icons[iconName] || icons.Calculator;


// --- Subject Appearance Logic ---
const simpleHash = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash |= 0;
    }
    return Math.abs(hash);
};

const subjectAppearances = {
    'Mathematics': { color: 'bg-primary-100 dark:bg-primary-900/50', icon: 'Sigma' },
    'Science': { color: 'bg-green-100 dark:bg-green-900/50', icon: 'FlaskConical' },
    'English': { color: 'bg-yellow-100 dark:bg-yellow-900/50', icon: 'BookText' },
    'Physics': { color: 'bg-purple-100 dark:bg-purple-900/50', icon: 'Atom' },
    'Chemistry': { color: 'bg-indigo-100 dark:bg-indigo-900/50', icon: 'TestTube' },
    'Art': { color: 'bg-pink-100 dark:bg-pink-900/50', icon: 'Palette' },
    'Data Structures': { color: 'bg-primary-100 dark:bg-primary-900/50', icon: 'Sigma' },
};
const fallbackColors = ['bg-gray-100', 'bg-red-100', 'bg-teal-100', 'bg-orange-100'];
const getAppearanceForSubject = (subjectName) => {
    if (subjectAppearances[subjectName]) return subjectAppearances[subjectName];
    const color = fallbackColors[simpleHash(subjectName) % fallbackColors.length] + ' dark:bg-gray-700';
    return { color, icon: 'Calculator' };
};


// --- Form Modal Component ---
const TimetableEntryForm = ({ cell, availableSubjects, allFaculty, onSave, onCancel, currentTimetable, currentStream, currentSemester }) => {
    const [day, setDay] = useState(cell.day);
    const [time, setTime] = useState(cell.time);
    const [subject, setSubject] = useState(cell.classData?.subject || '');
    const [teacher, setTeacher] = useState(cell.classData?.teacher || '');
    const [error, setError] = useState('');

    const handleSubmit = () => {
        setError('');
        if (!subject || !teacher || !day || !time) {
            setError('All fields are required.');
            return;
        }

        const isEditing = !!cell.classData;
        
        // Check for a direct slot conflict on the target day and time
        const targetDaySchedule = currentTimetable[day] || {};
        if (targetDaySchedule[time]) {
            // It's a conflict unless we are editing the exact same slot we started from.
            const isTheOriginalSlot = isEditing && day === cell.day && time === cell.time;
            if (!isTheOriginalSlot) {
                setError(`Slot Conflict: This time slot is already occupied by "${targetDaySchedule[time].subject}".`);
                return;
            }
        }

        // Check for teacher conflict on the target day at different times
        for (const scheduledTime in targetDaySchedule) {
            // Don't check against the original slot if we're just editing its details (e.g., changing teacher but not time/day)
            const isTheOriginalSlot = isEditing && day === cell.day && scheduledTime === cell.time;
            if (isTheOriginalSlot) {
                continue;
            }
            
            // This checks if the chosen teacher is already busy at another time on the same day.
            if (targetDaySchedule[scheduledTime].teacher === teacher) {
                setError(`Teacher Conflict: ${teacher} is already scheduled at ${scheduledTime} on this day.`);
                return;
            }
        }


        onSave({
            new_day: day,
            new_time: time,
            subject,
            teacher,
            original_day: cell.day,
            original_time: cell.time,
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-[100] p-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-2xl w-full max-w-md">
                <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">{cell.classData ? 'Edit' : 'Add'} Class Slot</h2>
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Day</label>
                        <select value={day} onChange={e => setDay(e.target.value)} className="w-full p-2 border rounded mt-1 dark:bg-gray-700 dark:border-gray-600">
                            {days.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Time</label>
                        <select value={time} onChange={e => setTime(e.target.value)} className="w-full p-2 border rounded mt-1 dark:bg-gray-700 dark:border-gray-600">
                            {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Subject</label>
                        <select value={subject} onChange={e => setSubject(e.target.value)} className="w-full p-2 border rounded mt-1 dark:bg-gray-700 dark:border-gray-600">
                            <option value="">-- Select Subject --</option>
                            {availableSubjects.map(s => <option key={s._id} value={s.name}>{s.name} ({s.code})</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Teacher</label>
                        <select value={teacher} onChange={e => setTeacher(e.target.value)} className="w-full p-2 border rounded mt-1 dark:bg-gray-700 dark:border-gray-600">
                            <option value="">-- Select Teacher --</option>
                            {allFaculty.map(f => <option key={f._id} value={f.name}>{f.name}</option>)}
                        </select>
                    </div>
                </div>
                {error && <p className="text-red-500 text-sm mt-4 text-center p-2 bg-red-50 dark:bg-red-900/30 rounded-md border border-red-200 dark:border-red-800">{error}</p>}
                <div className="flex justify-end gap-2 mt-6">
                    <button onClick={onCancel} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded">Cancel</button>
                    <button onClick={handleSubmit} className="px-4 py-2 bg-primary-600 text-white rounded">Save</button>
                </div>
            </div>
        </div>
    );
};


// --- DND Components ---
const DraggableClass = ({ classData, day, time, onDelete }) => {
    const { user } = useAuth();
    const [{ isDragging }, drag] = useDrag(() => ({
        type: ItemTypes.CLASS,
        item: { ...classData, day, time },
        canDrag: user?.role === 'Admin',
        collect: (monitor) => ({ isDragging: !!monitor.isDragging() }),
    }), [user, classData, day, time]);

    const appearance = getAppearanceForSubject(classData.subject);

    return (
        <div ref={drag} className={`relative w-full h-full p-2 rounded-md transition-opacity ${isDragging ? 'opacity-50' : 'opacity-100'} ${user?.role === 'Admin' ? 'cursor-move' : 'cursor-default'}`}>
            {user?.role === 'Admin' && (
                <div className="absolute top-1 right-1 flex opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => { e.stopPropagation(); onDelete(day, time, classData); }} className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full">
                        <Trash2 size={14} />
                    </button>
                </div>
            )}
            <div className="flex items-center font-bold text-sm text-gray-800 dark:text-gray-200">
                {getIconByName(appearance.icon)}
                <span className="ml-1.5">{classData.subject}</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{classData.teacher}</p>
        </div>
    );
};

const DropTargetCell = ({ day, time, classData, moveClass, onClick, children }) => {
    const { user } = useAuth();
    const [{ isOver, canDrop }, drop] = useDrop(() => ({
        accept: ItemTypes.CLASS,
        canDrop: () => !classData && user?.role === 'Admin',
        drop: (item) => moveClass(item.day, item.time, day, time),
        collect: (monitor) => ({ isOver: !!monitor.isOver(), canDrop: !!monitor.canDrop() }),
    }), [day, time, classData, moveClass, user]);

    const isAdmin = user?.role === 'Admin';
    
    let cellClasses = 'group border rounded-md min-h-[90px] transition-all duration-200 ease-in-out';

    if (classData) {
        const appearance = getAppearanceForSubject(classData.subject);
        cellClasses += ` ${appearance.color} dark:border-gray-700`;
    } else {
        if (isAdmin) {
            cellClasses += ' bg-gray-50 dark:bg-gray-700/30 border-dashed border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 hover:border-solid';
            if (canDrop && isOver) {
                cellClasses += ' !bg-primary-100 dark:!bg-primary-900/50 !border-solid !border-primary-400 ring-2 ring-primary-400';
            }
        } else {
             cellClasses += ' bg-gray-50 dark:bg-gray-700/30 dark:border-gray-700';
        }
    }
    
    const cellCursor = isAdmin ? 'cursor-pointer' : 'cursor-default';
    cellClasses += ` ${cellCursor}`;

    return (
        <div ref={drop} onClick={onClick} className={cellClasses}>
            {children}
        </div>
    );
};


// --- Main Timetable Logic Component ---
function Timetable() {
    const [streams, setStreams] = useState([]);
    const [selectedStreamName, setSelectedStreamName] = useState('');
    const [selectedSemester, setSelectedSemester] = useState('');
    
    const [timetable, setTimetable] = useState({});
    const timetableRef = useRef(null);
    const { user, api } = useAuth();
    const { addToast } = useNotification();


    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingCell, setEditingCell] = useState(null);
    const [availableSubjects, setAvailableSubjects] = useState([]);
    const [allFaculty, setAllFaculty] = useState([]);
    
    const [isSuggesting, setIsSuggesting] = useState(false);
    const [suggestionError, setSuggestionError] = useState('');
    const [confirmingSuggestion, setConfirmingSuggestion] = useState(null);
    const [confirmAction, setConfirmAction] = useState(null);


    useEffect(() => {
        const initializeTimetable = async () => {
            try {
                if (user?.role === 'Student') {
                    // For students, fetch their specific profile to get their stream and semester
                    const [studentProfile, streamsData] = await Promise.all([
                        api('/api/students/profile'),
                        api('/api/streams') // Still need all streams to find matching data
                    ]);

                    if (studentProfile) {
                        setStreams(streamsData);
                        setSelectedStreamName(studentProfile.stream);
                        setSelectedSemester(studentProfile.currentSemester.toString());
                    }
                } else if (user?.role === 'Admin' || user?.role === 'Teacher') {
                    // For Admins/Teachers, fetch all streams and faculty, and default to the first one
                    const [streamsData, facultyData] = await Promise.all([
                        api('/api/streams'),
                        user?.role === 'Admin' ? api('/api/faculty') : Promise.resolve([])
                    ]);
                    setStreams(streamsData);
                    setAllFaculty(facultyData);
                    if (streamsData.length > 0) {
                        setSelectedStreamName(streamsData[0].name);
                        if (streamsData[0].semesters.length > 0) {
                            setSelectedSemester(streamsData[0].semesters[0].semesterNumber.toString());
                        }
                    }
                }
            } catch (error) {
                console.error("Failed to fetch initial data:", error);
                addToast('Failed to load initial data.', 'error');
            }
        };
        if (user) {
            initializeTimetable();
        }
    }, [api, user, addToast]);

    const fetchTimetableAndSubjects = useCallback(async () => {
        if (!selectedStreamName || !selectedSemester) return;
        try {
            const timetablePromise = api(`/api/timetable/${selectedStreamName}/${selectedSemester}`);
            
            // Students don't need the subjects list for editing, so we skip this call for them.
            const subjectsPromise = (user?.role === 'Admin' || user?.role === 'Teacher')
                ? api(`/api/streams/${selectedStreamName}/${selectedSemester}/subjects`)
                : Promise.resolve([]); // Resolve immediately with an empty array for students

            const [timetableData, subjectsData] = await Promise.all([
                timetablePromise,
                subjectsPromise
            ]);
            
            setTimetable(timetableData.schedule || {});
            setAvailableSubjects(subjectsData);
        } catch (error) {
            console.error("Failed to fetch timetable data", error);
            addToast(`Could not load data for ${selectedStreamName}.`, 'error');
            setTimetable({}); // Reset on error
            setAvailableSubjects([]);
        }
    }, [api, selectedStreamName, selectedSemester, user, addToast]);
    
    useEffect(() => {
        fetchTimetableAndSubjects();
    }, [fetchTimetableAndSubjects]);
    
    const saveTimetable = async (newSchedule) => {
        try {
            await api(`/api/timetable/${selectedStreamName}/${selectedSemester}`, { method: 'PUT', body: JSON.stringify({ schedule: newSchedule }) });
            addToast('Timetable saved successfully!', 'success');
        } catch (error) {
            console.error("Failed to save timetable:", error);
            addToast("Could not save timetable changes.", 'error');
            fetchTimetableAndSubjects(); // Revert optimistic update
        }
    };
    
    const handleCellClick = (day, time, classData) => {
        if (user?.role !== 'Admin') return;
        setEditingCell({ day, time, classData });
        setIsFormOpen(true);
    };

    const handleSaveOrUpdateEntry = ({ new_day, new_time, subject, teacher, original_day, original_time }) => {
        const newSchedule = JSON.parse(JSON.stringify(timetable));

        if (original_day && original_time && newSchedule[original_day]?.[original_time]) {
            delete newSchedule[original_day][original_time];
            if (Object.keys(newSchedule[original_day]).length === 0) delete newSchedule[original_day];
        }
        
        if (!newSchedule[new_day]) newSchedule[new_day] = {};
        newSchedule[new_day][new_time] = { subject, teacher };

        setTimetable(newSchedule);
        saveTimetable(newSchedule);
        setIsFormOpen(false);
        setEditingCell(null);
    };

    const handleDeleteEntry = (day, time, classData) => {
        setConfirmAction({
            title: 'Delete Class Slot',
            message: `Are you sure you want to delete the "${classData.subject}" class at ${time} on ${day}?`,
            onConfirm: () => {
                const newSchedule = JSON.parse(JSON.stringify(timetable));
                if (newSchedule[day]?.[time]) {
                    delete newSchedule[day][time];
                    if (Object.keys(newSchedule[day]).length === 0) delete newSchedule[day];
                    setTimetable(newSchedule);
                    saveTimetable(newSchedule);
                }
                setConfirmAction(null);
            }
        });
    };
    
    const moveClass = (fromDay, fromTime, toDay, toTime) => {
        const newSchedule = JSON.parse(JSON.stringify(timetable));
        const classToMove = newSchedule[fromDay]?.[fromTime];
        if (!classToMove) return;

        if (!newSchedule[toDay]) newSchedule[toDay] = {};
        newSchedule[toDay][toTime] = classToMove;
        delete newSchedule[fromDay][fromTime];
        
        setTimetable(newSchedule);
        saveTimetable(newSchedule);
    };

    const handleSuggestTimetable = async () => {
        if (!selectedStreamName || !selectedSemester) {
            addToast("Please select a stream and semester first.", 'error');
            return;
        }

        setIsSuggesting(true);
        setSuggestionError('');

        try {
            const data = await api(`/api/timetable/suggest/${selectedStreamName}/${selectedSemester}`, {
                method: 'POST'
            });
            setConfirmingSuggestion(data.schedule);
        } catch (error) {
            console.error("Failed to get AI suggestion:", error);
            setSuggestionError(error.message || 'An error occurred while generating the suggestion.');
        } finally {
            setIsSuggesting(false);
        }
    };
    
    const applyAISuggestion = async () => {
        if (!confirmingSuggestion) return;
        setTimetable(confirmingSuggestion);
        await saveTimetable(confirmingSuggestion);
        setConfirmingSuggestion(null);
    }
    
    const exportToPdf = () => { /* ... PDF export logic, unchanged ... */ };

    const selectedStream = streams.find(s => s.name === selectedStreamName);
    const isStudent = user?.role === 'Student';

    return (
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-8 rounded-xl shadow-lg">
            <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100">Class Timetable</h1>
                <div className="flex items-center gap-4">
                    <div>
                        <label htmlFor="stream-select" className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Select Stream</label>
                        <select 
                            id="stream-select" 
                            value={selectedStreamName} 
                            onChange={e => { setSelectedStreamName(e.target.value); setSelectedSemester('1'); }} 
                            className="mt-1 block w-full sm:w-48 pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md disabled:opacity-75 disabled:bg-gray-100 dark:disabled:bg-gray-600"
                            disabled={isStudent}
                        >
                           {streams.map(s => <option key={s._id} value={s.name}>{s.name}</option>)}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="semester-select" className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Semester</label>
                        <select 
                            id="semester-select" 
                            value={selectedSemester} 
                            onChange={e => setSelectedSemester(e.target.value)} 
                            className="mt-1 block w-full sm:w-32 pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md disabled:opacity-75 disabled:bg-gray-100 dark:disabled:bg-gray-600" 
                            disabled={!selectedStream || isStudent}
                        >
                           {selectedStream?.semesters.map(s => <option key={s._id} value={s.semesterNumber}>{s.semesterNumber}</option>)}
                        </select>
                    </div>
                    {user?.role === 'Admin' && (
                        <div className="self-end">
                            <button 
                                onClick={handleSuggestTimetable}
                                disabled={isSuggesting}
                                className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:bg-primary-400"
                            >
                                <Sparkles size={18} className="mr-2" />
                                {isSuggesting ? 'Generating...' : 'Suggest with AI'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
            {suggestionError && (
                <div className="my-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg flex items-center">
                    <AlertCircle className="mr-2" size={20}/>
                    <strong>Error:</strong> {suggestionError}
                </div>
            )}

            <div className="overflow-x-auto">
                <div ref={timetableRef} className="grid grid-cols-[auto_repeat(5,minmax(140px,1fr))] gap-1 min-w-[700px] p-2 bg-white dark:bg-gray-800">
                    <div className="p-2 font-semibold text-center sticky left-0 bg-white dark:bg-gray-800 z-10">Time</div>
                    {days.map(day => <div key={day} className="p-2 font-semibold text-center bg-gray-100 dark:bg-gray-700 rounded-t-md">{day}</div>)}

                    {timeSlots.map(time => (
                        <React.Fragment key={time}>
                            <div className="p-2 font-semibold text-center sticky left-0 bg-white dark:bg-gray-800 z-10 flex items-center justify-center text-sm">{time}</div>
                            {days.map(day => {
                                const cellData = timetable[day]?.[time];
                                return (
                                    <DropTargetCell key={`${day}-${time}`} day={day} time={time} classData={cellData} moveClass={moveClass} onClick={() => handleCellClick(day, time, cellData)}>
                                        {cellData && <DraggableClass classData={cellData} day={day} time={time} onDelete={handleDeleteEntry} />}
                                    </DropTargetCell>
                                );
                            })}
                        </React.Fragment>
                    ))}
                </div>
            </div>
             {user?.role === 'Admin' && <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">Admin Mode: Click any cell to add/edit, or drag and drop to rearrange.</p>}
             
             {isFormOpen && <TimetableEntryForm 
                cell={editingCell} 
                availableSubjects={availableSubjects} 
                allFaculty={allFaculty} 
                onSave={handleSaveOrUpdateEntry} 
                onCancel={() => setIsFormOpen(false)}
                currentTimetable={timetable}
             />}
             {isSuggesting && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex flex-col justify-center items-center z-[110]">
                    <Loader2 className="animate-spin h-12 w-12 text-white" />
                    <p className="text-white mt-4 font-semibold">AI is generating a timetable suggestion...</p>
                    <p className="text-gray-300 text-sm">This may take a moment.</p>
                </div>
            )}
            {confirmingSuggestion && (
                 <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-[110] p-4">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-2xl w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">AI Suggestion Ready</h2>
                        <p className="text-gray-600 dark:text-gray-300">The AI has generated a new timetable. Do you want to apply it? This will overwrite the current schedule.</p>
                        <div className="flex justify-end gap-2 mt-6">
                            <button onClick={() => setConfirmingSuggestion(null)} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
                            <button onClick={applyAISuggestion} className="px-4 py-2 bg-primary-600 text-white rounded">Apply Suggestion</button>
                        </div>
                    </div>
                </div>
            )}
            <ConfirmationModal 
                isOpen={!!confirmAction}
                onClose={() => setConfirmAction(null)}
                onConfirm={confirmAction?.onConfirm}
                title={confirmAction?.title}
                message={confirmAction?.message}
            />
        </div>
    );
}

export default function TimetableViewer() {
  return (
    <DndProvider backend={HTML5Backend}>
      <Timetable />
    </DndProvider>
  );
}