import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useBilling } from "../../context/BillingContext";
import { Button } from "../../components/common/Button";
import { Card } from "../../components/common/Card";
import { Input } from "../../components/common/Input";
import {
  Avatar,
  DesignIcon,
  DesignProvider,
  ErrorMessage,
  Notice,
  Select,
  Textarea,
  Toggle,
} from "../../components/common/Design";
export function SettingsPage({
  section,
}: {
  section: "account" | "business" | "invoice" | "notifications" | "help";
}) {
  const { user, updateUser } = useAuth();
  const { profile, updateProfile, preferences, savePreferences } = useBilling();
  const navigate = useNavigate();
  const [business, setBusiness] = useState({ ...profile });
  const [options, setOptions] = useState({ ...preferences });
  const [name, setName] = useState(
    user?.role === "vendor"
      ? user.firstName + " " + user.lastName
      : "Rohan Mehta",
  );
  const [phone, setPhone] = useState(
    user?.role === "vendor"
      ? user.phoneNumber || profile.phoneNumber
      : profile.phoneNumber,
  );
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setSaved(false);
    try {
      if (section === "business") await updateProfile(business);
      else if (section === "account") {
        const [firstName, ...rest] = name.trim().split(/\s+/);
        updateUser({ firstName, lastName: rest.join(" "), phoneNumber: phone });
      } else await savePreferences(options);
      setSaved(true);
    } catch {
      setError("Could not save changes. Please try again.");
    } finally {
      setBusy(false);
    }
  }
  if (section === "help")
    return (
      <div className="stack">
        <h1>Help & support</h1>
        <p className="muted">A little help to keep your business moving.</p>
        <Card className="stack">
          {[
            [
              "How do I create a bill?",
              "Choose Create Bill, select a customer, add products, set the dates and review your invoice.",
            ],
            [
              "How do I mark a bill as paid?",
              "Open the bill from Bills and select Mark as Paid, then choose the payment method.",
            ],
            [
              "How can I download an invoice?",
              "Open a bill and choose Print / Save PDF. In the print dialog, select Save as PDF.",
            ],
            [
              "Where is my data saved?",
              "This demo saves changes in your browser on this device. It does not send invoices or connect to an API.",
            ],
          ].map(([q, a]) => (
            <details key={q}>
              <summary className="cursor-pointer font-semibold">{q}</summary>
              <p className="hint" style={{ marginTop: 10 }}>
                {a}
              </p>
            </details>
          ))}
        </Card>
        <Button
          variant="outline"
          fullWidth
          onClick={() => navigate("/vendor/more")}
        >
          Back to profile
        </Button>
      </div>
    );
  return (
    <DesignProvider
      screen={
        section === "account"
          ? "account"
          : section === "invoice"
            ? "invoiceSettings"
            : "business"
      }
    >
      <form className="form-stack" onSubmit={(e) => void submit(e)}>
        <h1 className="desktop-only">
          {section === "account"
            ? "Vendor profile"
            : section === "business"
              ? "Business details"
              : section === "invoice"
                ? "Invoice settings"
                : "Notifications"}
        </h1>
        {section === "account" && (
          <>
            <div className="account-avatar">
              <Avatar name={name} size={72} />
              <p className="hint">Business owner</p>
            </div>
            <h2>Your personal details</h2>
            <Input
              label="Full name *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              label="Email address"
              value={user?.email || ""}
              readOnly
              hint="Verified · Used to sign in"
              rightIcon={<DesignIcon name="imgBadgeCheck" />}
            />
            <Input
              label="Mobile number"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <Notice>
              Business information is managed separately in Business details.
            </Notice>
          </>
        )}
        {section === "business" && (
          <>
            <p className="muted">These details appear on every invoice.</p>
            <Input
              label="Business name *"
              value={business.businessName}
              onChange={(e) =>
                setBusiness({ ...business, businessName: e.target.value })
              }
              required
            />
            <Input
              label="GSTIN"
              value={business.gstin}
              maxLength={15}
              onChange={(e) =>
                setBusiness({
                  ...business,
                  gstin: e.target.value.toUpperCase(),
                })
              }
            />
            <Input
              label="Business address *"
              value={business.address}
              onChange={(e) =>
                setBusiness({ ...business, address: e.target.value })
              }
              required
            />
            <div className="field-row">
              <Input
                label="City"
                value={business.city}
                onChange={(e) =>
                  setBusiness({ ...business, city: e.target.value })
                }
              />
              <Input
                label="PIN code"
                value={business.pincode}
                inputMode="numeric"
                pattern="[0-9]{6}"
                onChange={(e) =>
                  setBusiness({ ...business, pincode: e.target.value })
                }
              />
            </div>
            <Select
              label="State"
              value={business.state}
              onChange={(e) =>
                setBusiness({ ...business, state: e.target.value })
              }
            >
              {[
                "Gujarat",
                "Maharashtra",
                "Rajasthan",
                "Delhi",
                "Karnataka",
                "Tamil Nadu",
                "Other",
              ].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </Select>
            <Input
              label="UPI ID"
              value={business.upiId || ""}
              onChange={(e) =>
                setBusiness({ ...business, upiId: e.target.value })
              }
            />
            <Notice>
              GST is split into CGST and SGST for sales within {business.state}.
            </Notice>
          </>
        )}
        {section === "invoice" && (
          <>
            <p className="muted">
              Set your defaults once. Keep every invoice consistent.
            </p>
            <h2>Invoice numbering</h2>
            <div className="field-row">
              <Input
                label="Prefix"
                required
                value={options.prefix}
                onChange={(e) =>
                  setOptions({ ...options, prefix: e.target.value })
                }
              />
              <Input
                label="Next number"
                type="number"
                min={preferences.nextNumber}
                required
                value={options.nextNumber}
                onChange={(e) =>
                  setOptions({ ...options, nextNumber: Number(e.target.value) })
                }
              />
            </div>
            <Notice>
              Next invoice: {options.prefix}
              {String(options.nextNumber).padStart(6, "0")}. Numbers are unique
              and sequential.
            </Notice>
            <h2>Tax & payment defaults</h2>
            <Select
              label="Default GST rate"
              value={options.gstRate}
              onChange={(e) =>
                setOptions({ ...options, gstRate: Number(e.target.value) })
              }
            >
              {[0, 5, 12, 18, 28].map((n) => (
                <option value={n} key={n}>
                  {n}%
                </option>
              ))}
            </Select>
            <Select
              label="Price entry"
              value={options.priceEntry}
              onChange={(e) =>
                setOptions({ ...options, priceEntry: e.target.value })
              }
            >
              <option>Exclusive of tax</option>
            </Select>
            <Select
              label="Default payment terms"
              value={options.paymentTerms}
              onChange={(e) =>
                setOptions({ ...options, paymentTerms: Number(e.target.value) })
              }
            >
              {[0, 7, 14, 30].map((n) => (
                <option value={n} key={n}>
                  {n ? "Due in " + n + " days" : "Due immediately"}
                </option>
              ))}
            </Select>
            <Textarea
              label="Default invoice note"
              value={options.note}
              onChange={(e) => setOptions({ ...options, note: e.target.value })}
            />
            <Toggle
              label="Show GST breakdown"
              hint="Display CGST and SGST on intra-state bills."
              checked={options.showGst}
              onChange={(showGst) => setOptions({ ...options, showGst })}
            />
            <Notice>
              {profile.state} sales use CGST + SGST. Interstate sales use IGST.
            </Notice>
          </>
        )}
        {section === "notifications" && (
          <>
            <p className="muted">Choose the updates you want to receive.</p>
            <Toggle
              label="Invoice emails"
              hint="Receive a copy when you create an invoice."
              checked={options.emailInvoices}
              onChange={(emailInvoices) =>
                setOptions({ ...options, emailInvoices })
              }
            />
            <Toggle
              label="Payment updates"
              hint="Keep track of recorded payments."
              checked={options.paymentUpdates}
              onChange={(paymentUpdates) =>
                setOptions({ ...options, paymentUpdates })
              }
            />
            <Toggle
              label="Weekly summary"
              hint="A weekly overview of your business."
              checked={options.weeklySummary}
              onChange={(weeklySummary) =>
                setOptions({ ...options, weeklySummary })
              }
            />
            <Notice>
              These preferences are saved for this demo. Email delivery will be
              available after API integration.
            </Notice>
          </>
        )}
        <ErrorMessage>{error}</ErrorMessage>
        {saved && (
          <p className="saved-message" role="status">
            Changes saved on this device.
          </p>
        )}
        <div className="form-actions">
          <Button type="submit" fullWidth isLoading={busy}>
            Save Changes
          </Button>
          <Button
            type="button"
            fullWidth
            variant="outline"
            onClick={() => navigate("/vendor/more")}
          >
            Cancel
          </Button>
        </div>
      </form>
    </DesignProvider>
  );
}
