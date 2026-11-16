import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { useResetPasswordMutation } from '../../services/authApi';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../redux/slices/authSlice';

const ResetPasswordPage = () => {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    try {
      const response = await resetPassword({ token, password }).unwrap();
      setIsSuccess(true);
      if (response.data?.token && response.data?.user) {
        dispatch(setCredentials({ user: response.data.user, token: response.data.token }));
      }
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 2000);
    } catch (err) {
      setErrorMessage(
        err?.data?.message || 'Failed to reset password. The link may have expired.'
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="font-display text-2xl font-bold text-forest">Set new password</h2>
        <p className="mt-1 text-xs text-ink/70">
          Choose a secure new password for your account.
        </p>
      </div>

      {isSuccess && (
        <div className="p-4 rounded-lg bg-forest/10 border border-forest/20 text-xs text-forest flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-forest shrink-0" />
          <span>Password reset successful! Redirecting to marketplace...</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 rounded-lg bg-tomato/10 border border-tomato/20 text-xs text-tomato flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {!isSuccess && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="New Password"
            type="password"
            icon={Lock}
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Input
            label="Confirm New Password"
            type="password"
            icon={Lock}
            placeholder="Repeat new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <Button type="submit" variant="primary" loading={isLoading} className="w-full">
            Update Password
          </Button>
        </form>
      )}

      <div className="text-center text-xs text-ink/70 pt-3 border-t border-forest/15">
        <Link to="/login" className="font-semibold text-forest hover:underline">
          Back to Login
        </Link>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
