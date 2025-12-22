import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, ChevronDown, Book, FileText, Bookmark, PlusCircle, Sparkles, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import ConfirmationModal from '../../components/ConfirmationModal';

// --- Reusable Modal Component ---
const Modal = ({ children, onClose }) => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in" onClick={onClose}>
        <div className="bg-white dark:bg-gray-900 p-8 rounded-[2rem] shadow-2xl w-full max-w-md border border-white/10 transform animate-scale-in" onClick={e => e.stopPropagation()}>
            {children}
        </div>
    </div>
);

// --- Form Components ---
const StreamForm = ({ stream, onSave, onCancel }) => {
    const [formData, setFormData] = useState(stream ? 
        { name: stream.name, level: stream.level, durationYears: stream.duration.split(' ')[0], description: stream.description } : 
        { name: '', level: 'Bachelors', durationYears: '4', description: '' }
    );
    const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleSubmit = (e) => { e.preventDefault(); onSave(formData); };

    return (
        <Modal onClose={onCancel}>
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-xl text-primary-600">
                    <Book size={24} />
                </div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
                    {stream ? 'Edit Stream' : 'New Stream'}
                </h2>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-1.5 ml-1">Stream Name</label>
                    <input name="name" value={formData.name} onChange={handleChange} placeholder="e.g., B.Tech in CS" className="w-full p-3 bg-gray-50 dark:bg-gray-800 border-0 rounded-2xl focus:ring-2 focus:ring-primary-500" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-1.5 ml-1">Level</label>
                        <select name="level" value={formData.level} onChange={handleChange} className="w-full p-3 bg-gray-50 dark:bg-gray-800 border-0 rounded-2xl focus:ring-2 focus:ring-primary-500">
                            <option>Bachelors</option>
                            <option>Masters</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-1.5 ml-1 flex items-center gap-1">
                            Duration <Clock size={12} />
                        </label>
                        <input name="durationYears" type="number" min="1" max="6" value={formData.durationYears} onChange={handleChange} placeholder="Years" className="w-full p-3 bg-gray-50 dark:bg-gray-800 border-0 rounded-2xl focus:ring-2 focus:ring-primary-500" required />
                        {!stream && <p className="text-[0.6rem] text-primary-500 mt-1 font-bold italic">Auto-generates {formData.durationYears * 2} semesters!</p>}
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-1.5 ml-1">Description</label>
                    <textarea name="description" value={formData.description} onChange={handleChange} placeholder="What is this stream about?" className="w-full p-3 bg-gray-50 dark:bg-gray-800 border-0 rounded-2xl focus:ring-2 focus:ring-primary-500 h-24 resize-none" />
                </div>
                <div className="flex gap-3 pt-4">
                    <button type="button" onClick={onCancel} className="flex-1 py-3 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-bold rounded-2xl hover:bg-gray-200 transition">Cancel</button>
                    <button type="submit" className="flex-[2] py-3 bg-primary-600 text-white font-bold rounded-2xl hover:bg-primary-700 transition shadow-lg shadow-primary-500/25">Save Stream</button>
                </div>
            </form>
        </Modal>
    );
};

const SubjectForm = ({ subject, onSave, onCancel }) => {
    const [formData, setFormData] = useState(subject || { name: '', code: '', credits: '' });
    const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleSubmit = (e) => { e.preventDefault(); onSave(formData); };

    return (
        <Modal onClose={onCancel}>
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl text-purple-600">
                    <FileText size={24} />
                </div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
                    {subject ? 'Edit Subject' : 'New Subject'}
                </h2>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-1.5 ml-1">Subject Name</label>
                    <input name="name" value={formData.name} onChange={handleChange} placeholder="e.g., Data Structures" className="w-full p-3 bg-gray-50 dark:bg-gray-800 border-0 rounded-2xl focus:ring-2 focus:ring-purple-500" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-1.5 ml-1">Code</label>
                        <input name="code" value={formData.code} onChange={handleChange} placeholder="CS-301" className="w-full p-3 bg-gray-50 dark:bg-gray-800 border-0 rounded-2xl focus:ring-2 focus:ring-purple-500" required />
                    </div>
                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-1.5 ml-1">Credits</label>
                        <input name="credits" type="number" value={formData.credits} onChange={handleChange} placeholder="4" className="w-full p-3 bg-gray-50 dark:bg-gray-800 border-0 rounded-2xl focus:ring-2 focus:ring-purple-500" required />
                    </div>
                </div>
                <div className="flex gap-3 pt-4">
                    <button type="button" onClick={onCancel} className="flex-1 py-3 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-bold rounded-2xl hover:bg-gray-200 transition">Cancel</button>
                    <button type="submit" className="flex-[2] py-3 bg-purple-600 text-white font-bold rounded-2xl hover:bg-purple-700 transition shadow-lg shadow-purple-500/25">Save Subject</button>
                </div>
            </form>
        </Modal>
    );
};

// --- Main Manager Component ---
export default function StreamManager() {
  const [streams, setStreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openState, setOpenState] = useState({}); // { streamId: { open: bool, openSemester: semesterId } }
  const [modal, setModal] = useState({ type: null, data: null });
  const [confirmAction, setConfirmAction] = useState(null);
  const { api } = useAuth();

  useEffect(() => {
    fetchStreams();
  }, [api]);

  const fetchStreams = async () => {
    setLoading(true);
    try {
        const data = await api('/api/streams');
        setStreams(data);
    } catch (error) {
        console.error("Failed to fetch streams:", error);
    } finally {
        setLoading(false);
    }
  };

  const handleSaveStream = async (streamData) => {
    const { data } = modal;
    const method = data ? 'PUT' : 'POST';
    const url = data ? `/api/streams/${data._id}` : '/api/streams';
    await api(url, { method, body: JSON.stringify(streamData) });
    setModal({ type: null });
    fetchStreams();
  };

  const handleDeleteStream = (streamId) => {
    setConfirmAction({
        title: 'Delete Stream',
        message: 'Are you sure you want to delete this entire stream and all its semesters/subjects? This action cannot be undone.',
        onConfirm: async () => {
            await api(`/api/streams/${streamId}`, { method: 'DELETE' });
            fetchStreams();
            setConfirmAction(null);
        }
    });
  };

  const handleAddSemester = async (streamId) => {
    await api(`/api/streams/${streamId}/semesters`, { method: 'POST' });
    fetchStreams();
  };

  const handleDeleteSemester = (streamId, semesterId) => {
     setConfirmAction({
        title: 'Delete Semester',
        message: 'Are you sure you want to delete this semester and all its subjects?',
        onConfirm: async () => {
            await api(`/api/streams/${streamId}/semesters/${semesterId}`, { method: 'DELETE' });
            fetchStreams();
            setConfirmAction(null);
        }
    });
  }

  const handleSaveSubject = async (subjectData) => {
    const { streamId, semesterId, subject } = modal.data;
    const method = subject ? 'PUT' : 'POST';
    const url = subject 
        ? `/api/streams/${streamId}/semesters/${semesterId}/subjects/${subject._id}`
        : `/api/streams/${streamId}/semesters/${semesterId}/subjects`;
    await api(url, { method, body: JSON.stringify(subjectData) });
    setModal({ type: null });
    fetchStreams();
  };

  const handleDeleteSubject = (streamId, semesterId, subjectId) => {
    setConfirmAction({
        title: 'Delete Subject',
        message: 'Are you sure you want to delete this subject?',
        onConfirm: async () => {
            await api(`/api/streams/${streamId}/semesters/${semesterId}/subjects/${subjectId}`, { method: 'DELETE' });
            fetchStreams();
            setConfirmAction(null);
        }
    });
  };
  
  const toggleStream = (streamId) => {
    setOpenState(prev => ({
        ...prev,
        [streamId]: { ...prev[streamId], open: !prev[streamId]?.open }
    }));
  };

  const toggleSemester = (streamId, semesterId) => {
     setOpenState(prev => ({
        ...prev,
        [streamId]: { ...prev[streamId], openSemester: prev[streamId]?.openSemester === semesterId ? null : semesterId }
    }));
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 animate-fade-in">
      <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
        <div className="space-y-1">
            <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter uppercase">Curriculum</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase tracking-widest">Academic Streams & Subject Plans</p>
        </div>
        <button onClick={() => setModal({ type: 'stream', data: null })} className="flex items-center px-8 py-3 bg-primary-600 text-white rounded-2xl font-black hover:bg-primary-700 transition shadow-xl shadow-primary-500/20 group uppercase text-sm tracking-widest">
          <Plus size={20} className="mr-2 group-hover:rotate-90 transition-transform" /> Add Stream
        </button>
      </div>
      
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Sparkles className="animate-pulse mb-4" size={48} />
            <p className="font-black uppercase tracking-widest">Syncing with registry...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
            {streams.map((stream, sIdx) => (
            <div key={stream._id} className="border dark:border-gray-700 rounded-[2rem] bg-gray-50/50 dark:bg-gray-900/30 overflow-hidden transform transition-all duration-300 hover:shadow-2xl animate-fade-in-up" style={{ animationDelay: `${sIdx * 100}ms` }}>
                <div className="flex items-center justify-between p-6 cursor-pointer group" onClick={() => toggleStream(stream._id)}>
                    <div className="flex items-center gap-5">
                        <div className="p-4 bg-white dark:bg-gray-800 rounded-[1.5rem] shadow-sm text-primary-500 group-hover:scale-110 transition-transform">
                            <Book size={32} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">{stream.name}</h2>
                            <div className="flex gap-3 mt-1">
                                <span className="text-[0.65rem] font-black uppercase tracking-widest bg-primary-100 dark:bg-primary-900/50 text-primary-600 px-2 py-0.5 rounded-md">{stream.level}</span>
                                <span className="text-[0.65rem] font-black uppercase tracking-widest bg-gray-200 dark:bg-gray-700 text-gray-500 px-2 py-0.5 rounded-md">{stream.duration}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={(e) => { e.stopPropagation(); setModal({ type: 'stream', data: stream }); }} className="p-3 text-primary-600 hover:bg-white dark:hover:bg-gray-800 rounded-full transition-all shadow-sm"><Edit size={18}/></button>
                            <button onClick={(e) => { e.stopPropagation(); handleDeleteStream(stream._id); }} className="p-3 text-red-600 hover:bg-white dark:hover:bg-gray-800 rounded-full transition-all shadow-sm"><Trash2 size={18}/></button>
                        </div>
                        <ChevronDown className={`transition-transform duration-500 text-gray-400 ${openState[stream._id]?.open ? 'rotate-180 text-primary-500' : ''}`} size={28} />
                    </div>
                </div>
                {openState[stream._id]?.open && (
                <div className="p-6 pt-0 border-t dark:border-gray-700 bg-white dark:bg-gray-800 animate-slide-down">
                    <div className="py-6 border-b dark:border-gray-700 mb-6">
                        <h4 className="text-[0.65rem] font-black uppercase tracking-widest text-gray-400 mb-2">Stream Synopsis</h4>
                        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed font-medium italic">{stream.description || "No synopsis provided for this stream."}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {stream.semesters.map((semester, semIdx) => (
                        <div key={semester._id} className="border dark:border-gray-700 rounded-[1.5rem] bg-gray-50 dark:bg-gray-900/50 hover:border-primary-500/50 transition-all animate-fade-in-up" style={{ animationDelay: `${semIdx * 50}ms` }}>
                            <div className="flex items-center justify-between p-4 cursor-pointer group/sem" onClick={() => toggleSemester(stream._id, semester._id)}>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm text-gray-500 group-hover/sem:text-primary-500 transition-colors">
                                        <Bookmark size={16}/>
                                    </div>
                                    <h3 className="font-black text-sm uppercase tracking-tight text-gray-700 dark:text-gray-200">Sem {semester.semesterNumber}</h3>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={(e) => { e.stopPropagation(); handleDeleteSemester(stream._id, semester._id); }} className="p-1.5 text-red-600 hover:bg-white dark:hover:bg-gray-800 rounded-lg opacity-0 group-hover/sem:opacity-100 transition-all"><Trash2 size={14}/></button>
                                    <ChevronDown className={`transition-transform duration-300 text-gray-400 ${openState[stream._id]?.openSemester === semester._id ? 'rotate-180 text-primary-500' : ''}`} size={18} />
                                </div>
                            </div>
                            {openState[stream._id]?.openSemester === semester._id && (
                                <div className="px-4 pb-4 animate-slide-down">
                                    <div className="space-y-2 mt-2">
                                        {semester.subjects.map(subject => (
                                            <div key={subject._id} className="group/sub flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-purple-500/30 transition-all shadow-sm">
                                                <div>
                                                    <p className="text-[0.6rem] font-black text-purple-600 uppercase tracking-widest">{subject.code}</p>
                                                    <p className="text-xs font-bold text-gray-800 dark:text-gray-100 line-clamp-1">{subject.name}</p>
                                                </div>
                                                <div className="flex items-center gap-1 opacity-0 group-hover/sub:opacity-100 transition-opacity">
                                                    <button onClick={() => setModal({ type: 'subject', data: { streamId: stream._id, semesterId: semester._id, subject }})} className="p-1.5 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-md transition-colors"><Edit size={12}/></button>
                                                    <button onClick={() => handleDeleteSubject(stream._id, semester._id, subject._id)} className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-colors"><Trash2 size={12}/></button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <button onClick={() => setModal({ type: 'subject', data: { streamId: stream._id, semesterId: semester._id, subject: null }})} className="w-full mt-3 py-2 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl text-[0.65rem] font-black uppercase tracking-widest text-gray-400 hover:border-purple-500 hover:text-purple-500 transition-all flex items-center justify-center gap-2">
                                        <PlusCircle size={14}/> Add Subject
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                    </div>
                    <div className="mt-8 flex justify-center border-t dark:border-gray-700 pt-6">
                        <button onClick={() => handleAddSemester(stream._id)} className="px-6 py-2 bg-green-50 dark:bg-green-900/30 text-green-600 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-green-100 transition-colors flex items-center gap-2">
                            <Plus size={16}/> Insert Extra Semester
                        </button>
                    </div>
                </div>
                )}
            </div>
            ))}
        </div>
      )}

      {modal.type === 'stream' && <StreamForm stream={modal.data} onSave={handleSaveStream} onCancel={() => setModal({ type: null })} />}
      {modal.type === 'subject' && <SubjectForm subject={modal.data?.subject} onSave={handleSaveSubject} onCancel={() => setModal({ type: null })} />}
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