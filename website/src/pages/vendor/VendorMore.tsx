import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useBilling } from "../../context/BillingContext";
import { Avatar, Status } from "../../components/common/Design";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
export function VendorMore() {
  const { user, logout } = useAuth();
  const { profile } = useBilling();
  const navigate = useNavigate();
  const name =
    user?.role === "vendor"
      ? user.firstName + " " + user.lastName
      : "Rohan Mehta";
  return (
    <div className="stack">
      <h1>Profile & settings</h1>
      <Card className="profile-identity">
        <Avatar name={name} size={56} />
        <div>
          <h2>{profile.businessName}</h2>
          <p>{user?.email}</p>
          <div style={{ marginTop: 8 }}>
            <Status tone="green">Business account</Status>
          </div>
        </div>
      </Card>
      <Card className="settings-list">
        {[
          ["Vendor profile", "Your personal details", "/vendor/account"],
          [
            "Business details",
            "Manage your business and GST information",
            "/vendor/business",
          ],
          ["Customers", "Your customer directory", "/vendor/customers"],
          [
            "Invoice settings",
            "Numbering, tax and payment defaults",
            "/vendor/invoice-settings",
          ],
          ["Notifications", "Choose what you receive", "/vendor/notifications"],
          ["Help & support", "Find answers and get help", "/vendor/help"],
        ].map(([label, hint, path]) => (
          <Link to={path} key={path}>
            <span>
              {label}
              <small>{hint}</small>
            </span>
            <span aria-hidden="true">›</span>
          </Link>
        ))}
      </Card>
      <Button
        fullWidth
        variant="outline"
        className="text-error"
        onClick={() => {
          logout();
          navigate("/auth", { replace: true });
        }}
      >
        Log Out
      </Button>
      <p className="list-footer">Bill-Z · v1.0.0</p>
    </div>
  );
}
