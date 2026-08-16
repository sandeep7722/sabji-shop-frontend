import React, { useState } from "react";
import { Pencil, X } from "lucide-react";
import { InputField, SelectField } from "./FormFields.jsx";
import { SubmitButton } from "./SubmitButton.jsx";

function createEditForm(party) {
  return {
    partyCode: party.partyCode || "",
    name: party.name || "",
    type: party.type || "BOTH",
    phone: party.phone || "",
    address: party.address || "",
    note: party.note || "",
    isActive: party.isActive !== false
  };
}

export function Parties({ parties, partyForm, setPartyForm, onCreateParty, onUpdateParty, loading, partySubmitStatus = "idle", submitError = "" }) {
  const [editingPartyId, setEditingPartyId] = useState("");
  const [editForm, setEditForm] = useState(null);
  const [editStatus, setEditStatus] = useState("idle");
  const [editError, setEditError] = useState("");

  function setField(field, value) {
    setPartyForm((current) => ({ ...current, [field]: value }));
  }

  function setEditField(field, value) {
    setEditForm((current) => ({ ...current, [field]: value }));
  }

  function startEdit(party) {
    setEditingPartyId(party._id);
    setEditForm(createEditForm(party));
    setEditStatus("idle");
    setEditError("");
  }

  function stopEdit() {
    setEditingPartyId("");
    setEditForm(null);
    setEditStatus("idle");
    setEditError("");
  }

  async function submitEdit(event, partyId) {
    event.preventDefault();
    setEditStatus("saving");
    setEditError("");

    try {
      await onUpdateParty(partyId, editForm);
      setEditStatus("saved");
      window.setTimeout(stopEdit, 900);
    } catch (requestError) {
      setEditStatus("idle");
      setEditError(requestError.message);
    }
  }

  return (
    <section className="content-section">
      <form className="form-grid party-add-form" onSubmit={onCreateParty}>
        <h3>Add Party / Customer</h3>
        <InputField label="Unique ID" value={partyForm.partyCode} required placeholder="P001" onChange={(value) => setField("partyCode", value)} />
        <SelectField label="Type" value={partyForm.type} onChange={(value) => setField("type", value)}>
          <option value="BOTH">Both</option>
          <option value="SUPPLIER">Supplier</option>
          <option value="CUSTOMER">Customer</option>
        </SelectField>
        <InputField label="Name" value={partyForm.name} required placeholder="Ram Traders" onChange={(value) => setField("name", value)} />
        <InputField label="Phone" value={partyForm.phone} placeholder="9876543210" onChange={(value) => setField("phone", value)} />
        <InputField label="Address" value={partyForm.address} placeholder="Market road" onChange={(value) => setField("address", value)} />
        <SubmitButton status={partySubmitStatus} idleLabel="Add Party" disabled={loading && partySubmitStatus !== "saving"} errorText={submitError} />
      </form>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Type</th>
              <th>Phone</th>
              <th>Address</th>
              <th>Note</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {parties.map((party) =>
              editingPartyId === party._id && editForm ? (
                <tr key={party._id}>
                  <td colSpan="8">
                    <form className="party-edit-form" onSubmit={(event) => submitEdit(event, party._id)}>
                      <InputField label="Unique ID" value={editForm.partyCode} required onChange={(value) => setEditField("partyCode", value)} />
                      <InputField label="Name" value={editForm.name} required onChange={(value) => setEditField("name", value)} />
                      <SelectField label="Type" value={editForm.type} onChange={(value) => setEditField("type", value)}>
                        <option value="BOTH">Both</option>
                        <option value="SUPPLIER">Supplier</option>
                        <option value="CUSTOMER">Customer</option>
                      </SelectField>
                      <InputField label="Phone" value={editForm.phone} onChange={(value) => setEditField("phone", value)} />
                      <InputField label="Address" value={editForm.address} onChange={(value) => setEditField("address", value)} />
                      <InputField label="Note" value={editForm.note} onChange={(value) => setEditField("note", value)} />
                      <SelectField label="Status" value={editForm.isActive ? "ACTIVE" : "INACTIVE"} onChange={(value) => setEditField("isActive", value === "ACTIVE")}>
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                      </SelectField>
                      <div className="party-edit-actions">
                        <SubmitButton status={editStatus} idleLabel="Save Party" disabled={loading && editStatus !== "saving"} errorText={editError} />
                        <button className="icon-only-button" type="button" title="Cancel" disabled={editStatus === "saving"} onClick={stopEdit}>
                          <X size={17} />
                        </button>
                      </div>
                    </form>
                  </td>
                </tr>
              ) : (
                <tr key={party._id}>
                  <td>{party.partyCode}</td>
                  <td>{party.name}</td>
                  <td>{party.type}</td>
                  <td>{party.phone || "-"}</td>
                  <td>{party.address || "-"}</td>
                  <td>{party.note || "-"}</td>
                  <td>{party.isActive ? "Active" : "Inactive"}</td>
                  <td>
                    <button className="icon-only-button" type="button" title="Edit party" disabled={loading} onClick={() => startEdit(party)}>
                      <Pencil size={16} />
                    </button>
                  </td>
                </tr>
              )
            )}
            {!parties.length && (
              <tr>
                <td colSpan="8">No parties found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
