import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, AlertCircle, Phone } from 'lucide-react';
import { useDispatch } from 'react-redux';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { useRegisterCustomerMutation } from '../../services/authApi';
import { setCredentials } from '../../redux/slices/authSlice';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [registerCustomer, { isLoading }] = useRegisterCustomerMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    try {
      // Normal customer registration automatically assigns role CUSTOMER
      const response = await registerCustomer({
        name,
        email,
        password,
        phone,
      }).unwrap();

      const { user, token } = response.data;
      dispatch(setCredentials({ user, token }));
      navigate('/', { replace: true });
    } catch (err) {
      setErrorMessage(
        err?.data?.message || 'Failed to create customer account. Please try again.'
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="font-display text-2xl font-bold text-forest">Create your customer account</h2>
        <p className="mt-1 text-xs text-ink/70">
          Order premium dehydrated fruits with a single multi-vendor checkout.
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
          label="Full Name"
          type="text"
          icon={User}
          placeholder="Jane Doe"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <Input
          label="Email address"
          type="email"
          icon={Mail}
          placeholder="jane@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Input
          label="Phone Number (Optional)"
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
          placeholder="At least 6 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <Button type="submit" variant="primary" loading={isLoading} className="w-full">
          Create Account
        </Button>
      </form>

      <div className="text-center text-xs text-ink/70 pt-3 border-t border-forest/15">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-forest hover:underline">
          Sign In
        </Link>
      </div>
    </div>
  );
};

export default RegisterPage;
