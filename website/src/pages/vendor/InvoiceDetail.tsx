import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useBilling } from "../../context/BillingContext";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../../components/common/Button";
import { Card } from "../../components/common/Card";
import { Modal } from "../../components/common/Modal";
import {
  EmptyState,
  ErrorMessage,
  SectionHeading,
  Select,
  Status,
} from "../../components/common/Design";
import { InvoiceDocument } from "../../components/common/InvoiceDocument";
import { formatDateIndian, formatINR } from "../../utils/indianFormat";
export function InvoiceDetail({ customer = false }: { customer?: boolean }) {
  const { id } = useParams();
  const { getInvoiceById, updatePaymentStatus, profile, preferences } =
    useBilling();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [confirm, setConfirm] = useState(false);
  const [mode, setMode] = useState("UPI");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const invoice = getInvoiceById(id || "");
  if (
    !invoice ||
    (customer &&
      invoice.customer.email.toLowerCase() !== user?.email.toLowerCase())
  )
    return (
      <EmptyState title="Invoice not found">
        Return to your bills to choose an available invoice.
      </EmptyState>
    );
  async function markPaid() {
    setBusy(true);
    setError("");
    try {
      await updatePaymentStatus(invoice!.id, "PAID", mode);
      setConfirm(false);
    } catch {
      setError("Could not update payment. Please try again.");
    } finally {
      setBusy(false);
    }
  }
  async function copy() {
    try {
      await navigator.clipboard.writeText(location.href);
      setCopied(true);
    } catch {
      setError("Could not copy the link. Copy the address from your browser.");
    }
  }
  return (
    <div className="stack">
      <div className="invoice-summary-head no-print">
        <div>
          <h1>{invoice.invoiceNumber}</h1>
          <p className="hint">{formatDateIndian(invoice.invoiceDate)}</p>
        </div>
        <Status tone={invoice.status === "PAID" ? "green" : "amber"}>
          {invoice.status === "PAID" ? "Paid" : "Pending"}
        </Status>
      </div>
      <div className="detail-layout">
        <InvoiceDocument
          invoice={invoice}
          profile={profile}
          showGst={preferences.showGst}
        />
        <div className="stack no-print">
          <div className="payment-banner">
            <p>{invoice.status === "PAID" ? "Amount paid" : "Amount due"}</p>
            <p className="amount">{formatINR(invoice.totalAmount)}</p>
            <p className="hint" style={{ color: "#cbd8e8" }}>
              Due {formatDateIndian(invoice.dueDate)}
            </p>
          </div>
          <Card className="stack">
            <SectionHeading title="Payment progress" />
            <div className="payment-timeline">
              {invoice.timeline.map((t) => (
                <div className="timeline-row" key={t.step}>
                  <span className={`timeline-dot ${t.completed ? "done" : ""}`}>
                    {t.completed ? "✓" : t.step}
                  </span>
                  <div>
                    <h3>{t.title}</h3>
                    <p>{t.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
          {!customer && invoice.status !== "PAID" && (
            <Button fullWidth onClick={() => setConfirm(true)}>
              Mark as Paid
            </Button>
          )}
          <Button fullWidth variant="outline" onClick={() => window.print()}>
            Print / Save PDF
          </Button>
          <Button fullWidth variant="outline" onClick={() => void copy()}>
            {copied ? "Link copied" : "Copy bill link"}
          </Button>
          <Button
            variant="ghost"
            fullWidth
            onClick={() =>
              navigate(customer ? "/customer/bills" : "/vendor/invoices")
            }
          >
            Back to bills
          </Button>
          <ErrorMessage>{error}</ErrorMessage>
        </div>
      </div>
      <Modal
        isOpen={confirm}
        onClose={() => setConfirm(false)}
        title="Record payment"
      >
        <p className="muted">
          Record {formatINR(invoice.totalAmount)} received for{" "}
          {invoice.invoiceNumber}.
        </p>
        <Select
          label="Payment method"
          value={mode}
          onChange={(e) => setMode(e.target.value)}
        >
          {["UPI", "Cash", "Bank transfer", "Card", "Other"].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </Select>
        <ErrorMessage>{error}</ErrorMessage>
        <Button isLoading={busy} fullWidth onClick={() => void markPaid()}>
          Confirm payment
        </Button>
      </Modal>
    </div>
  );
}
