import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function News() {
  const navigate = useNavigate();
  useEffect(() => navigate("/#news", { replace: true }), [navigate]);
  return null;
}
