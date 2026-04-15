import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import logo from "../assets/logo.png";

// const desktopItem =
//   "px-4 py-2 rounded-[5px] text-sm font-extrabold text-white hover:scale-105 transition duration-500 hover:bg-white/15 ";

const desktopItem =
  "relative inline-block px-4 py-2 text-sm font-extrabold text-white rounded-[5px] hover:scale-105 transition duration-500 hover:bg-white/15 before:content-[''] before:block before:absolute before:bottom-1.5 before:left-0 before:h-[3px] before:w-full before:bg-white before:scale-x-0 before:origin-center before:transition-transform before:duration-300 hover:before:scale-x-100";

const mobileItem =
  "w-full text-left px-4 py-3 rounded-2xl text-base font-extrabold text-[var(--color-brandBlack)] hover:text-[var(--color-brandOrange)] hover:bg-black/5 transition";

export default function Header() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const links = [
    { label: "Home", to: "/#home" },
    { label: "Services", to: "/#services" },
    { label: "How it works", to: "/#howitworks" },
    { label: "News", to: "/#news" },
    { label: "Privacy", to: "/#privacy" },
    { label: "Contact", to: "/#contact" },
  ];

  useEffect(() => setOpen(false), [location.pathname, location.hash]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "auto";
    return () => (document.body.style.overflow = "auto");
  }, [open]);

  return (
    <header className="sticky top-0 z-50 bg-[var(--color-brandRed)] border-b border-white/30">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/#home" className="flex items-center gap-3">
          <div className="h-14 w-14 rounded-2xl bg-white/15 flex items-center justify-center">
            <img src={logo} alt="Logo" className="h-12 w-auto object-contain" />
          </div>

          <div className="leading-tight hidden sm:block">
            <p className="font-extrabold text-lg text-white">Digital Census</p>
            <p className="text-sm text-white/90">Citizen services portal</p>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-3">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `${desktopItem} ${isActive ? "bg-white/20 text-white" : ""}`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {/* ✅ ENTER button -> go to /register */}
          <Link
            to="/register"
            className="hidden sm:inline-flex px-6 py-2 hover:scale-110 transition duration-700 rounded-xl font-bold bg-white hover:bg-blue-500 hover:text-white"
          >
            Enter
          </Link>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="lg:hidden inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-white/15 hover:bg-white/25 transition"
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            <div className="relative w-6 h-6">
              <span
                className={`absolute left-0 top-1 h-[3px] w-6 bg-white transition ${open ? "translate-y-2 rotate-45" : ""
                  }`}
              />
              <span
                className={`absolute left-0 top-3 h-[3px] w-6 bg-white transition ${open ? "opacity-0" : ""
                  }`}
              />
              <span
                className={`absolute left-0 top-5 h-[3px] w-6 bg-white transition ${open ? "-translate-y-2 -rotate-45" : ""
                  }`}
              />
            </div>
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden">
          <div className="fixed inset-0 bg-black/30" onClick={() => setOpen(false)} />

          <div className="fixed left-0 right-0 top-[92px] bg-white border-t border-black/10 shadow-lg">
            <div className="max-w-6xl mx-auto px-4 py-4">
              <div className="grid gap-2">
                {links.map((l) => (
                  <NavLink key={l.to} to={l.to} className={mobileItem}>
                    {l.label}
                  </NavLink>
                ))}

                {/* ✅ mobile Enter -> /register */}
                <Link
                  to="/register"
                  className="mt-2 inline-flex justify-center px-4 py-3 rounded-2xl font-extrabold text-white bg-[var(--color-brandRed)] hover:bg-[var(--color-brandOrange)] transition"
                >
                  Enter
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}