import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Lock, Mail } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';

interface CustomerLoginFormProps {
  onSwitchToRegister: () => void;
}

export const CustomerLoginForm: React.FC<CustomerLoginFormProps> = ({ onSwitchToRegister }) => {
  const { loginCustomer } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError('Please provide your email address.');
      return;
    }

    setIsLoading(true);
    try {
      await loginCustomer({
        email: email.trim(),
        password: password || undefined,
      });
      navigate('/customer');
    } catch (err: any) {
      const msg = err?.message || 'Failed to login as customer.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in">
      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-medium">
          {error}
        </div>
      )}

      <Input
        label="Your Customer Email"
        type="email"
        placeholder="john@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        leftIcon={<Mail size={18} />}
        hint="The email where vendors send your bills"
        required
      />

      <Input
        label="Password (Optional / OTP access)"
        type="password"
        placeholder="Enter password if created"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        leftIcon={<Lock size={18} />}
      />

      <Button
        type="submit"
        variant="primary"
        fullWidth
        size="lg"
        isLoading={isLoading}
        rightIcon={<ArrowRight size={18} />}
        className="mt-2"
      >
        Access My Bills
      </Button>

      <div className="text-center pt-2">
        <p className="text-xs text-slate-400">
          First time receiving a bill?{' '}
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="text-emerald-400 font-semibold hover:underline"
          >
            Create customer profile
          </button>
        </p>
      </div>
    </form>
  );
};
