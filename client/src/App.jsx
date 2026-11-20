import { Routes, Route, Navigate } from "react-router-dom";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Assessment from "./pages/student/Assessment";
import CodingChallenge from "./pages/student/CodingChallenge";
import GithubEvidence from "./pages/student/GithubEvidence";
import Dashboard from "./pages/student/Dashboard";
import PublicPassport from "./pages/PublicPassport";
import Skills from "./pages/student/Skills";
import RecruiterDashboard from "./pages/recruiter/Dashboard";
import RecruiterSaved from "./pages/recruiter/Saved";
import RecruiterTalentPool from "./pages/recruiter/TalentPool";
import Talent from "./pages/student/Talent";
import Verify from "./pages/student/Verify";
import ProtectedRoute from "./components/ProtectedRoute";
import GuestRoute from "./components/GuestRoute";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/signin" replace />} />
      <Route path="/signin" element={<GuestRoute><SignIn /></GuestRoute>} />
      <Route path="/signup" element={<GuestRoute><SignUp /></GuestRoute>} />
      <Route path="/p/:username" element={<PublicPassport />} />

      {/* Student routes */}
      <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['student']}><Dashboard /></ProtectedRoute>} />
      <Route path="/skills" element={<ProtectedRoute allowedRoles={['student']}><Skills /></ProtectedRoute>} />
      <Route path="/verify" element={<ProtectedRoute allowedRoles={['student']}><Verify /></ProtectedRoute>} />
      <Route path="/talent" element={<ProtectedRoute allowedRoles={['student']}><Talent /></ProtectedRoute>} />
      <Route path="/assessment/:skill" element={<ProtectedRoute allowedRoles={['student']}><Assessment /></ProtectedRoute>} />
      <Route path="/challenge/:skill" element={<ProtectedRoute allowedRoles={['student']}><CodingChallenge /></ProtectedRoute>} />
      <Route path="/github/:skill" element={<ProtectedRoute allowedRoles={['student']}><GithubEvidence /></ProtectedRoute>} />

      {/* Recruiter routes — RecruiterShell is wrapped inside each page itself */}
      <Route path="/recruiter/dashboard" element={<ProtectedRoute allowedRoles={['recruiter']}><RecruiterDashboard /></ProtectedRoute>} />
      <Route path="/recruiter/saved" element={<ProtectedRoute allowedRoles={['recruiter']}><RecruiterSaved /></ProtectedRoute>} />
      <Route path="/recruiter/talent-pool" element={<ProtectedRoute allowedRoles={['recruiter']}><RecruiterTalentPool /></ProtectedRoute>} />
    </Routes>
  );
}

export default App;