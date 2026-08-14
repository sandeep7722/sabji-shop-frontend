import React, { useState } from "react";
import { Pencil, X } from "lucide-react";
import { InputField } from "./FormFields.jsx";
import { SubmitButton } from "./SubmitButton.jsx";

export function Products({ products, name, setName, onSubmit, onRename, loading, productSubmitStatus = "idle", submitError = "" }) {
  const [editingProductId, setEditingProductId] = useState("");
  const [draftName, setDraftName] = useState("");
  const [renameStatus, setRenameStatus] = useState("idle");
  const [renameError, setRenameError] = useState("");

  function startEdit(product) {
    setEditingProductId(product._id);
    setDraftName(product.name);
    setRenameStatus("idle");
    setRenameError("");
  }

  function stopEdit() {
    setEditingProductId("");
    setDraftName("");
    setRenameStatus("idle");
    setRenameError("");
  }

  async function submitRename(event, productId) {
    event.preventDefault();
    setRenameStatus("saving");
    setRenameError("");

    try {
      await onRename(productId, draftName);
      setRenameStatus("saved");
      window.setTimeout(stopEdit, 900);
    } catch (requestError) {
      setRenameStatus("idle");
      setRenameError(requestError.message);
    }
  }

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
            {editingProductId === product._id ? (
              <form className="product-edit-form" onSubmit={(event) => submitRename(event, product._id)}>
                <InputField label="Product Name" value={draftName} required onChange={setDraftName} />
                <SubmitButton status={renameStatus} idleLabel="Rename" disabled={loading && renameStatus !== "saving"} errorText={renameError} />
                <button className="icon-only-button" type="button" title="Cancel" disabled={renameStatus === "saving"} onClick={stopEdit}>
                  <X size={17} />
                </button>
              </form>
            ) : (
              <>
                <span>{product.name}</span>
                <div className="product-actions">
                  <small>{product.isActive ? "Active" : "Inactive"}</small>
                  <button className="icon-only-button" type="button" title="Rename product" disabled={loading} onClick={() => startEdit(product)}>
                    <Pencil size={16} />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
