import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useBilling } from "../../context/BillingContext";
import { Button } from "../../components/common/Button";
import { Card } from "../../components/common/Card";
import { Modal } from "../../components/common/Modal";
import {
  DesignIcon,
  EmptyState,
  ErrorMessage,
  Status,
} from "../../components/common/Design";
import { formatINR } from "../../utils/indianFormat";
export function ProductDetail() {
  const { id } = useParams();
  const { products, deleteProduct } = useBilling();
  const navigate = useNavigate();
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const product = products.find((p) => p.id === id);
  if (!product)
    return (
      <EmptyState title="Product not found">
        This product may have been deleted.
      </EmptyState>
    );
  async function remove() {
    setBusy(true);
    try {
      await deleteProduct(product!.id);
      navigate("/vendor/products");
    } catch {
      setError("Could not delete the product. Please try again.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="stack" data-figma-node="2:58863">
      <div className="detail-layout">
        <div className="stack">
          {product.imageUrl && (
            <img
              className="product-detail-image"
              src={product.detailImageUrl || product.imageUrl}
              alt={product.name}
            />
          )}
          <div className="product-title">
            <div className="invoice-reference">
              <p className="selection-label">
                {product.brand?.toUpperCase()} · {product.sku}
              </p>
              <Status tone={product.active ? "green" : "neutral"}>
                {product.active ? "Active" : "Inactive"}
              </Status>
            </div>
            <h1>{product.name}</h1>
            <div className="flex items-baseline gap-2">
              <strong className="amount">{formatINR(product.price)}</strong>
              <span className="hint">excluding GST</span>
            </div>
            <p className="product-description">{product.description}</p>
          </div>
        </div>
        <div className="stack">
          <Card>
            <dl className="detail-grid">
              {[
                ["Category", product.category],
                ["Brand", product.brand],
                ["HSN code", product.hsn],
                ["GST", product.gstRate + "%"],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value || "—"}</dd>
                </div>
              ))}
            </dl>
          </Card>
          <Card>
            <div className="invoice-reference">
              <span className="hint">Price including GST</span>
              <strong>
                {formatINR(product.price * (1 + product.gstRate / 100), true)}
              </strong>
            </div>
          </Card>
          <Button
            fullWidth
            leftIcon={<DesignIcon name="imgPencil" />}
            onClick={() => navigate("/vendor/products/" + product.id + "/edit")}
          >
            Edit Product
          </Button>
          <Button
            fullWidth
            variant="outline"
            className="text-error"
            leftIcon={<DesignIcon name="imgTrash2" />}
            onClick={() => setConfirm(true)}
          >
            Delete Product
          </Button>
        </div>
      </div>
      <Modal
        isOpen={confirm}
        onClose={() => setConfirm(false)}
        title="Delete product?"
      >
        <p className="muted">
          Delete {product.name} from your catalogue? Existing invoice records
          will be kept.
        </p>
        <ErrorMessage>{error}</ErrorMessage>
        <Button variant="danger" isLoading={busy} onClick={() => void remove()}>
          Delete Product
        </Button>
        <Button variant="outline" onClick={() => setConfirm(false)}>
          Cancel
        </Button>
      </Modal>
    </div>
  );
}
