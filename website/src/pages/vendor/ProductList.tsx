import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBilling } from "../../context/BillingContext";
import { Button } from "../../components/common/Button";
import {
  DesignIcon,
  EmptyState,
  SearchField,
  Status,
  Tabs,
} from "../../components/common/Design";
import { formatINR } from "../../utils/indianFormat";
export function ProductList() {
  const { products } = useBilling();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const visible = products.filter(
    (p) =>
      (category === "All" || p.category === category) &&
      (p.name + p.sku).toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <div className="stack" data-figma-node="2:58615">
      <div className="catalogue-heading">
        <h1>Your catalogue</h1>
        <Status>{products.length} products</Status>
      </div>
      <SearchField
        value={search}
        onChange={setSearch}
        placeholder="Search by product name or SKU"
      />
      <Tabs
        options={[
          "All",
          ...new Set(
            products.map((p) => p.category).filter((c): c is string => !!c),
          ),
        ]}
        value={category}
        onChange={setCategory}
      />
      <Button
        fullWidth
        leftIcon={<DesignIcon name="imgPlus" />}
        onClick={() => navigate("/vendor/products/new")}
      >
        Add Product
      </Button>
      {visible.length ? (
        <div className="product-grid">
          {visible.map((p) => (
            <button
              type="button"
              className="bz-card product-card"
              key={p.id}
              onClick={() => navigate("/vendor/products/" + p.id)}
            >
              <div className="product-row">
                {p.imageUrl && (
                  <img
                    className="product-thumbnail"
                    src={p.imageUrl}
                    alt={p.name}
                  />
                )}
                <div className="product-information">
                  <h2>{p.name}</h2>
                  <p>
                    {p.brand} · {p.sku}
                  </p>
                  <strong>{formatINR(p.price)}</strong>
                </div>
                <DesignIcon name="imgChevronRight" />
              </div>
              <div className="product-metadata">
                <span>Excl. GST · {p.gstRate}% tax</span>
                <Status tone={p.active ? "green" : "neutral"}>
                  {p.active ? "Active" : "Inactive"}
                </Status>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <EmptyState title="No products found">
          Try another product name, SKU or category.
        </EmptyState>
      )}
      <p className="list-footer">
        All {visible.length} products shown · Saved on this device
      </p>
    </div>
  );
}
