import React from "react";
import { formatDate, formatMoney } from "../utils/format.js";
import { InputField, SelectField } from "./FormFields.jsx";
import { SubmitButton } from "./SubmitButton.jsx";

export function Payments({
  parties,
  payments,
  summary,
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
  function setPaymentField(field, value) {
    setPaymentForm((current) => ({ ...current, [field]: value }));
  }

  function setFilterField(field, value) {
    setFilters((current) => ({ ...current, [field]: value }));
  }

  return (
    <section className="content-section">
      <div className="metric-grid four-metrics">
        <div className="metric">
          <span>Total Buy</span>
          <strong>{formatMoney(summary.purchaseAmount)}</strong>
        </div>
        <div className="metric">
          <span>Total Sell</span>
          <strong>{formatMoney(summary.saleAmount)}</strong>
        </div>
        <div className="metric">
          <span>Total Payable</span>
          <strong className="negative">{formatMoney(summary.payableAmount)}</strong>
        </div>
        <div className="metric">
          <span>Total Receivable</span>
          <strong className="positive">{formatMoney(summary.receivableAmount)}</strong>
        </div>
      </div>

      <div className="party-layout">
        <form className="form-grid" onSubmit={onCreatePayment}>
          <h3>Add Payment</h3>
          <SelectField label="Party / Customer" value={paymentForm.partyId} required onChange={(value) => setPaymentField("partyId", value)}>
            <option value="">Select party</option>
            {parties.map((party) => (
              <option key={party._id} value={party._id}>
                {party.partyCode} - {party.name}
              </option>
            ))}
          </SelectField>
          <div className="two-column">
            <SelectField label="Type" value={paymentForm.type} required onChange={(value) => setPaymentField("type", value)}>
              <option value="RECEIVED">Received</option>
              <option value="PAID">Paid</option>
            </SelectField>
            <InputField label="Date" type="date" value={paymentForm.date} required onChange={(value) => setPaymentField("date", value)} />
          </div>
          <div className="two-column">
            <InputField label="Amount" type="number" min="0" step="0.01" value={paymentForm.amount} required onChange={(value) => setPaymentField("amount", value)} />
            <SelectField label="Mode" value={paymentForm.mode} onChange={(value) => setPaymentField("mode", value)}>
              <option value="Cash">Cash</option>
              <option value="UPI">UPI</option>
              <option value="Bank">Bank</option>
              <option value="Cheque">Cheque</option>
              <option value="Other">Other</option>
            </SelectField>
          </div>
          <label className="field">
            <span>Note</span>
            <textarea value={paymentForm.note} placeholder="Advance / old balance / partial payment" onChange={(event) => setPaymentField("note", event.target.value)} />
          </label>
          <SubmitButton status={paymentSubmitStatus} idleLabel="Save Payment" disabled={loading && paymentSubmitStatus !== "saving"} errorText={submitError} />
        </form>

        <form className="form-grid" onSubmit={onSearchPayments}>
          <h3>Search Payments</h3>
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
          <div className="two-column">
            <InputField label="From" type="date" value={filters.from} onChange={(value) => setFilterField("from", value)} />
            <InputField label="To" type="date" value={filters.to} onChange={(value) => setFilterField("to", value)} />
          </div>
          <button className="primary-button" type="submit" disabled={loading}>Search</button>
        </form>
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
