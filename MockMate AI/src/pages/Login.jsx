import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import InputField from '../components/InputField';
import Button from '../components/Button';

const Login = () => {
  const { login, showToast, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: true,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true });
  }, [isAuthenticated, navigate]);

  const validate = () => {
    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = 'Email address is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = 'Please enter a valid email address';
    if (!formData.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (err) {
      showToast(err.message || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen hero-mesh text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      <div className="absolute inset-0 hero-grid opacity-70 pointer-events-none" />

      <div className="max-w-md w-full relative z-10 my-8">
        <div
          className="flex flex-col items-center mb-8 cursor-pointer rise-in"
          onClick={() => navigate('/')}
        >
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-400 to-teal-700 flex items-center justify-center shadow-xl shadow-teal-900/40 mb-4">
            <span className="font-heading text-2xl text-white pt-0.5">M</span>
          </div>
          <h1 className="font-heading text-4xl text-white tracking-tight">MockMate</h1>
          <p className="text-xs text-slate-400 mt-2 tracking-wide">
            Sign in to continue your practice
          </p>
        </div>

        <div className="auth-card rise-in rise-in-delay-1">
          <form onSubmit={handleSubmit} className="auth-form">
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
              placeholder="••••••••"
              icon={Lock}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              error={errors.password}
              darkMode
              required
            />

            <div className="flex items-center justify-between text-sm my-2 px-0.5">
              <label className="flex items-center gap-2.5 cursor-pointer text-slate-300 font-medium">
                <input
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={(e) =>
                    setFormData({ ...formData, rememberMe: e.target.checked })
                  }
                  className="rounded border-slate-600 bg-slate-950 text-teal-600 focus:ring-teal-500 w-4 h-4"
                />
                <span>Remember me</span>
              </label>
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
                Sign in
              </Button>
            </div>
          </form>

          <div className="mt-8 text-center text-sm text-slate-400 pt-6 border-t border-white/10">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-teal-300 hover:text-teal-200 font-semibold ml-1">
              Create account
            </Link>
          </div>
        </div>

        <div className="mt-8 text-center rise-in rise-in-delay-2">
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

export default Login;
