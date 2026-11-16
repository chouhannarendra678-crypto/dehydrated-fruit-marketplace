import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Store, Mail, Lock, User, AlertCircle, Phone } from 'lucide-react';
import { useDispatch } from 'react-redux';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { useRegisterSellerMutation } from '../../services/authApi';
import { setCredentials } from '../../redux/slices/authSlice';

const SellerRegisterPage = () => {
  const [storeName, setStoreName] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [registerSeller, { isLoading }] = useRegisterSellerMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    try {
      const response = await registerSeller({
        name,
        storeName,
        email,
        phone,
        password,
      }).unwrap();

      const { user, token } = response.data;
      dispatch(setCredentials({ user, token }));
      navigate('/seller/dashboard', { replace: true });
    } catch (err) {
      setErrorMessage(
        err?.data?.message || 'Failed to submit seller registration.'
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-12 h-12 rounded-xl bg-forest/10 text-forest flex items-center justify-center mx-auto mb-2 border border-forest/15">
          <Store className="w-6 h-6 text-forest" />
        </div>
        <h2 className="font-display text-2xl font-bold text-forest">Seller Partner Registration</h2>
        <p className="mt-1 text-xs text-ink/70">
          Turn your dehydrated fruit orchard or facility into an online storefront.
        </p>
      </div>

      {errorMessage && (
        <div className="p-3 rounded-lg bg-tomato/10 border border-tomato/20 text-xs text-tomato flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Store / Brand Name"
          type="text"
          icon={Store}
          placeholder="e.g. Himalayan Dried Fruits Co."
          value={storeName}
          onChange={(e) => setStoreName(e.target.value)}
          required
        />

        <Input
          label="Authorized Representative Name"
          type="text"
          icon={User}
          placeholder="Primary Contact Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <Input
          label="Business Email"
          type="email"
          icon={Mail}
          placeholder="vendor@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Input
          label="Contact Phone"
          type="tel"
          icon={Phone}
          placeholder="+91 98765 43210"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <Input
          label="Password"
          type="password"
          icon={Lock}
          placeholder="Create password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <div className="p-3 rounded-lg bg-amber-100/70 border border-amber-200 text-[11px] text-amber-900">
          <p className="font-bold mb-0.5">Verification Required</p>
          New seller accounts receive <span className="font-bold">PENDING</span> status. FSSAI compliance, purity verification, and payout bank details will be confirmed upon onboarding.
        </div>

        <Button type="submit" variant="primary" loading={isLoading} className="w-full">
          Submit Seller Registration
        </Button>
      </form>

      <div className="text-center text-xs text-ink/70 pt-3 border-t border-forest/15">
        Already registered as a seller?{' '}
        <Link to="/login" className="font-semibold text-forest hover:underline">
          Sign In
        </Link>
      </div>
    </div>
  );
};

export default SellerRegisterPage;
