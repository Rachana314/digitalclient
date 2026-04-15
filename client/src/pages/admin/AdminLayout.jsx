import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

const nav = [
  { to: "/admin/dashboard", label: "Dashboard" },
  { to: "/admin/households", label: "Households" },
  { to: "/admin/analytics", label: "Analytics" },
  { to: "/admin/reports", label: "Reports" },
  { to: "/admin/map", label: "GIS Map" },
  { to: "/admin/notifications", label: "Notifications" },
];

function MenuIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

export default function AdminLayout() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/admin/login");
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full p-5">
      {/* Brand */}
      <div className="mb-6">
        <div className="font-extrabold text-xl text-white">Admin Panel</div>
        <div className="text-blue-200 text-sm mt-1 font-semibold">Census Verification</div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 space-y-1.5">
        {nav.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `block rounded-2xl px-4 py-3 font-extrabold transition duration-200 ${
                isActive
                  ? "bg-white text-blue-900"
                  : "text-blue-100 hover:bg-white/10"
              }`
            }
          >
            {n.label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <button
        onClick={logout}
        className="mt-4 w-full rounded-2xl px-4 py-3 font-extrabold border border-white/20 text-white hover:bg-white/10 transition"
      >
        Logout
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-100 flex">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — fixed on both desktop and mobile */}
      <aside
        className={`
          fixed top-0 left-0 h-screen w-64 z-30 bg-blue-900
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        <SidebarContent />
      </aside>

      {/* Main area — offset by sidebar width on desktop */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64">

        {/* Mobile top bar */}
        <header className="lg:hidden flex items-center gap-3 bg-blue-900 px-4 py-3 sticky top-0 z-10">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-white"
          >
            <MenuIcon />
          </button>
          <span className="font-extrabold text-white text-lg">Admin Panel</span>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}