import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useBilling } from "../../context/BillingContext";
import { EmptyState, SearchField, Tabs } from "../../components/common/Design";
import { InvoiceCard } from "../../components/common/InvoiceCard";
export function CustomerBills() {
  const { user } = useAuth();
  const { invoices } = useBilling();
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("All");
  const bills = invoices.filter(
    (i) =>
      i.customer.email.toLowerCase() === user?.email.toLowerCase() &&
      (tab === "All" || i.status === tab.toUpperCase()) &&
      (i.vendorName + i.invoiceNumber)
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  return (
    <div className="stack">
      <h1>My Bills</h1>
      <p className="muted">Your invoices, always within reach.</p>
      <SearchField
        value={search}
        onChange={setSearch}
        placeholder="Search invoice number or business"
      />
      <Tabs
        options={["All", "Pending", "Paid"]}
        value={tab}
        onChange={setTab}
      />
      {bills.length ? (
        <div className="invoice-cards">
          {bills.map((i) => (
            <InvoiceCard key={i.id} invoice={i} customer />
          ))}
        </div>
      ) : (
        <EmptyState title="No matching bills">
          Try another search or status.
        </EmptyState>
      )}
    </div>
  );
}
