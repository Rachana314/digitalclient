import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
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
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-extrabold ring-1 ${map[status] || ""}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {(status || "n/a").toUpperCase()}
    </span>
  );
}

export default function HouseholdView() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [reqType, setReqType] = useState("delete_member");
  const [memberIndex, setMemberIndex] = useState(0);
  const [note, setNote] = useState("");
  const [previewImage, setPreviewImage] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");

  const [newborn, setNewborn] = useState({
    name: "",
    age: 0,
    gender: "Male",
    maritalStatus: "Single",
    education: "",
    occupation: "",
    disability: false,
    disabilityDetail: "",
  });

  const canEdit = useMemo(() => item && item.status !== "verified", [item]);
  const canDelete = useMemo(() => item && item.status !== "verified", [item]);
  const load = async () => {
    try {
      setErr("");
      setLoading(true);
      const data = await apiFetch(`/api/households/${id}`);
      setItem(data);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const handleDeleteHousehold = async () => {
    const ok = window.confirm("Do you really want to delete this household form?");
    if (!ok) return;
    try {
      setErr("");
      await apiFetch(`/api/households/${id}`, { method: "DELETE" });
      navigate("/user/forms");
    } catch (e) {
      setErr(e.message);
    }
  };

  const sendRequest = async () => {
    try {
      setErr("");

      const payload =
        reqType === "delete_member"
          ? { type: "delete_member", memberIndex: Number(memberIndex), note }
          : { type: "add_newborn", newborn, note };

      await apiFetch(`/api/households/${id}/change-requests`, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setNote("");
      alert("Request sent to admin.");
      await load();
    } catch (e) {
      setErr(e.message);
    }
  };

  const openPreview = (url, title = "Photo preview") => {
    setPreviewImage(url);
    setPreviewTitle(title);
  };

  const closePreview = () => {
    setPreviewImage("");
    setPreviewTitle("");
  };

  if (loading) {
    return <div className="p-10 text-center font-extrabold text-black/60">Loading...</div>;
  }

  if (err) {
    return <div className="p-6 bg-rose-50 text-rose-700 font-bold rounded-2xl">{err}</div>;
  }

  if (!item) {
    return <div className="p-10 text-center text-black/60 font-semibold">Not found</div>;
  }

  return (
    <>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-end justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold">
                Household #{item.householdId}
              </h1>
              <StatusBadge status={item.status} />
            </div>
            <p className="text-black/60 font-medium mt-1">
              Last updated: {new Date(item.updatedAt).toLocaleString()}
            </p>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Link
              to="/user/forms"
              className="rounded-2xl px-4 py-2 font-bold border hover:bg-black/5 transition"
            >
              Back
            </Link>

            {canEdit && (
              <Link
                to={`/user/household/new?edit=${item.householdId}`}
                className="rounded-2xl px-4 py-2 font-extrabold bg-orange-500 text-white hover:bg-orange-600 transition"
              >
                Edit
              </Link>
            )}
          </div>
        </div>

        {canDelete && (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6">
            <div className="font-extrabold text-rose-700 text-lg">Delete household</div>
            <div className="text-rose-700/80 mt-1 font-medium">
              You can delete this form before admin verification.
            </div>

            <button
              onClick={handleDeleteHousehold}
              className="mt-4 rounded-2xl px-5 py-3 font-extrabold bg-rose-600 text-white hover:bg-rose-700 transition"
            >
              Delete this household
            </button>
          </div>
        )}

        {item.status === "rejected" && (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 p-5">
            <div className="font-extrabold text-rose-700">Rejected reason</div>
            <div className="text-rose-700/80 mt-1">{item.rejectionReason || "-"}</div>
          </div>
        )}

        <div className="rounded-3xl bg-white border shadow-sm p-6 space-y-4">
          <div className="font-extrabold text-lg">Household info</div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-2xl border p-4">
              <div className="text-black/60 font-bold text-sm">Ward</div>
              <div className="font-extrabold text-lg">{item.ward || "-"}</div>
            </div>

            <div className="rounded-2xl border p-4">
              <div className="text-black/60 font-bold text-sm">Address</div>
              <div className="font-extrabold text-lg">{item.address || "-"}</div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl bg-white border shadow-sm p-6 space-y-4">
          <div className="font-extrabold text-lg">Members</div>

          {item.members?.length ? (
            <div className="space-y-3">
              {item.members.map((m, idx) => (
                <div key={idx} className="rounded-3xl border p-5">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="font-extrabold text-lg">
                      {idx + 1}. {m.name || "-"}
                    </div>
                    <div className="text-black/60 font-bold text-sm">Age: {m.age ?? "-"}</div>
                  </div>

                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm font-semibold text-black/70">
                    <div>Gender: {m.gender || "-"}</div>
                    <div>Marital: {m.maritalStatus || "-"}</div>
                    <div>Education: {m.education || "-"}</div>
                    <div>Occupation: {m.occupation || "-"}</div>
                    <div className="sm:col-span-2">
                      Disability:{" "}
                      {m.disability ? `Yes (${m.disabilityDetail || "-"})` : "No"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-black/60 font-semibold">No members</div>
          )}
        </div>

        <div className="rounded-3xl bg-white border shadow-sm p-6 space-y-4">
          <div className="font-extrabold text-lg">Documents</div>

          {item.documents?.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {item.documents.map((d, i) => {
                const isImage =
                  d.url &&
                  (d.url.toLowerCase().includes(".jpg") ||
                    d.url.toLowerCase().includes(".jpeg") ||
                    d.url.toLowerCase().includes(".png") ||
                    d.url.toLowerCase().includes(".webp"));

                return (
                  <div key={i} className="rounded-2xl border p-4 space-y-3">
                    <div className="font-extrabold">{d.type}</div>

                    {isImage ? (
                      <button
                        type="button"
                        onClick={() =>
                          openPreview(d.url, d.originalName || `${d.type} Preview`)
                        }
                        className="block w-full text-left"
                      >
                        <img
                          src={d.url}
                          alt={d.originalName || d.type || "Uploaded document"}
                          className="w-full h-52 object-cover rounded-xl border hover:opacity-90 transition"
                        />
                      </button>
                    ) : (
                      <a
                        className="text-blue-700 underline break-all"
                        href={d.url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Open document
                      </a>
                    )}

                    <div className="text-sm text-black/60 break-all">
                      {d.originalName || d.url}
                    </div>

                    <a
                      className="inline-block text-sm font-bold text-blue-700 underline"
                      href={d.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open full file
                    </a>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-black/60 font-semibold">No documents</div>
          )}
        </div>

        {item.status === "verified" && (
          <div className="rounded-3xl bg-white border shadow-sm p-6 space-y-4">
            <div className="font-extrabold text-lg">Request changes (after verified)</div>
            <div className="text-black/60 font-medium">
              After verification you cannot edit. You need to request admin to do any changes.
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setReqType("delete_member")}
                className={`rounded-2xl px-4 py-2 font-extrabold transition ${
                  reqType === "delete_member"
                    ? "bg-zinc-900 text-white"
                    : "bg-zinc-100 text-black/70 hover:bg-black/5"
                }`}
              >
                Delete member (death)
              </button>

              <button
                onClick={() => setReqType("add_newborn")}
                className={`rounded-2xl px-4 py-2 font-extrabold transition ${
                  reqType === "add_newborn"
                    ? "bg-zinc-900 text-white"
                    : "bg-zinc-100 text-black/70 hover:bg-black/5"
                }`}
              >
                Add newborn
              </button>
            </div>

            {reqType === "delete_member" && (
              <div className="rounded-3xl border p-5 space-y-3">
                <div className="font-extrabold">Delete member request</div>

                <label className="font-extrabold text-sm">Select member</label>
                <select
                  className="rounded-2xl border p-3 w-full"
                  value={memberIndex}
                  onChange={(e) => setMemberIndex(e.target.value)}
                >
                  {item.members?.map((m, idx) => (
                    <option key={idx} value={idx}>
                      {idx + 1}. {m.name}
                    </option>
                  ))}
                </select>

                <label className="font-extrabold text-sm">Note</label>
                <input
                  className="rounded-2xl border p-3 w-full"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="example: died on 2026-02-10"
                />
              </div>
            )}

            {reqType === "add_newborn" && (
              <div className="rounded-3xl border p-5 space-y-4">
                <div className="font-extrabold">Add newborn request</div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-extrabold text-sm">Full name</label>
                    <input
                      className="mt-2 rounded-2xl border p-3 w-full"
                      value={newborn.name}
                      onChange={(e) =>
                        setNewborn((p) => ({ ...p, name: e.target.value }))
                      }
                      placeholder="newborn name"
                    />
                  </div>

                  <div>
                    <label className="font-extrabold text-sm">Age</label>
                    <input
                      type="number"
                      className="mt-2 rounded-2xl border p-3 w-full"
                      value={newborn.age}
                      onChange={(e) =>
                        setNewborn((p) => ({ ...p, age: Number(e.target.value) }))
                      }
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="font-extrabold text-sm">Gender</label>
                    <select
                      className="mt-2 rounded-2xl border p-3 w-full"
                      value={newborn.gender}
                      onChange={(e) =>
                        setNewborn((p) => ({ ...p, gender: e.target.value }))
                      }
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-extrabold text-sm">Marital Status</label>
                    <select
                      className="mt-2 rounded-2xl border p-3 w-full"
                      value={newborn.maritalStatus}
                      onChange={(e) =>
                        setNewborn((p) => ({ ...p, maritalStatus: e.target.value }))
                      }
                    >
                      <option value="Single">Single</option>
                      <option value="Married">Married</option>
                      <option value="Divorced">Divorced</option>
                      <option value="Widowed">Widowed</option>
                    </select>
                  </div>
                </div>

                <label className="font-extrabold text-sm">Note</label>
                <input
                  className="rounded-2xl border p-3 w-full"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="example: born on 2026-02-20"
                />
              </div>
            )}

            <button
              onClick={sendRequest}
              className="rounded-2xl px-5 py-3 font-extrabold bg-orange-500 text-white hover:bg-orange-600 transition"
            >
              Send request to admin
            </button>
          </div>
        )}
      </div>

      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={closePreview}
        >
          <div
            className="relative max-w-6xl w-full flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closePreview}
              className="absolute top-0 right-0 -mt-12 rounded-xl bg-white px-4 py-2 font-extrabold text-black shadow"
            >
              Close
            </button>

            <div className="mb-4 text-white font-extrabold text-lg text-center">
              {previewTitle}
            </div>

            <img
              src={previewImage}
              alt={previewTitle}
              className="max-h-[85vh] max-w-full rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      )}
    </>
  );
}