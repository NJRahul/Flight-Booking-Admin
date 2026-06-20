import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { Mail, Lock, Eye, EyeOff, Shield, Loader2, KeyRound } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { authApi } from '../../api/axios';
import { loginSchema } from '../../utils/validators';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, user } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') navigate('/admin', { replace: true });
    else if (isAuthenticated && user?.role !== 'admin') {
      toast.error('You do not have admin access.');
    }
  }, [isAuthenticated, user, navigate]);

  const { register, handleSubmit, formState: { errors }, setFocus, setValue } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const fillDemoCredentials = () => {
    setValue('email', 'admin@flightbook.com');
    setValue('password', 'Admin@1234');
  };

  useEffect(() => { setFocus('email'); }, [setFocus]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const res = await authApi.post('/login', data);
      const { token, user: userData } = res.data;

      if (userData.role !== 'admin') {
        toast.error('Access denied. Admin credentials required.');
        setIsSubmitting(false);
        return;
      }

      login(userData, token);
      toast.success(`Welcome, ${userData.name.split(' ')[0]}!`);
      navigate('/admin', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-600 rounded-2xl mb-4 shadow-lg">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">FlightBook Admin</h1>
          <p className="text-slate-400 text-sm mt-1">Sign in to access the admin dashboard</p>
        </div>

        {/* Demo credentials */}
        <button
          type="button"
          onClick={fillDemoCredentials}
          className="w-full mb-4 flex items-center gap-3 bg-slate-800/60 border border-slate-700 hover:border-primary-500/50 hover:bg-slate-800 rounded-xl px-4 py-3 transition-all group"
        >
          <div className="flex-shrink-0 w-8 h-8 bg-primary-600/20 rounded-lg flex items-center justify-center group-hover:bg-primary-600/30 transition-colors">
            <KeyRound className="w-4 h-4 text-primary-400" />
          </div>
          <div className="text-left flex-1">
            <p className="text-xs font-semibold text-slate-300 mb-0.5">Demo Admin Credentials</p>
            <p className="text-xs text-slate-500 font-mono">admin@flightbook.com · Admin@1234</p>
          </div>
          <span className="text-xs text-primary-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity">Click to fill</span>
        </button>

        {/* Card */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  {...register('email')}
                  type="email"
                  autoComplete="email"
                  placeholder="admin@flightbook.com"
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-700 border rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
                    errors.email
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-slate-600 focus:ring-primary-500 focus:border-transparent'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-10 py-2.5 bg-slate-700 border rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
                    errors.password
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-slate-600 focus:ring-primary-500 focus:border-transparent'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Signing in…</>
              ) : (
                <><Shield className="w-4 h-4" /> Sign In to Admin</>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-500 mt-6">
          Admin access only — unauthorised logins are logged.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
