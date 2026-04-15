import { useState, useEffect } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

const HOUSEHOLD_STATUSES = [
  { value: "all", label: "All" },
  { value: "submitted", label: "Submitted" },
  { value: "verified", label: "Verified" },
  { value: "rejected", label: "Rejected" },
  { value: "correction_required", label: "Correction" },
];

export default function AdminReports() {
  const [activeTab, setActiveTab] = useState("household");
  const [status, setStatus] = useState("all");
  const [households, setHouseholds] = useState([]);
  const [citizens, setCitizens] = useState([]);
  const [selectedHouseIds, setSelectedHouseIds] = useState([]);
  const [selectedCitizenIds, setSelectedCitizenIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const token = localStorage.getItem("token");

  // ── Fetch Households ────────────────────────────────────────────────
  useEffect(() => {
    if (activeTab !== "household") return;
    const fetchHouseholds = async () => {
      setLoading(true);
      setError("");
      try {
        const params = status !== "all" ? `?status=${status}` : "";
        const res = await fetch(`${API}/api/admin/households${params}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`Failed to fetch (${res.status})`);
        const data = await res.json();
        setHouseholds(Array.isArray(data) ? data : data.households || []);
        setSelectedHouseIds([]);
      } catch (err) {
        setError(err.message || "Failed to load households");
      } finally {
        setLoading(false);
      }
    };
    fetchHouseholds();
  }, [activeTab, status]);

  // ── Fetch Verified Citizens ─────────────────────────────────────────
  useEffect(() => {
    if (activeTab !== "verified") return;
    const fetchCitizens = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${API}/api/admin/verified-citizens`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`Failed to fetch (${res.status})`);
        const data = await res.json();
        setCitizens(Array.isArray(data) ? data : data.citizens || []);
        setSelectedCitizenIds([]);
      } catch (err) {
        setError(err.message || "Failed to load verified citizens");
      } finally {
        setLoading(false);
      }
    };
    fetchCitizens();
  }, [activeTab]);

  // ── Filtered Households ─────────────────────────────────────────────
  const filteredHouseholds = households.filter((h) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.trim().toLowerCase();
    return (
      (h.householdId || h._id || "").toLowerCase().includes(q) ||
      (h.user?.email || "").toLowerCase().includes(q) ||
      (h.user?.name || "").toLowerCase().includes(q)
    );
  });

  // ── Checkbox Helpers ────────────────────────────────────────────────
  const toggleHouse = (id) =>
    setSelectedHouseIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );

  const toggleAllHouses = () =>
    setSelectedHouseIds(
      selectedHouseIds.length === filteredHouseholds.length
        ? []
        : filteredHouseholds.map((h) => h._id)
    );

  const toggleCitizen = (id) =>
    setSelectedCitizenIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );

  const toggleAllCitizens = () =>
    setSelectedCitizenIds(
      selectedCitizenIds.length === citizens.length
        ? []
        : citizens.map((c) => c._id)
    );

  // ── Export PDF ──────────────────────────────────────────────────────
  const handleExport = async () => {
    if (selectedHouseIds.length === 0 && selectedCitizenIds.length === 0) {
      alert("Please select at least one record to export.");
      return;
    }
    try {
      setExporting(true);
      const res = await fetch(`${API}/api/admin/reports/pdf`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          householdIds: selectedHouseIds,
          citizenIds: selectedCitizenIds,
        }),
      });

      if (!res.ok) {
        let message = `Export failed (${res.status})`;
        try {
          const data = await res.json();
          message = data.message || message;
        } catch { /* ignore */ }
        throw new Error(message);
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `census-report-${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert(err.message || "PDF export failed");
    } finally {
      setExporting(false);
    }
  };

  const totalSelected = selectedHouseIds.length + selectedCitizenIds.length;

  return (
    <div className="bg-white rounded-3xl border border-gray-300 shadow-sm p-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <h1 className="text-2xl font-extrabold">Reports</h1>
        <button
          onClick={handleExport}
          disabled={exporting || totalSelected === 0}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed
            text-white font-extrabold px-6 py-3 rounded-2xl transition duration-200 flex items-center gap-2"
        >
          {exporting ? (
            <>
              <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              Generating...
            </>
          ) : (
            <>
              ⬇ Export PDF
              {totalSelected > 0 && (
                <span className="bg-white text-blue-600 text-xs font-extrabold px-2 py-0.5 rounded-lg">
                  {totalSelected}
                </span>
              )}
            </>
          )}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 mb-5">
        <TabButton
          active={activeTab === "household"}
          onClick={() => { setActiveTab("household"); setStatus("all"); setSearchQuery(""); }}
          label="Household Forms"
          count={selectedHouseIds.length}
        />
      </div>

      {/* Filters (Household tab only) */}
      {activeTab === "household" && (
        <>
          <div className="flex flex-wrap gap-2 mb-3">
            {HOUSEHOLD_STATUSES.map((s) => (
              <button
                key={s.value}
                onClick={() => setStatus(s.value)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition duration-200
                  ${status === s.value
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"
                  }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Search — now also searches by email */}
          <div className="relative mb-4">
            <span className="absolute inset-y-0 left-3 flex items-center text-gray-400 pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Household ID or email..."
              className="w-full pl-9 pr-9 py-2.5 border border-gray-300 rounded-xl text-sm font-semibold
                text-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1
                focus:ring-blue-500 transition duration-200"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-semibold px-4 py-3 rounded-xl mb-4">
          {error}
        </div>
      )}

      {/* Household Table */}
      {activeTab === "household" && (
        <>
          {searchQuery && (
            <p className="text-xs text-gray-400 font-semibold mb-2">
              {filteredHouseholds.length} result{filteredHouseholds.length !== 1 ? "s" : ""} for &quot;{searchQuery}&quot;
            </p>
          )}
          <HouseholdTable
            households={filteredHouseholds}
            selectedIds={selectedHouseIds}
            loading={loading}
            toggleOne={toggleHouse}
            toggleAll={toggleAllHouses}
          />
        </>
      )}

      {/* Verified Citizen Table */}
      {activeTab === "verified" && (
        <CitizenTable
          citizens={citizens}
          selectedIds={selectedCitizenIds}
          loading={loading}
          toggleOne={toggleCitizen}
          toggleAll={toggleAllCitizens}
        />
      )}

      {/* Bottom summary */}
      <div className="mt-4 flex items-center justify-between flex-wrap gap-2">
        <div className="text-sm text-gray-500 font-semibold">
          {totalSelected === 0 ? (
            "No records selected across both tabs"
          ) : (
            <span>
              <span className="text-blue-600 font-extrabold">{totalSelected}</span> record
              {totalSelected !== 1 ? "s" : ""} selected
              {selectedHouseIds.length > 0 && (
                <span className="ml-2 text-gray-400">
                  ({selectedHouseIds.length} household{selectedHouseIds.length !== 1 ? "s" : ""}
                  {selectedCitizenIds.length > 0 ? `, ${selectedCitizenIds.length} citizen${selectedCitizenIds.length !== 1 ? "s" : ""}` : ""})
                </span>
              )}
              {selectedHouseIds.length === 0 && selectedCitizenIds.length > 0 && (
                <span className="ml-2 text-gray-400">
                  ({selectedCitizenIds.length} citizen{selectedCitizenIds.length !== 1 ? "s" : ""})
                </span>
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Tab Button ───────────────────────────────────────────────────────────────
function TabButton({ active, onClick, label, count }) {
  return (
    <button
      onClick={onClick}
      className={`px-5 py-2.5 text-sm font-extrabold border-b-2 transition duration-200 flex items-center gap-2
        ${active ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-800"}`}
    >
      {label}
      {count > 0 && (
        <span className="bg-blue-600 text-white text-xs font-extrabold px-2 py-0.5 rounded-full">
          {count}
        </span>
      )}
    </button>
  );
}

// ── Household Table ──────────────────────────────────────────────────────────
function HouseholdTable({ households, selectedIds, loading, toggleOne, toggleAll }) {
  const allChecked = households.length > 0 && selectedIds.length === households.length;
  const someChecked = selectedIds.length > 0 && selectedIds.length < households.length;

  if (loading) return <LoadingState text="Loading household forms..." />;
  if (households.length === 0)
    return <EmptyState text="No household forms found for this status." />;

  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 px-4 py-3 grid grid-cols-12 gap-2 border-b border-gray-200">
        <div className="col-span-1 flex items-center">
          <input
            type="checkbox"
            checked={allChecked}
            ref={(el) => { if (el) el.indeterminate = someChecked; }}
            onChange={toggleAll}
            className="w-4 h-4 accent-blue-600 cursor-pointer"
          />
        </div>
        <div className="col-span-3 text-xs font-extrabold text-gray-500 uppercase">Household ID</div>
        <div className="col-span-2 text-xs font-extrabold text-gray-500 uppercase">Ward</div>
        <div className="col-span-2 text-xs font-extrabold text-gray-500 uppercase">Address</div>
        {/* ✅ NEW column */}
        <div className="col-span-2 text-xs font-extrabold text-gray-500 uppercase">Submitted By</div>
        <div className="col-span-1 text-xs font-extrabold text-gray-500 uppercase">Status</div>
        <div className="col-span-1 text-xs font-extrabold text-gray-500 uppercase">Members</div>
      </div>

      {/* Rows */}
      <div className="max-h-[520px] overflow-y-auto">
        {households.map((h) => (
          <div
            key={h._id}
            onClick={() => toggleOne(h._id)}
            className={`px-4 py-3 grid grid-cols-12 gap-2 items-center border-b border-gray-100
              cursor-pointer transition duration-150
              ${selectedIds.includes(h._id) ? "bg-blue-50" : "hover:bg-gray-50"}`}
          >
            <div className="col-span-1">
              <input
                type="checkbox"
                checked={selectedIds.includes(h._id)}
                onChange={() => toggleOne(h._id)}
                onClick={(e) => e.stopPropagation()}
                className="w-4 h-4 accent-blue-600 cursor-pointer"
              />
            </div>
            <div className="col-span-3 text-xs font-mono text-gray-800 truncate">
              {h.householdId || h._id}
            </div>
            <div className="col-span-2 text-sm text-gray-600 truncate">{h.ward || "—"}</div>
            <div className="col-span-2 text-sm text-gray-600 truncate">{h.address || "—"}</div>

            {/* ✅ NEW: Submitted By cell */}
            <div className="col-span-2 flex flex-col min-w-0">
              {h.user?.email ? (
                <>
                  <span className="text-xs font-bold text-blue-700 truncate" title={h.user.email}>
                    {h.user.email}
                  </span>
                  {h.user?.name && (
                    <span className="text-[10px] text-gray-400 truncate">{h.user.name}</span>
                  )}
                </>
              ) : (
                <span className="text-xs text-gray-400 italic">Unknown</span>
              )}
            </div>

            <div className="col-span-1">
              <StatusBadge status={h.status} />
            </div>
            <div className="col-span-1 text-sm text-gray-600">
              {h.members?.length ?? 0}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Verified Citizen Table ───────────────────────────────────────────────────
function CitizenTable({ citizens, selectedIds, loading, toggleOne, toggleAll }) {
  const allChecked = citizens.length > 0 && selectedIds.length === citizens.length;
  const someChecked = selectedIds.length > 0 && selectedIds.length < citizens.length;

  if (loading) return <LoadingState text="Loading verified citizen forms..." />;
  if (citizens.length === 0)
    return <EmptyState text="No verified citizen records found." />;

  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden">
      <div className="bg-gray-50 px-4 py-3 grid grid-cols-12 gap-2 border-b border-gray-200">
        <div className="col-span-1 flex items-center">
          <input
            type="checkbox"
            checked={allChecked}
            ref={(el) => { if (el) el.indeterminate = someChecked; }}
            onChange={toggleAll}
            className="w-4 h-4 accent-blue-600 cursor-pointer"
          />
        </div>
        <div className="col-span-3 text-xs font-extrabold text-gray-500 uppercase">Citizenship No</div>
        <div className="col-span-4 text-xs font-extrabold text-gray-500 uppercase">Full Name</div>
        <div className="col-span-2 text-xs font-extrabold text-gray-500 uppercase">District</div>
        <div className="col-span-2 text-xs font-extrabold text-gray-500 uppercase">DOB</div>
      </div>
      <div className="max-h-[520px] overflow-y-auto">
        {citizens.map((c) => (
          <div
            key={c._id}
            onClick={() => toggleCitizen(c._id)}
            className={`px-4 py-3 grid grid-cols-12 gap-2 items-center border-b border-gray-100
              cursor-pointer transition duration-150
              ${selectedIds.includes(c._id) ? "bg-blue-50" : "hover:bg-gray-50"}`}
          >
            <div className="col-span-1">
              <input
                type="checkbox"
                checked={selectedIds.includes(c._id)}
                onChange={() => toggleOne(c._id)}
                onClick={(e) => e.stopPropagation()}
                className="w-4 h-4 accent-blue-600 cursor-pointer"
              />
            </div>
            <div className="col-span-3 text-sm font-mono text-gray-800 truncate">{c.citizenshipNo}</div>
            <div className="col-span-4 text-sm text-gray-700 truncate">{c.fullName || "—"}</div>
            <div className="col-span-2 text-sm text-gray-600 truncate">{c.district || "—"}</div>
            <div className="col-span-2 text-sm text-gray-600">
              {c.dob ? new Date(c.dob).toLocaleDateString() : "—"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const styles = {
    verified: "bg-green-100 text-green-700",
    submitted: "bg-blue-100 text-blue-700",
    draft: "bg-gray-100 text-gray-600",
    rejected: "bg-red-100 text-red-700",
    correction_required: "bg-yellow-100 text-yellow-700",
  };
  return (
    <span className={`text-xs font-bold px-2 py-1 rounded-lg ${styles[status] || "bg-gray-100 text-gray-500"}`}>
      {status || "—"}
    </span>
  );
}

function LoadingState({ text }) {
  return (
    <div className="py-12 text-center text-gray-400 text-sm font-semibold">
      <div className="animate-spin inline-block w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full mb-3" />
      <p>{text}</p>
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="py-12 text-center text-gray-400 text-sm font-semibold border border-dashed border-gray-200 rounded-2xl">
      {text}
    </div>
  );
}