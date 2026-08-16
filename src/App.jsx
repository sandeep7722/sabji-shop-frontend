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
import { Summary } from "./components/Summary.jsx";
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

function resetSubmitStatus(setter, delay = 1400) {
  window.setTimeout(() => setter("idle"), delay);
}

function clearSubmitError(setter, key) {
  setter((current) => ({ ...current, [key]: "" }));
}

function setSubmitError(setter, key, message) {
  setter((current) => ({ ...current, [key]: message }));
}

export default function App() {
  const [activeTab, setActiveTab] = useState("current");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [parties, setParties] = useState([]);
  const [currentStock, setCurrentStock] = useState([]);
  const [history, setHistory] = useState([]);
  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState({
    purchaseAmount: 0,
    saleAmount: 0,
    paidAmount: 0,
    receivedAmount: 0,
    receivableAmount: 0,
    payableAmount: 0,
    buyPackets: 0,
    buyWeight: 0,
    sellPackets: 0,
    sellWeight: 0
  });
  const [partyDetails, setPartyDetails] = useState(null);
  const [selectedPartyId, setSelectedPartyId] = useState("");
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [submitErrors, setSubmitErrors] = useState({
    stockIn: "",
    stockOut: "",
    adjustment: "",
    payment: "",
    party: "",
    product: ""
  });
  const [stockInForm, setStockInForm] = useState(emptyMovementForm);
  const [stockOutForm, setStockOutForm] = useState(emptyMovementForm);
  const [adjustmentForm, setAdjustmentForm] = useState(emptyAdjustmentForm);
  const [stockInSubmitStatus, setStockInSubmitStatus] = useState("idle");
  const [stockOutSubmitStatus, setStockOutSubmitStatus] = useState("idle");
  const [adjustmentSubmitStatus, setAdjustmentSubmitStatus] = useState("idle");
  const [paymentSubmitStatus, setPaymentSubmitStatus] = useState("idle");
  const [partySubmitStatus, setPartySubmitStatus] = useState("idle");
  const [productSubmitStatus, setProductSubmitStatus] = useState("idle");
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
  const [summaryFilters, setSummaryFilters] = useState({
    partyId: "",
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

  async function loadSummary(filters = summaryFilters) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    const query = params.toString();
    const data = await api(`/summary${query ? `?${query}` : ""}`);
    setSummary(data);
  }

  async function refreshAll() {
    setLoading(true);
    setError("");
    try {
      await Promise.all([loadProducts(), loadParties(), loadCurrentStock(), loadHistory(), loadPayments(), loadSummary()]);
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
    const setSubmitStatus = kind === "in" ? setStockInSubmitStatus : setStockOutSubmitStatus;
    const submitErrorKey = kind === "in" ? "stockIn" : "stockOut";
    clearSubmitError(setSubmitErrors, submitErrorKey);
    setSubmitStatus("saving");

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
      if (kind === "in") setStockInForm(emptyMovementForm);
      if (kind === "out") setStockOutForm(emptyMovementForm);
      await Promise.all([loadCurrentStock(), loadHistory(), loadPayments(), loadSummary(), selectedPartyId ? loadPartyDetails() : Promise.resolve()]);
      setSubmitStatus("saved");
      resetSubmitStatus(setSubmitStatus);
    } catch (requestError) {
      setSubmitStatus("idle");
      setSubmitError(setSubmitErrors, submitErrorKey, formatApiError(requestError));
    } finally {
      setLoading(false);
    }
  }

  async function submitAdjustment(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setNotice("");
    clearSubmitError(setSubmitErrors, "adjustment");
    setAdjustmentSubmitStatus("saving");

    try {
      await api("/stock/adjustment", {
        method: "POST",
        body: JSON.stringify({
          ...adjustmentForm,
          packets: Number(adjustmentForm.packets),
          weight: Number(adjustmentForm.weight)
        })
      });
      setAdjustmentForm(emptyAdjustmentForm);
      await Promise.all([loadCurrentStock(), loadHistory()]);
      setActiveTab("current");
      setAdjustmentSubmitStatus("saved");
      resetSubmitStatus(setAdjustmentSubmitStatus);
    } catch (requestError) {
      setAdjustmentSubmitStatus("idle");
      setSubmitError(setSubmitErrors, "adjustment", formatApiError(requestError));
    } finally {
      setLoading(false);
    }
  }

  async function submitProduct(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setNotice("");
    clearSubmitError(setSubmitErrors, "product");
    setProductSubmitStatus("saving");

    try {
      await api("/products", {
        method: "POST",
        body: JSON.stringify({ name: productName })
      });
      setProductName("");
      await Promise.all([loadProducts(), loadCurrentStock()]);
      setProductSubmitStatus("saved");
      resetSubmitStatus(setProductSubmitStatus);
    } catch (requestError) {
      setProductSubmitStatus("idle");
      setSubmitError(setSubmitErrors, "product", requestError.message);
    } finally {
      setLoading(false);
    }
  }

  async function renameProduct(productId, nextName) {
    setLoading(true);
    setError("");

    try {
      await api(`/products/${productId}`, {
        method: "PATCH",
        body: JSON.stringify({ name: nextName })
      });
      await Promise.all([loadProducts(), loadCurrentStock(), loadHistory(), selectedPartyId ? loadPartyDetails() : Promise.resolve()]);
    } finally {
      setLoading(false);
    }
  }

  async function submitParty(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setNotice("");
    clearSubmitError(setSubmitErrors, "party");
    setPartySubmitStatus("saving");

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
      await loadParties();
      setPartySubmitStatus("saved");
      resetSubmitStatus(setPartySubmitStatus);
    } catch (requestError) {
      setPartySubmitStatus("idle");
      setSubmitError(setSubmitErrors, "party", requestError.message);
    } finally {
      setLoading(false);
    }
  }

  async function updateParty(partyId, form) {
    setLoading(true);
    setError("");

    try {
      await api(`/parties/${partyId}`, {
        method: "PATCH",
        body: JSON.stringify(form)
      });
      await Promise.all([loadParties(), loadHistory(), loadPayments(), loadSummary(), selectedPartyId === partyId ? loadPartyDetails() : Promise.resolve()]);
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
    clearSubmitError(setSubmitErrors, "payment");
    setPaymentSubmitStatus("saving");

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
      await Promise.all([loadPayments(), loadSummary(), selectedPartyId ? loadPartyDetails() : Promise.resolve()]);
      setPaymentSubmitStatus("saved");
      resetSubmitStatus(setPaymentSubmitStatus);
    } catch (requestError) {
      setPaymentSubmitStatus("idle");
      setSubmitError(setSubmitErrors, "payment", requestError.message);
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

  async function updateMovement(movementId, form) {
    const isStockTrade = ["IN", "OUT"].includes(form.type);

    setLoading(true);
    setError("");

    try {
      await api(`/stock/history/${movementId}`, {
        method: "PATCH",
        body: JSON.stringify({
          ...form,
          packets: Number(form.packets),
          weight: Number(form.weight),
          totalAmount: Number(form.totalAmount || 0),
          paymentAmount: isStockTrade ? Number(form.paymentAmount || 0) : 0,
          paymentMode: form.paymentMode
        })
      });

      await Promise.all([loadCurrentStock(), loadHistory(), loadPayments(), loadSummary(), selectedPartyId ? loadPartyDetails() : Promise.resolve()]);
    } finally {
      setLoading(false);
    }
  }

  async function submitSummaryFilters(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      await loadSummary(summaryFilters);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  async function resetSummaryFilters() {
    const emptyFilters = { partyId: "", from: "", to: "" };
    setSummaryFilters(emptyFilters);
    setLoading(true);
    setError("");

    try {
      await loadSummary(emptyFilters);
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
        {activeTab === "summary" && (
          <Summary
            parties={parties}
            summary={summary}
            filters={summaryFilters}
            setFilters={setSummaryFilters}
            onSearch={submitSummaryFilters}
            onReset={resetSummaryFilters}
            loading={loading}
          />
        )}
        {activeTab === "in" && (
          <section className="content-section">
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
              submitStatus={stockInSubmitStatus}
              submitError={submitErrors.stockIn}
              compact
            />
            <History
              products={products}
              parties={parties}
              history={history.filter((movement) => movement.type === "IN")}
              filters={historyFilters}
              setFilters={setHistoryFilters}
              onSubmit={submitHistoryFilters}
              onUpdateMovement={updateMovement}
              loading={loading}
              collapsible
              defaultCollapsed
            />
          </section>
        )}
        {activeTab === "out" && (
          <section className="content-section">
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
              submitStatus={stockOutSubmitStatus}
              submitError={submitErrors.stockOut}
              compact
            />
            <History
              products={products}
              parties={parties}
              history={history.filter((movement) => movement.type === "OUT")}
              filters={historyFilters}
              setFilters={setHistoryFilters}
              onSubmit={submitHistoryFilters}
              onUpdateMovement={updateMovement}
              loading={loading}
              collapsible
              defaultCollapsed
            />
          </section>
        )}
        {activeTab === "history" && (
          <History
            products={products}
            parties={parties}
            history={history}
            filters={historyFilters}
            setFilters={setHistoryFilters}
            onSubmit={submitHistoryFilters}
            onUpdateMovement={updateMovement}
            loading={loading}
            partySubmitStatus={partySubmitStatus}
          />
        )}
        {activeTab === "parties" && (
          <Parties
            parties={parties}
            partyForm={partyForm}
            setPartyForm={setPartyForm}
            onCreateParty={submitParty}
            onUpdateParty={updateParty}
            loading={loading}
            partySubmitStatus={partySubmitStatus}
            submitError={submitErrors.party}
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
            paymentSubmitStatus={paymentSubmitStatus}
            submitError={submitErrors.payment}
          />
        )}
        {activeTab === "adjustment" && (
          <AdjustmentForm
            form={adjustmentForm}
            setForm={setAdjustmentForm}
            productOptions={productOptions}
            onSubmit={submitAdjustment}
            loading={loading}
            adjustmentSubmitStatus={adjustmentSubmitStatus}
            submitError={submitErrors.adjustment}
          />
        )}
        {activeTab === "products" && (
          <Products
            products={products}
            name={productName}
            setName={setProductName}
            onSubmit={submitProduct}
            onRename={renameProduct}
            loading={loading}
            productSubmitStatus={productSubmitStatus}
            submitError={submitErrors.product}
          />
        )}
      </main>
    </div>
  );
}
