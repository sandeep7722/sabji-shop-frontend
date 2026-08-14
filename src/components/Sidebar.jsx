import React from "react";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  BarChart3,
  Boxes,
  ClipboardList,
  PackagePlus,
  ReceiptIndianRupee,
  SlidersHorizontal,
  Users
} from "lucide-react";

export const tabs = [
  { id: "current", label: "Current Stock", icon: Boxes },
  { id: "summary", label: "Summary", icon: BarChart3 },
  { id: "in", label: "Stock IN", icon: ArrowDownToLine },
  { id: "out", label: "Stock OUT", icon: ArrowUpFromLine },
  { id: "history", label: "History", icon: ClipboardList },
  { id: "parties", label: "Parties", icon: Users },
  { id: "payments", label: "Payments", icon: ReceiptIndianRupee },
  { id: "adjustment", label: "Adjustment", icon: SlidersHorizontal },
  { id: "products", label: "Products", icon: PackagePlus }
];

export function Sidebar({ activeTab, isOpen, onChange, onClose }) {
  return (
    <>
      <div className={isOpen ? "menu-backdrop visible" : "menu-backdrop"} onClick={onClose} />
      <aside className={isOpen ? "sidebar open" : "sidebar"}>
      <div className="brand">
        <div className="brand-mark">PO</div>
        <div>
          <h1>Stock Manager</h1>
          <p>Potato / Onion</p>
        </div>
      </div>

      <nav className="nav-list" aria-label="Stock sections">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={activeTab === tab.id ? "nav-item active" : "nav-item"}
              type="button"
              onClick={() => {
                onChange(tab.id);
                onClose();
              }}
            >
              <Icon size={18} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
      </aside>
    </>
  );
}
