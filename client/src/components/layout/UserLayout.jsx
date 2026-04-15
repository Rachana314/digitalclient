import { useEffect, useState, useCallback } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { apiFetch } from "../../lib/api";

const Icon = ({ children }) => (
  <span className="w-5 h-5 inline-block">{children}</span>
);

const DashboardIcon = () => (
  <Icon>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  </Icon>
);

const FormIcon = () => (
  <Icon>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 4h16v16H4z" />
      <path d="M8 8h8M8 12h8M8 16h5" />
    </svg>
  </Icon>
);

const BellIcon = () => (
  <Icon>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 8a6 6 0 10-12 0c0 7-3 7-3 7h18s-3 0-3-7" />
      <path d="M13.73 21a2 2 0 01-3.46 0" />
    </svg>
  </Icon>
);

const UserIcon = () => (
  <Icon>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21a8 8 0 10-16 0" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  </Icon>
);

const SettingsIcon = () => (
  <Icon>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 000-6l2.1-1.6-2-3.5-2.5 1a7 7 0 00-4-1l-.5-2.7H9.5L9 3.9a7 7 0 00-4 1l-2.5-1-2 3.5L3.6 9a1.7 1.7 0 000 6l-2.1 1.6 2 3.5 2.5-1a7 7 0 004 1l.5 2.7h5l.5-2.7a7 7 0 004-1l2.5 1 2-3.5z" />
    </svg>
  </Icon>
);

const LogoutIcon = () => (
  <Icon>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  </Icon>
);

function withCacheBust(url) {
  if (!url) return "";
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}t=${Date.now()}`;
}

function BellNavLink({ className, onClick, unreadCount }) {
  return (
    <NavLink to="/user/notifications" className={className} onClick={onClick}>
      <span className="relative inline-flex">
        <BellIcon />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-extrabold leading-none">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </span>
      Notifications
    </NavLink>
  );
}

export default function UserLayout() {
  const [open, setOpen] = useState(false);
  const [me, setMe] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  
  const baseLink =
    "flex items-center gap-3 px-4 py-3 rounded-xl text-orange-900 text-lg font-extrabold transition hover:bg-orange-200";
  const activeLink = "bg-white text-orange-700 shadow-sm";
  const linkClass = ({ isActive }) => `${baseLink} ${isActive ? activeLink : ""}`;

  useEffect(() => {
    const loadUser = () => {
      try {
        const raw = localStorage.getItem("me") || localStorage.getItem("user");
        const parsed = raw ? JSON.parse(raw) : null;
        if (parsed?.profileImageUrl) {
          parsed.profileImageUrl = withCacheBust(parsed.profileImageUrl);
        }
        setMe(parsed);
      } catch {
        setMe(null);
      }
    };
    loadUser();
    window.addEventListener("user-updated", loadUser);
    window.addEventListener("storage", loadUser);
    return () => {
      window.removeEventListener("user-updated", loadUser);
      window.removeEventListener("storage", loadUser);
    };
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await apiFetch("/api/notifications/count");
      setUnreadCount(res?.unread ?? 0);
    } catch {
     
    }
  }, []);

  
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 60_000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  useEffect(() => {
    if (!location.pathname.includes("/notifications")) {
      fetchUnreadCount();
    }
  }, [location.pathname, fetchUnreadCount]);

 
  useEffect(() => {
    const handler = (e) => setUnreadCount(e.detail ?? 0);
    window.addEventListener("notification-count-updated", handler);
    return () => window.removeEventListener("notification-count-updated", handler);
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("me");
    window.dispatchEvent(new Event("user-updated"));
    navigate("/login", { replace: true });
  };

  const Avatar = () => (
    <div className="mt-4 flex items-center gap-3 rounded-2xl bg-orange-200/50 p-3">
      <div className="h-12 w-12 rounded-full overflow-hidden border border-orange-300 bg-orange-100 flex-shrink-0">
        {me?.profileImageUrl ? (
          <img src={me.profileImageUrl} alt={me?.name || "User"} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full flex items-center justify-center font-extrabold text-orange-700">
            {String(me?.name || "U").charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      <div className="min-w-0">
        <div className="font-extrabold truncate text-orange-900">{me?.name || "User"}</div>
        <div className="text-xs text-orange-700 truncate">{me?.email || ""}</div>
      </div>
    </div>
  );

  const NavLinks = ({ onNav }) => (
    <>
      <NavLink to="/user/dashboard" className={linkClass} onClick={onNav}>
        <DashboardIcon /> Dashboard
      </NavLink>
      <NavLink to="/user/forms" className={linkClass} onClick={onNav}>
        <FormIcon /> Forms
      </NavLink>
      <BellNavLink className={linkClass} onClick={onNav} unreadCount={unreadCount} />
      <NavLink to="/user/profile" className={linkClass} onClick={onNav}>
        <UserIcon /> Profile
      </NavLink>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-72 bg-orange-100 flex-col sticky top-0 h-screen overflow-y-auto border-r border-orange-200">
        <div className="p-5 border-b border-orange-200">
          <h2 className="text-2xl font-extrabold text-orange-900">Digital Census</h2>
          
          <Avatar />
        </div>
        <nav className="p-4 space-y-2 flex-1">
          <NavLinks />
        </nav>
        <div className="p-4 border-t border-orange-200 space-y-2">
          <NavLink to="/user/settings" className={linkClass}>
            <SettingsIcon /> Settings
          </NavLink>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-orange-900 text-lg font-extrabold transition hover:bg-orange-200 text-left"
          >
            <LogoutIcon /> Logout
          </button>
        </div>
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-72 bg-orange-100 flex flex-col shadow-xl border-r border-orange-200">
            <div className="p-5 border-b border-orange-200 flex justify-between items-start">
              <div className="w-full">
                <h2 className="text-2xl font-extrabold text-orange-900">Digital Census</h2>
                <p className="text-sm text-orange-700 font-semibold">User Panel</p>
                <Avatar />
              </div>
              <button onClick={() => setOpen(false)} className="font-bold ml-3 mt-1 text-orange-900">✕</button>
            </div>
            <nav className="p-4 space-y-2 flex-1">
              <NavLinks onNav={() => setOpen(false)} />
            </nav>
            <div className="p-4 border-t border-orange-200 space-y-2">
              <NavLink to="/user/settings" className={linkClass} onClick={() => setOpen(false)}>
                <SettingsIcon /> Settings
              </NavLink>
              <button
                onClick={() => { setOpen(false); logout(); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-orange-900 text-lg font-extrabold transition hover:bg-orange-200 text-left"
              >
                <LogoutIcon /> Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b px-4 sm:px-6 py-3 flex justify-between items-center">
          <div className="md:hidden relative inline-flex">
            <NavLink to="/user/notifications" className="text-orange-500">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
                <path d="M18 8a6 6 0 10-12 0c0 7-3 7-3 7h18s-3 0-3-7" />
                <path d="M13.73 21a2 2 0 01-3.46 0" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-extrabold">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </NavLink>
          </div>
          <button onClick={() => setOpen(true)} className="md:hidden font-extrabold text-xl ml-auto">
            ☰
          </button>
        </header>

        <main className="p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}