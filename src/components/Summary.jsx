import React, { useState } from "react";
import { CalendarSearch, ChevronDown, ChevronUp, RotateCcw, SlidersHorizontal } from "lucide-react";
import { formatMoney } from "../utils/format.js";
import { InputField, SelectField } from "./FormFields.jsx";

export function Summary({ parties, summary, filters, setFilters, onSearch, onReset, loading }) {
  const [isFilterCollapsed, setIsFilterCollapsed] = useState(true);

  function setField(field, value) {
    setFilters((current) => ({ ...current, [field]: value }));
  }

  const metrics = [
    { label: "Total Buy", value: formatMoney(summary.purchaseAmount) },
    { label: "Total Sell", value: formatMoney(summary.saleAmount) },
    { label: "Total Payable", value: formatMoney(summary.payableAmount), className: "negative" },
    { label: "Total Receivable", value: formatMoney(summary.receivableAmount), className: "positive" },
    { label: "Total Buy Packet", value: summary.buyPackets || 0 },
    { label: "Total Buy KG", value: `${summary.buyWeight || 0} KG` },
    { label: "Total Sell Packet", value: summary.sellPackets || 0 },
    { label: "Total Sell KG", value: `${summary.sellWeight || 0} KG` }
  ];

  return (
    <section className="content-section">
      <button className="filter-toggle" type="button" onClick={() => setIsFilterCollapsed((current) => !current)}>
        <span>
          <SlidersHorizontal size={17} />
          Summary Filters
        </span>
        {isFilterCollapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
      </button>

      {!isFilterCollapsed && (
        <form className="summary-filter-form" onSubmit={onSearch}>
          <SelectField label="Party / Customer" value={filters.partyId} onChange={(value) => setField("partyId", value)}>
            <option value="">All parties</option>
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
            <span>Check</span>
          </button>
          <button className="icon-button text-button" type="button" disabled={loading} onClick={onReset}>
            <RotateCcw size={17} />
            <span>Reset</span>
          </button>
        </form>
      )}

      <div className="metric-grid summary-grid">
        {metrics.map((metric) => (
          <div className="metric" key={metric.label}>
            <span>{metric.label}</span>
            <strong className={metric.className || ""}>{metric.value}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}
