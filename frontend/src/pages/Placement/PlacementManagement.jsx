import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { Building, Briefcase, UserCheck, Plus, Edit, Trash2, Users } from 'lucide-react';
import ConfirmationModal from '../../components/ConfirmationModal';

const CompanyForm = ({ company, onSave, onCancel }) => {
    const [formData, setFormData] = useState(company || { name: '', sector: ''});
    const handleChange = e => setFormData({...formData, [e.target.name]: e.target.value });
    const handleSubmit = e => { e.preventDefault(); onSave(formData); };
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-sm space-y-4">
                <h2 className="text-xl font-bold">{company ? 'Edit Company' : 'Add New Company'}</h2>
                <input name="name" value={formData.name} onChange={handleChange} placeholder="Company Name" className="w-full p-2 border rounded" required />
                <input name="sector" value={formData.sector} onChange={handleChange} placeholder="Sector" className="w-full p-2 border rounded" required />
                <div className="flex justify-end gap-2"><button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 rounded">Cancel</button><button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded">Save</button></div>
            </form>
        </div>
    )
};

const JobForm = ({ job, companies, onSave, onCancel }) => {
    const [formData, setFormData] = useState(job ? { ...job, company: job.company._id } : { title: '', company: '', status: 'Open'});
    const handleChange = e => setFormData({...formData, [e.target.name]: e.target.value });
    const handleSubmit = e => { e.preventDefault(); onSave(formData); };
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-sm space-y-4">
                <h2 className="text-xl font-bold">{job ? 'Edit Job Posting' : 'Add New Job Posting'}</h2>
                <input name="title" value={formData.title} onChange={handleChange} placeholder="Job Title" className="w-full p-2 border rounded" required />
                <select name="company" value={formData.company} onChange={handleChange} className="w-full p-2 border rounded" required>
                    <option value="">-- Select Company --</option>
                    {companies.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
                <select name="status" value={formData.status} onChange={handleChange} className="w-full p-2 border rounded">
                    <option>Open</option><option>Closed</option>
                </select>
                <div className="flex justify-end gap-2"><button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 rounded">Cancel</button><button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded">Save</button></div>
            </form>
        </div>
    )
};

const Companies = ({ companies, onAdd, onUpdate, onDelete }) => {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingCompany, setEditingCompany] = useState(null);

    const handleSave = (data) => {
        if (editingCompany) {
            onUpdate(editingCompany._id, data);
        } else {
            onAdd(data);
        }
        setIsFormOpen(false);
        setEditingCompany(null);
    }
    const handleEdit = (company) => {
        setEditingCompany(company);
        setIsFormOpen(true);
    }

    return (
    <div>
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Companies</h3>
            <button onClick={() => { setEditingCompany(null); setIsFormOpen(true); }} className="flex items-center px-3 py-1.5 bg-primary-500 text-white rounded-md text-sm hover:bg-primary-600">
                <Plus size={16} className="mr-1" /> Add Company
            </button>
        </div>
        <table className="w-full text-left">
            <thead><tr className="bg-gray-100"><th className="p-3">Name</th><th className="p-3">Sector</th><th className="p-3">Actions</th></tr></thead>
            <tbody>
                {companies.map(c => (
                    <tr key={c._id} className="border-b">
                        <td className="p-3">{c.name}</td><td className="p-3">{c.sector}</td>
                        <td className="p-3 flex gap-2">
                           <button onClick={() => handleEdit(c)} className="p-2 text-primary-600 hover:bg-primary-100 rounded-full"><Edit size={16}/></button>
                           <button onClick={() => onDelete(c)} className="p-2 text-red-600 hover:bg-red-100 rounded-full"><Trash2 size={16}/></button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
        {isFormOpen && <CompanyForm company={editingCompany} onSave={handleSave} onCancel={() => setIsFormOpen(false)} />}
    </div>
)};

const Jobs = ({ user, jobs, companies, onAdd, onUpdate, onDelete, onApply, applications }) => {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingJob, setEditingJob] = useState(null);
    const appliedJobIds = new Set(applications.map(app => app.job._id));

    const handleSave = (data) => {
        if (editingJob) {
            onUpdate(editingJob._id, data);
        } else {
            onAdd(data);
        }
        setIsFormOpen(false);
        setEditingJob(null);
    }
    const handleEdit = (job) => {
        setEditingJob(job);
        setIsFormOpen(true);
    }

    return (
    <div>
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Job Postings</h3>
            {user.role === 'Admin' && <button onClick={() => { setEditingJob(null); setIsFormOpen(true); }} className="flex items-center px-3 py-1.5 bg-primary-500 text-white rounded-md text-sm hover:bg-primary-600"><Plus size={16} className="mr-1" /> Add Job</button>}
        </div>
        <table className="w-full text-left">
            <thead><tr className="bg-gray-100"><th className="p-3">Title</th><th className="p-3">Company</th><th className="p-3">Status</th><th className="p-3">Action</th></tr></thead>
            <tbody>
                {jobs.map(j => (
                    <tr key={j._id} className="border-b">
                        <td className="p-3">{j.title}</td><td className="p-3">{j.company.name}</td><td className="p-3">{j.status}</td>
                        <td className="p-3">
                            {user.role === 'Student' && j.status === 'Open' && (
                                appliedJobIds.has(j._id) ? (
                                    <span className="text-sm text-green-600 font-semibold">Applied</span>
                                ) : (
                                    <button onClick={() => onApply(j)} className="px-3 py-1 bg-primary-500 hover:bg-primary-600 text-white rounded-md text-sm">Apply</button>
                                )
                            )}
                             {user.role === 'Admin' && (
                                 <div className="flex gap-2">
                                    <button onClick={() => handleEdit(j)} className="p-2 text-primary-600 hover:bg-primary-100 rounded-full"><Edit size={16}/></button>
                                    <button onClick={() => onDelete(j)} className="p-2 text-red-600 hover:bg-red-100 rounded-full"><Trash2 size={16}/></button>
                                 </div>
                             )}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
        {isFormOpen && <JobForm job={editingJob} companies={companies} onSave={handleSave} onCancel={() => setIsFormOpen(false)} />}
    </div>
)};

const Applications = ({ applications, isAdmin }) => (
    <div>
        <h3 className="text-xl font-semibold mb-4">{isAdmin ? 'All Student Applications' : 'My Applications'}</h3>
        <table className="w-full text-left">
            <thead><tr className="bg-gray-100">
                {isAdmin && <th className="p-3">Student</th>}
                <th className="p-3">Job Title</th>
                <th className="p-3">Company</th>
                <th className="p-3">Status</th>
            </tr></thead>
            <tbody>
                {applications.map(app => (
                    <tr key={app._id} className="border-b">
                        {isAdmin && <td className="p-3">{app.student.name}</td>}
                        <td className="p-3">{app.job.title}</td><td className="p-3">{app.job.company.name}</td><td className="p-3">{app.status}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);


export default function PlacementManagement() {
    const { user, api } = useAuth();
    const { addToast } = useNotification();
    const [activeTab, setActiveTab] = useState(user.role === 'Admin' ? 'companies' : 'jobs');
    const [companies, setCompanies] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [applications, setApplications] = useState([]);
    const [confirmAction, setConfirmAction] = useState(null);

    useEffect(() => {
        fetchCompanies();
        fetchJobs();
        fetchApplications();
    }, [user.role, api]);

    const fetchCompanies = async () => setCompanies(await api('/api/placements/companies'));
    const fetchJobs = async () => setJobs(await api('/api/placements/jobs'));
    const fetchApplications = async () => setApplications(await api('/api/placements/applications'));

    const handleAddCompany = async (companyData) => { await api('/api/placements/companies', { method: 'POST', body: JSON.stringify(companyData) }); fetchCompanies(); };
    const handleUpdateCompany = async (id, companyData) => { await api(`/api/placements/companies/${id}`, { method: 'PUT', body: JSON.stringify(companyData) }); fetchCompanies(); };
    const handleDeleteCompany = async (company) => {
        setConfirmAction({
            title: 'Delete Company',
            message: `Are you sure you want to delete ${company.name}? This might affect associated job postings.`,
            onConfirm: async () => {
                await api(`/api/placements/companies/${company._id}`, { method: 'DELETE' });
                fetchCompanies();
                setConfirmAction(null);
            }
        });
    };
    
    const handleAddJob = async (jobData) => { await api('/api/placements/jobs', { method: 'POST', body: JSON.stringify(jobData) }); fetchJobs(); };
    const handleUpdateJob = async (id, jobData) => { await api(`/api/placements/jobs/${id}`, { method: 'PUT', body: JSON.stringify(jobData) }); fetchJobs(); };
    const handleDeleteJob = async (job) => {
        setConfirmAction({
            title: 'Delete Job Posting',
            message: `Are you sure you want to delete the job posting for "${job.title}"?`,
            onConfirm: async () => {
                await api(`/api/placements/jobs/${job._id}`, { method: 'DELETE' });
                fetchJobs();
                setConfirmAction(null);
            }
        });
    };

    const handleApply = async (job) => {
        try {
            await api('/api/placements/applications', { method: 'POST', body: JSON.stringify({ job: job._id }) });
            addToast(`Successfully applied for ${job.title}`, 'success');
            fetchApplications();
        } catch(error) {
            addToast(error.message, 'error');
        }
    };

    const tabs = user.role === 'Admin'
        ? [
            { id: 'companies', name: 'Companies', icon: <Building size={18} /> }, 
            { id: 'jobs', name: 'Job Postings', icon: <Briefcase size={18} /> },
            { id: 'applications', name: 'All Applications', icon: <Users size={18} /> }
        ]
        : [
            { id: 'jobs', name: 'Available Jobs', icon: <Briefcase size={18} /> }, 
            { id: 'applications', name: 'My Applications', icon: <UserCheck size={18} /> }
        ];

    return (
        <div className="bg-white p-8 rounded-xl shadow-lg">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Training & Placement</h1>
            
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                                activeTab === tab.id
                                    ? 'border-primary-500 text-primary-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            {tab.icon}<span className="ml-2">{tab.name}</span>
                        </button>
                    ))}
                </nav>
            </div>

            <div className="mt-6">
                {activeTab === 'companies' && user.role === 'Admin' && <Companies companies={companies} onAdd={handleAddCompany} onUpdate={handleUpdateCompany} onDelete={handleDeleteCompany} />}
                {activeTab === 'jobs' && <Jobs user={user} jobs={jobs} companies={companies} onAdd={handleAddJob} onUpdate={handleUpdateJob} onDelete={handleDeleteJob} onApply={handleApply} applications={applications}/>}
                {activeTab === 'applications' && <Applications applications={applications} isAdmin={user.role === 'Admin'} />}
            </div>

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