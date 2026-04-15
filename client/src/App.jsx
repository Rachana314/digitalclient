import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import PublicLayout from "./components/PublicLayout";
import AuthLayout from "./components/AuthLayout";
import AdminProtectedRoute from "./components/layout/AdminProtectedRoute";

// Public pages
import Home from "./pages/public/Home";
import Services from "./pages/public/Services";
import HowItWorks from "./pages/public/HowItWorks";
import News from "./pages/public/News";
import Contact from "./pages/public/Contact";
import PrivacyPolicy from "./pages/public/PrivacyPolicy";
import VerifyHousehold from "./pages/public/VerifyHousehold";

// Auth pages
import UserRegister from "./pages/user/Register";
import UserLogin from "./pages/user/Login";
import VerifyOtp from "./pages/user/VerifyOtp";
import ForgotPassword from "./pages/user/ForgotPassword";
import ResetPassword from "./pages/user/ResetPassword";
import AdminRegister from "./pages/admin/Register";
import AdminLogin from "./pages/admin/Login";

// Admin
import AdminLayout from "./pages/admin/AdminLayout";
import AdminHome from "./pages/admin/AdminHome";
import AdminHouseholds from "./pages/admin/AdminHouseholds";
import AdminHouseholdView from "./pages/admin/HouseholdView";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminReports from "./pages/admin/AdminReports";
import AdminNotifications from "./pages/admin/AdminNotifications";
import HouseholdMapDashboard from "./pages/admin/HouseholdMapDashboard";

// User
import UserLayout from "./components/layout/UserLayout";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import UserDashboard from "./pages/user/Dashboard";
import Forms from "./pages/user/Forms";
import Notifications from "./pages/user/Notifications";
import Settings from "./pages/user/Settings";
import QrCode from "./pages/user/QrCode";
import HouseholdNew from "./pages/user/HouseholdNew";
import Profile from "./pages/user/Profile";
import UserHouseholdView from "./pages/user/HouseholdView";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/news" element={<News />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/verify/:householdId" element={<VerifyHousehold />} />
        </Route>

        <Route element={<AuthLayout />}>
          <Route path="/register" element={<UserRegister />} />
          <Route path="/login" element={<UserLogin />} />
          <Route path="/verify-email" element={<VerifyOtp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/admin/register" element={<AdminRegister />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/enter" element={<Navigate to="/register" replace />} />
          
        </Route>

        <Route
          path="/admin"
          element={
            <AdminProtectedRoute>
              <AdminLayout />
            </AdminProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminHome />} />
          <Route path="households" element={<AdminHouseholds />} />
          <Route
            path="households/:householdId"
            element={<AdminHouseholdView />}
          />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="notifications" element={<AdminNotifications />} />
           <Route path="map" element={<HouseholdMapDashboard />} />

        </Route>

        <Route
          path="/user"
          element={
            <ProtectedRoute>
              <UserLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<UserDashboard />} />
          <Route path="forms" element={<Forms />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="settings" element={<Settings />} />
          <Route path="profile" element={<Profile />} />
          <Route path="household/new" element={<HouseholdNew />} />
          <Route path="household/:id" element={<UserHouseholdView />} />
          <Route path="qr/:householdId" element={<QrCode />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}