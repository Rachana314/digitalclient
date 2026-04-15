import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { apiFetch } from "../../lib/api";

export default function Login() {
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email) {
      setError("Enter email");
      return;
    }
    if (!password) {
      setError("Enter password");
      return;
    }

    try {
      setLoading(true);

      const data = await apiFetch("/api/auth/admin/login", {
        method: "POST",
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setSuccess(data.message || "Login successful");

      setTimeout(() => {
        navigate("/admin/dashboard");
      }, 1500);
    } catch (err) {
      console.error(err);
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="rounded-3xl bg-white/70 backdrop-blur border border-black/10 shadow-xl p-6 sm:p-8">
        <h1 className="text-2xl font-extrabold text-[var(--color-brandBlack)]">Admin Login</h1>
        <p className="text-sm text-black/60 mt-1">Login using email & password.</p>

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
          <div>
            <label className="text-sm font-bold text-black/80">Email</label>
            <input
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded-2xl bg-white border border-black/10 px-4 py-3 outline-none focus:ring-2 focus:ring-black/10"
            />
          </div>

          <div>
            <label className="text-sm font-bold text-black/80">Password</label>
            <div className="mt-2 flex items-center gap-2 rounded-2xl bg-white border border-black/10 px-4 py-3 focus-within:ring-2 focus-within:ring-black/10">
              <input
                type={showPw ? "text" : "password"}
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full outline-none bg-transparent"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="text-xl text-black/60 hover:text-black"
              >
                {showPw ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          <button
            disabled={loading}
            className="mt-2 rounded-2xl bg-sky-700 text-white font-extrabold py-3 hover:opacity-90 transition disabled:opacity-60"
          >
            {loading ? "Please wait..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}