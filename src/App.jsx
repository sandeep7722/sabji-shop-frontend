import React, { useEffect, useMemo, useState } from "react";
import { api } from "./api/client.js";
import { AdjustmentForm } from "./components/AdjustmentForm.jsx";
import { Alerts } from "./components/Alerts.jsx";
import { CurrentStock } from "./components/CurrentStock.jsx";
import { History } from "./components/History.jsx";
import { MovementForm } from "./components/MovementForm.jsx";
import { Parties } from "./components/Parties.jsx";
import { Payments } from "./components/Payments.jsx";
import { Products } from "./components/Products.jsx";
import { Sidebar } from "./components/Sidebar.jsx";
import { Topbar } from "./components/Topbar.jsx";
import { formatApiError, todayISO } from "./utils/format.js";

const emptyMovementForm = {
  productId: "",
  partyId: "",
  date: todayISO(),
  partyName: "",
  packets: "",
  weight: "",
  totalAmount: "",
  paymentAmount: "",
  paymentMode: "Cash",
  note: ""
};

const emptyAdjustmentForm = {
  productId: "",
  adjustmentType: "OUT",
  date: todayISO(),
  packets: "",
  weight: "",
  reason: "Damaged",
  note: ""
};

export default function App() {
  const [activeTab, setActiveTab] = useState("current");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [parties, setParties] = useState([]);
  const [currentStock, setCurrentStock] = useState([]);
  const [history, setHistory] = useState([]);
  const [payments, setPayments] = useState([]);
  const [partyDetails, setPartyDetails] = useState(null);
  const [selectedPartyId, setSelectedPartyId] = useState("");
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [stockInForm, setStockInForm] = useState(emptyMovementForm);
  const [stockOutForm, setStockOutForm] = useState(emptyMovementForm);
  const [adjustmentForm, setAdjustmentForm] = useState(emptyAdjustmentForm);
  const [productName, setProductName] = useState("");
  const [paymentForm, setPaymentForm] = useState({
    partyId: "",
    type: "RECEIVED",
    date: todayISO(),
    amount: "",
    mode: "Cash",
    note: ""
  });
  const [partyForm, setPartyForm] = useState({
    partyCode: "",
    name: "",
    type: "BOTH",
    phone: "",
    address: "",
    note: ""
  });
  const [historyFilters, setHistoryFilters] = useState({
    productId: "",
    partyId: "",
    type: "",
    from: "",
    to: ""
  });
  const [paymentFilters, setPaymentFilters] = useState({
    partyId: "",
    type: "",
    from: "",
    to: ""
  });

  const productOptions = useMemo(
    () => products.map((product) => ({ value: product._id, label: product.name })),
    [products]
  );

  const partyOptions = useMemo(
    () => parties.map((party) => ({ value: party._id, label: `${party.partyCode} - ${party.name}` })),
    [parties]
  );

  async function loadProducts() {
    const data = await api("/products");
    setProducts(data);
  }

  async function loadParties() {
    const data = await api("/parties");
    setParties(data);
  }

  async function loadCurrentStock() {
    const data = await api("/stock/current");
    setCurrentStock(data);
  }

  async function loadHistory(filters = historyFilters) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    const query = params.toString();
    const data = await api(`/stock/history${query ? `?${query}` : ""}`);
    setHistory(data);
  }

  async function loadPayments(filters = paymentFilters) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    const query = params.toString();
    const data = await api(`/payments${query ? `?${query}` : ""}`);
    setPayments(data);
  }

  async function refreshAll() {
    setLoading(true);
    setError("");
    try {
      await Promise.all([loadProducts(), loadParties(), loadCurrentStock(), loadHistory(), loadPayments()]);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshAll();
  }, []);

  async function submitMovement(event, kind) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setNotice("");

    const form = kind === "in" ? stockInForm : stockOutForm;

    try {
      await api(`/stock/${kind}`, {
        method: "POST",
        body: JSON.stringify({
          ...form,
          packets: Number(form.packets),
          weight: Number(form.weight),
          totalAmount: Number(form.totalAmount || 0),
          paymentAmount: Number(form.paymentAmount || 0),
          paymentMode: form.paymentMode
        })
      });
      setNotice(kind === "in" ? "Stock added successfully." : "Stock removed successfully.");
      if (kind === "in") setStockInForm(emptyMovementForm);
      if (kind === "out") setStockOutForm(emptyMovementForm);
      await Promise.all([loadCurrentStock(), loadHistory(), loadPayments(), selectedPartyId ? loadPartyDetails() : Promise.resolve()]);
      setActiveTab("current");
    } catch (requestError) {
      setError(formatApiError(requestError));
    } finally {
      setLoading(false);
    }
  }

  async function submitAdjustment(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setNotice("");

    try {
      await api("/stock/adjustment", {
        method: "POST",
        body: JSON.stringify({
          ...adjustmentForm,
          packets: Number(adjustmentForm.packets),
          weight: Number(adjustmentForm.weight)
        })
      });
      setNotice("Stock adjustment saved.");
      setAdjustmentForm(emptyAdjustmentForm);
      await Promise.all([loadCurrentStock(), loadHistory()]);
      setActiveTab("current");
    } catch (requestError) {
      setError(formatApiError(requestError));
    } finally {
      setLoading(false);
    }
  }

  async function submitProduct(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setNotice("");

    try {
      await api("/products", {
        method: "POST",
        body: JSON.stringify({ name: productName })
      });
      setProductName("");
      setNotice("Product created.");
      await Promise.all([loadProducts(), loadCurrentStock()]);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  async function submitParty(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setNotice("");

    try {
      await api("/parties", {
        method: "POST",
        body: JSON.stringify(partyForm)
      });
      setPartyForm({
        partyCode: "",
        name: "",
        type: "BOTH",
        phone: "",
        address: "",
        note: ""
      });
      setNotice("Party created.");
      await loadParties();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadPartyDetails() {
    if (!selectedPartyId) return;

    setLoading(true);
    setError("");
    setNotice("");

    try {
      const data = await api(`/parties/${selectedPartyId}`);
      setPartyDetails(data);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  async function submitPayment(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setNotice("");

    try {
      await api("/payments", {
        method: "POST",
        body: JSON.stringify({
          ...paymentForm,
          amount: Number(paymentForm.amount)
        })
      });
      setPaymentForm({
        partyId: "",
        type: "RECEIVED",
        date: todayISO(),
        amount: "",
        mode: "Cash",
        note: ""
      });
      setNotice("Payment saved.");
      await Promise.all([loadPayments(), selectedPartyId ? loadPartyDetails() : Promise.resolve()]);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  async function submitPaymentFilters(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      await loadPayments(paymentFilters);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  async function submitHistoryFilters(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await loadHistory(historyFilters);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app-shell">
      <Sidebar activeTab={activeTab} isOpen={isMenuOpen} onChange={setActiveTab} onClose={() => setIsMenuOpen(false)} />
      <main className="main">
        <Topbar activeTab={activeTab} loading={loading} onRefresh={refreshAll} onMenuClick={() => setIsMenuOpen(true)} onTabChange={setActiveTab} />
        <Alerts error={error} notice={notice} />

        {activeTab === "current" && <CurrentStock stock={currentStock} loading={loading} />}
        {activeTab === "in" && (
          <MovementForm
            title="Add Stock"
            submitLabel="Save Stock IN"
            form={stockInForm}
            setForm={setStockInForm}
            productOptions={productOptions}
            partyOptions={partyOptions}
            onSubmit={(event) => submitMovement(event, "in")}
            partyLabel="Dealer / Party"
            paymentLabel="Paid Now"
            notePlaceholder="Fresh onion stock"
            loading={loading}
          />
        )}
        {activeTab === "out" && (
          <MovementForm
            title="Remove Stock"
            submitLabel="Save Stock OUT"
            form={stockOutForm}
            setForm={setStockOutForm}
            productOptions={productOptions}
            partyOptions={partyOptions}
            onSubmit={(event) => submitMovement(event, "out")}
            partyLabel="Buyer / Party"
            paymentLabel="Received Now"
            notePlaceholder="Wholesale"
            loading={loading}
          />
        )}
        {activeTab === "history" && (
          <History
            products={products}
            parties={parties}
            history={history}
            filters={historyFilters}
            setFilters={setHistoryFilters}
            onSubmit={submitHistoryFilters}
            loading={loading}
          />
        )}
        {activeTab === "parties" && (
          <Parties
            parties={parties}
            selectedPartyId={selectedPartyId}
            setSelectedPartyId={setSelectedPartyId}
            partyDetails={partyDetails}
            partyForm={partyForm}
            setPartyForm={setPartyForm}
            onCreateParty={submitParty}
            onLoadPartyDetails={loadPartyDetails}
            loading={loading}
          />
        )}
        {activeTab === "payments" && (
          <Payments
            parties={parties}
            payments={payments}
            filters={paymentFilters}
            setFilters={setPaymentFilters}
            paymentForm={paymentForm}
            setPaymentForm={setPaymentForm}
            onCreatePayment={submitPayment}
            onSearchPayments={submitPaymentFilters}
            loading={loading}
          />
        )}
        {activeTab === "adjustment" && (
          <AdjustmentForm form={adjustmentForm} setForm={setAdjustmentForm} productOptions={productOptions} onSubmit={submitAdjustment} loading={loading} />
        )}
        {activeTab === "products" && <Products products={products} name={productName} setName={setProductName} onSubmit={submitProduct} loading={loading} />}
      </main>
    </div>
  );
}
