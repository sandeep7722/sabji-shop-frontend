import React, { useState } from "react";
import { CalendarSearch, ChevronDown, ChevronUp, Plus, RotateCcw, SlidersHorizontal } from "lucide-react";
import { formatDate, formatMoney } from "../utils/format.js";
import { InputField, SearchableSelect, SelectField } from "./FormFields.jsx";
import { SubmitButton } from "./SubmitButton.jsx";

export function Payments({
  parties,
  payments,
  filters,
  setFilters,
  paymentForm,
  setPaymentForm,
  onCreatePayment,
  onResetPaymentForm,
  onSearchPayments,
  onResetPaymentFilters,
  loading,
  paymentSubmitStatus = "idle",
  submitError = ""
}) {
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  function setPaymentField(field, value) {
    setPaymentForm((current) => ({ ...current, [field]: value }));
  }

  function setFilterField(field, value) {
    setFilters((current) => ({ ...current, [field]: value }));
  }

  const partyOptions = parties.map((party) => ({ value: party._id, label: `${party.partyCode} - ${party.name}` }));

  return (
    <section className="content-section">
      <button className="filter-toggle" type="button" onClick={() => setIsAddPaymentOpen((current) => !current)}>
        <span>
          <Plus size={17} />
          Add Payment
        </span>
        {isAddPaymentOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>

      {isAddPaymentOpen && (
        <form className="form-grid payment-add-form" onSubmit={onCreatePayment}>
          <SearchableSelect label="Party / Customer" value={paymentForm.partyId} options={partyOptions} required emptyLabel="Select party" placeholder="Search party" onChange={(value) => setPaymentField("partyId", value)} />
          <SelectField label="Type" value={paymentForm.type} required onChange={(value) => setPaymentField("type", value)}>
            <option value="RECEIVED">Received</option>
            <option value="PAID">Paid</option>
          </SelectField>
          <InputField label="Date" type="date" value={paymentForm.date} required onChange={(value) => setPaymentField("date", value)} />
          <InputField label="Amount" type="number" min="0" step="0.01" value={paymentForm.amount} required onChange={(value) => setPaymentField("amount", value)} />
          <SelectField label="Mode" value={paymentForm.mode} onChange={(value) => setPaymentField("mode", value)}>
            <option value="Cash">Cash</option>
            <option value="UPI">UPI</option>
            <option value="Bank">Bank</option>
            <option value="Cheque">Cheque</option>
            <option value="Other">Other</option>
          </SelectField>
          <label className="field payment-note-field">
            <span>Note</span>
            <input value={paymentForm.note} placeholder="Advance / old balance / partial payment" onChange={(event) => setPaymentField("note", event.target.value)} />
          </label>
          <div className="form-actions">
            <SubmitButton status={paymentSubmitStatus} idleLabel="Save Payment" disabled={loading && paymentSubmitStatus !== "saving"} errorText={submitError} />
            {onResetPaymentForm && (
              <button className="icon-button text-button" type="button" disabled={loading || paymentSubmitStatus === "saving"} onClick={onResetPaymentForm}>
                <RotateCcw size={17} />
                <span>Reset</span>
              </button>
            )}
          </div>
        </form>
      )}

      <button className="filter-toggle" type="button" onClick={() => setIsFilterOpen((current) => !current)}>
        <span>
          <SlidersHorizontal size={17} />
          Search Payments
        </span>
        {isFilterOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>

      {isFilterOpen && (
        <form className="payment-search-form" onSubmit={onSearchPayments}>
          <SearchableSelect label="Party" value={filters.partyId} options={partyOptions} emptyLabel="All parties" placeholder="Search party" onChange={(value) => setFilterField("partyId", value)} />
          <SelectField label="Type" value={filters.type} onChange={(value) => setFilterField("type", value)}>
            <option value="">All types</option>
            <option value="RECEIVED">Received</option>
            <option value="PAID">Paid</option>
          </SelectField>
          <InputField label="From" type="date" value={filters.from} onChange={(value) => setFilterField("from", value)} />
          <InputField label="To" type="date" value={filters.to} onChange={(value) => setFilterField("to", value)} />
          <button className="primary-button search-button" type="submit" disabled={loading}>
            <CalendarSearch size={17} />
            <span>Search</span>
          </button>
          {onResetPaymentFilters && (
            <button className="icon-button text-button" type="button" disabled={loading} onClick={onResetPaymentFilters}>
              <RotateCcw size={17} />
              <span>Reset</span>
            </button>
          )}
        </form>
      )}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Party</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Mode</th>
              <th>Sync</th>
              <th>Note</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment._id}>
                <td>{formatDate(payment.date)}</td>
                <td>{payment.partyId ? `${payment.partyId.partyCode} - ${payment.partyId.name}` : "-"}</td>
                <td><span className={`type-badge ${payment.type.toLowerCase()}`}>{payment.type}</span></td>
                <td className={payment.type === "RECEIVED" ? "positive" : "negative"}>{formatMoney(payment.amount)}</td>
                <td>{payment.mode || "-"}</td>
                <td>{payment.referenceType === "STOCK_MOVEMENT" ? "Stock entry" : "Manual"}</td>
                <td>{payment.note || "-"}</td>
              </tr>
            ))}
            {!payments.length && (
              <tr>
                <td colSpan="7">No payments found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
