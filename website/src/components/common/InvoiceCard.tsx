import { useNavigate } from "react-router-dom";
import type { InvoiceRecord } from "../../types/billing.types";
import { Avatar, Status, DesignIcon } from "./Design";
import { Card } from "./Card";
import { formatDateIndian, formatINR } from "../../utils/indianFormat";

export function InvoiceCard({
  invoice,
  customer = false,
}: {
  invoice: InvoiceRecord;
  customer?: boolean;
}) {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      className="bz-card invoice-card"
      onClick={() =>
        navigate(
          customer
            ? "/customer/bills/" + invoice.id
            : "/vendor/invoices/" + invoice.id,
        )
      }
    >
      <div className="invoice-reference">
        <span className="invoice-number">{invoice.invoiceNumber}</span>
        <Status
          tone={
            invoice.status === "PAID"
              ? "green"
              : invoice.status === "OVERDUE"
                ? "red"
                : "amber"
          }
        >
          {invoice.status === "PAID"
            ? "Paid"
            : invoice.status === "OVERDUE"
              ? "Overdue"
              : "Pending"}
        </Status>
      </div>
      <div className="invoice-customer">
        <Avatar name={customer ? invoice.vendorName : invoice.customer.name} />
        <div>
          <p className="customer-name">
            {customer ? invoice.vendorName : invoice.customer.name}
          </p>
          <p className="customer-date">
            {formatDateIndian(invoice.invoiceDate)}
          </p>
        </div>
        <strong className="invoice-amount">
          {formatINR(invoice.totalAmount)}
        </strong>
      </div>
    </button>
  );
}
export function InvoiceTable({ invoices }: { invoices: InvoiceRecord[] }) {
  const navigate = useNavigate();
  return (
    <Card className="table-wrap">
      <div className="section-heading">
        <h2>Recent invoices</h2>
        <button
          className="text-link"
          onClick={() => navigate("/vendor/invoices")}
        >
          View All
        </button>
      </div>
      <table className="desktop-table">
        <thead>
          <tr>
            {["INVOICE", "CUSTOMER", "DATE", "STATUS", "AMOUNT", ""].map(
              (x, i) => (
                <th key={i} scope="col">
                  {x}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody>
          {invoices.map((invoice) => (
            <tr key={invoice.id}>
              <td>
                <button
                  className="invoice-number"
                  onClick={() => navigate("/vendor/invoices/" + invoice.id)}
                >
                  {invoice.invoiceNumber}
                </button>
              </td>
              <td>
                <div className="table-customer">
                  <Avatar name={invoice.customer.name} size={30} />
                  {invoice.customer.name}
                </div>
              </td>
              <td>{formatDateIndian(invoice.invoiceDate)}</td>
              <td>
                <Status
                  screen="desktopDashboard"
                  tone={invoice.status === "PAID" ? "green" : "amber"}
                >
                  {invoice.status === "PAID" ? "Paid" : "Pending"}
                </Status>
              </td>
              <td>{formatINR(invoice.totalAmount)}</td>
              <td>
                <button
                  aria-label={"View " + invoice.invoiceNumber}
                  onClick={() => navigate("/vendor/invoices/" + invoice.id)}
                >
                  <DesignIcon
                    screen="desktopDashboard"
                    name="imgChevronRight"
                  />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
