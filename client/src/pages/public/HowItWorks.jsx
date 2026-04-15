import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function HowItWorks() {
  const navigate = useNavigate();
  useEffect(() => navigate("/#howitworks", { replace: true }), [navigate]);
  return null;
}
