import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { User, Mail, Phone, Home, GraduationCap, BarChart2, CheckCircle, Calendar, X, Download, Eye, Award, DollarSign, ArrowLeft, Bookmark } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { formatDate } from '../../utils/dateFormatter';


const InfoItem = ({ icon, label, value }) => (
    <div className="flex items-start text-gray-600 dark:text-gray-300">
        <div className="mr-4 mt-1 text-gray-400">{icon}</div>
        <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
            <p className="font-medium text-gray-800 dark:text-gray-100">{value || 'N/A'}</p>
        </div>
    </div>
);

const LoadingCard = ({ title, icon, lines = 3 }) => (
    <Card title={title} icon={icon}>
        {Array.from({ length: lines }).map((_, i) => (
             <div key={i} className="h-8 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
        ))}
    </Card>
);

const MarksheetModal = ({ marksheet, student, onClose }) => {
    const marksheetRef = useRef(null);

    const downloadPdf = () => {
        if (!marksheetRef.current) return;
        
        html2canvas(marksheetRef.current, { scale: 2, backgroundColor: '#ffffff' }).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'p',
                unit: 'px',
                format: [canvas.width + 40, canvas.height + 40]
            });
            pdf.addImage(imgData, 'PNG', 20, 20, canvas.width, canvas.height);
            pdf.save(`Marksheet-${student.firstName}-${marksheet.exam}.pdf`);
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Marksheet Details</h2>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"><X size={20}/></button>
                    </div>
                    <div ref={marksheetRef} className="p-6 bg-white rounded-lg text-gray-800">
                        <div className="text-center mb-6">
                            <h3 className="text-xl font-bold">Institute of Technology</h3>
                            <p className="text-lg font-semibold capitalize">{marksheet.exam.replace('-', ' ')} Exam Marksheet</p>
                        </div>
                        <div className="flex justify-between text-sm mb-6">
                            <p><strong>Student:</strong> {student.firstName} {student.lastName}</p>
                            <p><strong>Stream:</strong> {student.stream}</p>
                        </div>
                        <table className="w-full text-left">
                            <thead className="bg-gray-200">
                                <tr>
                                    <th className="p-3 font-semibold">Subject</th>
                                    <th className="p-3 font-semibold text-center">Marks Obtained</th>
                                    <th className="p-3 font-semibold text-center">Max Marks</th>
                                </tr>
                            </thead>
                            <tbody>
                                {marksheet.marks.map((m, i) => (
                                    <tr key={i} className="border-b">
                                        <td className="p-3">{m.subjectName}</td>
                                        <td className="p-3 text-center">{m.marksObtained}</td>
                                        <td className="p-3 text-center">{m.maxMarks}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="mt-6 flex justify-end">
                            <div className="w-1/2 bg-primary-50 p-4 rounded-lg">
                                <div className="flex justify-between text-sm"><span>Total Marks:</span> <strong>{marksheet.total}</strong></div>
                                <div className="flex justify-between text-sm"><span>Percentage:</span> <strong>{marksheet.percentage}%</strong></div>
                                <div className="flex justify-between font-bold text-md mt-2"><span>Grade:</span> <strong>{marksheet.grade}</strong></div>
                            </div>
                        </div>
                    </div>
                </div>
                 <div className="p-4 bg-gray-100 dark:bg-gray-900 rounded-b-lg flex justify-end">
                    <button onClick={downloadPdf} className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                        <Download size={16} className="mr-2"/> Download as PDF
                    </button>
                </div>
            </div>
        </div>
    );
}

const AttendanceModal = ({ attendance, onClose }) => {
    const recentAttendance = [...attendance].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 30);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-lg">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Attendance History</h2>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"><X size={20}/></button>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                        <ul className="space-y-2">
                            {recentAttendance.map(record => (
                                <li key={record._id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                                    <div className="flex items-center">
                                        <Calendar size={18} className="mr-3 text-gray-500" />
                                        <span className="font-medium">{formatDate(record.date)}</span>
                                    </div>
                                    {record.status === 'present' ? (
                                        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">Present</span>
                                    ) : (
                                        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300">Absent</span>
                                    )}
                                </li>
                            ))}
                        </ul>
                        {attendance.length > 30 && <p className="text-center text-sm text-gray-500 mt-4">Showing most recent 30 records.</p>}
                        {attendance.length === 0 && <p className="text-center text-gray-500 py-10">No attendance records found.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function ViewStudentProfile() {
  const { id: studentId } = useParams();
  const { api, user } = useAuth();
  const [student, setStudent] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [academics, setAcademics] = useState(null);
  const [fees, setFees] = useState(null);
  const [loading, setLoading] = useState({ profile: true, attendance: true, academics: true, fees: true });
  const [viewingMarksheet, setViewingMarksheet] = useState(null);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAllData = async () => {
        try {
            const [profileData, attendanceData, academicsData, feesData] = await Promise.all([
                api(`/api/students/${studentId}`).finally(() => setLoading(prev => ({...prev, profile: false}))),
                api(`/api/attendance/student/${studentId}`).finally(() => setLoading(prev => ({...prev, attendance: false}))),
                api(`/api/marksheet/student/${studentId}`).finally(() => setLoading(prev => ({...prev, academics: false}))),
                api(`/api/students/${studentId}/fees`).finally(() => setLoading(prev => ({...prev, fees: false}))),
            ]);
            setStudent(profileData);
            setAttendance(attendanceData);
            setAcademics(academicsData);
            setFees(feesData);
        } catch (err) {
            console.error("Failed to fetch student data:", err);
            setError(err.message || 'Failed to load student data. You may not have permission to view this profile.');
            setLoading({ profile: false, attendance: false, academics: false, fees: false });
        }
    };
    fetchAllData();
  }, [api, studentId]);

  const attendanceSummary = useMemo(() => {
    if (!attendance) return { overall: '0', total: 0 };
    const totalDays = attendance.length;
    if (totalDays === 0) return { overall: 'N/A', total: 0 };
    const presentDays = attendance.filter(a => a.status === 'present').length;
    const percentage = ((presentDays / totalDays) * 100).toFixed(1);
    return { overall: percentage, total: totalDays };
  }, [attendance]);

  const academicSummary = useMemo(() => {
    if (!academics || academics.length === 0) return { gpa: 'N/A', performance: [], exams: [] };

    const subjectDataMap = {};
    const examSet = new Set();
    const colors = ['#16a34a', '#22c55e', '#4ade80', '#15803d', '#166534']; // Shades of primary green

    academics.forEach(marksheet => {
        const examName = marksheet.exam.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
        examSet.add(examName);
        marksheet.marks.forEach(mark => {
            if (!subjectDataMap[mark.subjectName]) {
                subjectDataMap[mark.subjectName] = { 
                    subject: mark.subjectName, 
                    maxMarks: mark.maxMarks 
                };
            }
            subjectDataMap[mark.subjectName][examName] = mark.marksObtained;
        });
    });

    const performanceData = Object.values(subjectDataMap);
    const exams = Array.from(examSet).map((exam, index) => ({
        name: exam,
        color: colors[index % colors.length]
    }));

    const avgPercentage = academics.length > 0 ? academics.reduce((acc, m) => acc + m.percentage, 0) / academics.length : 0;
    const gpa = (avgPercentage / 25).toFixed(2);

    return { gpa, performance: performanceData, exams };
  }, [academics]);

  const backLink = user.role === 'Admin' ? '/app/student-admission' : '/app/teacher-dashboard';

  if (loading.profile) {
    return <div className="text-center p-8">Loading profile...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-500">{error}</div>;
  }
  
  if (!student) {
      return <div className="text-center p-8 text-red-500">Could not find student profile.</div>;
  }
  
  const photoUrl = student.photo || `https://api.dicebear.com/8.x/initials/svg?seed=${student.firstName}%20${student.lastName}`;

  return (
    <div>
        <Link to={backLink} className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 mb-4">
            <ArrowLeft size={16} />
            Back to {user.role === 'Admin' ? 'Student Management' : 'Dashboard'}
        </Link>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg mb-6">
            <div className="flex flex-col sm:flex-row items-center">
                <img src={photoUrl} alt="Student" className="w-24 h-24 rounded-full border-4 border-primary-200 object-cover mr-0 sm:mr-6 mb-4 sm:mb-0" />
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
                {loading.attendance ? <LoadingCard title="Attendance" icon={<CheckCircle />} /> : (
                 <Card title="Attendance Summary" icon={<CheckCircle />}>
                     <div className="text-center mb-4">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Overall Percentage</p>
                        <p className="text-4xl font-bold text-green-600">{attendanceSummary.overall}%</p>
                     </div>
                     <p className="text-center text-xs text-gray-500 dark:text-gray-400">Based on {attendanceSummary.total} recorded days.</p>
                     <div className="mt-4 border-t dark:border-gray-700 pt-4 text-center">
                        <button
                            onClick={() => setIsAttendanceModalOpen(true)}
                            className="inline-flex items-center text-sm font-semibold text-primary-600 dark:text-primary-400 hover:underline"
                        >
                            <Calendar size={14} className="mr-1.5"/> View Full History
                        </button>
                    </div>
                 </Card>
                )}
                 {loading.fees ? <LoadingCard title="Fee Records" icon={<DollarSign />} /> : (
                    <Card title="Fee Records" icon={<DollarSign />}>
                         {fees && fees.length > 0 ? (
                            <div className="space-y-3">
                                {fees.map(fee => (
                                    <div key={fee._id} className="flex justify-between items-center text-sm p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                                        <div>
                                            <p className="font-medium">{fee.type}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Due: {formatDate(fee.dueDate)}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-lg">₹{fee.amount.toLocaleString()}</p>
                                             {fee.status === 'Paid' ? (
                                                <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">Paid</span>
                                            ) : (
                                                <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300">Pending</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                         ) : (
                             <p className="text-center text-gray-500 dark:text-gray-400 py-6">No fee records found.</p>
                         )}
                    </Card>
                 )}
            </div>
            <div className="lg:col-span-2">
                {loading.academics ? <LoadingCard title="Academic Performance" icon={<BarChart2 />} lines={5} /> : (
                <Card title="Academic Performance" icon={<BarChart2 />}>
                    <div className="flex flex-col sm:flex-row sm:items-baseline mb-2">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mr-2">Calculated GPA:</p>
                        <p className="text-2xl font-bold text-primary-600">{academicSummary.gpa}</p>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Subject-wise marks obtained across different exams. Maximum marks for all subjects is 100.</p>
                    
                    {academics && academics.length > 0 ? (
                        <>
                            <div style={{ width: '100%', height: 250 }}>
                                <ResponsiveContainer>
                                    <BarChart data={academicSummary.performance} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                                        <XAxis dataKey="subject" fontSize={12} />
                                        <YAxis domain={[0, 100]} />
                                        <Tooltip cursor={{fill: 'rgba(100,100,100,0.1)'}} contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(5px)' }}/>
                                        <Legend />
                                        {academicSummary.exams.map(exam => (
                                            <Bar key={exam.name} dataKey={exam.name} fill={exam.color} radius={[4, 4, 0, 0]} />
                                        ))}
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="mt-6 border-t dark:border-gray-700 pt-4">
                                <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-2">Detailed Reports</h4>
                                <ul className="space-y-2">
                                    {academics.map(marksheet => (
                                        <li key={marksheet._id} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                                            <div className="flex items-center">
                                                <Award size={18} className="mr-3 text-yellow-500"/>
                                                <span className="font-medium capitalize">{marksheet.exam.replace('-', ' ')}</span>
                                            </div>
                                            <button onClick={() => setViewingMarksheet(marksheet)} className="flex items-center text-sm px-3 py-1 bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300 rounded-md hover:bg-primary-200 dark:hover:bg-primary-900/70">
                                                <Eye size={14} className="mr-1.5"/> View
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </>
                    ) : (
                        <p className="text-center text-gray-500 dark:text-gray-400 py-10">No academic records found yet.</p>
                    )}
                </Card>
                )}
            </div>
        </div>
        {viewingMarksheet && student && <MarksheetModal marksheet={viewingMarksheet} student={student} onClose={() => setViewingMarksheet(null)} />}
        {isAttendanceModalOpen && attendance && <AttendanceModal attendance={attendance} onClose={() => setIsAttendanceModalOpen(false)} />}
    </div>
  );
}

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