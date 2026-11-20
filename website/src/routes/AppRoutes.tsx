import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { AuthPage } from "../pages/auth/AuthPage";
import { ProtectedRoute } from "./ProtectedRoute";
import { VendorDashboard } from "../pages/vendor/VendorDashboard";
import { ProductList } from "../pages/vendor/ProductList";
import { ProductForm } from "../pages/vendor/ProductForm";
import { ProductDetail } from "../pages/vendor/ProductDetail";
import { CustomerList } from "../pages/vendor/CustomerList";
import { CustomerForm } from "../pages/vendor/CustomerForm";
import { CreateInvoice } from "../pages/vendor/CreateInvoice";
import { InvoiceList } from "../pages/vendor/InvoiceList";
import { InvoiceDetail } from "../pages/vendor/InvoiceDetail";
import { VendorMore } from "../pages/vendor/VendorMore";
import { SettingsPage } from "../pages/vendor/SettingsPage";
import { CustomerDashboard } from "../pages/customer/CustomerDashboard";
import { CustomerBills } from "../pages/customer/CustomerBills";
import { CustomerInvoiceDetail } from "../pages/customer/CustomerInvoiceDetail";
import { CustomerProfile } from "../pages/customer/CustomerProfile";
function RootRedirect() {
  const { isAuthenticated, role } = useAuth();
  return <Navigate to={isAuthenticated ? "/" + role : "/auth"} replace />;
}
export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/login" element={<Navigate to="/auth" replace />} />
      <Route
        path="/register"
        element={<Navigate to="/auth?mode=register" replace />}
      />
      <Route
        path="/vendor"
        element={
          <ProtectedRoute requiredRole="vendor">
            <VendorDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/vendor/products"
        element={
          <ProtectedRoute requiredRole="vendor">
            <ProductList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/vendor/products/new"
        element={
          <ProtectedRoute requiredRole="vendor">
            <ProductForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/vendor/products/:id"
        element={
          <ProtectedRoute requiredRole="vendor">
            <ProductDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/vendor/products/:id/edit"
        element={
          <ProtectedRoute requiredRole="vendor">
            <ProductForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/vendor/customers"
        element={
          <ProtectedRoute requiredRole="vendor">
            <CustomerList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/vendor/customers/new"
        element={
          <ProtectedRoute requiredRole="vendor">
            <CustomerForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/vendor/customers/:id/edit"
        element={
          <ProtectedRoute requiredRole="vendor">
            <CustomerForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/vendor/create-invoice"
        element={
          <ProtectedRoute requiredRole="vendor">
            <CreateInvoice />
          </ProtectedRoute>
        }
      />
      <Route
        path="/vendor/invoices"
        element={
          <ProtectedRoute requiredRole="vendor">
            <InvoiceList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/vendor/invoices/:id"
        element={
          <ProtectedRoute requiredRole="vendor">
            <InvoiceDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/vendor/more"
        element={
          <ProtectedRoute requiredRole="vendor">
            <VendorMore />
          </ProtectedRoute>
        }
      />
      {(
        ["account", "business", "invoice", "notifications", "help"] as const
      ).map((section) => (
        <Route
          key={section}
          path={
            "/vendor/" + (section === "invoice" ? "invoice-settings" : section)
          }
          element={
            <ProtectedRoute requiredRole="vendor">
              <SettingsPage section={section} />
            </ProtectedRoute>
          }
        />
      ))}
      <Route
        path="/customer"
        element={
          <ProtectedRoute requiredRole="customer">
            <CustomerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/customer/bills"
        element={
          <ProtectedRoute requiredRole="customer">
            <CustomerBills />
          </ProtectedRoute>
        }
      />
      <Route
        path="/customer/bills/:id"
        element={
          <ProtectedRoute requiredRole="customer">
            <CustomerInvoiceDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/customer/profile"
        element={
          <ProtectedRoute requiredRole="customer">
            <CustomerProfile />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
