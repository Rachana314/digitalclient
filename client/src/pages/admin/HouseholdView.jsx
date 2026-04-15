import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiFetch } from "../../lib/api";

const SERVER_BASE =
  import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:8000";

function resolveUrl(url) {
  if (!url) return "";
  if (url.startsWith("blob:") || url.startsWith("http")) return url;
  return `${SERVER_BASE}${url.startsWith("/") ? "" : "/"}${url}`;
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
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-3xl bg-white border shadow-xl p-6">
        <div className="text-xl font-extrabold text-zinc-900">Reject Submission</div>
        <p className="text-zinc-500 text-sm font-semibold mt-1">Provide a reason for the citizen to fix.</p>
        <textarea
          className="mt-4 w-full rounded-2xl border p-4 min-h-[130px] outline-none focus:border-zinc-900 transition"
          placeholder="Reason for rejection..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} disabled={busy} className="rounded-2xl px-5 py-2 font-black border hover:bg-zinc-50 disabled:opacity-50">Cancel</button>
          <button onClick={() => onSubmit(reason)} disabled={busy || !reason.trim()} className="rounded-2xl px-5 py-2 font-black bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50">
            {busy ? "Sending..." : "Confirm Reject"}
          </button>
        </div>
      </div>
    </div>
  );
}

function PhotoModal({ url, name, onClose }) {
  if (!url) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={onClose}>
      <div className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute -top-12 right-0 text-white font-black text-lg px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition">
          ✕ Close
        </button>
        <img src={url} alt={name} className="w-full rounded-2xl object-contain shadow-2xl" style={{ maxHeight: "85vh" }} />
        {name && <div className="text-white/70 text-center font-bold text-sm mt-3">{name}</div>}
      </div>
    </div>
  );
}

export default function HouseholdView() {
  const { householdId } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [lightbox, setLightbox] = useState(null);
  const [verifyConfirmOpen, setVerifyConfirmOpen] = useState(false);
  const [removeConfirm, setRemoveConfirm] = useState(null); // stores memberId

  const load = async () => {
    setLoading(true);
    try {
      const data = await apiFetch(`/api/admin/households/${householdId}`);
      setItem(data);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (householdId) load();
  }, [householdId]);

  const verify = async () => {
    setBusy(true);
    try {
      await apiFetch(`/api/admin/households/${householdId}/verify`, { method: "PATCH" });
      setVerifyConfirmOpen(false);
      await load();
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  const removeMember = async () => {
    setBusy(true);
    try {
      const updatedMembers = item.members.filter((m) => m._id !== removeConfirm);
      await apiFetch(`/api/admin/households/${householdId}/members`, {
        method: "PUT",
        body: JSON.stringify({ members: updatedMembers }),
      });
      setItem({ ...item, members: updatedMembers });
      setRemoveConfirm(null);
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  const reject = async (reason) => {
    setBusy(true);
    try {
      await apiFetch(`/api/admin/households/${householdId}/reject`, {
        method: "PATCH",
        body: JSON.stringify({ reason }),
      });
      setRejectOpen(false);
      await load();
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <div className="p-20 text-center font-black text-zinc-400 text-xl">Loading record...</div>;
  if (err) return <div className="p-20 text-center font-black text-rose-500">Error: {err}</div>;
  if (!item) return <div className="p-20 text-center font-black text-rose-500">Household record not found.</div>;

  const docsByMember = {};
  (item.documents || []).forEach((doc) => {
    const key = (doc.memberName || "").trim();
    if (!docsByMember[key]) docsByMember[key] = [];
    docsByMember[key].push(doc);
  });

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {err && <div className="bg-rose-100 text-rose-700 p-4 rounded-2xl font-bold">{err}</div>}

      <div className="flex items-center justify-between">
        <Link to="/admin/households" className="font-black text-zinc-400 hover:text-zinc-900 transition">
          ← Back to List
        </Link>
        <div className="flex gap-2">
          {item.status === "submitted" && (
            <>
              <button
                onClick={() => setVerifyConfirmOpen(true)}
                disabled={busy}
                className="bg-emerald-600 text-white px-6 py-2.5 rounded-2xl font-black shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition"
              >
                {busy ? "Processing..." : "Verify Record"}
              </button>
              <button
                onClick={() => setRejectOpen(true)}
                disabled={busy}
                className="bg-rose-50 text-rose-600 px-6 py-2.5 rounded-2xl font-black hover:bg-rose-100 transition"
              >
                Reject
              </button>
            </>
          )}
        </div>
      </div>

      <div className="bg-white border rounded-3xl p-8 shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-black text-zinc-900">{item.householdId}</h1>
            <p className="text-zinc-500 font-bold mt-1 text-lg">{item.address}</p>
          </div>
          <div className="px-4 py-1.5 rounded-full font-black text-xs uppercase tracking-widest bg-zinc-100 text-zinc-600">
            {item.status}
          </div>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4 border-t pt-6">
          <div>
            <div className="text-zinc-400 text-xs font-black uppercase">Ward Number</div>
            <div className="text-zinc-900 font-black text-lg">Ward {item.ward || "N/A"}</div>
          </div>
          <div>
            <div className="text-zinc-400 text-xs font-black uppercase">Lock Status</div>
            <div className="text-zinc-900 font-black text-lg">{item.locked ? "Locked 🔒" : "Open 🔓"}</div>
          </div>
        </div>
        {item.status === "rejected" && item.rejectionReason && (
          <div className="mt-4 p-4 rounded-2xl bg-rose-50 border border-rose-200">
            <div className="text-rose-700 font-black text-xs uppercase mb-1">Rejection Reason</div>
            <div className="text-rose-600 font-bold text-sm">{item.rejectionReason}</div>
          </div>
        )}
      </div>

      <div className="bg-white border rounded-3xl p-8 shadow-sm">
        <h2 className="text-2xl font-black text-zinc-900 mb-6">Members ({item.members?.length || 0})</h2>
        <div className="space-y-8">
          {item.members?.map((m) => {
            const linkedDocs = docsByMember[m.name?.trim()] || [];
            const photoUrl = resolveUrl(m.photo);
            const allPhotos = [];
            if (photoUrl) allPhotos.push({ url: photoUrl, label: m.docType || "Document Photo" });
            linkedDocs.forEach((doc) => {
              const docUrl = resolveUrl(doc.url);
              if (!allPhotos.find((p) => p.url === docUrl)) {
                allPhotos.push({ url: docUrl, label: doc.type, originalName: doc.originalName });
              }
            });

            return (
              <div key={m._id} className="rounded-2xl border overflow-hidden group">
                <div className="flex justify-between items-start p-5 bg-zinc-50 border-b">
                  <div>
                    <div className="font-black text-zinc-900 text-xl">{m.name}</div>
                    <div className="text-zinc-500 font-bold text-sm mt-0.5">
                      {m.age} Yrs • {m.gender}{m.occupation ? ` • ${m.occupation}` : ""}
                    </div>
                    {m.citizenshipId && (
                      <div className="text-zinc-500 text-xs font-mono mt-1">
                        Citizenship ID: <span className="font-black text-zinc-800 tracking-wider">{m.citizenshipId}</span>
                      </div>
                    )}
                    {m.education && <div className="text-zinc-400 text-xs mt-0.5">Education: {m.education}</div>}
                    {m.maritalStatus && <div className="text-zinc-400 text-xs mt-0.5">Marital Status: {m.maritalStatus}</div>}
                    {m.disability && (
                      <div className="text-amber-600 text-xs font-bold mt-1">
                        ⚠ Disability{m.disabilityDetail ? `: ${m.disabilityDetail}` : ""}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => setRemoveConfirm(m._id)}
                    className="opacity-0 group-hover:opacity-100 px-4 py-2 rounded-xl bg-rose-50 text-rose-600 font-black text-xs transition-opacity"
                  >
                    Remove
                  </button>
                </div>

                <div className="p-5 bg-white">
                  {allPhotos.length === 0 ? (
                    <div className="rounded-2xl border-2 border-dashed border-zinc-200 h-40 flex flex-col items-center justify-center text-zinc-400 gap-2">
                      <div className="text-3xl">📷</div>
                      <div className="text-sm font-bold">No document photo uploaded</div>
                    </div>
                  ) : (
                    <div className={`grid gap-4 ${allPhotos.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
                      {allPhotos.map((photo, i) => (
                        <div
                          key={i}
                          className="relative cursor-zoom-in rounded-2xl overflow-hidden border-2 border-zinc-200 hover:border-zinc-800 transition-all shadow-sm hover:shadow-md"
                          onClick={() => setLightbox({ url: photo.url, name: `${m.name} — ${photo.label}` })}
                        >
                          <img
                            src={photo.url}
                            alt={photo.label}
                            className="w-full object-cover"
                            style={{ minHeight: "220px", maxHeight: "320px" }}
                            onError={(e) => {
                              e.target.style.display = "none";
                              e.target.nextElementSibling.style.display = "flex";
                            }}
                          />
                          <div className="w-full items-center justify-center bg-zinc-100 text-zinc-500 font-bold text-sm flex-col gap-2" style={{ display: "none", minHeight: "220px" }}>
                            <div className="text-4xl">📄</div>
                            <div>{photo.label}</div>
                            <a href={photo.url} target="_blank" rel="noreferrer" className="text-xs text-blue-600 underline" onClick={(e) => e.stopPropagation()}>Open file ↗</a>
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-4 py-3 pointer-events-none">
                            <div className="text-white font-black text-sm uppercase tracking-wide">{photo.label}</div>
                            {photo.originalName && <div className="text-white/60 text-xs mt-0.5">{photo.originalName}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {lightbox && <PhotoModal url={lightbox.url} name={lightbox.name} onClose={() => setLightbox(null)} />}

      <ConfirmModal
        open={verifyConfirmOpen}
        message="Are you sure you want to mark this household as verified?"
        onConfirm={verify}
        onCancel={() => setVerifyConfirmOpen(false)}
        busy={busy}
      />

      <ConfirmModal
        open={!!removeConfirm}
        message="Are you sure you want to remove this member permanently?"
        onConfirm={removeMember}
        onCancel={() => setRemoveConfirm(null)}
        busy={busy}
      />

      <RejectModal open={rejectOpen} onClose={() => setRejectOpen(false)} onSubmit={reject} busy={busy} />
    </div>
  );
}