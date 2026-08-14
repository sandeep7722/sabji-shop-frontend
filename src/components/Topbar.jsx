import React from "react";
import { RefreshCw } from "lucide-react";
import { tabs } from "./Sidebar.jsx";

export function Topbar({ activeTab, loading, onRefresh }) {
  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">Inventory ledger</p>
        <h2>{tabs.find((tab) => tab.id === activeTab)?.label}</h2>
      </div>
      <button className="icon-button text-button" type="button" onClick={onRefresh} disabled={loading}>
        <RefreshCw size={17} />
        <span>Refresh</span>
      </button>
    </header>
  );
}
