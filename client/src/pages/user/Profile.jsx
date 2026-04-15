import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../../lib/api";

function StatusBadge({ status }) {
  const map = {
    draft: "bg-amber-50 text-amber-700 ring-amber-200",
    submitted: "bg-sky-50 text-sky-700 ring-sky-200",
    rejected: "bg-rose-50 text-rose-700 ring-rose-200",
    verified: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  };

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-extrabold ring-1 ${
        map[status] || ""
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {(status || "n/a").toUpperCase()}
    </span>
  );
}

export default function Profile() {
  const [user, setUser] = useState(null);
  const [household, setHousehold] = useState(null);
  const [err, setErr] = useState("");

  const load = async () => {
    try {
      setErr("");
      const data = await apiFetch("/api/users/me");
      setUser(data.user);
      setHousehold(data.household || null);
      
      localStorage.setItem("me", JSON.stringify(data.user));
    } catch (e) {
      setErr(e.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const syncUser = () => {
      const raw = localStorage.getItem("me");
      if (raw) setUser(JSON.parse(raw));
    };

    window.addEventListener("user-updated", syncUser);
    return () => window.removeEventListener("user-updated", syncUser);
  }, []);

  if (err) {
    return (
      <div className="p6 bg-rose-50 text-rose-700 font-bold rounded-2xl">
        {err}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-10 text-center font-extrabold text-black/60">
        Loading...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-extrabold">My Profile</h1>
        </div>

        <Link
          to="/user/settings"
          className="rounded-2xl px-5 py-3 font-extrabold bg-orange-500 text-white hover:bg-orange-600 transition"
        >
          Edit in Settings
        </Link>
      </div>

      <div className="rounded-3xl bg-white border shadow-sm p-6">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="h-24 w-24 rounded-full border overflow-hidden bg-zinc-100">
            {/* Show profile image if available*/}
            {user.profileImageUrl ? (
              <img
                src={user.profileImageUrl}
                alt="profile"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center font-extrabold text-black/40">
                {String(user.name || "U").charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div>
            <div className="text-2xl font-extrabold">{user.name || "User"}</div>
            <div className="text-black/60 font-semibold">{user.email || "-"}</div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-2xl border p-4">
            <div className="text-black/60 font-bold text-sm">Phone</div>
            <div className="font-extrabold text-lg">{user.phone || "-"}</div>
          </div>

          <div className="rounded-2xl border p-4">
            <div className="text-black/60 font-bold text-sm">Email</div>
            <div className="font-extrabold text-lg">{user.email || "-"}</div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl bg-white border shadow-sm p-6 space-y-4">
        <div className="font-extrabold text-lg">My Household Form</div>

        {!household ? (
          <div className="text-black/60 font-semibold">
            No form yet.{" "}
            <Link className="text-blue-700 underline" to="/user/household/new">
              Create one
            </Link>
          </div>
        ) : (
          <div className="rounded-3xl border p-5 space-y-3">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="font-extrabold text-xl">{household.householdId}</div>
              <StatusBadge status={household.status} />
            </div>

            <div className="text-black/60 font-semibold">
              Created: {new Date(household.createdAt).toLocaleString()}
            </div>

            <div className="text-black/60 font-semibold">
              Updated: {new Date(household.updatedAt).toLocaleString()}
            </div>

            {/* Show rejection reason if admin rejected the form */}
            {household.status === "rejected" && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
                <div className="font-extrabold text-rose-700">Rejected reason</div>
                <div className="text-rose-700/80 mt-1">
                  {household.rejectionReason || "-"}
                </div>
              </div>
            )}

            <div className="flex gap-2 flex-wrap">
              <Link
                to={`/user/household/${household.householdId}`}
                className="rounded-2xl px-4 py-2 font-bold border hover:bg-black/5 transition"
              >
                View
              </Link>

              {/* hidden edit button*/}
              {household.status !== "verified" && (
                <Link
                  to={`/user/household/new?edit=${household.householdId}`}
                  className="rounded-2xl px-4 py-2 font-extrabold bg-orange-500 text-white hover:bg-orange-600 transition"
                >
                  Edit
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}