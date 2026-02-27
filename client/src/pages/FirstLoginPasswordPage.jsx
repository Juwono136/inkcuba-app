import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FiLock } from 'react-icons/fi';
import Navbar from '../components/layout/Navbar';
import FormInput from '../common/FormInput';
import { updatePasswordAfterLogin } from '../features/auth/authSlice';
import toast from 'react-hot-toast';

const passwordHint =
  'Minimum 8 characters, with at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character (e.g. Admin123!).';

export default function FirstLoginPasswordPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, user } = useSelector((state) => state.auth);
  const [form, setForm] = useState({ password: '', confirm: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      toast.error('Password confirmation does not match.');
      return;
    }
    try {
      await dispatch(updatePasswordAfterLogin({ newPassword: form.password })).unwrap();
      toast.success('Password updated. Welcome to your dashboard.');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      toast.error(err || 'Failed to update password');
    }
  };

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />
      <main className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-base-100 rounded-2xl border border-base-200/70 shadow-sm p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-[#3B613A]/10 flex items-center justify-center">
              <FiLock className="w-5 h-5 text-[#3B613A]" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-[#303030]">
                Set your new password
              </h1>
              <p className="text-sm text-[#303030]/60">
                For security, you need to create a new password before accessing your dashboard.
              </p>
            </div>
          </div>
          {user?.email && (
            <p className="mb-4 text-sm text-[#303030]/70">
              Account:{' '}
              <span className="font-medium text-[#303030] break-all">
                {user.email}
              </span>
            </p>
          )}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <FormInput
              label="New password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
              showPasswordToggle
              autoComplete="new-password"
            />
            <FormInput
              label="Confirm new password"
              name="confirm"
              type="password"
              value={form.confirm}
              onChange={handleChange}
              required
              showPasswordToggle
              autoComplete="new-password"
            />
            <p className="text-xs text-[#303030]/60 leading-relaxed">{passwordHint}</p>
            <button
              type="submit"
              className="btn w-full mt-2 bg-[#3B613A] border-[#3B613A] hover:bg-[#4a7549] text-white rounded-xl"
              disabled={loading}
            >
              {loading ? (
                <span className="loading loading-spinner loading-sm" />
              ) : (
                'Save password and continue'
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

