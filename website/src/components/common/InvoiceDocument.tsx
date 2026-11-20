import type {
  InvoiceRecord,
  VendorBusinessProfile,
} from "../../types/billing.types";
import { formatDateIndian, formatINR } from "../../utils/indianFormat";
export function InvoiceDocument({
  invoice,
  profile,
  showGst = true,
}: {
  invoice: InvoiceRecord;
  profile: VendorBusinessProfile;
  showGst?: boolean;
}) {
  return (
    <article
      className="invoice-document"
      aria-label={"Tax invoice " + invoice.invoiceNumber}
    >
      <div className="document-head">
        <h2>{invoice.vendorName}</h2>
        <span className="document-type">TAX INVOICE</span>
      </div>
      <p className="document-address">
        {profile.address}
        <br />
        {profile.city}, {profile.state} – {profile.pincode}
        <br />
        GSTIN: {invoice.vendorGstin || "Unregistered"} · {invoice.vendorEmail}
      </p>
      <div className="document-meta">
        <div>
          <h3>BILL TO</h3>
          <strong>{invoice.customer.name}</strong>
          <p className="document-address">
            {invoice.customer.address}
            <br />
            {invoice.customer.city}, {invoice.customer.state} –{" "}
            {invoice.customer.pincode}
            <br />
            {invoice.customer.email}
            {invoice.customer.gstin && (
              <>
                <br />
                GSTIN: {invoice.customer.gstin}
              </>
            )}
          </p>
        </div>
        <div>
          <strong>{invoice.invoiceNumber}</strong>
          <p className="document-address">
            Invoice date: {formatDateIndian(invoice.invoiceDate)}
            <br />
            Due date: {formatDateIndian(invoice.dueDate)}
            <br />
            Place of supply: {invoice.customer.state}
          </p>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th scope="col">Description</th>
            <th scope="col">Qty</th>
            <th scope="col">Rate</th>
            <th scope="col">Amount</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item) => (
            <tr key={item.id}>
              <td>
                <strong>{item.name}</strong>
                <br />
                <span className="muted">
                  {item.sku} · GST {item.gstRate}%
                </span>
              </td>
              <td>{item.quantity}</td>
              <td>{formatINR(item.unitPrice)}</td>
              <td>{formatINR(item.lineTotal, true)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <InvoiceTotals invoice={invoice} compact={!showGst} />
      <div className="document-notes">
        <p>{invoice.notes}</p>
        <p style={{ marginTop: 16 }}>
          This invoice was generated electronically by {invoice.vendorName}.
        </p>
      </div>
    </article>
  );
}
export function InvoiceTotals({
  invoice,
  compact = false,
  subtotalLabel = "Subtotal",
  taxLabel = "GST",
}: {
  invoice: Pick<
    InvoiceRecord,
    "subtotal" | "discount" | "cgst" | "sgst" | "igst" | "totalAmount"
  >;
  compact?: boolean;
  subtotalLabel?: string;
  taxLabel?: string;
}) {
  return (
    <div className="totals">
      <div>
        <span>{subtotalLabel}</span>
        <span>{formatINR(invoice.subtotal, true)}</span>
      </div>
      {invoice.discount > 0 && (
        <div>
          <span>Discount</span>
          <span>−{formatINR(invoice.discount, true)}</span>
        </div>
      )}
      {compact ? (
        <div>
          <span>{taxLabel}</span>
          <span>
            {formatINR(invoice.cgst + invoice.sgst + invoice.igst, true)}
          </span>
        </div>
      ) : invoice.igst > 0 ? (
        <div>
          <span>IGST</span>
          <span>{formatINR(invoice.igst, true)}</span>
        </div>
      ) : (
        <>
          <div>
            <span>CGST</span>
            <span>{formatINR(invoice.cgst, true)}</span>
          </div>
          <div>
            <span>SGST</span>
            <span>{formatINR(invoice.sgst, true)}</span>
          </div>
        </>
      )}
      <div className="grand-total">
        <span>Total</span>
        <span>{formatINR(invoice.totalAmount, true)}</span>
      </div>
    </div>
  );
}
