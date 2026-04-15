import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { apiFetch } from "../../lib/api";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  // Pre-fill email 
  const [email, setEmail] = useState(location.state?.email || "");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("All fields required");
      return;
    }

    try {
      setLoading(true);

      const data = await apiFetch("/api/auth/user/login", {
        method: "POST",
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      // Save token and user info so other pages can access them
      localStorage.setItem("token", data.token);

      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("me", JSON.stringify(data.user));
        // Notify the app that user data has changed 
        window.dispatchEvent(new Event("user-updated"));
      }

      navigate("/user/dashboard");
    } catch (err) {
      const message = err.message || "Login failed";

      // If email is not verified, redirect to verify-email page 
      if (message.toLowerCase().includes("verify your email")) {
        navigate("/verify-email", {
          state: { email: email.trim().toLowerCase() },
        });
        return;
      }

      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="rounded-3xl bg-white/50 backdrop-blur border border-black/10 shadow-xl p-6 sm:p-8">
        <h1 className="text-3xl animate-bounce font-extrabold text-red-500 text-center">Login</h1>

        <form onSubmit={submit} className="mt-6 grid gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-xl border-gray-300 border px-4 py-3 w-95"
          />

          <div className="flex items-center gap-2 rounded-2xl border border-none px-4 py-3">
            <input
              type={showPw ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-95 relative right-4 border border-gray-300 px-4 py-3 rounded-xl"
            />
            {/* Toggle password visibility */}
            <button className="relative right-15" type="button" onClick={() => setShowPw(!showPw)}>
              {showPw ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>

          <div className="text-right">
            <Link to="/forgot-password" className="text-sm relative right-15 font-semibold text-red-600">
              Forgot Password?
            </Link>
          </div>

          <button
            disabled={loading}
            className="rounded-2xl relative right-2 max-w-100 bg-red-600 text-white py-3 font-bold disabled:opacity-60"
          >
            {loading ? "Please wait..." : "Login"}
          </button>
        </form>
        <p className="mt-5 text-sm text-center">
          Don't have an account?{" "}
          <Link to="/register" className="font-bold text-red-600">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}