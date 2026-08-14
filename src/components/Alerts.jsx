import React from "react";
import { AlertCircle } from "lucide-react";

export function Alerts({ error, notice }) {
  return (
    <>
      {error && (
        <div className="alert error-alert">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}
      {notice && <div className="alert success-alert">{notice}</div>}
    </>
  );
}
