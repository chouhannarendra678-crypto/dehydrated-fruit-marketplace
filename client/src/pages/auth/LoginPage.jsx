import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import { useDispatch } from 'react-redux';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { useLoginMutation } from '../../services/authApi';
import { setCredentials } from '../../redux/slices/authSlice';
import { ROLES } from '../../constants/roles';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    try {
      const response = await login({ email, password }).unwrap();
      const { user, token } = response.data;
      dispatch(setCredentials({ user, token }));

      // Role-based or intended destination redirect
      if (from) {
        navigate(from, { replace: true });
      } else if (user.role === ROLES.ADMIN) {
        navigate('/admin/dashboard', { replace: true });
      } else if (user.role === ROLES.SELLER) {
        navigate('/seller/dashboard', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (err) {
      setErrorMessage(
        err?.data?.message || 'Failed to sign in. Please verify your credentials.'
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="font-display text-2xl font-bold text-forest">Sign in to your account</h2>
        <p className="mt-1 text-xs text-ink/70">
          Access your cart, order history, and account settings.
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
          label="Email address"
          type="email"
          icon={Mail}
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <div>
          <Input
            label="Password"
            type="password"
            icon={Lock}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <div className="mt-1.5 text-right">
            <Link
              to="/forgot-password"
              className="text-xs font-semibold text-forest hover:underline transition-colors"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <Button type="submit" variant="primary" loading={isLoading} className="w-full">
          Sign In
        </Button>
      </form>

      <div className="text-center text-xs text-ink/70 pt-3 border-t border-forest/15">
        Don't have an account?{' '}
        <Link to="/register" className="font-semibold text-forest hover:underline">
          Register as Customer
        </Link>
      </div>

      <div className="text-center text-xs text-ink/70">
        Are you a fruit grower or vendor?{' '}
        <Link to="/seller/register" className="font-semibold text-forest hover:underline">
          Sell with us
        </Link>
      </div>
    </div>
  );
};

export default LoginPage;
