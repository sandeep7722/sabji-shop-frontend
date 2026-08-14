import React from "react";

export function CurrentStock({ stock, loading }) {
  const totals = stock.reduce(
    (sum, row) => ({
      packets: sum.packets + Number(row.packets || 0),
      weight: sum.weight + Number(row.weight || 0)
    }),
    { packets: 0, weight: 0 }
  );

  return (
    <section className="content-section">
      <div className="metric-grid">
        <div className="metric">
          <span>Total Packets</span>
          <strong>{totals.packets}</strong>
        </div>
        <div className="metric">
          <span>Total Weight</span>
          <strong>{totals.weight} KG</strong>
        </div>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Packets</th>
              <th>Weight</th>
            </tr>
          </thead>
          <tbody>
            {stock.map((row) => (
              <tr key={row.product._id}>
                <td>{row.product.name}</td>
                <td>{row.packets}</td>
                <td>{row.weight} KG</td>
              </tr>
            ))}
            {!stock.length && (
              <tr>
                <td colSpan="3">{loading ? "Loading stock..." : "No stock found."}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
