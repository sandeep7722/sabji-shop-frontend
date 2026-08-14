import React from "react";

export function InputField({ label, value, onChange, ...props }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} {...props} />
    </label>
  );
}

export function SelectField({ label, value, onChange, children, ...props }) {
  return (
    <label className="field">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} {...props}>
        {children}
      </select>
    </label>
  );
}
