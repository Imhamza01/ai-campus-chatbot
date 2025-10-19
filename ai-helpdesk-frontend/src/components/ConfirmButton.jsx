import React, { useState } from "react";

/**
 * Props:
 * - onConfirm: async function
 * - confirmText: string (shown in default confirm)
 * - buttonClass: string for button styling
 * - children: button contents
 */
export default function ConfirmButton({
  onConfirm,
  confirmText = "Are you sure?",
  buttonClass = "px-3 py-1 rounded bg-red-600 text-white",
  children,
}) {
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    const ok = window.confirm(confirmText);
    if (!ok) return;
    try {
      setLoading(true);
      await onConfirm();
    } catch (err) {
      console.error("ConfirmButton error:", err);
      alert(err?.message || "Action failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handle} className={buttonClass} disabled={loading}>
      {loading ? "…" : children}
    </button>
  );
}
