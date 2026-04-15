import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../lib/api";
import {
  ResponsiveContainer,
  BarChart, Bar,
  LineChart, Line,
  AreaChart, Area,
  RadialBarChart, RadialBar,
  XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, Cell,
} from "recharts";

const BLUE   = "#1e3a8a";
const BLUE2  = "#2563eb";
const BLUE3  = "#60a5fa";
const TEAL   = "#0d9488";
const AMBER  = "#d97706";
const ROSE   = "#e11d48";

// Custom tooltip
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "white", border: "1px solid #e2e8f0",
      borderRadius: 12, padding: "10px 14px", boxShadow: "0 4px 20px rgba(0,0,0,0.1)"
    }}>
      <p style={{ fontWeight: 800, fontSize: 12, color: "#1e3a8a", marginBottom: 6 }}>{label}</p>
      {payload.map((e, i) => (
        <p key={i} style={{ fontSize: 12, fontWeight: 600, color: e.color, margin: "2px 0" }}>
          {e.name}: <strong>{e.value}</strong>
        </p>
      ))}
    </div>
  );
}

// Stat card
function StatCard({ title, value, color = BLUE }) {
  return (
    <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5">
      <p className="text-xs font-extrabold text-black/40 uppercase tracking-widest mb-2">{title}</p>
      <p className="text-4xl font-extrabold" style={{ color }}>{value}</p>
    </div>
  );
}

// Chart wrapper
function ChartCard({ title, subtitle, children, span = "" }) {
  return (
    <div className={`rounded-2xl bg-white border border-gray-100 shadow-sm p-5 ${span}`}>
      <div className="mb-4">
        <h2 className="text-sm font-extrabold text-zinc-900">{title}</h2>
        {subtitle && <p className="text-xs text-black/40 font-semibold mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

export default function AdminAnalytics() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    let ok = true;
    apiFetch("/api/admin/analytics")
      .then((r) => { if (ok) { setData(r); setLoading(false); } })
      .catch((e) => { if (ok) { setError(e.message); setLoading(false); } });
    return () => { ok = false; };
  }, []);

  const statusData = useMemo(() => !data ? [] : [
    { name: "Draft",      value: data.statusBreakdown.draft              || 0, fill: "#94a3b8" },
    { name: "Submitted",  value: data.statusBreakdown.submitted          || 0, fill: BLUE2 },
    { name: "Correction", value: data.statusBreakdown.correction_required || 0, fill: AMBER },
    { name: "Rejected",   value: data.statusBreakdown.rejected           || 0, fill: ROSE },
    { name: "Verified",   value: data.statusBreakdown.verified           || 0, fill: TEAL },
  ], [data]);

  const genderData = useMemo(() => !data ? [] : [
    { name: "Male",   value: data.genderBreakdown.Male   || 0 },
    { name: "Female", value: data.genderBreakdown.Female || 0 },
    { name: "Other",  value: data.genderBreakdown.Other  || 0 },
  ], [data]);

  const ageData = useMemo(() => !data ? [] : [
    { name: "Children", value: data.ageBreakdown.children || 0, fill: BLUE3 },
    { name: "Adults",   value: data.ageBreakdown.adults   || 0, fill: BLUE2 },
    { name: "Seniors",  value: data.ageBreakdown.seniors  || 0, fill: BLUE },
  ], [data]);

  const wardData = useMemo(() =>
    !data?.wards ? [] : data.wards.map((w) => ({
      name: w.ward, households: w.households || 0, population: w.population || 0,
    })), [data]);

  const wardGenderData = useMemo(() =>
    !data?.wards ? [] : data.wards.map((w) => ({
      name: w.ward, male: w.male || 0, female: w.female || 0, other: w.other || 0,
    })), [data]);

  const eduData = useMemo(() =>
    !data?.educationBreakdown ? [] :
    data.educationBreakdown.slice(0, 8).map((i) => ({ name: i.name, value: i.count })),
  [data]);

  const occData = useMemo(() =>
    !data?.occupationBreakdown ? [] :
    data.occupationBreakdown.slice(0, 8).map((i) => ({ name: i.name, value: i.count })),
  [data]);

  // Radial data for gender donut-style
  const radialGender = useMemo(() => {
    if (!data) return [];
    const total = (data.genderBreakdown.Male || 0) + (data.genderBreakdown.Female || 0) + (data.genderBreakdown.Other || 0);
    if (!total) return [];
    return [
      { name: "Male",   value: Math.round(((data.genderBreakdown.Male   || 0) / total) * 100), fill: BLUE  },
      { name: "Female", value: Math.round(((data.genderBreakdown.Female || 0) / total) * 100), fill: TEAL  },
      { name: "Other",  value: Math.round(((data.genderBreakdown.Other  || 0) / total) * 100), fill: AMBER },
    ];
  }, [data]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center space-y-3">
        <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-900 border-t-transparent rounded-full" />
        <p className="font-extrabold text-black/40 text-sm">Loading analytics...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="rounded-2xl bg-rose-50 border border-rose-200 p-6">
      <h1 className="text-xl font-extrabold text-rose-700">Failed to load</h1>
      <p className="mt-1 text-rose-600 font-semibold text-sm">{error}</p>
    </div>
  );

  return (
    <div className="space-y-5 max-w-7xl mx-auto">

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900">Analytics</h1>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Total Households"    value={data.totalHouseholds}          color={BLUE}  />
        <StatCard title="Total Population"    value={data.totalPopulation}          color={BLUE2} />
        <StatCard title="Verified Households" value={data.statusBreakdown.verified} color={TEAL}  />
        <StatCard title="Avg Household Size"  value={data.averageHouseholdSize}     color={AMBER} />
      </div>

      {/* Row 1 — Status (colored bar) + Gender (radial) */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">

        {/* Status — colored bars, each bar its own color */}
        <ChartCard title="Household status" subtitle="Count by verification stage" span="xl:col-span-3">
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData} barSize={44} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 700, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f8fafc" }} />
                <Bar dataKey="value" name="Households" radius={[8, 8, 0, 0]}>
                  {statusData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Gender — radial bar */}
        <ChartCard title="Gender split" subtitle="% of total population" span="xl:col-span-2">
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                innerRadius="30%"
                outerRadius="90%"
                data={radialGender}
                startAngle={90}
                endAngle={-270}
              >
                <RadialBar
                  dataKey="value"
                  cornerRadius={8}
                  label={{ position: "insideStart", fill: "#fff", fontSize: 11, fontWeight: 800, formatter: (v) => `${v}%` }}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => (
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#475569" }}>{value}</span>
                  )}
                />
                <Tooltip content={<CustomTooltip />} />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Row 2 — Age (horizontal bar) + Ward population (area) */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

        {/* Age — horizontal bar */}
        <ChartCard title="Age breakdown" subtitle="Children, adults, seniors">
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={ageData}
                barSize={28}
                margin={{ top: 0, right: 16, left: 16, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fontWeight: 700, fill: "#475569" }} axisLine={false} tickLine={false} width={70} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f8fafc" }} />
                <Bar dataKey="value" name="People" radius={[0, 8, 8, 0]}>
                  {ageData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Ward population — area chart */}
        <ChartCard title="Ward-wise population" subtitle="Household & population trend per ward">
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={wardData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="fillHH" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={BLUE}  stopOpacity={0.2} />
                    <stop offset="95%" stopColor={BLUE}  stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="fillPop" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={TEAL}  stopOpacity={0.2} />
                    <stop offset="95%" stopColor={TEAL}  stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 700, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={8}
                  formatter={(v) => <span style={{ fontSize: 11, fontWeight: 700, color: "#475569" }}>{v}</span>}
                />
                <Area type="monotone" dataKey="households" name="Households" stroke={BLUE}  fill="url(#fillHH)"  strokeWidth={2} dot={{ r: 4, fill: BLUE }}  />
                <Area type="monotone" dataKey="population"  name="Population"  stroke={TEAL}  fill="url(#fillPop)" strokeWidth={2} dot={{ r: 4, fill: TEAL }}  />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Row 3 — Ward gender (grouped bar) + Disability */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

        <ChartCard title="Ward-wise gender breakdown" subtitle="Male / female / other per ward">
          <div style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={wardGenderData} barSize={14} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 700, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f8fafc" }} />
                <Legend iconType="circle" iconSize={8}
                  formatter={(v) => <span style={{ fontSize: 11, fontWeight: 700, color: "#475569" }}>{v}</span>}
                />
                <Bar dataKey="male"   name="Male"   fill={BLUE}  radius={[4, 4, 0, 0]} />
                <Bar dataKey="female" name="Female" fill={TEAL}  radius={[4, 4, 0, 0]} />
                <Bar dataKey="other"  name="Other"  fill={AMBER} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Disability insights" subtitle="Households and members affected">
          <div style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                barSize={36}
                margin={{ top: 0, right: 24, left: 8, bottom: 0 }}
                data={[
                  { name: "Households w/ disability", value: data.disability.householdsWithDisability || 0, fill: ROSE  },
                  { name: "Disabled members total",   value: data.disability.totalDisabledMembers     || 0, fill: BLUE2 },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fontWeight: 700, fill: "#475569" }} axisLine={false} tickLine={false} width={170} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f8fafc" }} />
                <Bar dataKey="value" name="Count" radius={[0, 8, 8, 0]}>
                  {[ROSE, BLUE2].map((c, i) => <Cell key={i} fill={c} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Row 4 — Education + Occupation (line charts for variety) */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

        <ChartCard title="Top education levels" subtitle="People per education category">
          <div style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={eduData} barSize={28} margin={{ top: 4, right: 8, left: -16, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" interval={0} angle={-20} textAnchor="end" tick={{ fontSize: 10, fontWeight: 700, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f8fafc" }} />
                <Bar dataKey="value" name="People" fill={BLUE2} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Top occupations" subtitle="People per occupation category">
          <div style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={occData} margin={{ top: 4, right: 16, left: -16, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" interval={0} angle={-20} textAnchor="end" tick={{ fontSize: 10, fontWeight: 700, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="value"
                  name="People"
                  stroke={TEAL}
                  strokeWidth={2.5}
                  dot={{ r: 5, fill: TEAL, strokeWidth: 2, stroke: "#fff" }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Ward table */}
      <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5">
        <h2 className="text-sm font-extrabold text-zinc-900 mb-4">Ward-wise summary</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr style={{ background: "#1e3a8a" }}>
                {["Ward","Households","Population","Male","Female","Other","Verified","Submitted","Rejected"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-extrabold text-white uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.wards.length === 0 ? (
                <tr><td colSpan="9" className="px-4 py-6 text-center text-black/40 font-semibold">No ward data.</td></tr>
              ) : (
                data.wards.map((w, i) => (
                  <tr key={w.ward} className={`border-b border-gray-50 hover:bg-blue-50/40 transition ${i % 2 === 0 ? "bg-white" : "bg-slate-50/60"}`}>
                    <td className="px-4 py-3 font-extrabold text-blue-900">{w.ward}</td>
                    <td className="px-4 py-3 font-semibold text-zinc-700">{w.households}</td>
                    <td className="px-4 py-3 font-semibold text-zinc-700">{w.population}</td>
                    <td className="px-4 py-3 text-zinc-600">{w.male}</td>
                    <td className="px-4 py-3 text-zinc-600">{w.female}</td>
                    <td className="px-4 py-3 text-zinc-600">{w.other}</td>
                    <td className="px-4 py-3"><span className="bg-teal-100 text-teal-800 text-xs font-extrabold px-2 py-1 rounded-lg">{w.verified}</span></td>
                    <td className="px-4 py-3"><span className="bg-blue-100 text-blue-800 text-xs font-extrabold px-2 py-1 rounded-lg">{w.submitted}</span></td>
                    <td className="px-4 py-3"><span className="bg-rose-100 text-rose-800 text-xs font-extrabold px-2 py-1 rounded-lg">{w.rejected}</span></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}