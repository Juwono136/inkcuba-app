import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import AuthLayout from '../components/layout/AuthLayout';
import FormInput from '../common/FormInput';
import { verifyEmail, resendVerification, clearError } from '../features/auth/authSlice';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get('token');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);
  const [status, setStatus] = useState('idle'); // idle | verifying | success | invalid | resending
  const [resendEmail, setResendEmail] = useState('');
  const [resendDone, setResendDone] = useState(false);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  useEffect(() => {
    if (!tokenFromUrl) {
      setStatus('invalid');
      return;
    }
    setStatus('verifying');
    dispatch(verifyEmail(tokenFromUrl))
      .then((result) => {
        if (verifyEmail.fulfilled.match(result)) {
          setStatus('success');
          toast.success('Email verified successfully!');
        } else {
          setStatus('invalid');
        }
      })
      .catch(() => setStatus('invalid'));
  }, [tokenFromUrl, dispatch]);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleResend = async (e) => {
    e.preventDefault();
    if (!resendEmail?.trim()) {
      toast.error('Enter your email');
      return;
    }
    const result = await dispatch(resendVerification({ email: resendEmail.trim().toLowerCase() }));
    if (resendVerification.fulfilled.match(result)) {
      setResendDone(true);
      toast.success(result.payload?.message || 'If the account exists, a new verification email was sent.');
    }
  };

  if (status === 'verifying' || status === 'idle') {
    return (
      <AuthLayout title="Verifying your email" subtitle="Please wait...">
        <div className="flex justify-center py-8">
          <span className="loading loading-spinner loading-lg text-[#3B613A]" />
        </div>
      </AuthLayout>
    );
  }

  if (status === 'success') {
    return (
      <AuthLayout title="Email verified" subtitle="Your account is ready to use">
        <div className="space-y-4 text-center">
          <p className="text-base-content/80">You can now use all features. Redirecting you...</p>
          <Link to="/dashboard" className="btn btn-primary bg-[#3B613A] border-[#3B613A] hover:bg-[#4a7549]">Go to Dashboard</Link>
        </div>
      </AuthLayout>
    );
  }

  if (status === 'invalid') {
    return (
      <AuthLayout title="Invalid or expired link" subtitle="Request a new verification email">
        <div className="space-y-4">
          <p className="text-base-content/80 text-sm">This verification link is invalid or has expired. Enter your email below to receive a new one.</p>
          {resendDone ? (
            <div className="text-center space-y-2">
              <p className="text-success text-sm">If the account exists, we sent a new verification email.</p>
              <Link to="/login" className="btn btn-ghost">Back to sign in</Link>
            </div>
          ) : (
            <form onSubmit={handleResend} className="space-y-4">
              <FormInput
                label="Email"
                type="email"
                name="email"
                value={resendEmail}
                onChange={(e) => setResendEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
              <button
                type="submit"
                className="btn btn-primary w-full bg-[#3B613A] border-[#3B613A] hover:bg-[#4a7549]"
                disabled={loading}
              >
                {loading ? <span className="loading loading-spinner loading-sm" /> : 'Resend verification email'}
              </button>
            </form>
          )}
          <p className="text-center">
            <Link to="/login" className="link link-primary text-sm">Back to sign in</Link>
          </p>
        </div>
      </AuthLayout>
    );
  }

  return null;
}
