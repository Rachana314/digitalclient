import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { apiFetch } from "../../lib/api";

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();

  // refill email if redirected from forgot-password page
  const [email, setEmail] = useState(location.state?.email || "");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email || !otp || !newPassword || !confirmPassword) {
      setError("All fields are required");
      return;
    }

    try {
      setLoading(true);

      const data = await apiFetch("/api/auth/user/reset-password", {
        method: "POST",
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          otp: otp.trim(),
          newPassword,
          confirmPassword,
        }),
      });

      setSuccess(data.message || "Password reset successful");

      // Redirect to login after 1.5s
      setTimeout(() => {
        navigate("/login", {
          state: { email: email.trim().toLowerCase() },
        });
      }, 1500);
    } catch (err) {
      setError(err.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="rounded-3xl bg-white/70 backdrop-blur border border-black/10 shadow-xl p-6 sm:p-8">
        <h1 className="text-2xl font-extrabold">Reset Password</h1>
        <p className="mt-2 text-sm text-gray-600">
          Enter the OTP sent to your email and choose a new password.
        </p>

        {error && (
          <div className="mt-4 rounded-xl bg-red-100 text-red-700 px-4 py-3 text-sm font-medium">
            {error}
          </div>
        )}
        {success && (
          <div className="mt-4 rounded-xl bg-green-100 text-green-700 px-4 py-3 text-sm font-medium">
            {success}
          </div>
        )}

        <form onSubmit={submit} className="mt-6 grid gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-2xl border px-4 py-3"
          />

          <input
            type="text"
            placeholder="OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="rounded-2xl border px-4 py-3"
          />

          {/* Password fields with show/hide toggle */}
          <div className="flex items-center gap-2 rounded-2xl border px-4 py-3">
            <input
              type={showNewPw ? "text" : "password"}
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full outline-none"
            />
            <button type="button" onClick={() => setShowNewPw(!showNewPw)}>
              {showNewPw ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>

          <div className="flex items-center gap-2 rounded-2xl border px-4 py-3">
            <input
              type={showConfirmPw ? "text" : "password"}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full outline-none"
            />
            <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)}>
              {showConfirmPw ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>

          <button
            disabled={loading}
            className="rounded-2xl bg-red-600 text-white py-3 font-bold disabled:opacity-60"
          >
            {loading ? "Please wait..." : "Reset Password"}
          </button>
        </form>

        <p className="mt-5 text-sm">
          Back to{" "}
          <Link to="/login" className="font-bold text-red-600">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}