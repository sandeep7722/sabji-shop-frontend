import React from "react";
import { Save } from "lucide-react";
import { InputField, SelectField } from "./FormFields.jsx";

export function AdjustmentForm({ form, setForm, productOptions, onSubmit, loading }) {
  function setField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  return (
    <section className="content-section narrow">
      <form className="form-grid" onSubmit={onSubmit}>
        <h3>Stock Adjustment</h3>
        <SelectField label="Product" value={form.productId} required onChange={(value) => setField("productId", value)}>
          <option value="">Select product</option>
          {productOptions.map((product) => (
            <option key={product.value} value={product.value}>
              {product.label}
            </option>
          ))}
        </SelectField>
        <SelectField label="Type" value={form.adjustmentType} required onChange={(value) => setField("adjustmentType", value)}>
          <option value="OUT">Reduce</option>
          <option value="IN">Increase</option>
        </SelectField>
        <InputField label="Date" type="date" value={form.date} required onChange={(value) => setField("date", value)} />
        <div className="two-column">
          <InputField label="Packets" type="number" min="0" step="1" value={form.packets} required onChange={(value) => setField("packets", value)} />
          <InputField label="Weight (KG)" type="number" min="0" step="0.01" value={form.weight} required onChange={(value) => setField("weight", value)} />
        </div>
        <SelectField label="Reason" value={form.reason} onChange={(value) => setField("reason", value)}>
          <option value="Damaged">Damaged</option>
          <option value="Wastage">Wastage</option>
          <option value="Weight Loss">Weight Loss</option>
          <option value="Entry Mistake">Entry Mistake</option>
          <option value="Physical Count Difference">Physical Count Difference</option>
        </SelectField>
        <label className="field">
          <span>Note</span>
          <textarea value={form.note} placeholder="Rotten onions" onChange={(event) => setField("note", event.target.value)} />
        </label>
        <button className="primary-button" type="submit" disabled={loading}>
          <Save size={17} />
          <span>Save Adjustment</span>
        </button>
      </form>
    </section>
  );
}
