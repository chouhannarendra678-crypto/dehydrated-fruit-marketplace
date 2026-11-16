import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, CheckCircle2, AlertCircle } from 'lucide-react';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { useForgotPasswordMutation } from '../../services/authApi';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [successInfo, setSuccessInfo] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [resetToken, setResetToken] = useState(null);

  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessInfo('');

    try {
      const response = await forgotPassword({ email }).unwrap();
      setSuccessInfo(response.message || 'Password reset instructions generated.');
      if (response.data?.resetToken) {
        setResetToken(response.data.resetToken);
      }
    } catch (err) {
      setErrorMessage(
        err?.data?.message || 'Failed to request password reset. Please try again.'
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="font-display text-2xl font-bold text-forest">Reset password</h2>
        <p className="mt-1 text-xs text-ink/70">
          Enter your registered email to receive password recovery details.
        </p>
      </div>

      {successInfo && (
        <div className="p-4 rounded-lg bg-forest/10 border border-forest/20 text-xs text-forest space-y-2">
          <div className="flex items-center gap-2 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-forest" />
            <span>{successInfo}</span>
          </div>
          {resetToken && (
            <p className="text-[11px] text-forest bg-oat p-2 rounded border border-forest/15 font-mono break-all">
              Dev/Test Token: {resetToken}
            </p>
          )}
        </div>
      )}

      {errorMessage && (
        <div className="p-3 rounded-lg bg-tomato/10 border border-tomato/20 text-xs text-tomato flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Account Email"
          type="email"
          icon={Mail}
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Button type="submit" variant="primary" loading={isLoading} className="w-full">
          Send Recovery Link
        </Button>
      </form>

      <div className="text-center text-xs text-ink/70 pt-3 border-t border-forest/15">
        Remember your password?{' '}
        <Link to="/login" className="font-semibold text-forest hover:underline">
          Back to Login
        </Link>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
