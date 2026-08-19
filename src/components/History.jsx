import React, { useState } from "react";
import { CalendarSearch, ChevronDown, ChevronUp, Pencil, RotateCcw, SlidersHorizontal, X } from "lucide-react";
import { formatApiError, formatDate, formatMoney, signedClass } from "../utils/format.js";
import { InputField, SearchableSelect, SelectField } from "./FormFields.jsx";
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
    ratePerKg: movement.ratePerKg ? String(movement.ratePerKg) : "",
    otherExpense: movement.otherExpense ? String(movement.otherExpense) : "",
    totalAmount: String(movement.totalAmount ?? ""),
    paymentAmount: movement.paymentAmount ? String(movement.paymentAmount) : "",
    paymentMode: movement.paymentMode || "Cash",
    note: movement.note || ""
  };
}

function isPaymentOnly(movement) {
  return movement.entryType === "PAYMENT" || movement.type === "PAYMENT_PAID" || movement.type === "PAYMENT_RECEIVED";
}

function partyLabel(movement) {
  if (movement.partyId && typeof movement.partyId === "object") {
    return `${movement.partyId.partyCode} - ${movement.partyId.name}`;
  }

  return movement.partyName || movement.reason || "Unknown party";
}

function typeLabel(type) {
  return type.replace(/_/g, " ");
}

function typeClass(type) {
  return type.toLowerCase().replace(/_/g, "-");
}

function calculateHistorySummary(history) {
  const summary = history.reduce(
    (result, movement) => {
      const amount = Number(movement.totalAmount || 0);
      const paymentAmount = Number(movement.paymentAmount || 0);
      const partyId = movement.partyId?._id || movement.partyId || "";
      const currentPartyLabel = partyLabel(movement);

      if (partyId && !result.partyBalances.has(partyId)) {
        result.partyBalances.set(partyId, { partyName: currentPartyLabel, balance: 0 });
      }

      const partyBalance = partyId ? result.partyBalances.get(partyId) : null;

      if (movement.type === "IN") {
        result.buyAmount += amount;
        result.buyPackets += movement.packets || 0;
        result.buyWeight += movement.weight || 0;
        result.buyEntries += 1;
        result.paidAmount += paymentAmount;
        if (partyBalance) partyBalance.balance -= amount - paymentAmount;
      }

      if (movement.type === "OUT") {
        result.sellAmount += amount;
        result.sellPackets += movement.packets || 0;
        result.sellWeight += movement.weight || 0;
        result.sellEntries += 1;
        result.receivedAmount += paymentAmount;
        if (partyBalance) partyBalance.balance += amount - paymentAmount;

        if (movement.sourcePartyId) {
          result.sourceSalePackets += movement.packets || 0;
          result.sourceSaleWeight += movement.weight || 0;
          result.sourceSaleAmount += amount;
        }
      }

      if (movement.type === "PAYMENT_PAID") {
        result.paidPaymentEntries += 1;
        result.paidAmount += paymentAmount;
        if (partyBalance) partyBalance.balance += paymentAmount;
      }

      if (movement.type === "PAYMENT_RECEIVED") {
        result.paymentEntries += 1;
        result.receivedAmount += paymentAmount;
        if (partyBalance) partyBalance.balance -= paymentAmount;
      }

      if (movement.type === "IN" || movement.type === "OUT") {
        result.totalAmount += amount;
      }

      return result;
    },
    {
      buyAmount: 0,
      sellAmount: 0,
      totalAmount: 0,
      paidAmount: 0,
      receivedAmount: 0,
      payableAmount: 0,
      receivableAmount: 0,
      buyPackets: 0,
      buyWeight: 0,
      sellPackets: 0,
      sellWeight: 0,
      sourceSalePackets: 0,
      sourceSaleWeight: 0,
      sourceSaleAmount: 0,
      remainingPackets: 0,
      remainingWeight: 0,
      buyEntries: 0,
      sellEntries: 0,
      paidPaymentEntries: 0,
      paymentEntries: 0,
      partyBalances: new Map()
    }
  );

  summary.payableAmount = Array.from(summary.partyBalances.values()).reduce(
    (total, party) => total + (party.balance < 0 ? Math.abs(party.balance) : 0),
    0
  );
  summary.receivableAmount = Array.from(summary.partyBalances.values()).reduce(
    (total, party) => total + (party.balance > 0 ? party.balance : 0),
    0
  );
  summary.remainingPackets = summary.buyPackets - summary.sourceSalePackets;
  summary.remainingWeight = summary.buyWeight - summary.sourceSaleWeight;
  summary.suggestions = Array.from(summary.partyBalances.values())
    .filter((party) => party.balance !== 0)
    .sort((first, second) => Math.abs(second.balance) - Math.abs(first.balance))
    .slice(0, 4);

  return summary;
}

export function History({
  products,
  parties,
  history,
  filters,
  setFilters,
  onSubmit,
  onReset,
  onUpdateMovement,
  loading,
  collapsible = false,
  defaultCollapsed = false,
  hideTypeFilter = false,
  showSummary = false,
  showBuySummary = false,
  showSellSummary = false
}) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [isSummaryCollapsed, setIsSummaryCollapsed] = useState(true);
  const [editingId, setEditingId] = useState("");
  const [editForm, setEditForm] = useState(null);
  const [editStatus, setEditStatus] = useState("idle");
  const [editError, setEditError] = useState("");

  function setField(field, value) {
    setFilters((current) => ({ ...current, [field]: value }));
  }

  function calculateEditTotal(nextForm) {
    if (nextForm.ratePerKg === "" || nextForm.ratePerKg === undefined || nextForm.ratePerKg === null) {
      return nextForm.totalAmount;
    }

    const weight = Number(nextForm.weight || 0);
    const ratePerKg = Number(nextForm.ratePerKg || 0);
    const otherExpense = Number(nextForm.otherExpense || 0);
    const total = weight * ratePerKg + otherExpense;

    return Number.isFinite(total) ? total.toFixed(2) : "";
  }

  function setEditField(field, value) {
    setEditForm((current) => {
      const nextForm = { ...current, [field]: value };
      if (["weight", "ratePerKg", "otherExpense"].includes(field)) {
        nextForm.totalAmount = calculateEditTotal(nextForm);
      }
      return nextForm;
    });
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

  const historySummary = calculateHistorySummary(history);
  const partyOptions = parties.map((party) => ({ value: party._id, label: `${party.partyCode} - ${party.name}` }));

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
          <SearchableSelect label="Party" value={filters.partyId} options={partyOptions} emptyLabel="All parties" placeholder="Search party" onChange={(value) => setField("partyId", value)} />
          <SelectField label="Product" value={filters.productId} onChange={(value) => setField("productId", value)}>
            <option value="">All products</option>
            {products.map((product) => (
              <option key={product._id} value={product._id}>
                {product.name}
              </option>
            ))}
          </SelectField>
          {!hideTypeFilter && (
            <SelectField label="Type" value={filters.type} onChange={(value) => setField("type", value)}>
              <option value="">All types</option>
              <option value="IN">IN</option>
              <option value="OUT">OUT</option>
              <option value="ADJUSTMENT_IN">ADJUSTMENT IN</option>
              <option value="ADJUSTMENT_OUT">ADJUSTMENT OUT</option>
            </SelectField>
          )}
          <InputField label="From" type="date" value={filters.from} onChange={(value) => setField("from", value)} />
          <InputField label="To" type="date" value={filters.to} onChange={(value) => setField("to", value)} />
          <button className="primary-button search-button" type="submit" disabled={loading}>
            <CalendarSearch size={17} />
            <span>Search</span>
          </button>
          {onReset && (
            <button className="icon-button text-button" type="button" disabled={loading} onClick={onReset}>
              <RotateCcw size={17} />
              <span>Reset</span>
            </button>
          )}
        </form>
      )}

      {(showSummary || showBuySummary || showSellSummary) && (
        <>
          <button className="filter-toggle" type="button" onClick={() => setIsSummaryCollapsed((current) => !current)}>
            <span>
              <SlidersHorizontal size={17} />
              {showBuySummary ? "Buy Summary" : showSellSummary ? "Sell Summary" : "History Summary"}
            </span>
            {isSummaryCollapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
          </button>

          {!isSummaryCollapsed && showBuySummary && (
            <div className="metric-grid history-summary-grid">
              <div className="metric">
                <span>Total Buy</span>
                <strong>{formatMoney(historySummary.buyAmount)}</strong>
              </div>
              <div className="metric">
                <span>Total Paid</span>
                <strong className="negative">{formatMoney(historySummary.paidAmount)}</strong>
              </div>
              <div className="metric">
                <span>Remaining Payable</span>
                <strong className={historySummary.payableAmount > 0 ? "negative" : "positive"}>{formatMoney(historySummary.payableAmount)}</strong>
              </div>
              <div className="metric">
                <span>Buy Packets</span>
                <strong>{historySummary.buyPackets || 0}</strong>
              </div>
              <div className="metric">
                <span>Buy KG</span>
                <strong>{historySummary.buyWeight || 0} KG</strong>
              </div>
              <div className="metric">
                <span>Buy / Payment Rows</span>
                <strong>{historySummary.buyEntries} / {historySummary.paidPaymentEntries}</strong>
              </div>
            </div>
          )}

          {!isSummaryCollapsed && showSellSummary && (
            <div className="metric-grid history-summary-grid">
              <div className="metric">
                <span>Total Sell</span>
                <strong>{formatMoney(historySummary.sellAmount)}</strong>
              </div>
              <div className="metric">
                <span>Total Received</span>
                <strong className="positive">{formatMoney(historySummary.receivedAmount)}</strong>
              </div>
              <div className="metric">
                <span>Remaining Amount</span>
                <strong className={historySummary.receivableAmount > 0 ? "negative" : "positive"}>{formatMoney(historySummary.receivableAmount)}</strong>
              </div>
              <div className="metric">
                <span>Sell Packets</span>
                <strong>{historySummary.sellPackets || 0}</strong>
              </div>
              <div className="metric">
                <span>Sell KG</span>
                <strong>{historySummary.sellWeight || 0} KG</strong>
              </div>
              <div className="metric">
                <span>Sell / Payment Rows</span>
                <strong>{historySummary.sellEntries} / {historySummary.paymentEntries}</strong>
              </div>
            </div>
          )}

          {!isSummaryCollapsed && showSummary && !showBuySummary && !showSellSummary && (
            <div className="metric-grid history-summary-grid">
              <div className="metric">
                <span>Total Buy</span>
                <strong>{formatMoney(historySummary.buyAmount)}</strong>
              </div>
              <div className="metric">
                <span>Total Sell</span>
                <strong>{formatMoney(historySummary.sellAmount)}</strong>
              </div>
              <div className="metric">
                <span>Total Amount</span>
                <strong>{formatMoney(historySummary.totalAmount)}</strong>
              </div>
              <div className="metric">
                <span>Total Paid</span>
                <strong className="negative">{formatMoney(historySummary.paidAmount)}</strong>
              </div>
              <div className="metric">
                <span>Total Received</span>
                <strong className="positive">{formatMoney(historySummary.receivedAmount)}</strong>
              </div>
              <div className="metric">
                <span>Payable Remaining</span>
                <strong className={historySummary.payableAmount > 0 ? "negative" : "positive"}>{formatMoney(historySummary.payableAmount)}</strong>
              </div>
              <div className="metric">
                <span>Receivable Remaining</span>
                <strong className={historySummary.receivableAmount > 0 ? "negative" : "positive"}>{formatMoney(historySummary.receivableAmount)}</strong>
              </div>
              <div className="metric">
                <span>Buy Packets / KG</span>
                <strong>{historySummary.buyPackets} / {historySummary.buyWeight} KG</strong>
              </div>
              <div className="metric">
                <span>Sell Packets / KG</span>
                <strong>{historySummary.sellPackets} / {historySummary.sellWeight} KG</strong>
              </div>
              <div className="metric">
                <span>Dealer Sold Packets / KG</span>
                <strong>{historySummary.sourceSalePackets} / {historySummary.sourceSaleWeight} KG</strong>
              </div>
              <div className="metric">
                <span>Dealer Remaining Packets</span>
                <strong className={historySummary.remainingPackets < 0 ? "negative" : "positive"}>{historySummary.remainingPackets}</strong>
              </div>
              <div className="metric">
                <span>Dealer Remaining KG</span>
                <strong className={historySummary.remainingWeight < 0 ? "negative" : "positive"}>{historySummary.remainingWeight} KG</strong>
              </div>
              <div className="history-suggestions">
                <strong>Suggestions</strong>
                {historySummary.suggestions.length ? (
                  historySummary.suggestions.map((party) => (
                    <span key={party.partyName} className={party.balance > 0 ? "negative" : "positive"}>
                      {party.balance > 0
                        ? `${party.partyName} se ${formatMoney(party.balance)} collect karna baki hai`
                        : `Aapko ${party.partyName} ko ${formatMoney(Math.abs(party.balance))} pay karna baki hai`}
                    </span>
                  ))
                ) : (
                  <span className="positive">Filtered history settled dikh rahi hai.</span>
                )}
              </div>
            </div>
          )}
        </>
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
              <th>Rate / KG</th>
              <th>Other Expense</th>
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
                  <td colSpan="13">
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
                      <SearchableSelect label="Party" value={editForm.partyId} options={partyOptions} emptyLabel="No party" placeholder="Search party" onChange={(value) => setEditField("partyId", value)} />
                      <SearchableSelect
                        label="Bought From"
                        value={editForm.sourcePartyId}
                        options={partyOptions}
                        emptyLabel="No source"
                        placeholder="Search source"
                        disabled={editForm.type !== "OUT"}
                        onChange={(value) => setEditField("sourcePartyId", value)}
                      />
                      <InputField label="Date" type="date" value={editForm.date} required onChange={(value) => setEditField("date", value)} />
                      <InputField label="Packets" type="number" min="0" step="1" value={editForm.packets} required onChange={(value) => setEditField("packets", value)} />
                      <InputField label="Weight" type="number" min="0" step="0.01" value={editForm.weight} required onChange={(value) => setEditField("weight", value)} />
                      <InputField label="Rate / KG" type="number" min="0" step="0.01" value={editForm.ratePerKg} onChange={(value) => setEditField("ratePerKg", value)} />
                      <InputField label="Other Expense" type="number" min="0" step="0.01" value={editForm.otherExpense} onChange={(value) => setEditField("otherExpense", value)} />
                      <InputField label="Total Amount" type="number" min="0" step="0.01" value={editForm.totalAmount} readOnly={Boolean(editForm.ratePerKg)} onChange={(value) => setEditField("totalAmount", value)} />
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
                  <td>{isPaymentOnly(movement) ? "-" : movement.productId?.name || "-"}</td>
                  <td>
                    <span className={`type-badge ${typeClass(movement.type)}`}>{typeLabel(movement.type)}</span>
                  </td>
                  <td>{partyLabel(movement)}</td>
                  <td>{movement.sourcePartyId ? `${movement.sourcePartyId.partyCode} - ${movement.sourcePartyId.name}` : "-"}</td>
                  <td className={isPaymentOnly(movement) ? "" : signedClass(movement.signedPackets)}>{isPaymentOnly(movement) ? "-" : movement.signedPackets}</td>
                  <td className={isPaymentOnly(movement) ? "" : signedClass(movement.signedWeight)}>{isPaymentOnly(movement) ? "-" : `${movement.signedWeight} KG`}</td>
                  <td>{isPaymentOnly(movement) || !movement.ratePerKg ? "-" : formatMoney(movement.ratePerKg)}</td>
                  <td>{isPaymentOnly(movement) || !movement.otherExpense ? "-" : formatMoney(movement.otherExpense)}</td>
                  <td>{isPaymentOnly(movement) ? "-" : formatMoney(movement.totalAmount)}</td>
                  <td className={movement.paymentType === "RECEIVED" ? "positive" : movement.paymentType === "PAID" ? "negative" : ""}>
                    {movement.paymentAmount ? `${movement.paymentType} ${formatMoney(movement.paymentAmount)}` : "-"}
                  </td>
                  <td>{[movement.note, isPaymentOnly(movement) && movement.paymentMode ? movement.paymentMode : ""].filter(Boolean).join(" / ") || "-"}</td>
                  <td>
                    {isPaymentOnly(movement) ? (
                      "-"
                    ) : (
                      <button className="icon-only-button" type="button" title="Edit history entry" disabled={loading || !onUpdateMovement} onClick={() => startEdit(movement)}>
                        <Pencil size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              )
            )}
            {!history.length && (
              <tr>
                <td colSpan="13">{loading ? "Loading history..." : "No movements found."}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
