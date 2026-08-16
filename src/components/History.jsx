import React, { useState } from "react";
import { CalendarSearch, ChevronDown, ChevronUp, Pencil, SlidersHorizontal, X } from "lucide-react";
import { formatApiError, formatDate, formatMoney, signedClass } from "../utils/format.js";
import { InputField, SelectField } from "./FormFields.jsx";
import { SubmitButton } from "./SubmitButton.jsx";

function dateInputValue(value) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

function createEditForm(movement) {
  return {
    productId: movement.productId?._id || movement.productId || "",
    partyId: movement.partyId?._id || movement.partyId || "",
    sourcePartyId: movement.sourcePartyId?._id || movement.sourcePartyId || "",
    type: movement.type || "IN",
    date: dateInputValue(movement.date),
    packets: String(movement.packets ?? ""),
    weight: String(movement.weight ?? ""),
    totalAmount: String(movement.totalAmount ?? ""),
    paymentAmount: movement.paymentAmount ? String(movement.paymentAmount) : "",
    paymentMode: movement.paymentMode || "Cash",
    note: movement.note || ""
  };
}

export function History({ products, parties, history, filters, setFilters, onSubmit, onUpdateMovement, loading, collapsible = false, defaultCollapsed = false }) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [editingId, setEditingId] = useState("");
  const [editForm, setEditForm] = useState(null);
  const [editStatus, setEditStatus] = useState("idle");
  const [editError, setEditError] = useState("");

  function setField(field, value) {
    setFilters((current) => ({ ...current, [field]: value }));
  }

  function setEditField(field, value) {
    setEditForm((current) => ({ ...current, [field]: value }));
  }

  function startEdit(movement) {
    setEditingId(movement._id);
    setEditForm(createEditForm(movement));
    setEditStatus("idle");
    setEditError("");
  }

  function stopEdit() {
    setEditingId("");
    setEditForm(null);
    setEditStatus("idle");
    setEditError("");
  }

  async function submitEdit(event, movementId) {
    event.preventDefault();
    setEditStatus("saving");
    setEditError("");

    try {
      await onUpdateMovement(movementId, editForm);
      setEditStatus("saved");
      window.setTimeout(stopEdit, 900);
    } catch (requestError) {
      setEditStatus("idle");
      setEditError(formatApiError(requestError));
    }
  }

  return (
    <section className="content-section">
      {collapsible && (
        <button className="filter-toggle" type="button" onClick={() => setIsCollapsed((current) => !current)}>
          <span>
            <SlidersHorizontal size={17} />
            Filters
          </span>
          {isCollapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
        </button>
      )}

      {(!collapsible || !isCollapsed) && (
        <form className="filters" onSubmit={onSubmit}>
          <SelectField label="Product" value={filters.productId} onChange={(value) => setField("productId", value)}>
            <option value="">All products</option>
            {products.map((product) => (
              <option key={product._id} value={product._id}>
                {product.name}
              </option>
            ))}
          </SelectField>
          <SelectField label="Party" value={filters.partyId} onChange={(value) => setField("partyId", value)}>
            <option value="">All parties</option>
            {parties.map((party) => (
              <option key={party._id} value={party._id}>
                {party.partyCode} - {party.name}
              </option>
            ))}
          </SelectField>
          <SelectField label="Type" value={filters.type} onChange={(value) => setField("type", value)}>
            <option value="">All types</option>
            <option value="IN">IN</option>
            <option value="OUT">OUT</option>
            <option value="ADJUSTMENT_IN">ADJUSTMENT IN</option>
            <option value="ADJUSTMENT_OUT">ADJUSTMENT OUT</option>
          </SelectField>
          <InputField label="From" type="date" value={filters.from} onChange={(value) => setField("from", value)} />
          <InputField label="To" type="date" value={filters.to} onChange={(value) => setField("to", value)} />
          <button className="primary-button search-button" type="submit" disabled={loading}>
            <CalendarSearch size={17} />
            <span>Search</span>
          </button>
        </form>
      )}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Product</th>
              <th>Type</th>
              <th>Party</th>
              <th>Bought From</th>
              <th>Packets</th>
              <th>Weight</th>
              <th>Total Amount</th>
              <th>Paid / Received</th>
              <th>Note</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {history.map((movement) =>
              editingId === movement._id && editForm ? (
                <tr className={movement.isEdited ? "edited-row" : ""} key={movement._id}>
                  <td colSpan="11">
                    <form className="history-edit-form" onSubmit={(event) => submitEdit(event, movement._id)}>
                      <SelectField label="Product" value={editForm.productId} required onChange={(value) => setEditField("productId", value)}>
                        <option value="">Select product</option>
                        {products.map((product) => (
                          <option key={product._id} value={product._id}>
                            {product.name}
                          </option>
                        ))}
                      </SelectField>
                      <SelectField label="Type" value={editForm.type} required onChange={(value) => setEditField("type", value)}>
                        <option value="IN">IN</option>
                        <option value="OUT">OUT</option>
                        <option value="ADJUSTMENT_IN">ADJUSTMENT IN</option>
                        <option value="ADJUSTMENT_OUT">ADJUSTMENT OUT</option>
                      </SelectField>
                      <SelectField label="Party" value={editForm.partyId} onChange={(value) => setEditField("partyId", value)}>
                        <option value="">No party</option>
                        {parties.map((party) => (
                          <option key={party._id} value={party._id}>
                            {party.partyCode} - {party.name}
                          </option>
                        ))}
                      </SelectField>
                      <SelectField label="Bought From" value={editForm.sourcePartyId} disabled={editForm.type !== "OUT"} onChange={(value) => setEditField("sourcePartyId", value)}>
                        <option value="">No source</option>
                        {parties.map((party) => (
                          <option key={party._id} value={party._id}>
                            {party.partyCode} - {party.name}
                          </option>
                        ))}
                      </SelectField>
                      <InputField label="Date" type="date" value={editForm.date} required onChange={(value) => setEditField("date", value)} />
                      <InputField label="Packets" type="number" min="0" step="1" value={editForm.packets} required onChange={(value) => setEditField("packets", value)} />
                      <InputField label="Weight" type="number" min="0" step="0.01" value={editForm.weight} required onChange={(value) => setEditField("weight", value)} />
                      <InputField label="Total Amount" type="number" min="0" step="0.01" value={editForm.totalAmount} onChange={(value) => setEditField("totalAmount", value)} />
                      <InputField
                        label="Paid / Received"
                        type="number"
                        min="0"
                        step="0.01"
                        value={editForm.paymentAmount}
                        disabled={!["IN", "OUT"].includes(editForm.type)}
                        onChange={(value) => setEditField("paymentAmount", value)}
                      />
                      <SelectField label="Payment Mode" value={editForm.paymentMode} onChange={(value) => setEditField("paymentMode", value)}>
                        <option value="Cash">Cash</option>
                        <option value="UPI">UPI</option>
                        <option value="Bank">Bank</option>
                        <option value="Cheque">Cheque</option>
                        <option value="Other">Other</option>
                      </SelectField>
                      <label className="field history-edit-note">
                        <span>Note</span>
                        <input value={editForm.note} onChange={(event) => setEditField("note", event.target.value)} />
                      </label>
                      <div className="history-edit-actions">
                        <SubmitButton status={editStatus} idleLabel="Save Edit" disabled={loading && editStatus !== "saving"} errorText={editError} />
                        <button className="icon-only-button" type="button" title="Cancel" disabled={editStatus === "saving"} onClick={stopEdit}>
                          <X size={17} />
                        </button>
                      </div>
                    </form>
                  </td>
                </tr>
              ) : (
                <tr className={movement.isEdited ? "edited-row" : ""} key={movement._id}>
                  <td>{formatDate(movement.date)}</td>
                  <td>{movement.productId?.name || "-"}</td>
                  <td>
                    <span className={`type-badge ${movement.type.toLowerCase().replace("_", "-")}`}>{movement.type.replace("_", " ")}</span>
                  </td>
                  <td>{movement.partyId ? `${movement.partyId.partyCode} - ${movement.partyId.name}` : movement.partyName || movement.reason || "-"}</td>
                  <td>{movement.sourcePartyId ? `${movement.sourcePartyId.partyCode} - ${movement.sourcePartyId.name}` : "-"}</td>
                  <td className={signedClass(movement.signedPackets)}>{movement.signedPackets}</td>
                  <td className={signedClass(movement.signedWeight)}>{movement.signedWeight} KG</td>
                  <td>{formatMoney(movement.totalAmount)}</td>
                  <td className={movement.paymentType === "RECEIVED" ? "positive" : movement.paymentType === "PAID" ? "negative" : ""}>
                    {movement.paymentAmount ? `${movement.paymentType} ${formatMoney(movement.paymentAmount)}` : "-"}
                  </td>
                  <td>{movement.note || "-"}</td>
                  <td>
                    <button className="icon-only-button" type="button" title="Edit history entry" disabled={loading || !onUpdateMovement} onClick={() => startEdit(movement)}>
                      <Pencil size={16} />
                    </button>
                  </td>
                </tr>
              )
            )}
            {!history.length && (
              <tr>
                <td colSpan="11">{loading ? "Loading history..." : "No movements found."}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
