import React from "react";
import { ArrowDownToLine, ArrowUpFromLine, Boxes, ClipboardList, Menu, RefreshCw, ReceiptIndianRupee, Users } from "lucide-react";
import { tabs } from "./Sidebar.jsx";

const quickActions = [
  { id: "current", label: "Home", icon: Boxes },
  { id: "in", label: "Add", icon: ArrowDownToLine },
  { id: "out", label: "Remove", icon: ArrowUpFromLine },
  { id: "history", label: "History", icon: ClipboardList },
  { id: "payments", label: "Payments", icon: ReceiptIndianRupee },
  { id: "parties", label: "Parties", icon: Users }
];

export function Topbar({ activeTab, loading, onRefresh, onMenuClick, onTabChange }) {
  return (
    <header className="topbar">
      <div className="topbar-title-group">
        <button className="icon-only-button" type="button" onClick={onMenuClick} aria-label="Open menu">
          <Menu size={22} />
        </button>
        <div>
          <p className="eyebrow">Inventory ledger</p>
          <h2>{tabs.find((tab) => tab.id === activeTab)?.label}</h2>
        </div>
      </div>
      <div className="topbar-actions">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              className={activeTab === action.id ? "icon-button text-button active" : "icon-button text-button"}
              type="button"
              onClick={() => onTabChange(action.id)}
            >
              <Icon size={17} />
              <span>{action.label}</span>
            </button>
          );
        })}
        <button className="icon-button text-button" type="button" onClick={onRefresh} disabled={loading}>
          <RefreshCw size={17} />
          <span>Refresh</span>
        </button>
      </div>
    </header>
  );
}
