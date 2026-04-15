import { useParams, Link } from "react-router-dom";
import { useRef } from "react";
import QRCode from "react-qr-code";

const PUBLIC_BASE =
  import.meta.env.VITE_PUBLIC_BASE_URL ||
  `${window.location.protocol}//${window.location.host}`;

export default function QrCode() {
  const { householdId } = useParams();
  const qrRef = useRef(null);

  const qrValue = householdId
    ? `${PUBLIC_BASE}/verify/${householdId}`
    : "N/A";

  const handleDownload = () => {
    const svg = qrRef.current?.querySelector("svg");
    if (!svg) return;

    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svg);
    const blob = new Blob([svgStr], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `QR-${householdId}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(qrValue);
      alert("QR link copied to clipboard!");
    } catch {
      alert("Could not copy to clipboard.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl sm:text-3xl font-extrabold">Household QR</h1>
        <Link
          to="/user/forms"
          className="rounded-2xl px-4 py-2 font-bold border hover:bg-black/5"
        >
          Back
        </Link>
      </div>

      <div className="rounded-3xl bg-white border shadow-sm p-6">
        <div className="font-extrabold">
          Household ID: <span className="text-orange-600">{householdId}</span>
        </div>

        <div className="text-xs text-black/50 break-all mt-1">
          QR target: {qrValue}
        </div>

        <div
          ref={qrRef}
          className="mt-5 rounded-2xl border bg-white p-8 flex items-center justify-center"
        >
          <QRCode
            value={qrValue}
            size={240}
            bgColor="#ffffff"
            fgColor="#1a1a1a"
          />
        </div>

        <div className="mt-5 flex gap-3 flex-wrap">
          <button
            onClick={handleDownload}
            className="rounded-2xl px-4 py-2 font-extrabold bg-black text-white hover:opacity-90 transition"
          >
            Download
          </button>
          <button
            onClick={handleShare}
            className="rounded-2xl px-4 py-2 font-bold border hover:bg-black/5 transition"
          >
            Share
          </button>
        </div>
      </div>
    </div>
  );
}