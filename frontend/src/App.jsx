import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import { ThemeProvider } from './contexts/ThemeContext.jsx';
import { NotificationProvider } from './contexts/NotificationContext.jsx';
import ToastContainer from './components/ToastContainer.jsx';

import Layout from './components/Layout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import StudentManager from './pages/StudentAdmission/StudentManager.jsx';
import FacultyManager from './pages/Faculty/FacultyManager.jsx';
import StreamManager from './pages/Streams/StreamManager.jsx';
import AttendanceTracker from './pages/Attendance/AttendanceTracker.jsx';
import MarksheetEntry from './pages/Marksheets/MarksheetEntry.jsx';
import TimetableViewer from './pages/Timetable/TimetableViewer.jsx';
import HostelManagement from './pages/Hostel/HostelManagement.jsx';
import NoticeBoard from './pages/NoticeBoard/NoticeBoard.jsx';
import Library from './pages/Library/Library.jsx';
import CanteenManagement from './pages/Canteen/CanteenManagement.jsx';
import ReportGenerator from './pages/Reports/ReportGenerator.jsx';
import EventCalendar from './pages/EventCalendar/EventCalendar.jsx';
import PlacementManagement from './pages/Placement/PlacementManagement.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import ViewStudentProfile from './pages/StudentProfile/ViewStudentProfile.jsx';
import TeacherDashboard from './pages/TeacherDashboard/TeacherDashboard.jsx';
import TransportManagement from './pages/Transport/TransportManagement.jsx';
import UserApproval from './pages/UserApproval/UserApproval.jsx';
import FeesManagement from './pages/Fees/FeesManagement.jsx';
import StudentDashboard from './pages/StudentDashboard/StudentDashboard.jsx';
import StudentProfile from './pages/StudentProfile/StudentProfile.jsx';
import CareerHub from './pages/CareerHub/CareerHub.jsx';

import PublicLayout from './components/PublicLayout.jsx';
import LandingPage from './pages/Landing/LandingPage.jsx';
import LoginSelection from './pages/Login/LoginSelection.jsx';
import RoleLoginPage from './pages/Login/RoleLoginPage.jsx';
import RoleRegisterPage from './pages/Register/RoleRegisterPage.jsx';
import PendingApprovalPage from './pages/Register/PendingApprovalPage.jsx';
import ForgotPasswordPage from './pages/Login/ForgotPasswordPage.jsx';
import ResetPasswordPage from './pages/Login/ResetPasswordPage.jsx';
import AdmissionInquiry from './pages/Admission/AdmissionInquiry.jsx';
import AdmissionRequests from './pages/Admission/AdmissionRequests.jsx';
import InstituteHistory from './pages/Institute/InstituteHistory.jsx';


function PrivateRoute({ children, roles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // Or a spinner component
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (roles && !roles.includes(user.role)) {
    // Redirect to a relevant dashboard or an unauthorized page
    if (user.role === 'Admin') return <Navigate to="/app/dashboard" />;
    if (user.role === 'Teacher') return <Navigate to="/app/teacher-dashboard" />;
    if (user.role === 'Student') return <Navigate to="/app/student-dashboard" />;
    return <Navigate to="/" />;
  }

  return children;
}

function App() {
  return (
    <ThemeProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthProvider>
          <NotificationProvider>
            <ToastContainer />
            <Routes>
              {/* Public Routes */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<LandingPage />} />
                <Route path="/admission-inquiry" element={<AdmissionInquiry />} />
                <Route path="/institute/history" element={<InstituteHistory />} />
              </Route>

              {/* Auth Routes */}
              <Route path="/login" element={<LoginSelection />} />
              <Route path="/login/:role" element={<RoleLoginPage />} />
              <Route path="/register/teacher" element={<RoleRegisterPage role="Teacher" />} />
              <Route path="/register/student" element={<RoleRegisterPage role="Student" />} />
              <Route path="/pending-approval" element={<PendingApprovalPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password/:resettoken" element={<ResetPasswordPage />} />


              {/* Protected Application Routes */}
              <Route path="/app" element={<PrivateRoute><Layout /></PrivateRoute>}>
                {/* Admin Routes */}
                <Route path="dashboard" element={<PrivateRoute roles={['Admin']}><Dashboard /></PrivateRoute>} />
                <Route path="user-approval" element={<PrivateRoute roles={['Admin']}><UserApproval/></PrivateRoute>} />
                <Route path="admission-requests" element={<PrivateRoute roles={['Admin']}><AdmissionRequests/></PrivateRoute>} />
                <Route path="student-admission" element={<PrivateRoute roles={['Admin']}><StudentManager /></PrivateRoute>} />
                <Route path="streams" element={<PrivateRoute roles={['Admin']}><StreamManager /></PrivateRoute>} />
                <Route path="hostel" element={<PrivateRoute roles={['Admin']}><HostelManagement /></PrivateRoute>} />
                <Route path="library" element={<PrivateRoute roles={['Admin']}><Library /></PrivateRoute>} />
                <Route path="reports" element={<PrivateRoute roles={['Admin']}><ReportGenerator /></PrivateRoute>} />
                <Route path="calendar" element={<PrivateRoute roles={['Admin', 'Student']}><EventCalendar /></PrivateRoute>} />
                <Route path="transport" element={<PrivateRoute roles={['Admin']}><TransportManagement/></PrivateRoute>} />
                <Route path="fees" element={<PrivateRoute roles={['Admin']}><FeesManagement /></PrivateRoute>} />

                {/* Teacher & Admin Routes */}
                <Route path="faculty" element={<PrivateRoute roles={['Admin', 'Teacher']}><FacultyManager /></PrivateRoute>} />
                <Route path="attendance" element={<PrivateRoute roles={['Admin', 'Teacher']}><AttendanceTracker /></PrivateRoute>} />
                <Route path="marksheet" element={<PrivateRoute roles={['Admin', 'Teacher']}><MarksheetEntry /></PrivateRoute>} />
                <Route path="timetable" element={<PrivateRoute roles={['Admin', 'Teacher', 'Student']}><TimetableViewer /></PrivateRoute>} />
                <Route path="student/:id" element={<PrivateRoute roles={['Admin', 'Teacher']}><ViewStudentProfile /></PrivateRoute>} />
                
                {/* Universal or Mixed Routes */}
                <Route path="notice-board" element={<PrivateRoute><NoticeBoard /></PrivateRoute>} />
                <Route path="canteen" element={<PrivateRoute><CanteenManagement /></PrivateRoute>} />
                <Route path="placements" element={<PrivateRoute><PlacementManagement /></PrivateRoute>} />
                <Route path="profile" element={<PrivateRoute roles={['Admin', 'Teacher']}><ProfilePage /></PrivateRoute>} />

                {/* Teacher Routes */}
                <Route path="teacher-dashboard" element={<PrivateRoute roles={['Teacher']}><TeacherDashboard /></PrivateRoute>} />

                {/* Student Routes */}
                <Route path="student-dashboard" element={<PrivateRoute roles={['Student']}><StudentDashboard /></PrivateRoute>} />
                <Route path="my-profile" element={<PrivateRoute roles={['Student']}><StudentProfile /></PrivateRoute>} />
                <Route path="career-hub" element={<PrivateRoute roles={['Student']}><CareerHub /></PrivateRoute>} />
                
                {/* Default redirect for /app */}
                <Route index element={<DefaultDashboard />} />
              </Route>
              
            </Routes>
          </NotificationProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

// Helper component to redirect users based on their role when they hit "/app"
function DefaultDashboard() {
    const { user } = useAuth();
    if (user?.role === 'Admin') return <Navigate to="/app/dashboard" />;
    if (user?.role === 'Teacher') return <Navigate to="/app/teacher-dashboard" />;
    if (user?.role === 'Student') return <Navigate to="/app/student-dashboard" />;
    return <Navigate to="/login" />; // Fallback
}


export default App;