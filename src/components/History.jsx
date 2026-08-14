import React, { useState } from "react";
import { CalendarSearch, ChevronDown, ChevronUp, SlidersHorizontal } from "lucide-react";
import { formatDate, formatMoney, signedClass } from "../utils/format.js";
import { InputField, SelectField } from "./FormFields.jsx";

export function History({ products, parties, history, filters, setFilters, onSubmit, loading, collapsible = false, defaultCollapsed = false }) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  function setField(field, value) {
    setFilters((current) => ({ ...current, [field]: value }));
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
              <th>Packets</th>
              <th>Weight</th>
              <th>Total Amount</th>
              <th>Paid / Received</th>
              <th>Note</th>
            </tr>
          </thead>
          <tbody>
            {history.map((movement) => (
              <tr key={movement._id}>
                <td>{formatDate(movement.date)}</td>
                <td>{movement.productId?.name || "-"}</td>
                <td>
                  <span className={`type-badge ${movement.type.toLowerCase().replace("_", "-")}`}>{movement.type.replace("_", " ")}</span>
                </td>
                <td>{movement.partyId ? `${movement.partyId.partyCode} - ${movement.partyId.name}` : movement.partyName || movement.reason || "-"}</td>
                <td className={signedClass(movement.signedPackets)}>{movement.signedPackets}</td>
                <td className={signedClass(movement.signedWeight)}>{movement.signedWeight} KG</td>
                <td>{formatMoney(movement.totalAmount)}</td>
                <td className={movement.paymentType === "RECEIVED" ? "positive" : movement.paymentType === "PAID" ? "negative" : ""}>
                  {movement.paymentAmount ? `${movement.paymentType} ${formatMoney(movement.paymentAmount)}` : "-"}
                </td>
                <td>{movement.note || "-"}</td>
              </tr>
            ))}
            {!history.length && (
              <tr>
                <td colSpan="9">{loading ? "Loading history..." : "No movements found."}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
