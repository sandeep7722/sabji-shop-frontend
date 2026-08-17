import React, { useMemo, useState } from "react";
import { CalendarSearch, ChevronDown, ChevronUp, RotateCcw, SlidersHorizontal } from "lucide-react";
import { formatDate, formatMoney } from "../utils/format.js";
import { InputField } from "./FormFields.jsx";

export function CustomerSalesReport({ parties, report, filters, setFilters, onSearch, onReset, loading }) {
  const [customerSearch, setCustomerSearch] = useState("");
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [isTableOpen, setIsTableOpen] = useState(false);

  const customerOptions = useMemo(() => {
    return parties.map((party) => ({
      id: party._id,
      label: `${party.partyCode} - ${party.name}${party.phone ? ` (${party.phone})` : ""}`
    }));
  }, [parties]);

  function setField(field, value) {
    setFilters((current) => ({ ...current, [field]: value }));
  }

  function setCustomer(value) {
    setCustomerSearch(value);
    const selectedCustomer = customerOptions.find((option) => option.label === value);
    setField("customerId", selectedCustomer ? selectedCustomer.id : "");
  }

  function resetFilters() {
    setCustomerSearch("");
    setIsSummaryOpen(false);
    setIsTableOpen(false);
    onReset();
  }

  function submitFilters(event) {
    setIsSummaryOpen(true);
    setIsTableOpen(true);
    onSearch(event);
  }

  function isPaymentOnly(row) {
    return row.entryType === "PAYMENT" || row.type === "PAYMENT_RECEIVED";
  }

  return (
    <section className="content-section">
      <form className="customer-report-filters" onSubmit={submitFilters}>
        <label className="field">
          <span>Customer</span>
          <input list="customer-options" value={customerSearch} placeholder="Search or select customer" onChange={(event) => setCustomer(event.target.value)} />
          <datalist id="customer-options">
            {customerOptions.map((option) => (
              <option key={option.id} value={option.label} />
            ))}
          </datalist>
        </label>
        <InputField label="From" type="date" value={filters.from} onChange={(value) => setField("from", value)} />
        <InputField label="To" type="date" value={filters.to} onChange={(value) => setField("to", value)} />
        <button className="primary-button search-button" type="submit" disabled={loading}>
          <CalendarSearch size={17} />
          <span>Search</span>
        </button>
        <button className="icon-button text-button" type="button" disabled={loading} onClick={resetFilters}>
          <RotateCcw size={17} />
          <span>Reset</span>
        </button>
      </form>

      <button className="filter-toggle" type="button" onClick={() => setIsSummaryOpen((current) => !current)}>
        <span>
          <SlidersHorizontal size={17} />
          Customer Sell Summary
        </span>
        {isSummaryOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>

      {isSummaryOpen && (
        <div className="metric-grid customer-report-grid">
          <div className="metric">
            <span>Total Sell Packet</span>
            <strong>{report.totals.sellPackets || 0}</strong>
          </div>
          <div className="metric">
            <span>Total Sell KG</span>
            <strong>{report.totals.sellWeight || 0} KG</strong>
          </div>
          <div className="metric">
            <span>Total Amount</span>
            <strong>{formatMoney(report.totals.sellAmount)}</strong>
          </div>
          <div className="metric">
            <span>Paid</span>
            <strong className="positive">{formatMoney(report.totals.paidAmount)}</strong>
          </div>
          <div className="metric">
            <span>Remaining Amount</span>
            <strong className={report.totals.balanceAmount > 0 ? "negative" : "positive"}>{formatMoney(report.totals.balanceAmount)}</strong>
          </div>
        </div>
      )}

      <button className="filter-toggle" type="button" onClick={() => setIsTableOpen((current) => !current)}>
        <span>
          <SlidersHorizontal size={17} />
          Customer Sell Table
        </span>
        {isTableOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>

      {isTableOpen && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Customer</th>
                <th>Bought From</th>
                <th>Product</th>
                <th>Packets</th>
                <th>Weight</th>
                <th>Amount</th>
                <th>Paid</th>
                <th>Remaining Amount</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              {report.rows.map((movement) => {
                const paymentOnly = isPaymentOnly(movement);
                const rowBalance = paymentOnly ? 0 : Math.max(0, (movement.totalAmount || 0) - (movement.paymentAmount || 0));

                return (
                  <tr key={movement._id}>
                    <td>{formatDate(movement.date)}</td>
                    <td>{movement.partyId ? `${movement.partyId.partyCode} - ${movement.partyId.name}` : "-"}</td>
                    <td>{movement.sourcePartyId ? `${movement.sourcePartyId.partyCode} - ${movement.sourcePartyId.name}` : "-"}</td>
                    <td>{paymentOnly ? "Manual Payment" : movement.productId?.name || "-"}</td>
                    <td>{paymentOnly ? "-" : movement.packets}</td>
                    <td>{paymentOnly ? "-" : `${movement.weight} KG`}</td>
                    <td>{paymentOnly ? "-" : formatMoney(movement.totalAmount)}</td>
                    <td className="positive">{movement.paymentAmount ? formatMoney(movement.paymentAmount) : "-"}</td>
                    <td className={rowBalance > 0 ? "negative" : "positive"}>{paymentOnly ? "-" : formatMoney(rowBalance)}</td>
                    <td>{[movement.note, paymentOnly && movement.paymentMode ? movement.paymentMode : ""].filter(Boolean).join(" / ") || "-"}</td>
                  </tr>
                );
              })}
              {!report.rows.length && (
                <tr>
                  <td colSpan="10">{loading ? "Loading report..." : "No customer sales found."}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
