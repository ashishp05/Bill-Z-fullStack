import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../../components/common/Button";
import { Card } from "../../components/common/Card";
import { Input } from "../../components/common/Input";
import { Avatar, ErrorMessage, Status } from "../../components/common/Design";
export function CustomerProfile() {
  const { user, saveCustomerProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [edit, setEdit] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState(user?.role === "customer" ? user.name : "");
  const [phone, setPhone] = useState(
    user?.role === "customer" ? user.phone || "" : "",
  );
  async function save(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await saveCustomerProfile({ name, phone });
      setSaved(true);
      setEdit(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save your profile.");
    }
  }
  return (
    <div className="stack">
      <h1>{edit ? "Edit profile" : "Your profile"}</h1>
      <Card className="profile-identity">
        <Avatar name={name} size={64} />
        <div>
          <h2>{name}</h2>
          <p>{user?.email}</p>
          <div style={{ marginTop: 8 }}>
            <Status tone="green">Email verified</Status>
          </div>
        </div>
      </Card>
      <ErrorMessage>{error}</ErrorMessage>
      {saved && (
        <p className="saved-message" role="status">
          Profile updated.
        </p>
      )}
      {edit ? (
        <form className="form-stack" onSubmit={(e) => void save(e)}>
          <Input
            label="Full name *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input label="Email address" value={user?.email || ""} readOnly />
          <Input
            label="Mobile number"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <Button fullWidth type="submit">
            Save Changes
          </Button>
          <Button
            fullWidth
            type="button"
            variant="outline"
            onClick={() => setEdit(false)}
          >
            Cancel
          </Button>
        </form>
      ) : (
        <>
          <Card className="stack">
            <div>
              <p className="hint">Full name</p>
              <p>{name}</p>
            </div>
            <div>
              <p className="hint">Email address</p>
              <p>{user?.email}</p>
            </div>
            <div>
              <p className="hint">Mobile number</p>
              <p>{phone || "Not added"}</p>
            </div>
          </Card>
          <Button fullWidth variant="outline" onClick={() => setEdit(true)}>
            Edit Profile
          </Button>
          <Button
            fullWidth
            variant="outline"
            className="text-error"
            onClick={() => {
              logout();
              navigate("/auth?role=customer", { replace: true });
            }}
          >
            Log Out
          </Button>
        </>
      )}
    </div>
  );
}
