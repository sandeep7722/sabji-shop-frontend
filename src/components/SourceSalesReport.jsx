import React from "react";
import { CalendarSearch, RotateCcw } from "lucide-react";
import { formatDate, formatMoney } from "../utils/format.js";
import { InputField, SelectField } from "./FormFields.jsx";

export function SourceSalesReport({ parties, report, filters, setFilters, onSearch, onReset, loading }) {
  function setField(field, value) {
    setFilters((current) => ({ ...current, [field]: value }));
  }

  return (
    <section className="content-section">
      <form className="source-report-filters" onSubmit={onSearch}>
        <SelectField label="Bought From Party" value={filters.sourcePartyId} onChange={(value) => setField("sourcePartyId", value)}>
          <option value="">All source parties</option>
          {parties.map((party) => (
            <option key={party._id} value={party._id}>
              {party.partyCode} - {party.name}
            </option>
          ))}
        </SelectField>
        <InputField label="From" type="date" value={filters.from} onChange={(value) => setField("from", value)} />
        <InputField label="To" type="date" value={filters.to} onChange={(value) => setField("to", value)} />
        <button className="primary-button search-button" type="submit" disabled={loading}>
          <CalendarSearch size={17} />
          <span>Search</span>
        </button>
        <button className="icon-button text-button" type="button" disabled={loading} onClick={onReset}>
          <RotateCcw size={17} />
          <span>Reset</span>
        </button>
      </form>

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
    </section>
  );
}
