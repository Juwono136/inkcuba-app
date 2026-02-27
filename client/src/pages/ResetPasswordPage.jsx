import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import AuthLayout from '../components/layout/AuthLayout';
import FormInput from '../common/FormInput';
import { resetPassword, clearError } from '../features/auth/authSlice';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);
  const [form, setForm] = useState({ newPassword: '', confirmPassword: '' });
  const [localError, setLocalError] = useState({});

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (localError[e.target.name]) setLocalError((prev) => ({ ...prev, [e.target.name]: '' }));
  };

  const validate = () => {
    const err = {};
    if (!form.newPassword) err.newPassword = 'Password is required';
    else if (form.newPassword.length < 8) err.newPassword = 'Password must be at least 8 characters';
    if (form.newPassword !== form.confirmPassword) err.confirmPassword = 'Passwords do not match';
    setLocalError(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.error('Invalid reset link. Please request a new one.');
      return;
    }
    if (!validate()) return;
    const result = await dispatch(resetPassword({ token, newPassword: form.newPassword }));
    if (resetPassword.fulfilled.match(result)) {
      toast.success('Password updated. You are now signed in.');
      navigate('/dashboard', { replace: true });
    }
  };

  if (!token) {
    return (
      <AuthLayout title="Invalid link" subtitle="This reset link is missing or invalid">
        <div className="space-y-5 text-center">
          <p className="text-base-content/80 text-sm">Please request a new password reset from the sign-in page.</p>
          <div className="flex flex-col gap-2 pt-2">
            <Link to="/forgot-password" className="btn w-full bg-[#3B613A] border-[#3B613A] hover:bg-[#4a7549] text-base-100 rounded-xl h-12 font-medium">Request new link</Link>
            <Link to="/login" className="btn btn-ghost">Back to sign in</Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Set new password" subtitle="Choose a secure password for your account" loading={loading}>
      {!loading && (
        <form onSubmit={handleSubmit} className="space-y-5">
          <FormInput
            label="New password"
            type="password"
            name="newPassword"
            value={form.newPassword}
            onChange={handleChange}
            placeholder="Min. 8 characters"
            error={localError.newPassword}
            required
            autoComplete="new-password"
            showPasswordToggle
          />
          <FormInput
            label="Confirm new password"
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder="Repeat password"
            error={localError.confirmPassword}
            required
            autoComplete="new-password"
            showPasswordToggle
          />
          <button
            type="submit"
            className="btn w-full bg-[#3B613A] border-[#3B613A] hover:bg-[#4a7549] text-base-100 font-medium rounded-xl h-12"
            disabled={loading}
          >
            {loading ? <span className="loading loading-spinner loading-sm" /> : 'Reset password'}
          </button>
          <p className="text-center pt-2">
            <Link to="/login" className="link link-primary text-sm text-[#3B613A]">Back to sign in</Link>
          </p>
        </form>
      )}
    </AuthLayout>
  );
}
