import { useState } from "react";
import type { FormEvent } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useBilling } from "../../context/BillingContext";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import {
  DesignProvider,
  ErrorMessage,
  Notice,
  Select,
} from "../../components/common/Design";
import seed from "../../data/demo.json";
export function CustomerForm() {
  const { id } = useParams();
  const { customers, addCustomer, updateCustomer } = useBilling();
  const navigate = useNavigate();
  const location = useLocation();
  const existing = customers.find((c) => c.id === id);
  const [form, setForm] = useState({
    name: existing?.name || seed.customers[0].name,
    email: existing?.email || seed.customers[0].email,
    phone: existing?.phone || seed.customers[0].phone,
    address: existing?.address || seed.customers[0].address,
    city: existing?.city || "Ahmedabad",
    pincode: existing?.pincode || "380009",
    state: existing?.state || "Gujarat",
    gstin: existing?.gstin || "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      if (id) await updateCustomer(id, form);
      else {
        const saved = await addCustomer(form);
        if (location.state?.fromInvoice) {
          navigate("/vendor/create-invoice", {
            state: { customerId: saved.id },
          });
          return;
        }
      }
      navigate("/vendor/customers");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save customer.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <DesignProvider screen="addCustomer">
      <form
        className="form-stack"
        onSubmit={(e) => void submit(e)}
        data-figma-node="2:58990"
      >
        <h1 className="desktop-only">
          {id ? "Edit Customer" : "Add Customer"}
        </h1>
        <p className="muted">
          Customer details help you address and share every invoice correctly.
        </p>
        <Input
          label="Full name *"
          required
          autoComplete="name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <Input
          label="Email address *"
          type="email"
          required
          autoComplete="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <Input
          label="Mobile number"
          type="tel"
          autoComplete="tel"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
        <Input
          label="Billing address"
          autoComplete="street-address"
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
        />
        <div className="field-row">
          <Input
            label="City"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
          />
          <Input
            label="PIN code"
            inputMode="numeric"
            pattern="[0-9]{6}"
            value={form.pincode}
            onChange={(e) => setForm({ ...form, pincode: e.target.value })}
          />
        </div>
        <Select
          label="State / Place of supply"
          value={form.state}
          onChange={(e) => setForm({ ...form, state: e.target.value })}
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
            <option key={s} value={s}>
              {s}
              {s === "Gujarat" ? " (24)" : ""}
            </option>
          ))}
        </Select>
        <Input
          label="GST registration"
          placeholder="Unregistered customer"
          value={form.gstin}
          onChange={(e) =>
            setForm({ ...form, gstin: e.target.value.toUpperCase() })
          }
          maxLength={15}
        />
        <Notice>
          Invoices will be available in the customer’s Bill-Z account using this
          email.
        </Notice>
        <ErrorMessage>{error}</ErrorMessage>
        <div className="form-actions">
          <Button fullWidth type="submit" isLoading={busy}>
            Save & Continue
          </Button>
          <Button
            fullWidth
            type="button"
            variant="outline"
            onClick={() =>
              navigate(
                location.state?.fromInvoice
                  ? "/vendor/create-invoice"
                  : "/vendor/customers",
              )
            }
          >
            Cancel
          </Button>
        </div>
      </form>
    </DesignProvider>
  );
}
