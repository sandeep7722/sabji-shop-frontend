import React from "react";
import { AlertCircle, Check, LoaderCircle, Save } from "lucide-react";

export function SubmitButton({ status = "idle", idleLabel, savingLabel = "Saving", savedLabel = "Saved", disabled = false, errorText = "" }) {
  const isSaving = status === "saving";
  const isSaved = status === "saved";

  return (
    <div className="submit-row">
      <button className={isSaved ? "primary-button submit-button saved" : "primary-button submit-button"} type="submit" disabled={disabled || isSaving}>
        {isSaving ? <LoaderCircle className="spin" size={17} /> : isSaved ? <Check size={17} /> : <Save size={17} />}
        <span>{isSaving ? savingLabel : isSaved ? savedLabel : idleLabel}</span>
      </button>
      {errorText && (
        <span className="submit-error">
          <AlertCircle size={16} />
          <span>{errorText}</span>
        </span>
      )}
    </div>
  );
}
