import { Routes, Route, Navigate } from "react-router-dom";
import UserLayout from "../components/layout/UserLayout";
import ProtectedRoute from "../components/layout/ProtectedRoute";
import Dashboard from "../pages/user/Dashboard";
import HouseholdView from "./HouseholdView";

export default function UserRoutes() {
  return (
    <Routes>
      <Route
        element={
          <ProtectedRoute>
            <UserLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/user/dashboard" element={<Dashboard />} />

        <Route path="/user/forms" element={<div>Forms Page</div>} />
        <Route path="/user/notifications" element={<div>Notifications Page</div>} />
        <Route path="/user/settings" element={<div>Settings Page</div>} />
        <Route path="household/:id" element={<HouseholdView />} />

        <Route path="*" element={<Navigate to="/user/dashboard" />} />
      </Route>
    </Routes>
  );
}
