import React, { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Plus, Wand2, Trash2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import Spinner from '../../components/Spinner';

export default function ExamScheduler() {
    const { api, user } = useAuth();
    const { addToast } = useNotification();
    const [streams, setStreams] = useState([]);
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(false);

    const [filters, setFilters] = useState({
        stream: 'all',
        semester: 'all',
        section: 'all',
        academicYear: 'all',
        status: 'all'
    });

    const [form, setForm] = useState({
        name: '',
        type: 'custom',
        stream: '',
        semester: '1',
        section: 'A',
        subject: '',
        academicYear: '',
        startDate: '',
        endDate: '',
        status: 'scheduled',
        notes: ''
    });

    const [autoForm, setAutoForm] = useState({
        stream: '',
        academicYear: '',
        semesters: [1],
        section: 'A',
        subjectWise: true
    });

    useEffect(() => {
        const loadStreams = async () => {
            try {
                const data = await api('/api/streams');
                setStreams(data);
            } catch (error) {
                addToast('Failed to load streams.', 'error');
            }
        };
        loadStreams();
    }, [api, addToast]);

    const fetchExams = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                stream: filters.stream,
                semester: filters.semester,
                section: filters.section,
                academicYear: filters.academicYear,
                status: filters.status
            });
            const data = await api(`/api/exams?${params.toString()}`);
            setExams(data || []);
        } catch (error) {
            addToast('Failed to load exams.', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExams();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleCreateExam = async (e) => {
        e.preventDefault();
        try {
            await api('/api/exams', {
                method: 'POST',
                body: JSON.stringify(form)
            });
            addToast('Exam created.', 'success');
            setForm(p => ({ ...p, name: '', subject: '', startDate: '', endDate: '', notes: '' }));
            fetchExams();
        } catch (error) {
            addToast(error.message || 'Failed to create exam.', 'error');
        }
    };

    const handleAutoSchedule = async () => {
        try {
            await api('/api/exams/auto-schedule', {
                method: 'POST',
                body: JSON.stringify(autoForm)
            });
            addToast('Auto schedule completed.', 'success');
            fetchExams();
        } catch (error) {
            addToast(error.message || 'Auto schedule failed.', 'error');
        }
    };

    const handleDeleteExam = async (id) => {
        if (!confirm('Delete this exam?')) return;
        try {
            await api(`/api/exams/${id}`, { method: 'DELETE' });
            addToast('Exam deleted.', 'success');
            fetchExams();
        } catch (error) {
            addToast(error.message || 'Failed to delete exam.', 'error');
        }
    };

    const streamOptions = useMemo(() => streams.map(s => s.name), [streams]);

    return (
        <div className="space-y-8 max-w-[1400px] mx-auto pb-16 animate-fade-in">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-2xl text-primary-600"><CalendarDays size={24} /></div>
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Exam Scheduler</h1>
                    <p className="text-[0.65rem] font-black text-gray-400 uppercase tracking-[0.4em]">Create, schedule, and manage exams</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-xl">
                    <h2 className="text-lg font-black uppercase tracking-tight mb-4">Create Exam</h2>
                    <form onSubmit={handleCreateExam} className="space-y-4">
                        <input value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Exam Name" className="w-full p-3 bg-gray-50 dark:bg-gray-900 rounded-2xl font-bold" />
                        <select value={form.type} onChange={(e) => setForm(p => ({ ...p, type: e.target.value }))} className="w-full p-3 bg-gray-50 dark:bg-gray-900 rounded-2xl font-bold">
                            <option value="custom">Custom</option>
                            <option value="surprise">Surprise</option>
                            <option value="unit-test">Unit Test</option>
                            <option value="mid-term">Mid Term</option>
                            <option value="final">Final</option>
                            <option value="practical">Practical</option>
                        </select>
                        <select value={form.stream} onChange={(e) => setForm(p => ({ ...p, stream: e.target.value }))} className="w-full p-3 bg-gray-50 dark:bg-gray-900 rounded-2xl font-bold">
                            <option value="">Select Stream</option>
                            {streamOptions.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <div className="grid grid-cols-2 gap-3">
                            <input type="number" value={form.semester} onChange={(e) => setForm(p => ({ ...p, semester: e.target.value }))} placeholder="Semester" className="w-full p-3 bg-gray-50 dark:bg-gray-900 rounded-2xl font-bold" />
                            <input value={form.section} onChange={(e) => setForm(p => ({ ...p, section: e.target.value }))} placeholder="Section" className="w-full p-3 bg-gray-50 dark:bg-gray-900 rounded-2xl font-bold" />
                        </div>
                        <input value={form.academicYear} onChange={(e) => setForm(p => ({ ...p, academicYear: e.target.value }))} placeholder="Academic Year (optional)" className="w-full p-3 bg-gray-50 dark:bg-gray-900 rounded-2xl font-bold" />
                        <input value={form.subject} onChange={(e) => setForm(p => ({ ...p, subject: e.target.value }))} placeholder="Subject (optional)" className="w-full p-3 bg-gray-50 dark:bg-gray-900 rounded-2xl font-bold" />
                        <div className="grid grid-cols-2 gap-3">
                            <input type="date" value={form.startDate} onChange={(e) => setForm(p => ({ ...p, startDate: e.target.value }))} className="w-full p-3 bg-gray-50 dark:bg-gray-900 rounded-2xl font-bold" />
                            <input type="date" value={form.endDate} onChange={(e) => setForm(p => ({ ...p, endDate: e.target.value }))} className="w-full p-3 bg-gray-50 dark:bg-gray-900 rounded-2xl font-bold" />
                        </div>
                        <textarea value={form.notes} onChange={(e) => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Notes" className="w-full p-3 bg-gray-50 dark:bg-gray-900 rounded-2xl font-bold" />
                        <button type="submit" className="w-full py-3 bg-primary-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest">Create Exam</button>
                    </form>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-xl">
                    <h2 className="text-lg font-black uppercase tracking-tight mb-4">Auto Schedule</h2>
                    <div className="space-y-3">
                        <select value={autoForm.stream} onChange={(e) => setAutoForm(p => ({ ...p, stream: e.target.value }))} className="w-full p-3 bg-gray-50 dark:bg-gray-900 rounded-2xl font-bold">
                            <option value="">Select Stream</option>
                            {streamOptions.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <input value={autoForm.academicYear} onChange={(e) => setAutoForm(p => ({ ...p, academicYear: e.target.value }))} placeholder="Academic Year" className="w-full p-3 bg-gray-50 dark:bg-gray-900 rounded-2xl font-bold" />
                        <input value={autoForm.section} onChange={(e) => setAutoForm(p => ({ ...p, section: e.target.value }))} placeholder="Section" className="w-full p-3 bg-gray-50 dark:bg-gray-900 rounded-2xl font-bold" />
                        <input value={autoForm.semesters.join(',')} onChange={(e) => setAutoForm(p => ({ ...p, semesters: e.target.value.split(',').map(v => parseInt(v.trim(), 10)).filter(Boolean) }))} placeholder="Semesters (e.g., 1,2,3)" className="w-full p-3 bg-gray-50 dark:bg-gray-900 rounded-2xl font-bold" />
                        <label className="flex items-center gap-3 text-[0.65rem] font-black uppercase tracking-widest text-gray-400">
                            <input type="checkbox" checked={autoForm.subjectWise} onChange={(e) => setAutoForm(p => ({ ...p, subjectWise: e.target.checked }))} />
                            Subject-wise scheduling
                        </label>
                        <button onClick={handleAutoSchedule} className="w-full py-3 bg-gray-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest">Auto Schedule</button>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-xl">
                    <h2 className="text-lg font-black uppercase tracking-tight mb-4">Filter Exams</h2>
                    <div className="space-y-3">
                        <select value={filters.stream} onChange={(e) => setFilters(p => ({ ...p, stream: e.target.value }))} className="w-full p-3 bg-gray-50 dark:bg-gray-900 rounded-2xl font-bold">
                            <option value="all">All Streams</option>
                            {streamOptions.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <select value={filters.semester} onChange={(e) => setFilters(p => ({ ...p, semester: e.target.value }))} className="w-full p-3 bg-gray-50 dark:bg-gray-900 rounded-2xl font-bold">
                            <option value="all">All Semesters</option>
                            {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Sem {s}</option>)}
                        </select>
                        <select value={filters.section} onChange={(e) => setFilters(p => ({ ...p, section: e.target.value }))} className="w-full p-3 bg-gray-50 dark:bg-gray-900 rounded-2xl font-bold">
                            <option value="all">All Sections</option>
                            {['A','B','C','D','E'].map(s => <option key={s} value={s}>Section {s}</option>)}
                        </select>
                        <input value={filters.academicYear} onChange={(e) => setFilters(p => ({ ...p, academicYear: e.target.value }))} placeholder="Academic Year" className="w-full p-3 bg-gray-50 dark:bg-gray-900 rounded-2xl font-bold" />
                        <select value={filters.status} onChange={(e) => setFilters(p => ({ ...p, status: e.target.value }))} className="w-full p-3 bg-gray-50 dark:bg-gray-900 rounded-2xl font-bold">
                            <option value="all">All Status</option>
                            <option value="scheduled">Scheduled</option>
                            <option value="ongoing">Ongoing</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                        <button onClick={fetchExams} className="w-full py-3 bg-primary-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest">Apply Filters</button>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-black uppercase tracking-tight">Scheduled Exams</h2>
                    <span className="text-[0.6rem] font-black uppercase tracking-widest text-gray-400">{exams.length} total</span>
                </div>
                {loading ? (
                    <div className="py-10 text-center"><Spinner /></div>
                ) : exams.length === 0 ? (
                    <p className="text-sm text-gray-400">No exams found.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {exams.map(exam => (
                            <div key={exam._id} className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-black text-gray-800 dark:text-gray-100">{exam.name}</p>
                                        <p className="text-[0.6rem] uppercase tracking-widest text-gray-400">{exam.stream} • Sem {exam.semester} • Sec {exam.section}</p>
                                        <p className="text-[0.6rem] uppercase tracking-widest text-gray-400">{exam.startDate}{exam.endDate ? ` → ${exam.endDate}` : ''}</p>
                                    </div>
                                    {user?.role === 'Admin' && (
                                        <button onClick={() => handleDeleteExam(exam._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl"><Trash2 size={16} /></button>
                                    )}
                                </div>
                                {exam.subject && <p className="text-[0.65rem] font-black uppercase tracking-widest text-primary-600 mt-2">{exam.subject}</p>}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
