import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./features/auth/Login";
import AdminDashboard from "./pages/Admin/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminUsers from "./pages/Admin/Users";
import AdminTickets from "./pages/Admin/AdminTickets"
import AdminFAQs from "./pages/Admin/AdminFAQs";
import AdminChat from "./pages/Admin/AdminChat";
import AdminProfile from "./pages/Admin/AdminProfile";
import AdminNotifications from "./pages/Admin/AdminNotifications"
import AdminFeedback from "./pages/Admin/AdminFeedback";
import StudentDashboard from "./pages/Student/StudentDashboard";
import StudentChatPage from "./pages/Student/StudentChatPage";
import StudentProfile from "./pages/Student/StudentProfile";
import StudentFeedback from "./pages/Student/StudentFeedback";
import StudentTickets from "./pages/Student/StudentTickets";
import FacultyDashboard from "./pages/Faculty/FacultyDashboard"
import FacultyProfile from "./pages/Faculty/FacultyProfile"
import { AuthProvider } from "./contexts/AuthContext";
import StudentNotifications from "./pages/Student/StudentNotifications";
import StudentFAQs from "./pages/Student/StudentFAQs";
import FacultyTickets from "./pages/Faculty/FacultyTickets";
import FacultyChat from "./pages/Faculty/FacultyChat";
import FacultyNotifications from "./pages/Faculty/FacultyNotification";
import FacultyFaqPage from "./pages/Faculty/FacultyFaqPage";
import FacultyFeedbackPage from "./pages/Faculty/FacultyFeedbackPage";
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Redirect root to login */}
          <Route path="/" element={<Navigate to="/login" />} />

          {/* Public login */}
          <Route path="/login" element={<Login />} />

          {/* Protected admin route */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
  path="/admin/tickets"
  element={
    <ProtectedRoute allowedRoles={["admin", "faculty"]}>
      <AdminTickets />
    </ProtectedRoute>
  }
/>
<Route
  path="/student"
  element={
    <ProtectedRoute allowedRoles={["student"]}>
      <StudentDashboard />
    </ProtectedRoute>
  }
/>  
<Route
  path="/student/chat"
  element={
    <ProtectedRoute allowedRoles={["student"]}>
      <StudentChatPage  />
    </ProtectedRoute>
  }
/>  
<Route path="/admin/faqs" element={
  <ProtectedRoute allowedRoles={['admin']}>
    <AdminFAQs />
  </ProtectedRoute>
} />
          <Route
            path="/admin/users"
             element={
              <ProtectedRoute allowedRoles={["admin"]}>
               <AdminUsers />
    </ProtectedRoute>
  }
/>
<Route
  path="/student/tickets"
  element={
    <ProtectedRoute allowedRoles={["student"]}>
      <StudentTickets />
    </ProtectedRoute>
  }
/>
<Route
  path="/student/notifications"
  element={
    <ProtectedRoute allowedRoles={["student"]}>
      <StudentNotifications />
    </ProtectedRoute>
  }
/>
<Route
  path="/student/faqs"
  element={
    <ProtectedRoute allowedRoles={["student"]}>
      <StudentFAQs />
    </ProtectedRoute>
  }
/>
<Route
  path="/admin/feedback"
  element={
    <ProtectedRoute allowedRoles={["admin"]}>
      <AdminFeedback />
    </ProtectedRoute>
  }
/>

<Route
  path="/admin/profile"
  element={
    <ProtectedRoute allowedRoles={["admin"]}>
      <AdminProfile />
    </ProtectedRoute>
  }
/>  
<Route
  path="/student/profile"
  element={
    <ProtectedRoute allowedRoles={["student"]}>
      <StudentProfile />
    </ProtectedRoute>
  }
/>
<Route
  path="/faculty/profile"
  element={
    <ProtectedRoute allowedRoles={["faculty"]}>
      <FacultyProfile />
    </ProtectedRoute>
  }
/>
<Route
  path="/faculty/tickets"
  element={
    <ProtectedRoute allowedRoles={["faculty"]}>
      <FacultyTickets />
    </ProtectedRoute>
  }
/>
<Route
  path="/faculty/chat"
  element={
    <ProtectedRoute allowedRoles={["faculty"]}>
      <FacultyChat />
    </ProtectedRoute>
  }
/>

<Route
  path="/student/feedback"
  element={
    <ProtectedRoute allowedRoles={["student"]}>
      <StudentFeedback />
    </ProtectedRoute>
  }
/>

<Route
  path="/admin/notifications"
  element={
    <ProtectedRoute allowedRoles={["admin"]}>
      <AdminNotifications />
    </ProtectedRoute>
  }
/>

<Route
  path="/faculty"
  element={
    <ProtectedRoute role="faculty">
      <FacultyDashboard />
    </ProtectedRoute>
  }
/>
<Route
  path="/faculty/notifications"
  element={
    <ProtectedRoute role="faculty">
      <FacultyNotifications />
    </ProtectedRoute>
  }
/>
<Route
  path="/faculty/feedback"
  element={
    <ProtectedRoute role="faculty">
      <FacultyFeedbackPage />
    </ProtectedRoute>
  }
/>
<Route
  path="/faculty/faqs"
  element={
    <ProtectedRoute role="faculty">
      <FacultyFaqPage />
    </ProtectedRoute>
  }
/>

<Route
  path="/admin/chat"
  element={
    <ProtectedRoute allowedRoles={["admin", "faculty"]}>
      <AdminChat />
    </ProtectedRoute>
  }
/>



          {/* Fallback */}
          <Route
            path="*"
            element={
              <div className="flex items-center justify-center h-screen bg-gray-900 text-white text-3xl font-semibold">
                404 | Page Not Found
              </div>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
