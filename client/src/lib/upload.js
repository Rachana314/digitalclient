const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ✅ memberName added so the server can link the doc to the correct member
export async function uploadDoc(householdId, type, file, memberName = "") {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token found. Please login again.");

  const fd = new FormData();
  fd.append("type", type);
  fd.append("file", file);
  fd.append("memberName", memberName); // ✅ NEW

  const res = await fetch(`${API}/api/households/${householdId}/documents`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: fd,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || `Upload failed (${res.status})`);
  }

  return data; // { message, item }
}