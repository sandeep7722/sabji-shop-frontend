import React from "react";
import { Plus } from "lucide-react";
import { InputField } from "./FormFields.jsx";

export function Products({ products, name, setName, onSubmit, loading }) {
  return (
    <section className="content-section narrow">
      <form className="form-grid" onSubmit={onSubmit}>
        <h3>Create Product</h3>
        <InputField label="Product Name" value={name} required placeholder="Tomato" onChange={setName} />
        <button className="primary-button" type="submit" disabled={loading}>
          <Plus size={17} />
          <span>Add Product</span>
        </button>
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
