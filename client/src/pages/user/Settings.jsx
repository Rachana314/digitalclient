import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import QRCode from "react-qr-code";
import { apiFetch } from "../../lib/api";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";
const PUBLIC_BASE =
  import.meta.env.VITE_PUBLIC_BASE_URL ||
  `${window.location.protocol}//${window.location.host}`;

export default function Settings() {
  const navigate = useNavigate();

  const [me, setMe] = useState(null);
  const [household, setHousehold] = useState(null);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPasswordBox, setShowPasswordBox] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const bust = (url) => {
    if (!url) return "";
    const sep = url.includes("?") ? "&" : "?";
    return `${url}${sep}t=${Date.now()}`;
  };

  const load = async () => {
    try {
      setErr("");

      const data = await apiFetch("/api/users/me");

      const nextUser = data?.user
        ? {
            ...data.user,
            profileImageUrl: data.user.profileImageUrl
              ? bust(data.user.profileImageUrl)
              : "",
          }
        : null;

      setMe(nextUser);
      setHousehold(data.household || null);

      if (nextUser) {
        localStorage.setItem("me", JSON.stringify(nextUser));
        localStorage.setItem("user", JSON.stringify(nextUser));
        window.dispatchEvent(new Event("user-updated"));
      }
    } catch (e) {
      setErr(e.message || "Failed to load settings");
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const changePass = async () => {
    try {
      setErr("");
      setMsg("");

      if (!oldPassword || !newPassword) {
        throw new Error("Old password and new password are required.");
      }

      setSavingPassword(true);

      await apiFetch("/api/users/change-password", {
        method: "POST",
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      setOldPassword("");
      setNewPassword("");
      setShowPasswordBox(false);
      setMsg("Password changed successfully.");
    } catch (e) {
      setErr(e.message || "Failed to change password");
    } finally {
      setSavingPassword(false);
    }
  };

  const handleSelectAvatar = (file) => {
    if (!file) return;

    setErr("");
    setMsg("");

    if (!file.type.startsWith("image/")) {
      setErr("Please select an image file.");
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    const localPreview = URL.createObjectURL(file);
    setSelectedFile(file);
    setPreviewUrl(localPreview);
  };

  const uploadAvatar = async () => {
    try {
      setErr("");
      setMsg("");
      setUploading(true);

      if (!selectedFile) {
        throw new Error("Please choose a profile photo first.");
      }

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found. Please login again.");
      }

      const form = new FormData();
      form.append("file", selectedFile);

      const res = await fetch(`${API}/api/users/avatar`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: form,
      });

      const raw = await res.text();
      let data = {};

      try {
        data = raw ? JSON.parse(raw) : {};
      } catch {
        data = { message: raw };
      }

      if (!res.ok) {
        throw new Error(data.message || "Upload failed");
      }

      setMsg("Profile photo updated.");

      if (data.user) {
        const updatedUser = {
          ...data.user,
          profileImageUrl: data.user.profileImageUrl
            ? bust(data.user.profileImageUrl)
            : "",
        };

        setMe(updatedUser);
        localStorage.setItem("me", JSON.stringify(updatedUser));
        localStorage.setItem("user", JSON.stringify(updatedUser));
        window.dispatchEvent(new Event("user-updated"));
      } else {
        await load();
      }

      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      setSelectedFile(null);
      setPreviewUrl("");
    } catch (e) {
      setErr(e.message || "Profile photo upload failed");
    } finally {
      setUploading(false);
    }
  };

  const cancelPreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl("");
    setErr("");
    setMsg("");
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("me");
    window.dispatchEvent(new Event("user-updated"));
    navigate("/login", { replace: true });
  };

  const hasHousehold = Boolean(household?.householdId);
  const qrTargetUrl = hasHousehold
    ? `${PUBLIC_BASE}/verify/${household.householdId}`
    : "";
  const hasQr = Boolean(qrTargetUrl);

  const currentAvatar = previewUrl || me?.profileImageUrl || "";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold">Settings</h1>
      </div>

      {err && (
        <div className="p-5 rounded-2xl bg-rose-50 text-rose-700 font-bold">
          {err}
        </div>
      )}

      {msg && (
        <div className="p-5 rounded-2xl bg-emerald-50 text-emerald-700 font-bold">
          {msg}
        </div>
      )}

      {/* Profile Photo */}
      <div className="rounded-3xl bg-white border shadow-sm p-6 space-y-4">
        <div className="font-extrabold text-lg">Profile Photo</div>

        <div className="flex items-center gap-5 flex-wrap">
          <div className="h-28 w-28 rounded-full overflow-hidden border bg-zinc-100">
            {currentAvatar ? (
              <img
                src={currentAvatar}
                alt="profile"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center font-extrabold text-black/40 text-2xl">
                {String(me?.name || "U").charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <input
              type="file"
              accept="image/*"
              disabled={uploading}
              id="avatar-upload"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                handleSelectAvatar(file);
                e.target.value = "";
              }}
            />
            <label
              htmlFor="avatar-upload"
              className={`inline-flex items-center rounded-2xl px-5 py-3 font-extrabold border cursor-pointer hover:bg-black/5 transition ${
                uploading ? "opacity-50 pointer-events-none" : ""
              }`}
            >
              Choose Photo
            </label>

            {selectedFile && (
              <div className="text-sm font-semibold text-black/70">
                Selected: {selectedFile.name}
              </div>
            )}

            <div className="flex gap-3 flex-wrap">
              <button
                onClick={uploadAvatar}
                disabled={!selectedFile || uploading}
                className="rounded-2xl px-5 py-3 font-extrabold bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50 transition"
              >
                {uploading ? "Uploading..." : "Upload Photo"}
              </button>

              {selectedFile && (
                <button
                  onClick={cancelPreview}
                  disabled={uploading}
                  className="rounded-2xl px-5 py-3 font-extrabold border hover:bg-black/5 disabled:opacity-50 transition"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Password & Security */}
      <div className="rounded-3xl bg-white border shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="font-extrabold text-lg">Password & Security</div>
            <p className="text-sm text-black/60 mt-1">
              Update your password to keep your account secure.
            </p>
          </div>

          <button
            onClick={() => setShowPasswordBox((v) => !v)}
            className="rounded-2xl px-5 py-3 font-extrabold bg-zinc-900 text-white hover:opacity-90 transition"
          >
            {showPasswordBox ? "Close" : "Change Password"}
          </button>
        </div>

        {showPasswordBox && (
          <div className="border rounded-3xl p-5 space-y-4 bg-zinc-50">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-extrabold text-sm">Old Password</label>
                <input
                  type="password"
                  className="mt-2 w-full rounded-2xl border p-3"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Enter old password"
                />
              </div>

              <div>
                <label className="font-extrabold text-sm">New Password</label>
                <input
                  type="password"
                  className="mt-2 w-full rounded-2xl border p-3"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={changePass}
                disabled={savingPassword}
                className="rounded-2xl px-6 py-3 font-extrabold bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50 transition"
              >
                {savingPassword ? "Saving..." : "Save Password"}
              </button>

              <button
                onClick={() => {
                  setShowPasswordBox(false);
                  setOldPassword("");
                  setNewPassword("");
                }}
                className="rounded-2xl px-6 py-3 font-extrabold border hover:bg-black/5 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Verification & QR */}
      <div className="rounded-3xl bg-white border shadow-sm p-6 space-y-4">
        <div className="font-extrabold text-lg">Verification & QR</div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-2xl border p-4 bg-zinc-50">
            <div className="text-sm font-bold text-black/50">Form Status</div>
            <div className="mt-2 text-lg font-extrabold">
              {household?.status ? household.status.toUpperCase() : "NO FORM"}
            </div>
          </div>

          <div className="rounded-2xl border p-4 bg-zinc-50">
            <div className="text-sm font-bold text-black/50">QR Availability</div>
            <div className="mt-2 text-lg font-extrabold">
              {hasQr ? "AVAILABLE" : "NOT AVAILABLE YET"}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-dashed p-5 bg-zinc-50">
          {hasQr ? (
            <div className="space-y-4">
              <div className="font-extrabold text-emerald-700">
                Your QR code is ready.
              </div>

              <div className="text-sm text-black/60">
                This QR code always shows the latest form status.
              </div>

              <div className="bg-white p-4 rounded-2xl border inline-block">
                <QRCode value={qrTargetUrl} size={220} />
              </div>

              <div className="text-sm font-semibold text-black/70">
                Household ID: {household.householdId}
              </div>

              <div className="text-xs text-black/50 break-all">
                QR target: {qrTargetUrl}
              </div>

              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={() => navigate(`/user/qr/${household.householdId}`)}
                  className="rounded-2xl px-5 py-3 font-extrabold bg-orange-500 text-white hover:bg-orange-600 transition"
                >
                  Open QR Page
                </button>

                <button
                  onClick={() => window.open(qrTargetUrl, "_blank")}
                  className="rounded-2xl px-5 py-3 font-extrabold border hover:bg-black/5 transition"
                >
                  Open Status Page
                </button>
              </div>
            </div>
          ) : hasHousehold ? (
            <div className="space-y-2">
              <div className="font-extrabold text-zinc-900">
                QR code is not available yet.
              </div>
              <div className="text-sm text-black/60">
                Submit your household form first. After submission QR code will
                appear here automatically.
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="font-extrabold text-zinc-900">
                No household form found.
              </div>
              <div className="text-sm text-black/60">
                Create and submit your household form first to continue.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Account / Logout */}
      <div className="rounded-3xl bg-white border shadow-sm p-6 space-y-4">
        <div className="font-extrabold text-lg">Account</div>
        <p className="text-sm text-black/60">
          Sign out from your account on this device.
        </p>

        <button
          onClick={logout}
          className="rounded-2xl px-6 py-3 font-extrabold bg-rose-600 text-white hover:bg-rose-700 transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
}