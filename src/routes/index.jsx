import { Navigate, Route, Routes } from "react-router-dom";
import Login from "../pages/auth/Login";
import RegisterType from "../pages/auth/RegisterType";
import RegisterStudent from "../pages/auth/RegisterStudent";
import RegisterCompany from "../pages/auth/RegisterCompany";
import EmailVerification from "../pages/auth/EmailVerification";
import ForgotPassword from "../pages/auth/ForgotPassword";
import UnifiedVerificationStep from "../pages/auth/UnifiedVerificationStep";
import ResubmitDocument from "../pages/auth/ResubmitDocument";
import StudentProfile from "../pages/student/Profile";
import StudentProfileForm from "../pages/student/StudentProfileForm";
import ProfileSetup from "../pages/student/ProfileSetup";
import StudentUploadCv from "../pages/student/StudentUploadCv";
import StudentPending from "../pages/student/StudentPending";
import CompanyProfileCompletion from "../pages/enterprise/CompanyProfileCompletion";
import CompanyVerificationMethod from "../pages/enterprise/CompanyVerificationMethod";
import CompanyVerifyEmail from "../pages/enterprise/CompanyVerifyEmail";
import CompanyUploadRc from "../pages/enterprise/CompanyUploadRc";
import CompanyPending from "../pages/enterprise/CompanyPending";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminProfile from "../pages/admin/Profile";
import Companies from "../pages/admin/Companies";
import Candidates from "../pages/admin/Candidates";
import Offers from "../pages/admin/Offers";
import Logs from "../pages/admin/Logs";
import StudentDashboard from "../pages/student/Dashboard";
import StudentOffers from "../pages/student/Offers";
import StudentApplications from "../pages/student/Applications";
import StudentCvScanner from "../pages/student/CvScanner";
import Chatbot from "../pages/student/Chatbot";
import EnterpriseDashboard from "../pages/enterprise/Dashboard";

import EnterpriseProfile from "../pages/enterprise/Profile";
import OffreEmploi from "../pages/enterprise/OffreEmploi";
import OffreStage from "../pages/enterprise/OffreStage";
import MissionFreelance from "../pages/enterprise/MissionFreelance";
import Postulations from "../pages/enterprise/Postulations";
import Home from "../pages/public/Home";

import { useAuth } from "../hooks";

function RequireAuth({ children, roles }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles?.length && !roles.includes(user?.role)) return <Navigate to="/login" replace />;

  return children;
}

function PublicOnly({ children }) {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return children;

  if (user?.role === "admin") return <Navigate to="/admin/dashboard" replace />;
  if (user?.role === "student" || user?.role === "laureat") return <Navigate to="/student/dashboard" replace />;
  if (user?.role === "company") return <Navigate to="/company/dashboard" replace />;
  return <Navigate to="/login" replace />;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route
        path="/forgot-password"
        element={
          <PublicOnly>
            <ForgotPassword />
          </PublicOnly>
        }
      />

      <Route
        path="/login"
        element={
          <PublicOnly>
            <Login />
          </PublicOnly>
        }
      />

      <Route
        path="/register-type"
        element={
          <PublicOnly>
            <RegisterType />
          </PublicOnly>
        }
      />

      <Route
        path="/register/student"
        element={
          <PublicOnly>
            <RegisterStudent />
          </PublicOnly>
        }
      />

      <Route
        path="/register/company"
        element={
          <PublicOnly>
            <RegisterCompany />
          </PublicOnly>
        }
      />

      <Route path="/verify-email" element={<EmailVerification />} />
      <Route path="/verification/step-3" element={<UnifiedVerificationStep />} />
      <Route path="/verification/document-upload" element={<UnifiedVerificationStep />} />
      <Route
        path="/resubmit-document"
        element={
          <RequireAuth roles={["student", "laureat", "company"]}>
            <ResubmitDocument />
          </RequireAuth>
        }
      />

      <Route
        path="/student/profile-setup"
        element={
          <RequireAuth roles={["student", "laureat"]}>
            <ProfileSetup />
          </RequireAuth>
        }
      />
      <Route
        path="/student/upload-cv"
        element={
          <RequireAuth roles={["student", "laureat"]}>
            <StudentUploadCv />
          </RequireAuth>
        }
      />
      <Route
        path="/student/profile"
        element={
          <RequireAuth roles={["student", "laureat"]}>
            <StudentProfile />
          </RequireAuth>
        }
      />
      <Route
        path="/student/profile-form"
        element={
          <RequireAuth roles={["student", "laureat"]}>
            <StudentProfileForm />
          </RequireAuth>
        }
      />
      <Route
        path="/student/onboarding/document-upload"
        element={
          <Navigate to="/verification/document-upload?role=student" replace />
        }
      />
      <Route
        path="/student/pending"
        element={
          <StudentPending />
        }
      />
      <Route
        path="/student/dashboard"
        element={
          <RequireAuth roles={["student", "laureat"]}>
            <StudentDashboard />
          </RequireAuth>
        }
      />
      <Route
        path="/student/offres"
        element={
          <RequireAuth roles={["student", "laureat"]}>
            <StudentOffers />
          </RequireAuth>
        }
      />
      <Route
        path="/student/applications"
        element={
          <RequireAuth roles={["student", "laureat"]}>
            <StudentApplications />
          </RequireAuth>
        }
      />
      <Route
        path="/student/cv-scanner"
        element={
          <RequireAuth roles={["student", "laureat"]}>
            <StudentCvScanner />
          </RequireAuth>
        }
      />
      <Route
        path="/student/chatbot"
        element={
          <RequireAuth roles={["student", "laureat"]}>
            <Chatbot />
          </RequireAuth>
        }
      />

      <Route
        path="/company/verification-method"
        element={
          <PublicOnly>
            <CompanyVerificationMethod />
          </PublicOnly>
        }
      />
      <Route
        path="/company/verify-email"
        element={
          <PublicOnly>
            <CompanyVerifyEmail />
          </PublicOnly>
        }
      />
      <Route
        path="/company/upload-rc"
        element={
          <PublicOnly>
            <CompanyUploadRc />
          </PublicOnly>
        }
      />

      <Route
        path="/company/profile-setup"
        element={
          <RequireAuth roles={["company"]}>
            <CompanyProfileCompletion />
          </RequireAuth>
        }
      />
      <Route path="/company/pending" element={<CompanyPending />} />
      <Route
        path="/company/dashboard"
        element={
          <RequireAuth roles={["company"]}>
            <EnterpriseDashboard />
          </RequireAuth>
        }
      />
      <Route
        path="/company/profile"
        element={
          <RequireAuth roles={["company"]}>
            <EnterpriseProfile />
          </RequireAuth>
        }
      />
      <Route
        path="/company/emplois"
        element={
          <RequireAuth roles={["company"]}>
            <OffreEmploi />
          </RequireAuth>
        }
      />
      <Route
        path="/company/stages"
        element={
          <RequireAuth roles={["company"]}>
            <OffreStage />
          </RequireAuth>
        }
      />
      <Route
        path="/company/missions"
        element={
          <RequireAuth roles={["company"]}>
            <MissionFreelance />
          </RequireAuth>
        }
      />
      <Route
        path="/company/postulations"
        element={
          <RequireAuth roles={["company"]}>
            <Postulations />
          </RequireAuth>
        }
      />

      <Route
        path="/admin/dashboard"
        element={
          <RequireAuth roles={["admin"]}>
            <AdminDashboard />
          </RequireAuth>
        }
      />
      <Route
        path="/admin/companies"
        element={
          <RequireAuth roles={["admin"]}>
            <Companies />
          </RequireAuth>
        }
      />
      <Route
        path="/admin/candidates"
        element={
          <RequireAuth roles={["admin"]}>
            <Candidates />
          </RequireAuth>
        }
      />
      <Route
        path="/admin/offers"
        element={
          <RequireAuth roles={["admin"]}>
            <Offers />
          </RequireAuth>
        }
      />
      <Route
        path="/admin/logs"
        element={
          <RequireAuth roles={["admin"]}>
            <Logs />
          </RequireAuth>
        }
      />
      <Route
        path="/admin/profile"
        element={
          <RequireAuth roles={["admin"]}>
            <AdminProfile />
          </RequireAuth>
        }
      />

      <Route path="/email-verification" element={<Navigate to="/verify-email" replace />} />
      <Route path="/student/verification" element={<Navigate to="/student/onboarding/document-upload" replace />} />
      <Route path="/student/verification-document" element={<Navigate to="/student/onboarding/document-upload" replace />} />
      <Route path="/student/profile-completion" element={<Navigate to="/student/profile-form" replace />} />
      <Route path="/company/profile-completion" element={<Navigate to="/company/profile-setup" replace />} />

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
