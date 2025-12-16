import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginUser, reset } from "../features/auth/authSlice";
import FormInput from "../components/common/FormInput";
import MainLayout from "../components/layout/MainLayout";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const { email, password } = formData;

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isLoading, isError, isSuccess, message } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isError) {
      toast.error(message);
      dispatch(reset());
    }
    if (isSuccess || user) {
      if (isSuccess) toast.success("Welcome back!");
      navigate("/dashboard");
      dispatch(reset());
    }
  }, [user, isError, isSuccess, message, navigate, dispatch]);

  const onChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter both email and password");
      return;
    }
    dispatch(loginUser({ email, password }));
  };

  return (
    <MainLayout>
      <div className="grow flex items-center justify-center bg-[#F9FAFB] py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background Accent (Opsional: Lingkaran samar untuk estetika) */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[#1B211A] rounded-full mix-blend-multiply filter blur-3xl opacity-[0.03] animate-blob"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-[#D4AF37] rounded-full mix-blend-multiply filter blur-3xl opacity-[0.03] animate-blob animation-delay-2000"></div>

        {/* Card Login dengan Animasi Masuk */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-105 bg-white rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] overflow-hidden border border-gray-100 relative z-10"
        >
          <div className="px-8 pt-10 pb-6 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-[#1B211A] tracking-tight">
              Welcome Back
            </h2>
            <p className="mt-2 text-sm text-gray-500">Sign in to access your InkCuba dashboard.</p>
          </div>

          <div className="px-8 pb-10">
            <form className="space-y-5" onSubmit={onSubmit}>
              <FormInput
                label="Email Address"
                type="email"
                name="email"
                value={email}
                onChange={onChange}
                placeholder="student@binus.ac.id"
                required
              />

              <div>
                <FormInput
                  label="Password"
                  type="password"
                  name="password"
                  value={password}
                  onChange={onChange}
                  placeholder="********"
                  required
                />
                {/* Forgot Password Link - Only */}
                <div className="flex justify-end mt-2">
                  <a
                    href="#"
                    className="text-sm font-semibold text-[#1B211A] hover:underline hover:text-black transition-colors"
                  >
                    Forgot password?
                  </a>
                </div>
              </div>

              {/* Submit Button dengan Animasi Klik */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-[#F1F3E0] bg-[#1B211A] hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1B211A]  transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed items-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  // Gunakan Spinner mini buatan kita sendiri, jangan spinner daisyUI bawaan
                  <div className="flex items-center gap-2">
                    {/* Kita render manual div kecil agar tidak bentrok dengan props LoadingSpinner full */}
                    <motion.div
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    <span>Signing In...</span>
                  </div>
                ) : (
                  "Sign In"
                )}
              </motion.button>
            </form>

            <div className="mt-6 border-t border-gray-100 pt-6 text-center">
              <p className="text-xs text-gray-400">
                Need an account? Please contact the{" "}
                <span className="font-semibold text-[#1B211A]">University Admin</span>.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </MainLayout>
  );
};

export default LoginPage;
