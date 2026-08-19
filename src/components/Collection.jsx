import React from "react";
import { Download } from "lucide-react";
import { formatMoney } from "../utils/format.js";

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function Collection({ rows, loading }) {
  const totalCollection = rows.reduce((total, party) => total + Number(party.collectionAmount || 0), 0);

  function downloadPdf() {
    const reportWindow = window.open("", "_blank", "width=1100,height=800");

    if (!reportWindow) {
      window.alert("Popup blocked hai. PDF download ke liye browser me popup allow kar dein.");
      return;
    }

    const generatedAt = new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(new Date());
    const tableRows = rows
      .map(
        (party, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>${escapeHtml(party.partyCode || "-")}</td>
            <td>${escapeHtml(party.name || "-")}</td>
            <td>${escapeHtml(party.phone || "-")}</td>
            <td>${escapeHtml(party.address || "-")}</td>
            <td class="amount">${escapeHtml(formatMoney(party.collectionAmount))}</td>
          </tr>
        `
      )
      .join("");

    reportWindow.document.write(`
      <!doctype html>
      <html>
        <head>
          <title>Collection Report - SV Trading Company</title>
          <style>
            @page { size: A4; margin: 14mm; }
            * { box-sizing: border-box; }
            body {
              margin: 0;
              color: #17212b;
              font-family: Arial, sans-serif;
              font-size: 12px;
            }
            header {
              display: flex;
              justify-content: space-between;
              gap: 18px;
              align-items: flex-start;
              border-bottom: 2px solid #116b5e;
              padding-bottom: 12px;
              margin-bottom: 14px;
            }
            h1 {
              margin: 0;
              color: #0c4f46;
              font-size: 22px;
            }
            h2 {
              margin: 4px 0 0;
              color: #17212b;
              font-size: 15px;
            }
            .meta {
              color: #5b6875;
              text-align: right;
              line-height: 1.5;
              white-space: nowrap;
            }
            .summary {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 10px;
              margin-bottom: 14px;
            }
            .box {
              border: 1px solid #d9e0e7;
              border-radius: 6px;
              padding: 10px;
            }
            .box span {
              display: block;
              color: #5b6875;
              font-size: 11px;
              font-weight: 700;
            }
            .box strong {
              display: block;
              margin-top: 5px;
              color: #0c4f46;
              font-size: 17px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
            }
            th,
            td {
              border: 1px solid #d9e0e7;
              padding: 7px 8px;
              text-align: left;
              vertical-align: top;
            }
            th {
              background: #edf4f2;
              color: #324250;
              font-size: 10px;
              text-transform: uppercase;
            }
            .amount {
              text-align: right;
              white-space: nowrap;
              font-weight: 700;
            }
            .empty {
              text-align: center;
              color: #5b6875;
              padding: 16px;
            }
          </style>
        </head>
        <body>
          <header>
            <div>
              <h1>SV Trading Company</h1>
              <h2>Collection Report</h2>
            </div>
            <div class="meta">
              <div>Generated: ${escapeHtml(generatedAt)}</div>
              <div>Total Parties: ${rows.length}</div>
            </div>
          </header>
          <section class="summary">
            <div class="box">
              <span>Total Collection Amount</span>
              <strong>${escapeHtml(formatMoney(totalCollection))}</strong>
            </div>
            <div class="box">
              <span>Parties / Customers</span>
              <strong>${rows.length}</strong>
            </div>
          </section>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Party / Customer ID</th>
                <th>Name</th>
                <th>Phone No</th>
                <th>Address</th>
                <th>Collection Amount</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows || `<tr><td class="empty" colspan="6">No collection amount pending.</td></tr>`}
            </tbody>
          </table>
        </body>
      </html>
    `);
    reportWindow.document.close();
    reportWindow.focus();
    window.setTimeout(() => {
      reportWindow.print();
    }, 250);
  }

  return (
    <section className="content-section">
      <div className="collection-actions">
        <button className="primary-button" type="button" disabled={loading || !rows.length} onClick={downloadPdf}>
          <Download size={17} />
          <span>Download PDF</span>
        </button>
      </div>

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
