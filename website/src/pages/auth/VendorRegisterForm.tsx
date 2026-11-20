import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Building2, Lock, Mail, Phone, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';

interface VendorRegisterFormProps {
  onSwitchToLogin: () => void;
}

export const VendorRegisterForm: React.FC<VendorRegisterFormProps> = ({ onSwitchToLogin }) => {
  const { registerVendor } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    businessName: '',
    email: '',
    phoneNumber: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setIsLoading(true);
    try {
      await registerVendor({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        businessName: formData.businessName.trim() || undefined,
        email: formData.email.trim(),
        phoneNumber: formData.phoneNumber.trim() || undefined,
        password: formData.password,
      });
      navigate('/vendor');
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || err?.message || 'Vendor registration failed.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5 animate-fade-in">
      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-medium">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="First Name"
          placeholder="e.g. Rahul"
          value={formData.firstName}
          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
          leftIcon={<User size={16} />}
          required
        />
        <Input
          label="Last Name"
          placeholder="e.g. Sharma"
          value={formData.lastName}
          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
          leftIcon={<User size={16} />}
          required
        />
      </div>

      <Input
        label="Business / Store Name"
        placeholder="e.g. Sharma Electronics"
        value={formData.businessName}
        onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
        leftIcon={<Building2 size={16} />}
      />

      <Input
        label="Business Email"
        type="email"
        placeholder="rahul@store.com"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        leftIcon={<Mail size={16} />}
        required
      />

      <Input
        label="Phone Number (Optional)"
        type="tel"
        placeholder="+91 98765 43210"
        value={formData.phoneNumber}
        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
        leftIcon={<Phone size={16} />}
      />

      <Input
        label="Password"
        type="password"
        placeholder="At least 8 characters"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        leftIcon={<Lock size={16} />}
        required
      />

      <div className="text-[11px] text-slate-400 pt-1 leading-relaxed">
        By registering, you agree to Bill-Z's{' '}
        <span className="text-brand-400 hover:underline cursor-pointer">Terms of Service</span> and{' '}
        <span className="text-brand-400 hover:underline cursor-pointer">Privacy Policy</span>.
      </div>

      <Button
        type="submit"
        fullWidth
        size="lg"
        isLoading={isLoading}
        rightIcon={<ArrowRight size={18} />}
        className="mt-2"
      >
        Create Business Account
      </Button>

      <div className="text-center pt-2">
        <p className="text-xs text-slate-400">
          Already registered?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-brand-400 font-semibold hover:underline"
          >
            Sign in here
          </button>
        </p>
      </div>
    </form>
  );
};
