import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://192.168.1.112:8000";

export default function VerifyHousehold() {
  const { householdId } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHousehold() {
      try {
        setLoading(true);
        setError("");

        const res = await axios.get(
          `${API}/api/public/verify/${householdId}`
        );

        setData(res.data);
      } catch (err) {
        setData(null);
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load household status"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchHousehold();
  }, [householdId]);

  if (loading) {
    return (
      <div style={{ padding: "40px", maxWidth: "900px", margin: "0 auto" }}>
        <h2>Checking household status...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "40px", maxWidth: "900px", margin: "0 auto" }}>
        <h2>Verification</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ padding: "40px", maxWidth: "900px", margin: "0 auto" }}>
        <h2>Verification</h2>
        <p>Household not found</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "40px", maxWidth: "900px", margin: "0 auto" }}>
      <h1>Household Verification</h1>

      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: "16px",
          padding: "24px",
          marginTop: "20px",
          background: "#fff",
        }}
      >
        <p>
          <strong>Household ID:</strong> {data.householdId}
        </p>

        <p>
          <strong>Status:</strong>{" "}
          <span style={{ textTransform: "uppercase", fontWeight: "bold" }}>
            {data.status}
          </span>
        </p>

        <p>
          <strong>Ward:</strong> {data.ward}
        </p>

        <p>
          <strong>Address:</strong> {data.address}
        </p>

        {data.rejectionReason ? (
          <p>
            <strong>Rejection Reason:</strong> {data.rejectionReason}
          </p>
        ) : null}

        <h3 style={{ marginTop: "24px" }}>Members</h3>

        {data.members?.length ? (
          <div>
            {data.members.map((member, index) => (
              <div
                key={index}
                style={{
                  padding: "12px 0",
                  borderBottom: "1px solid #eee",
                }}
              >
                <div>
                  <strong>Name:</strong> {member.name}
                </div>
                <div>
                  <strong>Age:</strong> {member.age}
                </div>
                <div>
                  <strong>Gender:</strong> {member.gender}
                </div>
                <div>
                  <strong>Occupation:</strong> {member.occupation}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No members found.</p>
        )}
      </div>
    </div>
  );
}