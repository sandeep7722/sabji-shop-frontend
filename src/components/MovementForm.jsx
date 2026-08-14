import React from "react";
import { InputField, SelectField } from "./FormFields.jsx";
import { SubmitButton } from "./SubmitButton.jsx";

export function MovementForm({
  title,
  submitLabel,
  form,
  setForm,
  productOptions,
  partyOptions,
  onSubmit,
  partyLabel,
  paymentLabel,
  notePlaceholder,
  loading,
  submitStatus = "idle",
  submitError = "",
  compact = false
}) {
  function setField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  return (
    <section className={compact ? "content-section" : "content-section narrow"}>
      <form className={compact ? "form-grid compact-form" : "form-grid"} onSubmit={onSubmit}>
        <h3>{title}</h3>
        <div className={compact ? "compact-form-row compact-form-row-main" : ""}>
          <SelectField label="Product" value={form.productId} required onChange={(value) => setField("productId", value)}>
            <option value="">Select product</option>
            {productOptions.map((product) => (
              <option key={product.value} value={product.value}>
                {product.label}
              </option>
            ))}
          </SelectField>
          <InputField label="Date" type="date" value={form.date} required onChange={(value) => setField("date", value)} />
          <SelectField label={partyLabel} value={form.partyId} onChange={(value) => setField("partyId", value)}>
            <option value="">Select party</option>
            {partyOptions.map((party) => (
              <option key={party.value} value={party.value}>
                {party.label}
              </option>
            ))}
          </SelectField>
          <InputField label="Packets" type="number" min="0" step="1" value={form.packets} required onChange={(value) => setField("packets", value)} />
          <InputField
            label="Weight (KG)"
            type="number"
            min="0"
            step="0.01"
            value={form.weight}
            required
            onChange={(value) => setField("weight", value)}
          />
        </div>
        <div className={compact ? "compact-form-row compact-form-row-money" : "two-column"}>
          <InputField
            label="Total Amount"
            type="number"
            min="0"
            step="0.01"
            value={form.totalAmount}
            placeholder="0"
            onChange={(value) => setField("totalAmount", value)}
          />
          <InputField
            label={paymentLabel}
            type="number"
            min="0"
            step="0.01"
            value={form.paymentAmount}
            placeholder="0"
            onChange={(value) => setField("paymentAmount", value)}
          />
          <SelectField label="Payment Mode" value={form.paymentMode} onChange={(value) => setField("paymentMode", value)}>
            <option value="Cash">Cash</option>
            <option value="UPI">UPI</option>
            <option value="Bank">Bank</option>
            <option value="Cheque">Cheque</option>
            <option value="Other">Other</option>
          </SelectField>
          {compact && (
            <label className="field">
              <span>Note</span>
              <input value={form.note} placeholder={notePlaceholder} onChange={(event) => setField("note", event.target.value)} />
            </label>
          )}
        </div>
        {!compact && (
          <label className="field">
            <span>Note</span>
            <textarea value={form.note} placeholder={notePlaceholder} onChange={(event) => setField("note", event.target.value)} />
          </label>
        )}
        <SubmitButton status={submitStatus} idleLabel={submitLabel} disabled={loading && submitStatus !== "saving"} errorText={submitError} />
      </form>
    </section>
  );
}
