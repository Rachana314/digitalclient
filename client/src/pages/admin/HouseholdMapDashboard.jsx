import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function HouseholdMapDashboard() {
  const [households, setHouseholds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedWard, setSelectedWard] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/households/admin/map-data", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setHouseholds(data.data);
        else setError(data.message);
      })
      .catch(() => setError("Failed to load map data"))
      .finally(() => setLoading(false));
  }, []);

  const wards = ["all", ...new Set(households.map((h) => h.ward).filter(Boolean))];

  const filtered = households.filter((h) => {
    const matchWard = selectedWard === "all" || h.ward === selectedWard;
    const matchSearch =
      search === "" ||
      h.householdId?.toLowerCase().includes(search.toLowerCase()) ||
      h.address?.toLowerCase().includes(search.toLowerCase());
    return matchWard && matchSearch;
  });

  const totalMembers = filtered.reduce((sum, h) => sum + (h.memberCount || 0), 0);
  const wardCounts = households.reduce((acc, h) => {
    if (h.ward) acc[h.ward] = (acc[h.ward] || 0) + 1;
    return acc;
  }, {});

  const center = [26.6586, 87.2878];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Household Distribution Map</h1>
          </div>
          <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
            Live Data
          </span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Verified", value: households.length, color: "blue" },
            { label: "Showing on Map", value: filtered.length, color: "green" },
            { label: "Total Members", value: totalMembers, color: "purple" },
            { label: "Wards Covered", value: Object.keys(wardCounts).length, color: "orange" },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              className={`bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center`}
            >
              <p className="text-xs text-gray-500 mb-1">{label}</p>
              <p className={`text-3xl font-bold text-${color}-600`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-wrap gap-3 items-center">
          <input
            type="text"
            placeholder="Search by ID or address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm flex-1 min-w-[200px] focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
          <select
            value={selectedWard}
            onChange={(e) => setSelectedWard(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            {wards.map((w) => (
              <option key={w} value={w}>
                {w === "all" ? "All Wards" : `Ward ${w}`}
              </option>
            ))}
          </select>
          {(search || selectedWard !== "all") && (
            <button
              onClick={() => { setSearch(""); setSelectedWard("all"); }}
              className="text-sm text-red-500 hover:text-red-700"
            >
              Clear filters
            </button>
          )}
        </div>

        <div className="flex gap-4 h-[600px]">
          {/* Map */}
          <div className="flex-1 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full bg-gray-50 gap-3">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-400 text-sm">Loading map data...</p>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-full bg-red-50">
                <p className="text-red-500 text-sm">{error}</p>
              </div>
            ) : (
              <MapContainer
                center={center}
                zoom={12}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {filtered.map((h) => (
                  <Marker key={h.id} position={[h.lat, h.lng]}>
                    <Popup>
                      <div className="text-sm space-y-1 min-w-[160px]">
                        <p className="font-semibold text-gray-800">{h.householdId}</p>
                        <p className="text-gray-500">{h.address}</p>
                        <p className="text-gray-500">Ward: {h.ward}</p>
                        <p className="text-gray-500">Members: {h.memberCount}</p>
                        <span className="inline-block mt-1 bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">
                          {h.status}
                        </span>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            )}
          </div>

          {/* Ward Sidebar */}
          <div className="w-64 bg-white rounded-xl border border-gray-100 shadow-sm p-4 overflow-y-auto flex-shrink-0">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Ward Summary</h2>
            {Object.keys(wardCounts).length === 0 ? (
              <p className="text-xs text-gray-400">No data available</p>
            ) : (
              <div className="space-y-2">
                {Object.entries(wardCounts)
                  .sort((a, b) => b[1] - a[1])
                  .map(([ward, count]) => (
                    <button
                      key={ward}
                      onClick={() => setSelectedWard(selectedWard === ward ? "all" : ward)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedWard === ward
                          ? "bg-blue-50 border border-blue-200 text-blue-700"
                          : "bg-gray-50 hover:bg-gray-100 text-gray-700"
                      }`}
                    >
                      <span>Ward {ward}</span>
                      <span className="font-semibold">{count}</span>
                    </button>
                  ))}
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-gray-100">
              <h2 className="text-sm font-semibold text-gray-700 mb-2">Legend</h2>
              <div className="space-y-1 text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span>Verified household</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}