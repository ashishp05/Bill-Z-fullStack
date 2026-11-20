import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBilling } from "../../context/BillingContext";
import { Button } from "../../components/common/Button";
import {
  Avatar,
  EmptyState,
  SearchField,
} from "../../components/common/Design";
export function CustomerList() {
  const { customers } = useBilling();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const visible = customers.filter((c) =>
    (c.name + c.email + c.phone).toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <div className="stack">
      <h1>Your customers</h1>
      <SearchField
        placeholder="Search name, email or mobile"
        value={search}
        onChange={setSearch}
      />
      <Button fullWidth onClick={() => navigate("/vendor/customers/new")}>
        Add Customer
      </Button>
      <div className="customer-picker">
        {visible.map((c) => (
          <button
            key={c.id}
            className="customer-choice"
            onClick={() => navigate("/vendor/customers/" + c.id + "/edit")}
          >
            <Avatar name={c.name} />
            <div>
              <h3>{c.name}</h3>
              <p>{c.email}</p>
              <p>{c.phone}</p>
            </div>
            <span aria-hidden="true">›</span>
          </button>
        ))}
      </div>
      {!visible.length && (
        <EmptyState title="No customers found">
          Try a different search or add a customer.
        </EmptyState>
      )}
    </div>
  );
}
