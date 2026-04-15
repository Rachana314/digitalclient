import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

const tabs = ["submitted", "verified", "rejected", "draft"];
const BASE_URL = "http://localhost:8000";

function StatusBadge({ status }) {
  const map = {
    draft: "bg-amber-50 text-amber-700 ring-amber-200",
    submitted: "bg-sky-50 text-sky-700 ring-sky-200",
    rejected: "bg-rose-50 text-rose-700 ring-rose-200",
    verified: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    correction_required: "bg-orange-50 text-orange-700 ring-orange-200",
  };
  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-extrabold ring-1 ${map[status] || "bg-zinc-50 text-zinc-700 ring-zinc-200"}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {(status || "n/a").toUpperCase()}
    </span>
  );
}

function ConfirmModal({ open, message, onConfirm, onCancel, busy }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl bg-white border shadow-xl p-6">
        <div className="text-xl font-extrabold text-zinc-900">Confirm Action</div>
        <p className="text-zinc-500 text-sm font-semibold mt-2">{message}</p>
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onCancel} disabled={busy} className="rounded-2xl px-4 py-2 font-extrabold border hover:bg-zinc-50">Cancel</button>
          <button onClick={onConfirm} disabled={busy} className="rounded-2xl px-4 py-2 font-extrabold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50">
            {busy ? "Processing..." : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}

function RejectModal({ open, onClose, onSubmit, busy }) {
  const [reason, setReason] = useState("");
  useEffect(() => { if (open) setReason(""); }, [open]);
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-3xl bg-white border shadow-xl p-6">
        <div className="text-xl font-extrabold text-zinc-900">Reject Submission</div>
        <div className="text-zinc-500 text-sm font-semibold mt-1">Provide a reason for the citizen to correct.</div>
        <textarea
          className="mt-4 w-full rounded-2xl border p-3 min-h-[130px] outline-none focus:ring-2 focus:ring-rose-500/20 transition"
          placeholder="e.g., Citizenship document is blurry..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} disabled={busy} className="rounded-2xl px-4 py-2 font-extrabold border hover:bg-zinc-50">Cancel</button>
          <button onClick={() => onSubmit(reason)} disabled={busy || !reason.trim()} className="rounded-2xl px-4 py-2 font-extrabold bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50">
            {busy ? "Rejecting..." : "Confirm Reject"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminHouseholds() {
  const [rows, setRows] = useState([]);
  const [progress, setProgress] = useState({ total: 0, submitted: 0, verified: 0, rejected: 0 });
  const [q, setQ] = useState("");
  const [ward, setWard] = useState("");
  const [status, setStatus] = useState("submitted");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [err, setErr] = useState("");
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectTarget, setRejectTarget] = useState("");
  const [busyAction, setBusyAction] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState("");

  const getHeaders = () => ({
    "Content-Type": "application/json",
    "Authorization": `Bearer ${localStorage.getItem("token")}`,
  });

  const loadProgress = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/admin/progress`, { headers: getHeaders() });
      const data = await res.json();
      setProgress(data);
    } catch (e) { console.error(e); }
  };

  const loadHouseholds = async ({ isRefresh = false } = {}) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      setErr("");
      const params = new URLSearchParams();
      if (q) params.append("search", q);
      if (ward) params.append("ward", ward);
      if (status) params.append("status", status);

      const res = await fetch(`${BASE_URL}/api/admin/households?${params.toString()}`, { headers: getHeaders() });
      const data = await res.json();
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e.message || "Failed to load households");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadProgress();
    loadHouseholds();
  }, [status]);

  const openVerifyConfirm = (householdId) => {
    setConfirmTarget(householdId);
    setConfirmOpen(true);
  };

  const verify = async () => {
    setBusyAction(true);
    try {
      const res = await fetch(`${BASE_URL}/api/admin/households/${confirmTarget}/verify`, {
        method: "PATCH",
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error("Verification failed");
      setConfirmOpen(false);
      await Promise.all([loadProgress(), loadHouseholds({ isRefresh: true })]);
    } catch (e) { setErr(e.message); }
    finally { setBusyAction(false); }
  };

  const openReject = (householdId) => {
    setRejectTarget(householdId);
    setRejectOpen(true);
  };

  const reject = async (reason) => {
    setBusyAction(true);
    try {
      const res = await fetch(`${BASE_URL}/api/admin/households/${rejectTarget}/reject`, {
        method: "PATCH",
        headers: getHeaders(),
        body: JSON.stringify({ reason }),
      });
      if (!res.ok) throw new Error("Rejection failed");
      setRejectOpen(false);
      await Promise.all([loadProgress(), loadHouseholds({ isRefresh: true })]);
    } catch (e) { setErr(e.message); }
    finally { setBusyAction(false); }
  };

  const wardOptions = useMemo(() => {
    const set = new Set((rows || []).map((r) => String(r.ward || "").trim()).filter(Boolean));
    return Array.from(set).sort((a, b) => a - b);
  }, [rows]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4">
      {err && <div className="bg-rose-100 text-rose-700 p-4 rounded-2xl font-bold">{err}</div>}

      <div className="rounded-3xl bg-white border p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-zinc-900">Census Management</h1>
        </div>
        <button onClick={() => loadHouseholds({ isRefresh: true })} className="rounded-2xl px-5 py-2.5 font-extrabold bg-zinc-100 border hover:bg-zinc-200 transition">
          {refreshing ? "Updating..." : "Refresh Data"}
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MiniCard label="Total" value={progress.total} color="text-zinc-900" />
        <MiniCard label="Pending" value={progress.submitted} color="text-sky-600" />
        <MiniCard label="Verified" value={progress.verified} color="text-emerald-600" />
        <MiniCard label="Rejected" value={progress.rejected} color="text-rose-600" />
      </div>

      <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-3xl border shadow-sm">
        {tabs.map((tab) => (
          <button key={tab} onClick={() => setStatus(tab)}
            className={`px-5 py-2 rounded-2xl font-black transition-all ${status === tab ? "bg-zinc-900 text-white shadow-lg" : "hover:bg-zinc-100 text-zinc-500"}`}>
            {tab.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="bg-white border rounded-3xl shadow-sm p-4 flex flex-wrap gap-3">
        <input
          className="flex-1 min-w-[300px] border-zinc-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-zinc-900/5 transition border"
          placeholder="Search ID, address, or names..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select className="border border-zinc-200 rounded-2xl px-4 py-3 outline-none" value={ward} onChange={(e) => setWard(e.target.value)}>
          <option value="">All Wards</option>
          {wardOptions.map((w) => <option key={w} value={w}>Ward {w}</option>)}
        </select>
        <button onClick={() => loadHouseholds()} className="bg-zinc-900 text-white px-8 py-3 rounded-2xl font-black hover:bg-zinc-800 transition">
          Search
        </button>
      </div>

      <div className="bg-white border rounded-3xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-20 text-center font-black text-zinc-400 animate-pulse">Fetching records...</div>
        ) : rows.length === 0 ? (
          <div className="p-20 text-center font-bold text-zinc-400">No records matching your filters.</div>
        ) : (
          <div className="divide-y divide-zinc-100">
            {rows.map((r) => (
              <div key={r._id} className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-zinc-50/50 transition">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="text-xl font-black text-zinc-900">{r.householdId || "Pending"}</span>
                    <StatusBadge status={r.status} />
                  </div>
                  <p className="text-zinc-500 font-bold text-sm">Ward {r.ward} • {r.address}</p>
                  <p className="text-zinc-400 text-xs font-bold">
                    Submitted by: {r.user?.name || "Unknown"} • {r.user?.email || ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    to={`/admin/households/${r.householdId}`}
                    className="px-5 py-2.5 rounded-xl bg-zinc-900 text-white font-black text-sm"
                  >
                    Review Details
                  </Link>
                  {r.status === "submitted" && (
                    <>
                      <button onClick={() => openVerifyConfirm(r.householdId)} disabled={busyAction} className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition font-bold disabled:opacity-50">
                        Verify
                      </button>
                      <button onClick={() => openReject(r.householdId)} disabled={busyAction} className="p-2.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition font-bold disabled:opacity-50">
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmModal
        open={confirmOpen}
        message="Are you sure you want to verify this household?"
        onConfirm={verify}
        onCancel={() => setConfirmOpen(false)}
        busy={busyAction}
      />
      <RejectModal open={rejectOpen} onClose={() => setRejectOpen(false)} onSubmit={reject} busy={busyAction} />
    </div>
  );
}

function MiniCard({ label, value, color }) {
  return (
    <div className="rounded-3xl bg-white border p-5 shadow-sm">
      <div className="text-zinc-400 font-bold text-xs uppercase tracking-wider">{label}</div>
      <div className={`text-3xl font-black mt-1 ${color}`}>{value || 0}</div>
    </div>
  );
}