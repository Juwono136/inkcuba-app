import { useState, useEffect } from 'react';
import { Link, useNavigate, Navigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import AuthLayout from '../components/layout/AuthLayout';
import FormInput from '../common/FormInput';
import { login, clearError } from '../features/auth/authSlice';

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);
  const [form, setForm] = useState({ email: '', password: '' });

  useEffect(() => {
    const message = location.state?.message;
    if (message) {
      toast.success(message);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state?.message, location.pathname, navigate]);

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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(login(form));
    if (login.fulfilled.match(result)) {
      toast.success('Welcome back!');
      navigate('/dashboard', { replace: true });
    }
  };

  return (
    <AuthLayout title="Sign in" subtitle="Enter your credentials to access your account" loading={loading}>
      {!loading && (
        <form onSubmit={handleSubmit} className="space-y-5">
          <FormInput
            label="Email"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            required
            autoComplete="email"
          />
          <FormInput
            label="Password"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="••••••••"
            required
            autoComplete="current-password"
            showPasswordToggle
          />
          <div className="text-right">
            <Link to="/forgot-password" className="link link-primary text-sm text-[#3B613A] hover:text-[#4a7549]">
              Forgot password?
            </Link>
          </div>
          <button
            type="submit"
            className="btn w-full bg-[#3B613A] border-[#3B613A] hover:bg-[#4a7549] text-base-100 font-medium rounded-xl h-12"
            disabled={loading}
          >
            Sign in
          </button>
        </form>
      )}
    </AuthLayout>
  );
}
