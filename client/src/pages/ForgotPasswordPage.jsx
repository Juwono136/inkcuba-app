import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import AuthLayout from '../components/layout/AuthLayout';
import FormInput from '../common/FormInput';
import { forgotPassword, clearError } from '../features/auth/authSlice';

export default function ForgotPasswordPage() {
  const dispatch = useDispatch();
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email?.trim()) {
      toast.error('Please enter your email');
      return;
    }
    const result = await dispatch(forgotPassword({ email: email.trim().toLowerCase() }));
    if (forgotPassword.fulfilled.match(result)) {
      setSubmitted(true);
      toast.success('A password reset link has been sent to your email.');
    }
  };

  if (submitted) {
    return (
      <AuthLayout title="Check your email" subtitle="We sent a password reset link to your email address">
        <div className="space-y-5 text-center">
          <p className="text-base-content/80 text-sm leading-relaxed">
            Please check your inbox and spam folder. Use the link in the email to set a new password.
          </p>
          <div className="flex flex-col gap-2 pt-2">
            <Link to="/login" className="btn btn-ghost">Back to sign in</Link>
            <button
              type="button"
              className="btn w-full bg-[#3B613A] border-[#3B613A] hover:bg-[#4a7549] text-base-100 rounded-xl h-12 font-medium"
              onClick={() => { setSubmitted(false); setEmail(''); }}
            >
              Send another link
            </button>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Forgot password?" subtitle="Enter your email and we'll send you a reset link" loading={loading}>
      {!loading && (
        <form onSubmit={handleSubmit} className="space-y-5">
          <FormInput
            label="Email"
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            autoComplete="email"
          />
          <button
            type="submit"
            className="btn w-full bg-[#3B613A] border-[#3B613A] hover:bg-[#4a7549] text-base-100 font-medium rounded-xl h-12"
            disabled={loading}
          >
            {loading ? (
              <span className="loading loading-spinner loading-sm" />
            ) : (
              'Send reset link'
            )}
          </button>
          <p className="text-center pt-2">
            <Link to="/login" className="link link-primary text-sm text-[#3B613A]">Back to sign in</Link>
          </p>
        </form>
      )}
    </AuthLayout>
  );
}
