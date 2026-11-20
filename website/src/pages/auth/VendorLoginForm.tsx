import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Lock, Mail } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';

interface VendorLoginFormProps {
  onSwitchToRegister: () => void;
}

export const VendorLoginForm: React.FC<VendorLoginFormProps> = ({ onSwitchToRegister }) => {
  const { loginVendor } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.email || !formData.password) {
      setError('Please fill in all fields.');
      return;
    }

    setIsLoading(true);
    try {
      await loginVendor({
        email: formData.email.trim(),
        password: formData.password,
      });
      navigate('/vendor');
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || err?.message || 'Invalid vendor credentials.';
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
        label="Business Email"
        type="email"
        placeholder="vendor@company.com"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        leftIcon={<Mail size={18} />}
        required
      />

      <Input
        label="Password"
        type="password"
        placeholder="Enter your password"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        leftIcon={<Lock size={18} />}
        required
      />

      <div className="flex items-center justify-between text-xs pt-1">
        <label className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-slate-200">
          <input type="checkbox" className="rounded bg-slate-900 border-slate-700 text-brand-600 focus:ring-0" defaultChecked />
          <span>Remember me</span>
        </label>
        <button
          type="button"
          onClick={() => alert('Password reset link will be sent to your email.')}
          className="text-brand-400 hover:text-brand-300 transition-colors"
        >
          Forgot password?
        </button>
      </div>

      <Button
        type="submit"
        fullWidth
        size="lg"
        isLoading={isLoading}
        rightIcon={<ArrowRight size={18} />}
        className="mt-2"
      >
        Sign In as Vendor
      </Button>

      <div className="text-center pt-2">
        <p className="text-xs text-slate-400">
          New business owner?{' '}
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="text-brand-400 font-semibold hover:underline"
          >
            Create vendor account
          </button>
        </p>
      </div>
    </form>
  );
};
