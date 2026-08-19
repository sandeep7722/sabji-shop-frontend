import React from "react";
import { formatMoney } from "../utils/format.js";

export function Collection({ rows, loading }) {
  const totalCollection = rows.reduce((total, party) => total + Number(party.collectionAmount || 0), 0);

  return (
    <section className="content-section">
      <div className="metric-grid">
        <div className="metric">
          <span>Total Collection Amount</span>
          <strong className={totalCollection > 0 ? "negative" : "positive"}>{formatMoney(totalCollection)}</strong>
        </div>
        <div className="metric">
          <span>Parties / Customers</span>
          <strong>{rows.length}</strong>
        </div>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Party / Customer ID</th>
              <th>Name</th>
              <th>Phone No</th>
              <th>Address</th>
              <th>Collection Amount</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((party) => (
              <tr key={party._id}>
                <td>{party.partyCode || "-"}</td>
                <td>{party.name || "-"}</td>
                <td>{party.phone || "-"}</td>
                <td>{party.address || "-"}</td>
                <td className="negative">{formatMoney(party.collectionAmount)}</td>
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td colSpan="5">{loading ? "Loading collection list..." : "No collection amount pending."}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
