import type {
  InvoicePaymentStatus,
  InvoiceTimelineEvent,
} from "../types/billing.types";
import { formatDateIndian } from "./indianFormat";

interface TimelineSource {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  status: InvoicePaymentStatus;
  paymentMode?: string;
  paidAt?: string;
  viewedAt?: string;
}

/** The invoice timeline is presentation only: it is derived from stored dates and status. */
export function buildTimeline(invoice: TimelineSource): InvoiceTimelineEvent[] {
  const paid = invoice.status === "PAID";
  const overdue = invoice.status === "OVERDUE";
  const viewed = !!invoice.viewedAt || paid;
  return [
    {
      step: 1,
      title: "Invoice created",
      description: `Invoice ${invoice.invoiceNumber} generated`,
      date: formatDateIndian(invoice.invoiceDate),
      completed: true,
      iconType: "sent",
    },
    {
      step: 2,
      title: "Viewed by customer",
      description: viewed
        ? "Invoice viewed in Bill-Z"
        : "Awaiting customer view",
      date: invoice.viewedAt ? formatDateIndian(invoice.viewedAt) : undefined,
      completed: viewed,
      iconType: "viewed",
    },
    {
      step: 3,
      title: paid
        ? "Payment confirmed"
        : overdue
          ? "Payment overdue"
          : "Payment pending",
      description: paid
        ? "Payment recorded by vendor"
        : `${overdue ? "Was due" : "Due"} ${formatDateIndian(invoice.dueDate)}`,
      completed: paid,
      current: !paid,
      iconType: "pending",
    },
    {
      step: 4,
      title: "Payment received",
      description: paid
        ? `Received via ${invoice.paymentMode || "recorded payment"}`
        : "Awaiting payment",
      date: invoice.paidAt ? formatDateIndian(invoice.paidAt) : undefined,
      completed: paid,
      iconType: "received",
    },
  ];
}

/** "Overdue" is never stored: a pending invoice past its due date is shown as overdue. */
export function displayStatus(
  status: "PENDING" | "PAID",
  dueDate: string,
  today: string,
): InvoicePaymentStatus {
  return status === "PENDING" && dueDate < today ? "OVERDUE" : status;
}
