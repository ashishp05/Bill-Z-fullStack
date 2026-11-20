import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useBilling } from "../../context/BillingContext";
import { Avatar, DesignIcon, DesignProvider } from "../common/Design";
import type { DesignScreen } from "../common/Design";

function screenFor(path: string): DesignScreen {
  if (
    path.includes("/products/new") ||
    (path.includes("/edit") && path.includes("/products"))
  )
    return "addProduct";
  if (/\/products\/[^/]+$/.test(path)) return "productDetail";
  if (path.includes("/products")) return "products";
  if (path.includes("/customers/new")) return "addCustomer";
  if (path.includes("/create-invoice")) return "selectCustomer";
  if (path.includes("/invoices")) return "invoices";
  if (
    path.includes("/account") ||
    path.includes("/more") ||
    path.includes("/profile")
  )
    return "account";
  if (path.includes("/invoice-settings")) return "invoiceSettings";
  return "dashboard";
}
export function AppShell({ children }: { children: ReactNode }) {
  const { isAuthenticated, role, user } = useAuth();
  const { profile } = useBilling();
  const location = useLocation();
  const navigate = useNavigate();
  const [online, setOnline] = useState(navigator.onLine);
  const [notificationPath, setNotificationPath] = useState<string | null>(null);
  const showNotifications = notificationPath === location.pathname;
  const setShowNotifications = (show: boolean) =>
    setNotificationPath(show ? location.pathname : null);
  useEffect(() => {
    const sync = () => setOnline(navigator.onLine);
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, []);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  const authPage =
    location.pathname === "/auth" ||
    location.pathname === "/login" ||
    location.pathname === "/register";
  if (authPage || !isAuthenticated)
    return <div className="auth-page">{children}</div>;
  const root = "/" + role;
  const home = location.pathname === root;
  const screen = screenFor(location.pathname);
  const items =
    role === "vendor"
      ? [
          ["Home", root, "imgHouse"],
          ["Products", root + "/products", "imgPackage"],
          ["Bills", root + "/invoices", "imgReceiptText"],
          ["Profile", root + "/more", "imgUserRound"],
        ]
      : [
          ["Home", root, "imgHouse"],
          ["My Bills", root + "/bills", "imgReceiptText"],
          ["Profile", root + "/profile", "imgUserRound"],
        ];
  const title = home
    ? "Bill-Z"
    : location.pathname.includes("create-invoice")
      ? "Create Bill"
      : location.pathname.includes("products/new")
        ? "Add Product"
        : location.pathname.includes("products") &&
            location.pathname.includes("edit")
          ? "Edit Product"
          : /\/products\/[^/]+$/.test(location.pathname)
            ? "Product details"
            : location.pathname.includes("products")
              ? "Products"
              : location.pathname.includes("customers/new")
                ? "Add Customer"
                : location.pathname.includes("customers")
                  ? "Customers"
                  : location.pathname.includes("invoice-settings")
                    ? "Invoice settings"
                    : location.pathname.includes("notifications")
                      ? "Notifications"
                      : location.pathname.includes("help")
                        ? "Help & support"
                        : location.pathname.includes("account")
                          ? "Vendor profile"
                          : location.pathname.includes("business")
                            ? "Business details"
                            : location.pathname.includes("invoices/") ||
                                location.pathname.includes("bills/")
                              ? "Bill details"
                              : location.pathname.includes("invoices") ||
                                  location.pathname.includes("bills")
                                ? "Bills"
                                : "Profile & settings";
  const name =
    user?.role === "vendor"
      ? user.firstName + " " + user.lastName
      : user?.name || "Customer";
  const formPage =
    /\/new$|\/edit$|\/create-invoice|invoice-settings|\/business$|\/notifications$/.test(
      location.pathname,
    );
  const nav = (desktop = false) =>
    items.map(([label, path, icon]) => (
      <NavLink
        key={path}
        to={path}
        end={path === root}
        className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
      >
        <DesignIcon
          screen={
            desktop
              ? "desktopDashboard"
              : screen === "addProduct" ||
                  screen === "selectCustomer" ||
                  screen === "addCustomer" ||
                  screen === "invoiceSettings"
                ? "dashboard"
                : screen
          }
          name={
            icon === "imgReceiptText" && desktop
              ? "imgReceiptText1"
              : icon === "imgReceiptText" && screen === "dashboard"
                ? "imgReceiptText2"
                : icon
          }
        />
        <span>{label}</span>
      </NavLink>
    ));
  return (
    <DesignProvider screen={screen}>
      <div className="workspace">
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <aside className="desktop-sidebar">
          <div className="sidebar-top">
            <button className="brand" onClick={() => navigate(root)}>
              <span className="brand-mark">
                <DesignIcon screen="desktopDashboard" name="imgReceiptText" />
              </span>
              <span>Bill-Z</span>
            </button>
            <nav aria-label="Main navigation">{nav(true)}</nav>
            {role === "vendor" && (
              <button
                className="sidebar-create"
                onClick={() => navigate("/vendor/create-invoice")}
              >
                <DesignIcon screen="desktopDashboard" name="imgPlus" />
                Create Bill
              </button>
            )}
          </div>
          <div className="sidebar-bottom">
            <NavLink to={root + (role === "vendor" ? "/help" : "/profile")}>
              <DesignIcon screen="desktopDashboard" name="imgCircleHelp" />
              Help & support
            </NavLink>
            <hr />
            <div className="business-identity">
              <Avatar name={name} size={34} />
              <div>
                <p>{role === "vendor" ? profile.businessName : name}</p>
                <small>
                  {role === "vendor"
                    ? profile.city + ", " + profile.state
                    : user?.email}
                </small>
              </div>
            </div>
            <small>Bill-Z · v1.0.0</small>
          </div>
        </aside>
        <div className="workspace-body">
          <div className="device-status" aria-hidden="true">
            <span>9:41</span>
            <span>
              <DesignIcon screen={screen} name="imgIosSignal" />
              <DesignIcon screen={screen} name="imgIosWifiSignal" />
              <DesignIcon screen={screen} name="imgIosBatteryFull" />
            </span>
          </div>
          <header className="desktop-header">
            <span>Workspace / {home ? "Overview" : title}</span>
            <div className="account-controls">
              <span className="sync-label">
                <i />
                {online
                  ? "All changes saved locally"
                  : "Offline · changes saved locally"}
              </span>
              <button
                aria-label="Notifications"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <DesignIcon screen="desktopDashboard" name="imgBell" />
              </button>
              <button
                aria-label="Open profile"
                onClick={() =>
                  navigate(root + (role === "vendor" ? "/more" : "/profile"))
                }
              >
                <Avatar name={name} size={36} />
              </button>
            </div>
          </header>
          <header
            className={`mobile-header ${home ? "brand-header" : ""} ${title === "Create Bill" ? "wizard-placeholder" : ""}`}
          >
            {home ? (
              <>
                <button className="brand" onClick={() => navigate(root)}>
                  <span className="brand-mark">
                    <DesignIcon screen="dashboard" name="imgReceiptText" />
                  </span>
                  <span>Bill-Z</span>
                </button>
                <span className="header-spacer" />
                <button
                  className="icon-button"
                  aria-label="Notifications"
                  onClick={() => setShowNotifications(!showNotifications)}
                >
                  <DesignIcon screen="dashboard" name="imgBell" />
                </button>
                <button
                  aria-label="Open profile"
                  onClick={() =>
                    navigate(root + (role === "vendor" ? "/more" : "/profile"))
                  }
                >
                  <Avatar name={name} size={34} />
                </button>
              </>
            ) : (
              <>
                <button
                  className="back-button"
                  aria-label="Go back"
                  onClick={() => navigate(-1)}
                >
                  <DesignIcon name="imgArrowLeft" />
                </button>
                <div className="header-title">
                  <h1>{title}</h1>
                  {["Products", "Bills", "Create Bill"].includes(title) && (
                    <p>{profile.businessName}</p>
                  )}
                </div>
              </>
            )}
          </header>
          {!online && (
            <p className="offline-banner" role="status">
              You’re offline. You can keep exploring your saved demo data.
            </p>
          )}
          {showNotifications && (
            <div className="notifications-panel" role="status">
              <strong>You’re all caught up</strong>
              <p>There are no new notifications.</p>
              <button
                className="text-link"
                onClick={() => setShowNotifications(false)}
              >
                Close
              </button>
            </div>
          )}
          <main
            id="main-content"
            className={`app-main ${home ? "dashboard-main" : ""} ${formPage ? "form-page" : ""}`}
          >
            {children}
          </main>
          {!formPage && (
            <nav className="mobile-bottom-nav" aria-label="Main navigation">
              <div>{nav()}</div>
              <span className="home-indicator" aria-hidden="true" />
            </nav>
          )}
        </div>
      </div>
    </DesignProvider>
  );
}
