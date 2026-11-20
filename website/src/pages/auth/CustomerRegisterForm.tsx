import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Lock, Mail, Phone, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';

interface CustomerRegisterFormProps {
  onSwitchToLogin: () => void;
}

export const CustomerRegisterForm: React.FC<CustomerRegisterFormProps> = ({ onSwitchToLogin }) => {
  const { registerCustomer } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please provide your full name.');
      return;
    }
    if (!email.trim()) {
      setError('Please provide your email address.');
      return;
    }

    setIsLoading(true);
    try {
      await registerCustomer({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        password: password || undefined,
      });
      navigate('/customer');
    } catch (err: any) {
      const msg = err?.message || 'Failed to create customer account.';
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
        label="Full Name"
        type="text"
        placeholder="Alex Smith"
        value={name}
        onChange={(e) => setName(e.target.value)}
        leftIcon={<User size={18} />}
        required
      />

      <Input
        label="Email Address"
        type="email"
        placeholder="alex@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        leftIcon={<Mail size={18} />}
        hint="Receive instant invoice links directly"
        required
      />

      <Input
        label="Phone Number"
        type="tel"
        placeholder="+1 (555) 000-0000"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        leftIcon={<Phone size={18} />}
        hint="Optional: For WhatsApp & SMS bill alerts"
      />

      <Input
        label="Password (Optional)"
        type="password"
        placeholder="Set a password to secure receipts"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        leftIcon={<Lock size={18} />}
        hint="Optional. You can also view bills via verified links"
      />

      <Button
        type="submit"
        variant="primary"
        size="lg"
        isLoading={isLoading}
        rightIcon={<ArrowRight size={18} />}
        className="w-full mt-2"
      >
        Create Customer Account
      </Button>

      <div className="pt-2 text-center">
        <p className="text-xs text-slate-400">
          Already registered?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-brand-400 hover:text-brand-300 font-medium underline underline-offset-4"
          >
            Sign in here
          </button>
        </p>
      </div>
    </form>
  );
};
