import React, { useState, useEffect, useMemo } from 'react';
import { User, Mail, Phone, Home, GraduationCap, Calendar, X, BarChart2, CheckCircle, Award, DollarSign, Eye, Download, Bookmark } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { formatDate } from '../../utils/dateFormatter';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const InfoItem = ({ icon, label, value }) => (
    <div className="flex items-start text-gray-600 dark:text-gray-300">
        <div className="mr-4 mt-1 text-gray-400">{icon}</div>
        <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
            <p className="font-medium text-gray-800 dark:text-gray-100">{value || 'N/A'}</p>
        </div>
    </div>
);

const Card = ({ title, icon, children }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg h-full">
        <div className="flex items-center text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">
            {React.cloneElement(icon, { className: "mr-3 text-primary-500"})}
            {title}
        </div>
        <div className="space-y-4">
            {children}
        </div>
    </div>
);

const LoadingCard = ({ title, icon }) => (
    <Card title={title} icon={icon}>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
    </Card>
);

const StudentDetailModal = ({ student, onClose }) => {
    const { api } = useAuth();
    const [details, setDetails] = useState({ attendance: null, academics: null, fees: null });
    const [loading, setLoading] = useState({ attendance: true, academics: true, fees: true });
    
    useEffect(() => {
        if (!student) return;

        const fetchDetails = async () => {
            try {
                const [attendanceData, academicsData, feesData] = await Promise.all([
                    api(`/api/attendance/student/${student._id}`).finally(() => setLoading(prev => ({ ...prev, attendance: false }))),
                    api(`/api/marksheet/student/${student._id}`).finally(() => setLoading(prev => ({ ...prev, academics: false }))),
                    api(`/api/students/${student._id}/fees`).finally(() => setLoading(prev => ({ ...prev, fees: false }))),
                ]);
                setDetails({ attendance: attendanceData, academics: academicsData, fees: feesData });
            } catch (error) {
                console.error("Failed to load student details:", error);
            }
        };

        fetchDetails();
    }, [student, api]);

    const attendanceSummary = useMemo(() => {
        if (!details.attendance) return { overall: '0', total: 0 };
        const totalDays = details.attendance.length;
        if (totalDays === 0) return { overall: 'N/A', total: 0 };
        const presentDays = details.attendance.filter(a => a.status === 'present').length;
        return { overall: ((presentDays / totalDays) * 100).toFixed(1), total: totalDays };
    }, [details.attendance]);

    const academicSummary = useMemo(() => {
        if (!details.academics || details.academics.length === 0) return { gpa: 'N/A' };
        const avgPercentage = details.academics.reduce((acc, m) => acc + m.percentage, 0) / details.academics.length;
        return { gpa: (avgPercentage / 25).toFixed(2) };
    }, [details.academics]);

    if (!student) return null;

    const photoUrl = student.photo || `https://api.dicebear.com/8.x/initials/svg?seed=${student.firstName}%20${student.lastName}`;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-gray-100 dark:bg-gray-900 p-8 rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 z-10">
                    <X size={24} />
                </button>
                
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg mb-6">
                    <div className="flex flex-col sm:flex-row items-center">
                        <img src={photoUrl} alt="Student" className="w-24 h-24 rounded-full mr-0 sm:mr-6 mb-4 sm:mb-0 border-4 border-primary-200 object-cover" />
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 text-center sm:text-left">{student.firstName} {student.lastName}</h1>
                            <p className="text-gray-600 dark:text-gray-400 text-center sm:text-left">{student.stream} | ID: {student._id.slice(-6).toUpperCase()}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1 space-y-6">
                        <Card title="Personal Information" icon={<User />}>
                            <InfoItem icon={<Mail size={20} />} label="Email" value={student.email} />
                            <InfoItem icon={<Phone size={20} />} label="Phone" value={student.phone} />
                            <InfoItem icon={<Calendar size={20} />} label="Date of Birth" value={formatDate(student.dob)} />
                            <InfoItem icon={<Home size={20} />} label="Address" value={student.address} />
                             <InfoItem icon={<GraduationCap size={20} />} label="Stream" value={student.stream} />
                             <InfoItem icon={<Bookmark size={20} />} label="Current Semester" value={student.currentSemester} />
                        </Card>
                    </div>

                    <div className="lg:col-span-2 space-y-6">
                         {loading.attendance ? <LoadingCard title="Attendance" icon={<CheckCircle />} /> : (
                             <Card title="Attendance Summary" icon={<CheckCircle />}>
                                 <div className="text-center">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Overall Percentage</p>
                                    <p className="text-4xl font-bold text-green-600">{attendanceSummary.overall}%</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Based on {attendanceSummary.total} recorded days.</p>
                                 </div>
                             </Card>
                         )}

                          {loading.academics ? <LoadingCard title="Academics" icon={<Award />} /> : (
                             <Card title="Academic Summary" icon={<Award />}>
                                {details.academics && details.academics.length > 0 ? (
                                    <div className="text-center">
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Calculated GPA</p>
                                        <p className="text-4xl font-bold text-primary-600">{academicSummary.gpa}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Based on {details.academics.length} exam records.</p>
                                    </div>
                                ) : <p className="text-center text-gray-500">No academic records found.</p>}
                            </Card>
                          )}

                          {loading.fees ? <LoadingCard title="Fees" icon={<DollarSign />} /> : (
                            <Card title="Fee Records" icon={<DollarSign />}>
                                {details.fees && details.fees.length > 0 ? (
                                    <ul className="space-y-2">
                                        {details.fees.map(fee => (
                                            <li key={fee._id} className="flex justify-between items-center text-sm p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                                                <div>
                                                    <p className="font-medium">{fee.type}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">Due: {formatDate(fee.dueDate)}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-semibold">₹{fee.amount.toLocaleString()}</p>
                                                     {fee.status === 'Paid' ? (
                                                        <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">Paid</span>
                                                    ) : (
                                                        <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300">Pending</span>
                                                    )}
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : <p className="text-center text-gray-500">No fee records found.</p>}
                            </Card>
                          )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDetailModal;