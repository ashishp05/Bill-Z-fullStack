import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBilling } from "../../context/BillingContext";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../../components/common/Button";
import { Card } from "../../components/common/Card";
import {
  DesignIcon,
  Notice,
  SectionHeading,
  Status,
} from "../../components/common/Design";
import { InvoiceCard, InvoiceTable } from "../../components/common/InvoiceCard";
import { InstallPrompt } from "../../components/pwa/InstallPrompt";
import { formatINR, todayISODate } from "../../utils/indianFormat";
import seed from "../../data/demo.json";
import { USE_API } from "../../config/dataSource";
import type { CSSProperties } from "react";

/** "Today" is the design's reference date in mock mode and the real date with the API. */
const today = () =>
  USE_API ? todayISODate() : seed.referenceDate;
/** Monday of the week containing `date` (YYYY-MM-DD). */
const mondayOf = (date: string) => {
  const d = new Date(date + "T12:00:00Z");
  return new Date(d.getTime() - ((d.getUTCDay() + 6) % 7) * 86400000)
    .toISOString()
    .slice(0, 10);
};

export function VendorDashboard() {
  const { profile, invoices } = useBilling();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [weekStart, setWeekStart] = useState(() => mondayOf(today()));
  const [chooseWeek, setChooseWeek] = useState(false);
  const weekEnd = new Date(
    new Date(weekStart + "T12:00:00Z").getTime() + 6 * 86400000,
  )
    .toISOString()
    .slice(0, 10);
  const startDate = new Date(weekStart + "T12:00:00Z");
  const endDate = new Date(weekEnd + "T12:00:00Z");
  const periodLabel =
    startDate.getUTCDate() +
    "–" +
    endDate.getUTCDate() +
    " " +
    endDate.toLocaleDateString("en-GB", {
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    });
  const periodShort = periodLabel.replace(/ \d{4}$/, "");
  const weekInvoices = invoices.filter(
    (i) => i.invoiceDate >= weekStart && i.invoiceDate <= weekEnd,
  );
  const total = weekInvoices.reduce((s, i) => s + i.totalAmount, 0);
  const pending = weekInvoices.filter((i) => i.status !== "PAID");
  const paid = weekInvoices.filter((i) => i.status === "PAID");
  const sum = (rows: typeof invoices) =>
    rows.reduce((s, i) => s + i.totalAmount, 0);
  const dailySales = useMemo(
    () =>
      Array.from({ length: 7 }, (_, index) =>
        invoices
          .filter((i) => i.invoiceDate >= weekStart && i.invoiceDate <= weekEnd)
          .filter((i) => {
            const date = new Date(i.invoiceDate + "T12:00:00");
            return (date.getDay() + 6) % 7 === index;
          })
          .reduce((s, i) => s + i.totalAmount, 0),
      ),
    [invoices, weekStart, weekEnd],
  );
  const maxSales = Math.max(...dailySales, 0);
  const firstName = user?.role === "vendor" ? user.firstName : "Rohan";
  const shortcuts = (
    <>
      <Button
        fullWidth
        leftIcon={<DesignIcon screen="dashboard" name="imgPlus" />}
        onClick={() => navigate("/vendor/create-invoice")}
      >
        Create Bill
      </Button>
      <div className="quick-actions">
        <Button
          variant="outline"
          fullWidth
          leftIcon={<DesignIcon screen="dashboard" name="imgPackagePlus" />}
          onClick={() => navigate("/vendor/products/new")}
        >
          Add Product
        </Button>
        <Button
          variant="outline"
          fullWidth
          leftIcon={<DesignIcon screen="dashboard" name="imgUserPlus" />}
          onClick={() => navigate("/vendor/customers/new")}
        >
          Add Customer
        </Button>
      </div>
    </>
  );
  return (
    <div className="dashboard-content" data-figma-node="2:58461">
      <div className="dashboard-introduction">
        <div className="greeting">
          <p className="date-label">
            {new Date(today() + "T12:00:00")
              .toLocaleDateString("en-GB", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })
              .toUpperCase()}
          </p>
          <h1>Good morning, {firstName}</h1>
          <p className="mobile-business">
            {profile.businessName} · {profile.city}
          </p>
          <p className="desktop-only">
            Here’s what’s happening at {profile.businessName} this week.
          </p>
        </div>
        <div className="week-picker desktop-only">
          <button
            className="date-filter"
            type="button"
            aria-expanded={chooseWeek}
            onClick={() => setChooseWeek(!chooseWeek)}
          >
            <DesignIcon screen="desktopDashboard" name="imgCalendarDays" />
            <span>{periodLabel}</span>
            <DesignIcon screen="desktopDashboard" name="imgChevronDown" />
          </button>
          {chooseWeek && (
            <form
              className="week-popover"
              onSubmit={(event) => {
                event.preventDefault();
                const value = String(
                  new FormData(event.currentTarget).get("weekDate") || "",
                );
                if (!value) return;
                const date = new Date(value + "T12:00:00Z");
                date.setUTCDate(
                  date.getUTCDate() - ((date.getUTCDay() + 6) % 7),
                );
                setWeekStart(date.toISOString().slice(0, 10));
                setChooseWeek(false);
              }}
            >
              <label htmlFor="report-week">Week containing</label>
              <input
                id="report-week"
                type="date"
                name="weekDate"
                defaultValue={weekStart}
                required
              />
              <button className="text-link" type="submit">
                Apply week
              </button>
            </form>
          )}
        </div>
      </div>
      <div className="mobile-only stack">
        <div className="sales-total">
          <div className="period">
            <span>Total Sales</span>
            <small>This week</small>
          </div>
          <div className="amount">{formatINR(total)}</div>
          <div className="summary">
            <DesignIcon screen="dashboard" name="imgReceiptText1" />
            <span>
              {weekInvoices.length} invoices · {periodLabel}
            </span>
          </div>
        </div>
        <div className="payment-metrics">
          <Card>
            <Status tone="amber">Pending</Status>
            <strong className="metric-value">{formatINR(sum(pending))}</strong>
            <p className="metric-caption">{pending.length} invoices</p>
          </Card>
          <Card>
            <Status tone="green">Paid</Status>
            <strong className="metric-value">{formatINR(sum(paid))}</strong>
            <p className="metric-caption">{paid.length} invoices</p>
          </Card>
        </div>
        <div className="dashboard-actions">{shortcuts}</div>
      </div>
      <div className="desktop-metrics desktop-only">
        {[
          {
            label: "Total Sales",
            value: total,
            caption: weekInvoices.length + " invoices this week",
            icon: "imgIndianRupee",
            sales: true,
          },
          {
            label: "Pending",
            value: sum(pending),
            caption: pending.length + " invoices awaiting payment",
            icon: "imgClock3",
          },
          {
            label: "Paid",
            value: sum(paid),
            caption: paid.length + " invoices paid",
            icon: "imgCircleCheck",
          },
        ].map((metric) => (
          <Card
            className={`desktop-metric ${metric.sales ? "sales" : ""}`}
            key={metric.label}
          >
            <div className="metric-top">
              <span>{metric.label}</span>
              <DesignIcon screen="desktopDashboard" name={metric.icon} />
            </div>
            <p className="amount">{formatINR(metric.value)}</p>
            <p className="metric-caption">{metric.caption}</p>
          </Card>
        ))}
      </div>
      <div className="dashboard-middle">
        <Card className="weekly-chart">
          <SectionHeading title="Weekly sales" action="This week" />
          <div className="chart-body">
            <div className="chart-scale">
              <span>{formatINR(Math.ceil(maxSales / 1000))}k</span>
              <Status>{periodShort}</Status>
            </div>
            <div
              className="bar-plot"
              role="img"
              aria-label={dailySales
                .map(
                  (v, i) =>
                    [
                      "Monday",
                      "Tuesday",
                      "Wednesday",
                      "Thursday",
                      "Friday",
                      "Saturday",
                      "Sunday",
                    ][i] +
                    ": " +
                    formatINR(v),
                )
                .join(", ")}
            >
              {dailySales.map((v, i) => (
                <div className="daily-bar" key={i} title={formatINR(v)}>
                  <div
                    className={`bar ${i === 4 ? "today" : ""}`}
                    style={
                      {
                        "--bar-ratio": v / (maxSales || 1),
                        background: v === 0 ? "#e3e9f1" : undefined,
                      } as CSSProperties
                    }
                  />
                  <span className={i === 4 ? "today-label" : ""}>
                    {["M", "T", "W", "T", "F", "S", "S"][i]}
                  </span>
                </div>
              ))}
            </div>
            <p className="chart-caption">
              Mon {formatINR(dailySales[0])} · Tue {formatINR(dailySales[1])} ·
              Wed {formatINR(dailySales[2])} Thu {formatINR(dailySales[3])} ·
              Fri {formatINR(dailySales[4])} · Sat/Sun{" "}
              {formatINR(dailySales[5] + dailySales[6])}
            </p>
          </div>
        </Card>
        <div className="desktop-quick desktop-only">
          <Card>
            <SectionHeading title="Keep business moving" />
            <p className="hint">
              Create, add and manage without the extra steps.
            </p>
            <Button
              fullWidth
              leftIcon={<DesignIcon screen="desktopDashboard" name="imgPlus" />}
              onClick={() => navigate("/vendor/create-invoice")}
            >
              Create Bill
            </Button>
            <div className="quick-actions">
              <Button
                variant="outline"
                fullWidth
                onClick={() => navigate("/vendor/products/new")}
              >
                Add Product
              </Button>
              <Button
                variant="outline"
                fullWidth
                onClick={() => navigate("/vendor/customers/new")}
              >
                Add Customer
              </Button>
            </div>
          </Card>
          <Notice success icon="imgCloudCheck">
            All changes saved on this device
          </Notice>
        </div>
      </div>
      <div className="mobile-only stack">
        <SectionHeading
          title="Recent invoices"
          action="View All"
          onAction={() => navigate("/vendor/invoices")}
        />
        <div className="invoice-cards">
          {invoices.slice(0, 3).map((i) => (
            <InvoiceCard key={i.id} invoice={i} />
          ))}
        </div>
        <Notice success icon="imgCloudCheck">
          You’re up to date. All changes saved on this device.
        </Notice>
        <InstallPrompt />
      </div>
      <div className="desktop-only">
        <InvoiceTable invoices={invoices} />
      </div>
    </div>
  );
}
