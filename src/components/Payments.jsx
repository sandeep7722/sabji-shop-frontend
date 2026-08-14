import React, { useMemo, useState } from "react";
import { CalendarSearch, ChevronDown, ChevronUp, Plus, SlidersHorizontal } from "lucide-react";
import { formatDate, formatMoney } from "../utils/format.js";
import { InputField, SelectField } from "./FormFields.jsx";
import { SubmitButton } from "./SubmitButton.jsx";

export function Payments({
  parties,
  payments,
  filters,
  setFilters,
  paymentForm,
  setPaymentForm,
  onCreatePayment,
  onSearchPayments,
  loading,
  paymentSubmitStatus = "idle",
  submitError = ""
}) {
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
  const [tableFilters, setTableFilters] = useState({
    source: "",
    mode: "",
    search: ""
  });

  const paymentModes = useMemo(() => {
    const modes = new Set(payments.map((payment) => payment.mode).filter(Boolean));
    return Array.from(modes).sort();
  }, [payments]);

  const filteredPayments = useMemo(() => {
    const searchText = tableFilters.search.trim().toLowerCase();

    return payments.filter((payment) => {
      const source = payment.referenceType === "STOCK_MOVEMENT" ? "STOCK" : "MANUAL";
      const partyText = payment.partyId ? `${payment.partyId.partyCode} ${payment.partyId.name}` : "";
      const noteText = payment.note || "";
      const amountText = String(payment.amount || "");

      if (tableFilters.source && tableFilters.source !== source) return false;
      if (tableFilters.mode && tableFilters.mode !== payment.mode) return false;
      if (searchText && !`${partyText} ${noteText} ${amountText}`.toLowerCase().includes(searchText)) return false;

      return true;
    });
  }, [payments, tableFilters]);

  function setPaymentField(field, value) {
    setPaymentForm((current) => ({ ...current, [field]: value }));
  }

  function setFilterField(field, value) {
    setFilters((current) => ({ ...current, [field]: value }));
  }

  function setTableFilterField(field, value) {
    setTableFilters((current) => ({ ...current, [field]: value }));
  }

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
          <SelectField label="Party / Customer" value={paymentForm.partyId} required onChange={(value) => setPaymentField("partyId", value)}>
            <option value="">Select party</option>
            {parties.map((party) => (
              <option key={party._id} value={party._id}>
                {party.partyCode} - {party.name}
              </option>
            ))}
          </SelectField>
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
          <SubmitButton status={paymentSubmitStatus} idleLabel="Save Payment" disabled={loading && paymentSubmitStatus !== "saving"} errorText={submitError} />
        </form>
      )}

      <form className="payment-search-form" onSubmit={onSearchPayments}>
        <span className="payment-search-title">
          <SlidersHorizontal size={17} />
          Search Payments
        </span>
        <SelectField label="Party" value={filters.partyId} onChange={(value) => setFilterField("partyId", value)}>
          <option value="">All parties</option>
          {parties.map((party) => (
            <option key={party._id} value={party._id}>
              {party.partyCode} - {party.name}
            </option>
          ))}
        </SelectField>
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
      </form>

      <div className="table-filter-bar">
        <SelectField label="Table Source" value={tableFilters.source} onChange={(value) => setTableFilterField("source", value)}>
          <option value="">All sources</option>
          <option value="MANUAL">Manual payments</option>
          <option value="STOCK">Stock linked</option>
        </SelectField>
        <SelectField label="Mode" value={tableFilters.mode} onChange={(value) => setTableFilterField("mode", value)}>
          <option value="">All modes</option>
          {paymentModes.map((mode) => (
            <option key={mode} value={mode}>
              {mode}
            </option>
          ))}
        </SelectField>
        <InputField label="Search Table" value={tableFilters.search} placeholder="Party, note, amount" onChange={(value) => setTableFilterField("search", value)} />
        <button className="icon-button text-button" type="button" onClick={() => setTableFilters({ source: "", mode: "", search: "" })}>
          <span>Clear</span>
        </button>
      </div>

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
            {filteredPayments.map((payment) => (
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
            {!filteredPayments.length && (
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
