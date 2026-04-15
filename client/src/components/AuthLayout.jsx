import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-red-100 via-sky-100 to-red-50">
      <Outlet />
    </div>
  );
}
