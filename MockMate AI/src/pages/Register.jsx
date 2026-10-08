import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, ArrowRight } from 'lucide-react';
import InputField from '../components/InputField';
import Button from '../components/Button';

const Register = () => {
  const { register, showToast, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true });
  }, [isAuthenticated, navigate]);

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Email address is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = 'Please enter a valid email address';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8)
      newErrors.password = 'Password must be at least 8 characters';
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match';
    if (!formData.acceptTerms)
      newErrors.acceptTerms = 'You must accept the terms and conditions';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await register(formData.name, formData.email, formData.password);
      navigate('/dashboard');
    } catch (err) {
      showToast(err.message || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen hero-mesh text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      <div className="absolute inset-0 hero-grid opacity-70 pointer-events-none" />

      <div className="max-w-lg w-full relative z-10 my-8">
        <div
          className="flex flex-col items-center mb-8 cursor-pointer rise-in"
          onClick={() => navigate('/')}
        >
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-400 to-teal-700 flex items-center justify-center shadow-xl shadow-teal-900/40 mb-4">
            <span className="font-heading text-2xl text-white pt-0.5">M</span>
          </div>
          <h1 className="font-heading text-4xl text-white tracking-tight">MockMate</h1>
          <p className="text-xs text-slate-400 mt-2 tracking-wide">
            Create your practice account
          </p>
        </div>

        <div className="auth-card rise-in rise-in-delay-1">
          <form onSubmit={handleSubmit} className="auth-form">
            <InputField
              label="Full Name"
              name="name"
              type="text"
              placeholder="e.g. Kavya Sharma"
              icon={User}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              error={errors.name}
              darkMode
              required
            />

            <InputField
              label="Email Address"
              name="email"
              type="email"
              placeholder="name@example.com"
              icon={Mail}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              error={errors.email}
              darkMode
              required
            />

            <InputField
              label="Password"
              name="password"
              type="password"
              placeholder="At least 8 characters"
              icon={Lock}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              error={errors.password}
              darkMode
              required
            />

            <InputField
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              placeholder="Re-enter password"
              icon={Lock}
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
              error={errors.confirmPassword}
              darkMode
              required
            />

            <div className="pt-1 pb-2 space-y-2">
              <label className="flex items-start gap-3 cursor-pointer text-sm text-slate-300 leading-relaxed">
                <input
                  type="checkbox"
                  checked={formData.acceptTerms}
                  onChange={(e) =>
                    setFormData({ ...formData, acceptTerms: e.target.checked })
                  }
                  className="mt-1 w-4 h-4 shrink-0 rounded border-slate-600 bg-slate-950 text-teal-600 focus:ring-teal-500"
                />
                <span>
                  I agree to the Terms of Service and Privacy Policy.
                </span>
              </label>
              {errors.acceptTerms && (
                <p className="text-xs text-rose-400 font-semibold">{errors.acceptTerms}</p>
              )}
            </div>

            <div className="pt-3">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={loading}
                icon={ArrowRight}
                className="shimmer-effect py-3.5"
              >
                Create account
              </Button>
            </div>
          </form>

          <div className="mt-8 text-center text-sm text-slate-400 pt-6 border-t border-white/10">
            Already have an account?{' '}
            <Link to="/login" className="text-teal-300 hover:text-teal-200 font-semibold ml-1">
              Sign in
            </Link>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link
            to="/"
            className="text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            ← Back to homepage
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
