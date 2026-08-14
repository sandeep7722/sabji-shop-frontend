import React from "react";
import { Plus, Search } from "lucide-react";
import { balanceLabel, formatDate, formatMoney, signedClass } from "../utils/format.js";
import { InputField, SelectField } from "./FormFields.jsx";

export function Parties({
  parties,
  selectedPartyId,
  setSelectedPartyId,
  partyDetails,
  partyForm,
  setPartyForm,
  onCreateParty,
  onLoadPartyDetails,
  loading
}) {
  function setField(field, value) {
    setPartyForm((current) => ({ ...current, [field]: value }));
  }

  return (
    <section className="content-section">
      <div className="party-layout">
        <form className="form-grid" onSubmit={onCreateParty}>
          <h3>Create Party / Customer</h3>
          <div className="two-column">
            <InputField label="Unique ID" value={partyForm.partyCode} required placeholder="P001" onChange={(value) => setField("partyCode", value)} />
            <SelectField label="Type" value={partyForm.type} onChange={(value) => setField("type", value)}>
              <option value="BOTH">Both</option>
              <option value="SUPPLIER">Supplier</option>
              <option value="CUSTOMER">Customer</option>
            </SelectField>
          </div>
          <InputField label="Name" value={partyForm.name} required placeholder="Ram Traders" onChange={(value) => setField("name", value)} />
          <InputField label="Phone" value={partyForm.phone} placeholder="9876543210" onChange={(value) => setField("phone", value)} />
          <label className="field">
            <span>Address</span>
            <textarea value={partyForm.address} placeholder="Market road" onChange={(event) => setField("address", event.target.value)} />
          </label>
          <button className="primary-button" type="submit" disabled={loading}>
            <Plus size={17} />
            <span>Add Party</span>
          </button>
        </form>

        <div className="form-grid">
          <h3>Party Details</h3>
          <SelectField label="Select Party" value={selectedPartyId} onChange={setSelectedPartyId}>
            <option value="">Select party</option>
            {parties.map((party) => (
              <option key={party._id} value={party._id}>
                {party.partyCode} - {party.name}
              </option>
            ))}
          </SelectField>
          <button className="primary-button" type="button" disabled={!selectedPartyId || loading} onClick={onLoadPartyDetails}>
            <Search size={17} />
            <span>View Full Details</span>
          </button>

          {partyDetails && (
            <div className="party-summary">
              <div>
                <span>Party</span>
                <strong>
                  {partyDetails.party.partyCode} - {partyDetails.party.name}
                </strong>
              </div>
              <div>
                <span>Total Bought From Party</span>
                <strong>{partyDetails.totals.inPackets} packets / {partyDetails.totals.inWeight} KG / {formatMoney(partyDetails.totals.purchaseAmount)}</strong>
              </div>
              <div>
                <span>Total Sold To Party</span>
                <strong>{partyDetails.totals.outPackets} packets / {partyDetails.totals.outWeight} KG / {formatMoney(partyDetails.totals.saleAmount)}</strong>
              </div>
              <div>
                <span>Payment Paid</span>
                <strong>{formatMoney(partyDetails.totals.paidAmount)}</strong>
              </div>
              <div>
                <span>Payment Received</span>
                <strong>{formatMoney(partyDetails.totals.receivedAmount)}</strong>
              </div>
              <div>
                <span>Final Balance</span>
                <strong className={partyDetails.totals.balance >= 0 ? "positive" : "negative"}>
                  {formatMoney(Math.abs(partyDetails.totals.balance))} - {balanceLabel(partyDetails.totals.balance)}
                </strong>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Type</th>
              <th>Phone</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {parties.map((party) => (
              <tr key={party._id}>
                <td>{party.partyCode}</td>
                <td>{party.name}</td>
                <td>{party.type}</td>
                <td>{party.phone || "-"}</td>
                <td>{party.isActive ? "Active" : "Inactive"}</td>
              </tr>
            ))}
            {!parties.length && (
              <tr>
                <td colSpan="5">No parties found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {partyDetails && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Product</th>
                <th>Type</th>
                <th>Packets</th>
                <th>Weight</th>
                <th>Amount</th>
                <th>Balance Impact</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              {partyDetails.movements.map((movement) => (
                <tr key={movement._id}>
                  <td>{formatDate(movement.date)}</td>
                  <td>{movement.productId?.name || "-"}</td>
                  <td>
                    <span className={`type-badge ${movement.type.toLowerCase().replace("_", "-")}`}>{movement.type.replace("_", " ")}</span>
                  </td>
                  <td className={signedClass(movement.signedPackets)}>{movement.signedPackets}</td>
                  <td className={signedClass(movement.signedWeight)}>{movement.signedWeight} KG</td>
                  <td>{formatMoney(movement.totalAmount)}</td>
                  <td className={movement.balanceImpact >= 0 ? "positive" : "negative"}>{formatMoney(Math.abs(movement.balanceImpact))}</td>
                  <td>{movement.note || "-"}</td>
                </tr>
              ))}
              {!partyDetails.movements.length && (
                <tr>
                  <td colSpan="8">No stock movement for this party.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {partyDetails && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Payment Type</th>
                <th>Amount</th>
                <th>Mode</th>
                <th>Sync</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              {partyDetails.payments.map((payment) => (
                <tr key={payment._id}>
                  <td>{formatDate(payment.date)}</td>
                  <td><span className={`type-badge ${payment.type.toLowerCase()}`}>{payment.type}</span></td>
                  <td className={payment.type === "RECEIVED" ? "positive" : "negative"}>{formatMoney(payment.amount)}</td>
                  <td>{payment.mode || "-"}</td>
                  <td>{payment.referenceType === "STOCK_MOVEMENT" ? "Stock entry" : "Manual"}</td>
                  <td>{payment.note || "-"}</td>
                </tr>
              ))}
              {!partyDetails.payments.length && (
                <tr>
                  <td colSpan="6">No payment found for this party.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
