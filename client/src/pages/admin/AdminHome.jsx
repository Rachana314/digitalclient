import { useEffect, useState } from "react";
import { apiFetch } from "../../lib/api";
import { Link } from "react-router-dom";

function StatCard({ label, value, hint }) {
  return (
    <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-5 hover:shadow-md transition duration-300">
      <div className="text-black/50 font-bold text-sm">{label}</div>
      <div className="text-4xl font-extrabold mt-2 text-blue-900">{value}</div>
      {hint && <div className="text-black/40 text-sm font-semibold mt-2">{hint}</div>}
    </div>
  );
}

function QuickAction({ to, title, desc, color }) {
  return (
    <Link
      to={to}
      className="rounded-2xl bg-white border border-gray-200 shadow-sm p-5 hover:shadow-md hover:border-blue-200 transition duration-300 flex flex-col gap-2"
    >
      <div className={`text-base font-extrabold ${color}`}>{title}</div>
      <div className="text-black/50 text-sm font-semibold">{desc}</div>
      <div className="text-blue-900 font-extrabold text-sm mt-1">Go →</div>
    </Link>
  );
}

export default function AdminHome() {
  const [progress, setProgress] = useState({ total: 0, submitted: 0, verified: 0, rejected: 0 });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setErr("");
        setLoading(true);
        const data = await apiFetch("/api/admin/progress");
        setProgress(data);
      } catch (e) {
        setErr(e.message || "Failed to load progress");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const completionPct = progress.total > 0
    ? Math.round((progress.verified / progress.total) * 100)
    : 0;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900">Dashboard</h1>
        </div>
        <Link
          to="/admin/households"
          className="rounded-2xl px-5 py-3 font-extrabold bg-blue-900 text-white hover:bg-blue-800 transition"
        >
          Review Households
        </Link>
      </div>

    
      {err && (
        <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 text-rose-700 font-bold">
          {err}
        </div>
      )}

      {/* Stats grid */}
      {loading ? (
        <div className="p-10 text-center font-extrabold text-black/40">Loading...</div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Records" value={progress.total}     hint="All households"    />
          <StatCard label="Submitted"     value={progress.submitted} hint="Waiting review"    />
          <StatCard label="Verified"      value={progress.verified}  hint="Approved & locked" />
          <StatCard label="Rejected"      value={progress.rejected}  hint="Needs correction"  />
        </div>
      )}

      {/* Verification progress bar */}
      {!loading && progress.total > 0 && (
        <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-6 space-y-3">
          <div className="flex items-center justify-between">
            <div className="font-extrabold text-zinc-900">Verification Progress</div>
            <div className="font-extrabold text-blue-900">{completionPct}%</div>
          </div>
          <div className="w-full bg-zinc-100 rounded-full h-3">
            <div
              className="bg-blue-900 h-3 rounded-full transition-all duration-700"
              style={{ width: `${completionPct}%` }}
            />
          </div>
          <div className="text-sm text-black/50 font-semibold">
            {progress.verified} of {progress.total} households verified
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div>
        <div className="font-extrabold text-zinc-900 mb-3">Quick Actions</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <QuickAction
            to="/admin/households?tab=submitted"
            title="Review Pending"
            desc={`${progress.submitted} household${progress.submitted !== 1 ? "s" : ""} waiting for your review.`}
            color="text-sky-700"
          />
          <QuickAction
            to="/admin/households?tab=rejected"
            title="Rejected Forms"
            desc={`${progress.rejected} form${progress.rejected !== 1 ? "s" : ""} rejected and need correction follow-up.`}
            color="text-rose-600"
          />
          <QuickAction
            to="/admin/notifications"
            title="Send Notification"
            desc="Broadcast announcements or updates to all registered users."
            color="text-amber-600"
          />
          <QuickAction
            to="/admin/analytics"
            title="View Analytics"
            desc="See ward-wise breakdowns and census completion statistics."
            color="text-emerald-700"
          />
          <QuickAction
            to="/admin/map"
            title="GIS Map"
            desc="Visualize household locations and coverage across wards."
            color="text-violet-700"
          />
          <QuickAction
            to="/admin/reports"
            title="Export Reports"
            desc="Download household data and verification reports as CSV or PDF."
            color="text-blue-700"
          />
        </div>
      </div>

    </div>
  );
}