import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { BillingProvider } from './context/BillingContext';
import { AppShell } from './components/layout/AppShell';
import { AppRoutes } from './routes/AppRoutes';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <BillingProvider>
          <AppShell>
            <AppRoutes />
          </AppShell>
        </BillingProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
