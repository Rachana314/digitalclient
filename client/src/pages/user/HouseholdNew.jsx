import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { apiFetch } from "../../lib/api";
import { uploadDoc } from "../../lib/upload";

const CITIZENSHIP_REGEX = /^\d{2}-\d{2}-\d{2}-\d{4}$/;

// ✅ Hash utility
async function getFileHash(file) {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export default function HouseholdNew() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");

  const steps = useMemo(() => ["Household", "Members", "Review"], []);
  const [step, setStep] = useState(0);

  const [householdId, setHouseholdId] = useState(null);
  const [status, setStatus] = useState("draft");

  const [household, setHousehold] = useState({ ward: "", address: "" });
  const [members, setMembers] = useState([]);

  const [memberDraft, setMemberDraft] = useState({
    name: "",
    age: "",
    gender: "Male",
    maritalStatus: "Single",
    education: "",
    occupation: "",
    disability: false,
    disabilityDetail: "",
    citizenshipId: "",
    docType: "Citizenship",
    photoFile: null,
    photoPreview: null,
    photoHash: null, // ✅
  });

  const [citizenshipError, setCitizenshipError] = useState("");
  const [photoError, setPhotoError] = useState(""); // ✅

  const [documents, setDocuments] = useState([]);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const canEdit = status !== "verified";

  useEffect(() => {
    if (!editId) return;
    const load = async () => {
      try {
        setLoadingEdit(true);
        const data = await apiFetch(`/api/households/${editId}`);
        setHouseholdId(data.householdId);
        setStatus(data.status || "draft");
        setHousehold({
          ward: data.ward || "",
          address: data.address || "",
        });
        setMembers(Array.isArray(data.members) ? data.members : []);
        setDocuments(Array.isArray(data.documents) ? data.documents : []);

        if ((data.status || "").toLowerCase() === "verified") {
          navigate(`/user/household/${editId}`, { replace: true });
        }
      } catch (e) {
        setError(e.message || "Failed to load household");
      } finally {
        setLoadingEdit(false);
      }
    };
    load();
  }, [editId, navigate]);

  const validateStep = (s) => {
    if (s === 0) {
      if (!household.ward.trim()) throw new Error("Ward is required.");
      if (!household.address.trim()) throw new Error("Address is required.");
    }
    if (s === 1) {
      if (members.length === 0) throw new Error("Add at least one member.");
    }
  };

  const saveDraft = async () => {
    if (!canEdit) throw new Error("This record is verified. You cannot edit.");
    const payload = {
      ward: household.ward.trim(),
      address: household.address.trim(),
      members,
      documents,
    };

    if (!householdId) {
      const created = await apiFetch("/api/households", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setHouseholdId(created.householdId);
      return created.householdId;
    }

    await apiFetch(`/api/households/${householdId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    return householdId;
  };

  const handleCitizenshipInput = (val) => {
    let cleaned = val.replace(/[^0-9]/g, "");
    let formatted = cleaned;
    if (cleaned.length > 2) formatted = cleaned.slice(0, 2) + "-" + cleaned.slice(2);
    if (cleaned.length > 4) formatted = formatted.slice(0, 5) + "-" + cleaned.slice(4);
    if (cleaned.length > 6) formatted = formatted.slice(0, 8) + "-" + cleaned.slice(6);
    if (cleaned.length > 10) formatted = formatted.slice(0, 13);

    setMemberDraft((prev) => ({ ...prev, citizenshipId: formatted }));

    if (formatted && !CITIZENSHIP_REGEX.test(formatted)) {
      setCitizenshipError("Enter in the correct format: 01-02-00-0213");
    } else {
      setCitizenshipError("");
    }
  };

  // ✅ Updated handlePhotoChange with duplicate detection
  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoError("");

    // Generate hash
    const hash = await getFileHash(file);

    // ✅ Check against already added members in current form session
    const isDuplicateInForm = members.some((m) => m.photoHash === hash);
    if (isDuplicateInForm) {
      setPhotoError("⚠️ This photo is already used by another member. Please upload a different photo.");
      e.target.value = "";
      return;
    }

    // ✅ Check against database
    try {
      const res = await apiFetch("/api/households/check-photo-hash", {
        method: "POST",
        body: JSON.stringify({ hash }),
      });
      if (res.isDuplicate) {
        setPhotoError("⚠️ This photo already exists in the system. Please use a different photo.");
        e.target.value = "";
        return;
      }
    } catch {
      // fail silently — backend will catch it on upload anyway
    }

    const previewUrl = URL.createObjectURL(file);
    setMemberDraft((prev) => ({
      ...prev,
      photoFile: file,
      photoPreview: previewUrl,
      photoHash: hash, // ✅ store hash
    }));
  };

  const addMember = async () => {
    if (!canEdit) return;
    setError("");

    if (!memberDraft.name.trim()) {
      setError("Member name is required.");
      return;
    }

    if (!memberDraft.citizenshipId.trim()) {
      setError("Citizenship ID is required.");
      return;
    }

    if (!CITIZENSHIP_REGEX.test(memberDraft.citizenshipId)) {
      setError("Citizenship ID must be in the format: 01-02-00-0213");
      return;
    }

    setSaving(true);
    try {
      let currentId = householdId;
      if (!currentId) {
        currentId = await saveDraft();
      }

      let uploadedPhotoUrl = memberDraft.photoPreview || "";
      if (memberDraft.photoFile) {
        try {
          const res = await uploadDoc(currentId, memberDraft.docType, memberDraft.photoFile);
          uploadedPhotoUrl = res?.item?.documents?.at(-1)?.url || memberDraft.photoPreview || "";
        } catch {
          uploadedPhotoUrl = memberDraft.photoPreview || "";
        }
      }

      const newMember = {
        name: memberDraft.name.trim(),
        age: memberDraft.age === "" ? null : Number(memberDraft.age),
        gender: memberDraft.gender,
        maritalStatus: memberDraft.maritalStatus,
        education: memberDraft.education.trim(),
        occupation: memberDraft.occupation.trim(),
        disability: !!memberDraft.disability,
        disabilityDetail: memberDraft.disability ? memberDraft.disabilityDetail.trim() : "",
        citizenshipId: memberDraft.citizenshipId.trim(),
        docType: memberDraft.docType,
        photo: uploadedPhotoUrl,
        photoHash: memberDraft.photoHash || null, // ✅ store hash in member
      };

      setMembers((prev) => [...prev, newMember]);

      // Reset draft
      setMemberDraft({
        name: "", age: "", gender: "Male", maritalStatus: "Single",
        education: "", occupation: "", disability: false, disabilityDetail: "",
        citizenshipId: "", docType: "Citizenship",
        photoFile: null, photoPreview: null,
        photoHash: null, // ✅ reset hash
      });
      setCitizenshipError("");
      setPhotoError(""); // ✅ reset photo error
    } catch (e) {
      setError(e.message || "Failed to add member");
    } finally {
      setSaving(false);
    }
  };

  const removeMember = (idx) => {
    if (!canEdit) return;
    setMembers((prev) => prev.filter((_, i) => i !== idx));
  };

  const next = async () => {
    if (saving) return;
    setError("");
    try {
      validateStep(step);
      setSaving(true);
      if (step < steps.length - 1) {
        await saveDraft();
      }
      setStep((x) => Math.min(x + 1, steps.length - 1));
    } catch (e) {
      setError(e.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const back = () => setStep((x) => Math.max(x - 1, 0));

  const submit = async () => {
    if (!canEdit || saving) return;
    setSaving(true);
    try {
      validateStep(0);
      validateStep(1);
      const id = householdId || (await saveDraft());

      const getLocation = () =>
        new Promise((resolve) => {
          if (!navigator.geolocation) return resolve({});
          navigator.geolocation.getCurrentPosition(
            (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
            () => resolve({})
          );
        });

      const location = await getLocation();

      if (location.lat && location.lng) {
        await apiFetch(`/api/households/${id}`, {
          method: "PUT",
          body: JSON.stringify({
            ward: household.ward,
            address: household.address,
            members,
            documents,
            lat: location.lat,
            lng: location.lng,
          }),
        });
      }

      await apiFetch(`/api/households/${id}/submit`, { method: "POST" });
      navigate("/user/forms");
    } catch (e) {
      setError(e.message || "Submit failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold">
            {editId ? "Edit household" : "Household form"}
          </h1>
          <p className="text-black/60 font-medium mt-1">{editId ? `Editing: ${editId}` : ""}</p>
        </div>
        <Link
          to="/user/forms"
          className="rounded-2xl px-4 py-2 font-bold border hover:bg-black/5 transition"
        >
          Back
        </Link>
      </div>

      {error && (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-5">
          <div className="font-extrabold text-rose-700">Error</div>
          <div className="text-rose-700/80 mt-1">{error}</div>
        </div>
      )}

      <div className="rounded-3xl bg-white border shadow-sm p-5">
        {/* Step Tabs */}
        <div className="flex flex-wrap gap-2">
          {steps.map((label, idx) => (
            <div
              key={idx}
              className={`rounded-2xl px-4 py-2 text-sm font-extrabold border ${
                idx === step
                  ? "bg-zinc-900 text-white border-zinc-900"
                  : "bg-zinc-50 text-black/60"
              }`}
            >
              {idx + 1}. {label}
            </div>
          ))}
        </div>

        <div className="mt-6">
          {/* STEP 0: Household */}
          {step === 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-extrabold text-sm">Ward</label>
                <input
                  disabled={!canEdit}
                  className="mt-2 w-full rounded-2xl border p-3"
                  value={household.ward}
                  onChange={(e) => setHousehold({ ...household, ward: e.target.value })}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="font-extrabold text-sm">Address</label>
                <input
                  disabled={!canEdit}
                  className="mt-2 w-full rounded-2xl border p-3"
                  value={household.address}
                  onChange={(e) => setHousehold({ ...household, address: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* STEP 1: Members */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {/* Full Name */}
                <input
                  disabled={!canEdit}
                  className="rounded-2xl border p-3"
                  placeholder="Full Name"
                  value={memberDraft.name}
                  onChange={(e) => setMemberDraft({ ...memberDraft, name: e.target.value })}
                />

                {/* Age */}
                <input
                  disabled={!canEdit}
                  type="number"
                  className="rounded-2xl border p-3"
                  placeholder="Age"
                  value={memberDraft.age}
                  onChange={(e) => setMemberDraft({ ...memberDraft, age: e.target.value })}
                />

                {/* Gender */}
                <select
                  disabled={!canEdit}
                  className="rounded-2xl border p-3"
                  value={memberDraft.gender}
                  onChange={(e) => setMemberDraft({ ...memberDraft, gender: e.target.value })}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>

                {/* Citizenship ID */}
                <div className="flex flex-col lg:col-span-2">
                  <label className="text-[10px] font-bold uppercase ml-1 mb-1 text-black/40">
                    Citizenship ID <span className="text-rose-500">*</span>
                  </label>
                  <input
                    disabled={!canEdit}
                    className={`rounded-2xl border p-3 ${
                      citizenshipError ? "border-rose-400 bg-rose-50" : ""
                    }`}
                    placeholder="01-02-00-0213"
                    value={memberDraft.citizenshipId}
                    onChange={(e) => handleCitizenshipInput(e.target.value)}
                    maxLength={13}
                  />
                  {citizenshipError && (
                    <p className="text-rose-500 text-xs mt-1 ml-1">{citizenshipError}</p>
                  )}
                  {!citizenshipError && memberDraft.citizenshipId && CITIZENSHIP_REGEX.test(memberDraft.citizenshipId) && (
                    <p className="text-emerald-600 text-xs mt-1 ml-1">✓ Valid format</p>
                  )}
                </div>

                {/* Education */}
                <input
                  disabled={!canEdit}
                  className="rounded-2xl border p-3"
                  placeholder="Education"
                  value={memberDraft.education}
                  onChange={(e) => setMemberDraft({ ...memberDraft, education: e.target.value })}
                />

                {/* Occupation */}
                <input
                  disabled={!canEdit}
                  className="rounded-2xl border p-3"
                  placeholder="Occupation"
                  value={memberDraft.occupation}
                  onChange={(e) => setMemberDraft({ ...memberDraft, occupation: e.target.value })}
                />

                {/* Document Type + File Upload */}
                <div className="flex flex-col lg:col-span-2">
                  <label className="text-[10px] font-bold uppercase ml-1 mb-1 text-black/40">
                    Document Photo
                  </label>
                  <div className="flex gap-2 items-stretch">
                    <select
                      disabled={!canEdit}
                      className="rounded-2xl border p-3 text-sm font-semibold bg-zinc-50 min-w-[170px]"
                      value={memberDraft.docType}
                      onChange={(e) =>
                        setMemberDraft({
                          ...memberDraft,
                          docType: e.target.value,
                          photoFile: null,
                          photoPreview: null,
                          photoHash: null, // ✅ reset hash on type change
                        })
                      }
                    >
                      <option value="Citizenship">Citizenship</option>
                      <option value="BirthCertificate">Birth Certificate</option>
                      <option value="License">License</option>
                    </select>

                    <label
                      className={`flex-1 flex items-center gap-2 rounded-2xl border p-3 cursor-pointer text-sm font-semibold text-zinc-600 hover:bg-zinc-50 transition ${
                        !canEdit ? "opacity-50 pointer-events-none" : ""
                      }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828L18 9.828a4 4 0 00-5.656-5.656L5.757 10.757a6 6 0 008.486 8.486L20 13.5" />
                      </svg>
                      {memberDraft.photoFile ? memberDraft.photoFile.name : "Choose File"}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={!canEdit}
                        onChange={handlePhotoChange}
                      />
                    </label>
                  </div>

                  {/* ✅ Photo error message */}
                  {photoError && (
                    <p className="text-rose-500 text-xs mt-2 ml-1 font-semibold">{photoError}</p>
                  )}

                  {/* Photo Preview */}
                  {memberDraft.photoPreview && (
                    <div className="mt-3 flex items-start gap-3">
                      <div className="relative">
                        <img
                          src={memberDraft.photoPreview}
                          alt="Preview"
                          className="h-24 w-24 rounded-xl object-cover border-2 border-zinc-200 shadow-sm"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setMemberDraft((p) => ({
                              ...p,
                              photoFile: null,
                              photoPreview: null,
                              photoHash: null, // ✅ clear hash on remove
                            }))
                          }
                          className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shadow"
                        >
                          ×
                        </button>
                      </div>
                      <div className="text-xs text-black/50 mt-1">
                        <div className="font-semibold text-black/70">{memberDraft.docType}</div>
                        <div>{memberDraft.photoFile?.name}</div>
                        <div>{memberDraft.photoFile ? (memberDraft.photoFile.size / 1024).toFixed(1) + " KB" : ""}</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Disability */}
                <label className="flex items-center gap-2 rounded-2xl border p-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={memberDraft.disability}
                    onChange={(e) =>
                      setMemberDraft({ ...memberDraft, disability: e.target.checked })
                    }
                  />
                  Disability
                </label>

                {/* Disability Detail */}
                {memberDraft.disability && (
                  <input
                    disabled={!canEdit}
                    className="rounded-2xl border p-3 lg:col-span-2"
                    placeholder="Describe disability"
                    value={memberDraft.disabilityDetail}
                    onChange={(e) =>
                      setMemberDraft({ ...memberDraft, disabilityDetail: e.target.value })
                    }
                  />
                )}
              </div>

              {/* Add Member Button */}
              <button
                disabled={!canEdit || saving}
                onClick={addMember}
                className="rounded-2xl px-6 py-3 font-extrabold bg-zinc-900 text-white disabled:opacity-50"
              >
                {saving ? "Processing..." : "Add Member"}
              </button>

              {/* Members List */}
              <div className="grid grid-cols-1 gap-3">
                {members.map((m, i) => (
                  <div
                    key={i}
                    className="rounded-2xl border p-4 bg-zinc-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex flex-col items-center gap-1">
                        <div className="h-16 w-16 rounded-xl bg-zinc-200 overflow-hidden border-2 border-zinc-300 shadow-sm">
                          {m.photo ? (
                            <img
                              src={m.photo}
                              className="h-full w-full object-cover"
                              alt={m.docType || "doc"}
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-[8px] text-zinc-400 font-bold">
                              NO PHOTO
                            </div>
                          )}
                        </div>
                        {m.docType && (
                          <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wide">
                            {m.docType}
                          </span>
                        )}
                      </div>

                      <div>
                        <div className="font-bold text-sm">
                          {m.name}{" "}
                          <span className="text-black/40 font-normal">({m.age})</span>
                        </div>
                        <div className="text-[11px] text-black/50 mt-0.5">
                          {m.gender} • {m.occupation || "—"}
                        </div>
                        <div className="text-[11px] text-black/40 mt-0.5 font-mono">
                          ID: {m.citizenshipId || "—"}
                        </div>
                        <div className="text-[11px] text-black/40">
                          {m.photo ? "✅ Photo uploaded" : "❌ No photo"}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => removeMember(i)}
                      className="text-rose-600 font-bold text-xs px-3 py-1 rounded-xl border border-rose-200 hover:bg-rose-50 transition self-start sm:self-auto"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: Review */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="rounded-2xl border p-4 bg-zinc-50">
                <div className="font-extrabold mb-2 uppercase text-xs text-black/40 tracking-widest">
                  Review Summary
                </div>
                <div className="text-sm">
                  Ward: {household.ward} | Address: {household.address}
                </div>
                <div className="mt-4 font-bold text-sm">Members ({members.length}):</div>
                <div className="mt-3 space-y-3">
                  {members.map((m, i) => (
                    <div key={i} className="flex items-center gap-3 text-xs">
                      <div className="h-10 w-10 rounded-lg overflow-hidden border bg-zinc-200 flex-shrink-0">
                        {m.photo ? (
                          <img src={m.photo} className="h-full w-full object-cover" alt={m.name} />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-[7px] text-zinc-400">
                            N/A
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-bold">
                          {i + 1}. {m.name}
                        </div>
                        <div className="text-black/50 font-mono text-[10px]">
                          ID: {m.citizenshipId || "—"} • {m.docType}
                        </div>
                        <div>{m.photo ? "✅ Photo Uploaded" : "❌ No Photo"}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                disabled={!canEdit || saving}
                onClick={submit}
                className="w-full sm:w-auto rounded-2xl px-8 py-4 font-extrabold bg-emerald-600 text-white disabled:opacity-50"
              >
                {saving ? "Submitting..." : "Submit for verification"}
              </button>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="mt-10 flex items-center justify-between border-t pt-6">
          <button
            onClick={back}
            disabled={step === 0 || saving}
            className="rounded-2xl px-5 py-3 font-extrabold border disabled:opacity-30"
          >
            Back
          </button>
          <button
            onClick={next}
            disabled={step === steps.length - 1 || !canEdit || saving}
            className="rounded-2xl px-5 py-3 font-extrabold bg-zinc-900 text-white disabled:opacity-30"
          >
            {saving ? "Saving..." : "Next Step"}
          </button>
        </div>
      </div>
    </div>
  );
}