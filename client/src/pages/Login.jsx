import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { login } from '../features/auth/authSlice'
import Navbar from '../common/Navbar'
import Footer from '../common/Footer'
import { FaEnvelope, FaLock } from 'react-icons/fa'

const Login = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { selectedRole } = useSelector((state) => state.auth)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    agreeToTerms: false,
  })

  // Redirect to select-role if no role is selected
  useEffect(() => {
    if (!selectedRole) {
      navigate('/select-role')
    }
  }, [selectedRole, navigate])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // For now, just set authenticated state
    // In a real app, you would validate credentials with the backend
    if (formData.email && formData.password && formData.agreeToTerms) {
      dispatch(login({ email: formData.email }))
      navigate('/student-dashboard')
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow flex items-center justify-center py-16 px-4 lg:px-8">
        <div className="w-full max-w-md">
          <div className="bg-base-100 rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold mb-2 text-base-content">
              Login Account{selectedRole && <span className="text-base-content/70 font-normal"> ({selectedRole})</span>}
            </h1>
            <p className="text-base-content/70 mb-6">
              Enter details of existing account!
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Input */}
              <div>
                <label className="label">
                  <span className="label-text">Email Address</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    className="input input-bordered w-full pr-10"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                  <FaEnvelope className="absolute right-3 top-1/2 transform -translate-y-1/2 text-base-content/50" />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="label">
                  <span className="label-text">Password</span>
                </label>
                <div className="relative">
                  <input
                    type="password"
                    name="password"
                    placeholder="Enter your password"
                    className="input input-bordered w-full pr-10"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <FaLock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-base-content/50" />
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  name="agreeToTerms"
                  className="checkbox checkbox-sm mt-1"
                  checked={formData.agreeToTerms}
                  onChange={handleChange}
                  required
                />
                <label className="label cursor-pointer">
                  <span className="label-text text-sm">
                    I agree to the{' '}
                    <Link to="/terms" className="link text-black">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy" className="link text-black">
                      Privacy Policy
                    </Link>
                  </span>
                </label>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                className="btn bg-black text-white hover:bg-black/90 w-full"
              >
                Login Account
              </button>
            </form>

            {/* Sign Up Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-base-content/70">
                Don't have an account?{' '}
                <Link to="/select-role" className="link text-black font-semibold">
                  Get Started
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default Login

