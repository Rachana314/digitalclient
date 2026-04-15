import { useEffect, useMemo, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { apiFetch } from "../../lib/api";

// Icons 
const BellIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);
const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
  </svg>
);
const DoubleCheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="17 6 7 17 2 12"/><polyline points="22 6 12 17"/>
  </svg>
);
const CircleDotIcon = () => (
  <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="12" r="10"/>
  </svg>
);

//  Type badge 
const TYPE_STYLE = {
  form:           { label: "FORM",           bg: "bg-blue-100",   text: "text-blue-700"   },
  admin:          { label: "ADMIN",          bg: "bg-amber-100",  text: "text-amber-700"  },
  change_request: { label: "CHANGE REQUEST", bg: "bg-violet-100", text: "text-violet-700" },
};

function TypeBadge({ type }) {
  const s = TYPE_STYLE[type] || { label: String(type).toUpperCase(), bg: "bg-zinc-100", text: "text-zinc-600" };
  return (
    <span className={`inline-block text-[10px] font-extrabold tracking-widest px-2 py-0.5 rounded-full ${s.bg} ${s.text}`}>
      {s.label}
    </span>
  );
}

//  Sidebar sync helper 
const pushCountToSidebar = (unread) =>
  window.dispatchEvent(new CustomEvent("notification-count-updated", { detail: unread }));

//  Main component 
export default function Notifications() {
  const { t } = useTranslation();
  const [filter, setFilter]   = useState("all");
  const [data, setData]       = useState([]);
  const [counts, setCounts]   = useState({ total: 0, unread: 0, read: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [busy, setBusy]       = useState({});

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const [list, cnt] = await Promise.all([
        apiFetch("/api/notifications"),
        apiFetch("/api/notifications/count"),
      ]);
      setData(Array.isArray(list) ? list : []);
      const safeCnt = cnt || { total: 0, unread: 0, read: 0 };
      setCounts(safeCnt);
      pushCountToSidebar(safeCnt.unread);        
    } catch (e) {
      setError(e.message || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  
  const setBusyFor = (id, val) => setBusy((b) => ({ ...b, [id]: val }));

  const toggleRead = async (n) => {
    const endpoint = n.read
      ? `/api/notifications/${n._id}/unread`
      : `/api/notifications/${n._id}/read`;
    setBusyFor(n._id, true);
    try {
      await apiFetch(endpoint, { method: "PATCH" });
      setData((prev) => prev.map((x) => x._id === n._id ? { ...x, read: !x.read } : x));
      setCounts((c) => {
        const next = {
          ...c,
          unread: n.read ? c.unread + 1 : c.unread - 1,
          read:   n.read ? c.read   - 1 : c.read   + 1,
        };
        pushCountToSidebar(next.unread);          
        return next;
      });
    } catch (e) {
      setError(e.message || "Failed to update");
    } finally {
      setBusyFor(n._id, false);
    }
  };

  
  const deleteOne = async (id) => {
    setBusyFor(id, true);
    try {
      await apiFetch(`/api/notifications/${id}`, { method: "DELETE" });
      setData((prev) => {
        const removed = prev.find((x) => x._id === id);
        if (removed && !removed.read) {
          setCounts((c) => {
            const next = { total: c.total - 1, unread: c.unread - 1, read: c.read };
            pushCountToSidebar(next.unread);     
            return next;
          });
        } else {
          setCounts((c) => {
            const next = { total: c.total - 1, unread: c.unread, read: c.read - 1 };
            pushCountToSidebar(next.unread);      
            return next;
          });
        }
        return prev.filter((x) => x._id !== id);
      });
    } catch (e) {
      setError(e.message || "Failed to delete");
    } finally {
      setBusyFor(id, false);
    }
  };

  // Mark all read 
  const markAllRead = async () => {
    try {
      await apiFetch("/api/notifications/read-all", { method: "PATCH" });
      setData((prev) => prev.map((x) => ({ ...x, read: true })));
      setCounts((c) => {
        const next = { total: c.total, unread: 0, read: c.total };
        pushCountToSidebar(0);                   
        return next;
      });
    } catch (e) {
      setError(e.message || "Failed to mark all read");
    }
  };

  // Delete all read ─
  const deleteAllRead = async () => {
    try {
      await apiFetch("/api/notifications/read", { method: "DELETE" });
      setData((prev) => prev.filter((x) => !x.read));
      setCounts((c) => {
        const next = { total: c.unread, unread: c.unread, read: 0 };
        pushCountToSidebar(next.unread);          
        return next;
      });
    } catch (e) {
      setError(e.message || "Failed to delete read");
    }
  };

  // Derived list 
  const mapped = useMemo(() =>
    data.map((n) => ({
      ...n,
      type:  String(n.type || "").toLowerCase(),
      title: n.title || "Notification",
      msg:   n.msg || n.message || "",
      time:  n.createdAt ? new Date(n.createdAt).toLocaleString() : "",
    })),
    [data]
  );

  const filtered = useMemo(() => {
    if (filter === "all")    return mapped;
    if (filter === "unread") return mapped.filter((n) => !n.read);
    return mapped.filter((n) => n.type === filter);
  }, [mapped, filter]);

  // Filter tabs 
  const filters = [
    { key: "all",            label: t("notifications.filterAll",    { defaultValue: "All" }),     count: counts.total  },
    { key: "unread",         label: t("notifications.filterUnread", { defaultValue: "Unread" }),  count: counts.unread },
    { key: "form",           label: t("notifications.filterForm",   { defaultValue: "Form" })                          },
    { key: "change_request", label: t("notifications.filterChange", { defaultValue: "Changes" })                       },
  ];

  const hasUnread    = counts.unread > 0;
  const hasReadItems = data.some((n) => n.read);

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold">
              {t("notifications.title", { defaultValue: "Notifications" })}
            </h1>
            {counts.unread > 0 && (
              <span className="inline-flex items-center justify-center min-w-[26px] h-[26px] px-1.5 rounded-full bg-rose-500 text-white text-xs font-extrabold">
                {counts.unread > 99 ? "99+" : counts.unread}
              </span>
            )}
          </div>
        </div>

        {/* Bulk actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {hasUnread && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-1.5 rounded-2xl px-4 py-2 text-sm font-bold bg-zinc-900 text-white hover:bg-zinc-700 transition"
            >
              <DoubleCheckIcon /> Mark all read
            </button>
          )}
          {hasReadItems && (
            <button
              onClick={deleteAllRead}
              className="flex items-center gap-1.5 rounded-2xl px-4 py-2 text-sm font-bold bg-zinc-100 text-black/70 hover:bg-rose-50 hover:text-rose-600 transition"
            >
              <TrashIcon /> Clear read
            </button>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="rounded-3xl bg-white border shadow-sm p-4 flex gap-2 flex-wrap">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`flex items-center gap-1.5 rounded-2xl px-4 py-2 font-extrabold text-sm transition ${
              filter === f.key
                ? "bg-zinc-900 text-white"
                : "bg-zinc-100 text-black/70 hover:bg-black/5"
            }`}
          >
            {f.label}
            {f.count !== undefined && f.count > 0 && (
              <span className={`text-xs font-extrabold px-1.5 py-0.5 rounded-full ${
                filter === f.key ? "bg-white/20 text-white" : "bg-black/10 text-black/60"
              }`}>
                {f.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-5">
          <div className="font-extrabold text-rose-700">Error</div>
          <div className="text-rose-700/80 mt-1">{error}</div>
        </div>
      )}

      {/* Stats bar */}
      {!loading && data.length > 0 && (
        <div className="flex items-center gap-4 text-sm font-semibold text-black/50 px-1">
          <span>{counts.total} total</span>
          <span>·</span>
          <span className={counts.unread > 0 ? "text-rose-500 font-bold" : ""}>
            {counts.unread} unread
          </span>
          <span>·</span>
          <span>{counts.read} read</span>
        </div>
      )}

      {/* Notification list */}
      <div className="rounded-3xl bg-white border shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-black/60 font-semibold">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 p-14 text-black/40">
            <BellIcon />
            <span className="font-semibold">
              {t("notifications.empty", { defaultValue: "No notifications here" })}
            </span>
          </div>
        ) : (
          <div className="divide-y">
            {filtered.map((n) => (
              <div
                key={n._id}
                className={`p-5 transition ${n.read ? "bg-white" : "bg-blue-50/40"} hover:bg-black/[0.03]`}
              >
                <div className="flex items-start justify-between gap-4">

                  
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="mt-1.5 flex-shrink-0">
                      {!n.read
                        ? <span className="text-blue-500"><CircleDotIcon /></span>
                        : <span className="opacity-0"><CircleDotIcon /></span>
                      }
                    </div>

                    <div className="min-w-0">
                      <div className={`font-extrabold text-base leading-snug ${n.read ? "text-black/70" : "text-black"}`}>
                        {n.title}
                      </div>
                      <div className="text-black/60 mt-1 text-sm leading-relaxed">{n.msg}</div>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <TypeBadge type={n.type} />
                        <span className="text-xs text-black/40 font-semibold">{n.time}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => toggleRead(n)}
                      disabled={!!busy[n._id]}
                      title={n.read ? "Mark as unread" : "Mark as read"}
                      className={`flex items-center justify-center w-8 h-8 rounded-xl transition ${
                        n.read
                          ? "text-black/30 hover:bg-zinc-100 hover:text-black/60"
                          : "text-blue-500 hover:bg-blue-100"
                      } disabled:opacity-40`}
                    >
                      <CheckIcon />
                    </button>

                    <button
                      onClick={() => deleteOne(n._id)}
                      disabled={!!busy[n._id]}
                      title="Delete"
                      className="flex items-center justify-center w-8 h-8 rounded-xl text-black/30 hover:bg-rose-50 hover:text-rose-500 transition disabled:opacity-40"
                    >
                      <TrashIcon />
                    </button>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}