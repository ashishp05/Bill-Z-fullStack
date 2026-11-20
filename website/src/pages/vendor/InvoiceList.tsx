import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBilling } from "../../context/BillingContext";
import { Button } from "../../components/common/Button";
import {
  DesignIcon,
  EmptyState,
  SearchField,
  Tabs,
} from "../../components/common/Design";
import { InvoiceCard } from "../../components/common/InvoiceCard";
import { formatINR } from "../../utils/indianFormat";

export function InvoiceList() {
  const { invoices } = useBilling();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("All");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const count = (status: string) =>
    invoices.filter((i) => i.status === status).length;
  const visible = invoices.filter(
    (i) =>
      (tab === "All" || i.status === tab.toUpperCase()) &&
      (i.invoiceNumber + i.customer.name)
        .toLowerCase()
        .includes(search.toLowerCase()) &&
      (!from || i.invoiceDate >= from) &&
      (!to || i.invoiceDate <= to),
  );
  return (
    <div className="stack">
      <div className="stack" style={{ gap: 8 }}>
        <h1>Every bill, in order.</h1>
        <p className="muted">
          {invoices.length} invoices · Total{" "}
          {formatINR(invoices.reduce((s, i) => s + i.totalAmount, 0))}
        </p>
      </div>
      <Button
        fullWidth
        leftIcon={<DesignIcon name="imgPlus" />}
        onClick={() => navigate("/vendor/create-invoice")}
      >
        Create Bill
      </Button>
      <SearchField
        value={search}
        onChange={setSearch}
        placeholder="Search invoice number or customer"
      />
      <Tabs
        options={["All", "Pending", "Paid"].map(
          (v) =>
            v +
            " (" +
            (v === "All" ? invoices.length : count(v.toUpperCase())) +
            ")",
        )}
        value={
          tab +
          " (" +
          (tab === "All" ? invoices.length : count(tab.toUpperCase())) +
          ")"
        }
        onChange={(value) => setTab(value.split(" (")[0])}
      />
      <div className="date-filter">
        <span>Invoice dates</span>
        <div className="flex gap-2 flex-wrap">
          <input
            aria-label="From invoice date"
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
          <span>–</span>
          <input
            aria-label="To invoice date"
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </div>
      </div>
      {visible.length ? (
        <div className="invoice-cards">
          {visible.map((i) => (
            <InvoiceCard key={i.id} invoice={i} />
          ))}
        </div>
      ) : (
        <EmptyState title="No invoices found">
          Try a different name, date or status.
        </EmptyState>
      )}
      <p className="list-footer">All {visible.length} invoices shown</p>
    </div>
  );
}
