import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { apiFetch } from "../../lib/api";

export default function VerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState(location.state?.email || "");
  const [verificationCode, setVerificationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    }
  }, [location.state]);

  const verifyOtp = async (e) => {
    e.preventDefault();
    setErr("");
    setMsg("");

    try {
      setLoading(true);

      await apiFetch("/api/auth/user/verify-otp", {
        method: "POST",
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          verificationCode: verificationCode.trim(),
        }),
      });

      setMsg("Email verified successfully. You can login now.");

      setTimeout(() => {
        navigate("/login", {
          replace: true,
          state: { email: email.trim().toLowerCase() },
        });
      }, 1200);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    setErr("");
    setMsg("");

    try {
      setResending(true);

      const res = await apiFetch("/api/auth/user/request-otp", {
        method: "POST",
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
        }),
      });

      setMsg(res.message || "OTP sent again to your email.");
    } catch (e) {
      setErr(e.message);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded-3xl border shadow-sm">
      <h2 className="text-2xl font-extrabold mb-1">Verify Email</h2>
      <p className="text-black/60 font-medium mb-5">
        Enter the OTP sent to your email address.
      </p>

      {err && (
        <div className="mb-4 p-3 bg-rose-50 text-rose-700 rounded-2xl font-bold">
          {err}
        </div>
      )}

      {msg && (
        <div className="mb-4 p-3 bg-emerald-50 text-emerald-700 rounded-2xl font-bold">
          {msg}
        </div>
      )}

      <form onSubmit={verifyOtp} className="space-y-4">
        <div>
          <label className="font-extrabold text-sm">Email</label>
          <input
            type="email"
            className="mt-2 w-full border p-3 rounded-2xl"
            placeholder="example@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label className="font-extrabold text-sm">OTP Code</label>
          <input
            className="mt-2 w-full border p-3 rounded-2xl"
            placeholder="Enter OTP"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
          />
        </div>

        <button
          disabled={loading}
          className="w-full bg-orange-500 text-white p-3 rounded-2xl font-extrabold hover:bg-orange-600 transition disabled:opacity-50"
        >
          {loading ? "Verifying..." : "Verify Email"}
        </button>
      </form>

      <button
        onClick={resendOtp}
        disabled={resending || !email.trim()}
        className="mt-4 w-full border p-3 rounded-2xl font-extrabold hover:bg-black/5 transition disabled:opacity-50"
      >
        {resending ? "Sending..." : "Send OTP"}
      </button>

      <div className="mt-4 text-sm font-semibold text-black/60">
        Already verified?{" "}
        <Link to="/login" className="text-blue-700 underline">
          Login
        </Link>
      </div>
    </div>
  );
}