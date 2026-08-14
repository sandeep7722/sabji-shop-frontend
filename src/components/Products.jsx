import React from "react";
import { InputField } from "./FormFields.jsx";
import { SubmitButton } from "./SubmitButton.jsx";

export function Products({ products, name, setName, onSubmit, loading, productSubmitStatus = "idle", submitError = "" }) {
  return (
    <section className="content-section narrow">
      <form className="form-grid" onSubmit={onSubmit}>
        <h3>Create Product</h3>
        <InputField label="Product Name" value={name} required placeholder="Tomato" onChange={setName} />
        <SubmitButton status={productSubmitStatus} idleLabel="Add Product" disabled={loading && productSubmitStatus !== "saving"} errorText={submitError} />
      </form>

      <div className="product-list">
        {products.map((product) => (
          <div className="product-row" key={product._id}>
            <span>{product.name}</span>
            <small>{product.isActive ? "Active" : "Inactive"}</small>
          </div>
        ))}
      </div>
    </section>
  );
}
