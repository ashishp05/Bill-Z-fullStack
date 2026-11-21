import { useState } from "react";
import type { FormEvent, ChangeEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useBilling } from "../../context/BillingContext";
import { Button } from "../../components/common/Button";
import { Card } from "../../components/common/Card";
import { Input } from "../../components/common/Input";
import {
  DesignProvider,
  ErrorMessage,
  Notice,
  Select,
  Textarea,
  Toggle,
} from "../../components/common/Design";
import assets from "../../design/assets.json";
import { formatINR } from "../../utils/indianFormat";

export function ProductForm() {
  const { id } = useParams();
  const { products, preferences, categories, brands, addProduct, updateProduct } =
    useBilling();
  const navigate = useNavigate();
  const existing = products.find((p) => p.id === id);
  const [form, setForm] = useState(() => ({
    name: existing?.name || "Electric Kettle",
    sku: existing?.sku || "KIT-001",
    category: existing?.category || categories[0] || "",
    brand: existing?.brand || brands[0] || "",
    price: existing?.price ?? 1800,
    gstRate: existing?.gstRate ?? preferences.gstRate,
    description:
      existing?.description ||
      "1.5 L stainless steel electric kettle with auto shut-off and a 360° swivel base.",
    hsn: existing?.hsn || "85167920",
    active: existing?.active ?? true,
    imageUrl: existing?.imageUrl || assets.addProduct.imgProductImage,
  }));
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  if (id && !existing)
    return (
      <div className="stack">
        <h1>Product not found</h1>
        <Button onClick={() => navigate("/vendor/products")}>
          Back to products
        </Button>
      </div>
    );
  function upload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (
      !["image/png", "image/jpeg"].includes(file.type) ||
      file.size > 5 * 1024 * 1024
    ) {
      setError("Choose a JPG or PNG image smaller than 5 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setForm((p) => ({ ...p, imageUrl: String(reader.result) }));
      setError("");
    };
    reader.onerror = () =>
      setError("This image could not be read. Please try another file.");
    reader.readAsDataURL(file);
  }
  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const product = {
        ...form,
        name: form.name.trim(),
        unit: existing?.unit || "Pcs",
        unlimitedStock: true,
        quantity: existing?.quantity || 0,
      };
      if (!product.name || product.price < 0)
        throw new Error("Enter a product name and a valid selling price.");
      if (id) await updateProduct(id, product);
      else await addProduct(product);
      navigate("/vendor/products");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save product.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <DesignProvider screen="addProduct">
      <form
        className="form-stack"
        onSubmit={(e) => void submit(e)}
        data-figma-node="2:58703"
      >
        <h1 className="desktop-only">{id ? "Edit Product" : "Add Product"}</h1>
        <p className="muted">
          Build your catalogue once. Add products to any bill in seconds.
        </p>
        <Card className="upload-card">
          <img src={form.imageUrl} alt="Product preview" />
          <label>
            <strong>Product image</strong>
            <span className="text-link">Upload image</span>
            <input
              type="file"
              aria-label="Upload product image"
              accept="image/jpeg,image/png"
              onChange={upload}
            />
            <span className="hint">JPG or PNG · up to 5 MB</span>
          </label>
        </Card>
        <h2>Product information</h2>
        <Input
          label="Product name *"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <div className="field-row">
          <Input
            label="SKU"
            value={form.sku}
            onChange={(e) => setForm({ ...form, sku: e.target.value })}
          />
          <Select
            label="Category"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            <option value="">No category</option>
            {categories.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </Select>
        </div>
        <Select
          label="Brand"
          value={form.brand}
          onChange={(e) => setForm({ ...form, brand: e.target.value })}
        >
          <option value="">No brand</option>
          {brands.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </Select>
        <div className="field-row">
          <Input
            label="Selling price (₹) *"
            type="number"
            required
            min="0"
            step="1"
            value={form.price}
            onChange={(e) =>
              setForm({ ...form, price: Number(e.target.value) })
            }
          />
          <Select
            label="GST rate"
            value={form.gstRate}
            onChange={(e) =>
              setForm({ ...form, gstRate: Number(e.target.value) })
            }
          >
            {[0, 5, 12, 18, 28].map((v) => (
              <option value={v} key={v}>
                {v}%
              </option>
            ))}
          </Select>
        </div>
        <Notice>
          Price excludes tax. Final price with GST:{" "}
          {formatINR(form.price * (1 + form.gstRate / 100), true)}
        </Notice>
        <Textarea
          label="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <Input
          label="HSN code"
          value={form.hsn}
          onChange={(e) => setForm({ ...form, hsn: e.target.value })}
        />
        <Toggle
          label="Active product"
          hint="Available when creating a bill."
          checked={form.active}
          onChange={(active) => setForm({ ...form, active })}
        />
        <ErrorMessage>{error}</ErrorMessage>
        <div className="form-actions">
          <Button fullWidth type="submit" isLoading={busy}>
            Save Product
          </Button>
          <Button
            fullWidth
            variant="outline"
            type="button"
            onClick={() => navigate("/vendor/products")}
          >
            Cancel
          </Button>
        </div>
      </form>
    </DesignProvider>
  );
}
