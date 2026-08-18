import React, { useState } from "react";
import { CalendarSearch, ChevronDown, ChevronUp, RotateCcw, SlidersHorizontal } from "lucide-react";
import { formatDate, formatMoney } from "../utils/format.js";
import { InputField, SearchableSelect } from "./FormFields.jsx";

export function SourceSalesReport({ parties, report, filters, setFilters, onSearch, onReset, loading }) {
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [isTableOpen, setIsTableOpen] = useState(false);

  function setField(field, value) {
    setFilters((current) => ({ ...current, [field]: value }));
  }

  function resetFilters() {
    setIsSummaryOpen(false);
    setIsTableOpen(false);
    onReset();
  }

  function submitFilters(event) {
    setIsSummaryOpen(true);
    setIsTableOpen(true);
    onSearch(event);
  }

  const partyOptions = parties.map((party) => ({ value: party._id, label: `${party.partyCode} - ${party.name}` }));

  return (
    <section className="content-section">
      <form className="source-report-filters" onSubmit={submitFilters}>
        <SearchableSelect label="Bought From Party" value={filters.sourcePartyId} options={partyOptions} emptyLabel="All source parties" placeholder="Search dealer" onChange={(value) => setField("sourcePartyId", value)} />
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
          Dealer Product Summary
        </span>
        {isSummaryOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>

      {isSummaryOpen && (
        <div className="metric-grid source-report-grid">
          <div className="metric">
            <span>Buy Packets</span>
            <strong>{report.totals.buyPackets || 0}</strong>
          </div>
          <div className="metric">
            <span>Buy KG</span>
            <strong>{report.totals.buyWeight || 0} KG</strong>
          </div>
          <div className="metric">
            <span>Total Buy Amount</span>
            <strong>{formatMoney(report.totals.buyAmount)}</strong>
          </div>
          <div className="metric">
            <span>Remaining Packets</span>
            <strong className={(report.totals.remainingPackets || 0) < 0 ? "negative" : "positive"}>{report.totals.remainingPackets || 0}</strong>
          </div>
          <div className="metric">
            <span>Remaining KG</span>
            <strong className={(report.totals.remainingWeight || 0) < 0 ? "negative" : "positive"}>{report.totals.remainingWeight || 0} KG</strong>
          </div>
          <div className="metric">
            <span>Paid To Party</span>
            <strong className="negative">{formatMoney(report.totals.paidAmount)}</strong>
          </div>
          <div className="metric">
            <span>Sale Packets</span>
            <strong>{report.totals.salePackets || 0}</strong>
          </div>
          <div className="metric">
            <span>Sale KG</span>
            <strong>{report.totals.saleWeight || 0} KG</strong>
          </div>
          <div className="metric">
            <span>Total Sale Amount</span>
            <strong>{formatMoney(report.totals.saleAmount)}</strong>
          </div>
          <div className="metric">
            <span>Received From Customers</span>
            <strong className="positive">{formatMoney(report.totals.receivedAmount)}</strong>
          </div>
        </div>
      )}

      <button className="filter-toggle" type="button" onClick={() => setIsTableOpen((current) => !current)}>
        <span>
          <SlidersHorizontal size={17} />
          Dealer Product Table
        </span>
        {isTableOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>

      {isTableOpen && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Bought From</th>
                <th>Customer</th>
                <th>Product</th>
                <th>Packets</th>
                <th>Weight</th>
                <th>Amount</th>
                <th>Received</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              {report.rows.map((movement) => (
                <tr key={movement._id}>
                  <td>{formatDate(movement.date)}</td>
                  <td>{movement.sourcePartyId ? `${movement.sourcePartyId.partyCode} - ${movement.sourcePartyId.name}` : "-"}</td>
                  <td>{movement.partyId ? `${movement.partyId.partyCode} - ${movement.partyId.name}` : "-"}</td>
                  <td>{movement.productId?.name || "-"}</td>
                  <td>{movement.packets}</td>
                  <td>{movement.weight} KG</td>
                  <td>{formatMoney(movement.totalAmount)}</td>
                  <td className="positive">{movement.paymentAmount ? formatMoney(movement.paymentAmount) : "-"}</td>
                  <td>{movement.note || "-"}</td>
                </tr>
              ))}
              {!report.rows.length && (
                <tr>
                  <td colSpan="9">{loading ? "Loading report..." : "No source-party sales found."}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
