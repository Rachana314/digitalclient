import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiFetch } from "../../lib/api";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email) {
      setError("Email is required");
      return;
    }

    try {
      setLoading(true);

      const data = await apiFetch("/api/auth/user/forgot-password", {
        method: "POST",
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
        }),
      });

      setSuccess(data.message || "OTP sent to email");

      // Pass email and redirect after 1.5s
      setTimeout(() => {
        navigate("/reset-password", {
          state: { email: email.trim().toLowerCase() },
        });
      }, 1500);
    } catch (err) {
      setError(err.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="rounded-3xl bg-white/70 backdrop-blur border border-black/10 shadow-xl p-6 sm:p-8">
        <h1 className="text-2xl font-extrabold">Forgot Password</h1>
        <p className="mt-2 text-sm text-gray-600">
          Enter your email and we will send you an OTP to reset your password.
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

          <button
            disabled={loading}
            className="rounded-2xl bg-red-600 text-white py-3 font-bold disabled:opacity-60"
          >
            {loading ? "Please wait..." : "Send OTP"}
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