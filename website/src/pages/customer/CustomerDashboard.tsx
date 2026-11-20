import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useBilling } from "../../context/BillingContext";
import { Button } from "../../components/common/Button";
import { Card } from "../../components/common/Card";
import { EmptyState, SectionHeading } from "../../components/common/Design";
import { InvoiceCard } from "../../components/common/InvoiceCard";
import { formatINR } from "../../utils/indianFormat";
export function CustomerDashboard() {
  const { user } = useAuth();
  const { invoices } = useBilling();
  const navigate = useNavigate();
  const bills = invoices.filter(
    (i) => i.customer.email.toLowerCase() === user?.email.toLowerCase(),
  );
  const pending = bills.filter((i) => i.status !== "PAID");
  const paid = bills.filter((i) => i.status === "PAID");
  return (
    <div className="stack">
      <div className="greeting">
        <p className="date-label">YOUR BILL-Z ACCOUNT</p>
        <h1>
          Hello, {user?.role === "customer" ? user.name.split(" ")[0] : "Aarav"}
        </h1>
        <p>All your bills, in one simple place.</p>
      </div>
      <div className="payment-banner">
        <p>Outstanding amount</p>
        <p className="amount">
          {formatINR(pending.reduce((s, i) => s + i.totalAmount, 0))}
        </p>
        <p>
          {pending.length} pending {pending.length === 1 ? "bill" : "bills"}
        </p>
      </div>
      <div className="payment-metrics">
        <Card>
          <strong className="metric-value">{bills.length}</strong>
          <p className="metric-caption">Total bills</p>
        </Card>
        <Card>
          <strong className="metric-value">
            {formatINR(paid.reduce((s, i) => s + i.totalAmount, 0))}
          </strong>
          <p className="metric-caption">Amount paid</p>
        </Card>
      </div>
      <Button fullWidth onClick={() => navigate("/customer/bills")}>
        View My Bills
      </Button>
      <SectionHeading
        title="Recent bills"
        action="View All"
        onAction={() => navigate("/customer/bills")}
      />
      {bills.length ? (
        <div className="invoice-cards">
          {bills.slice(0, 3).map((i) => (
            <InvoiceCard key={i.id} invoice={i} customer />
          ))}
        </div>
      ) : (
        <EmptyState title="No bills yet">
          Bills sent to {user?.email} will appear here.
        </EmptyState>
      )}
    </div>
  );
}
