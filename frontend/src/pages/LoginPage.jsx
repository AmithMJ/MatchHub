import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import api from '../utils/api';
import { Phone, Lock, LogIn, UserPlus, AlertCircle, ShieldCheck, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSpinner from '../components/LoadingSpinner';

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const { register, handleSubmit, formState: { errors } } = useForm();

  const loginMutation = useMutation({
    mutationFn: (data) => api.post('/auth/login', data),
    onSuccess: (response) => {
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('role', response.data.role);
      localStorage.setItem('user_phone', response.data.phone);
      window.location.href = response.data.role === 'organizer' ? '/' : '/player-dashboard';
    },
    onError: (err) => {
      const detail = err.response?.data?.detail;
      setError(typeof detail === 'string' ? detail : (Array.isArray(detail) ? detail[0].msg : 'Authentication failed'));
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data) => api.post('/auth/register', { ...data, role: 'organizer' }),
    onSuccess: () => {
      setIsLogin(true);
      setError('Registration successful! Please login.');
    },
    onError: (err) => {
      const detail = err.response?.data?.detail;
      setError(typeof detail === 'string' ? detail : (Array.isArray(detail) ? detail[0].msg : 'Registration failed'));
    },
  });

  const onSubmit = (data) => {
    setError('');
    if (isLogin) {
      loginMutation.mutate(data);
    } else {
      registerMutation.mutate(data);
    }
  };

  const isPending = loginMutation.isPending || registerMutation.isPending;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 relative overflow-hidden">
      {isPending && <LoadingSpinner fullPage={true} />}

      {/* Animated Background Orbs */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-emerald-500/5 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-amber-500/5 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[40%] left-[60%] w-[300px] h-[300px] rounded-full bg-indigo-500/5 blur-[100px] animate-pulse" style={{ animationDelay: '4s' }} />
      </div>

      {/* Brand Header */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">
            {isLogin ? 'Admin Login' : 'Create Admin'}
          </h2>
          <p className="text-emerald-500/40 font-medium text-sm mt-2">
            {isLogin ? 'Access MatchHub Organizer Dashboard' : 'Set up your tournament control center'}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl flex items-center gap-3 text-rose-500 text-xs font-bold"
              >
                <AlertCircle size={16} /> {error}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-4">
            <div className="premium-glass p-1 focus-within:ring-2 ring-emerald-500/50 transition-all rounded-2xl flex items-center border-emerald-500/10">
              <Phone className="ml-4 text-emerald-800" size={18} />
              <input
                {...register('phone', { required: true })}
                className="w-full bg-transparent border-none px-4 py-4 focus:outline-none font-bold placeholder:text-emerald-100/30 text-white"
                placeholder="Mobile Number"
              />
            </div>

            <div className="premium-glass p-1 focus-within:ring-2 ring-emerald-500/50 transition-all rounded-2xl flex items-center border-emerald-500/10">
              <Lock className="ml-4 text-emerald-800" size={18} />
              <input
                type="password"
                {...register('password', { required: true })}
                className="w-full bg-transparent border-none px-4 py-4 focus:outline-none font-bold placeholder:text-emerald-100/30 text-white"
                placeholder="Password"
              />
            </div>

            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="premium-glass p-1 focus-within:ring-2 ring-amber-500/50 transition-all rounded-2xl flex items-center border-amber-500/10"
              >
                <ShieldCheck className="ml-4 text-amber-800" size={18} />
                <input
                  type="password"
                  {...register('admin_key', { required: !isLogin })}
                  className="w-full bg-transparent border-none px-4 py-4 focus:outline-none font-bold placeholder:text-amber-100/30 text-white"
                  placeholder="Master Admin Key"
                />
              </motion.div>
            )}
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={loginMutation.isLoading || registerMutation.isLoading}
            className={`btn-primary w-full mt-4 ${!isLogin && 'bg-amber-500 shadow-amber-500/20'}`}
          >
            {isLogin ? (loginMutation.isLoading ? 'Authenticating...' : 'Sign In') : (registerMutation.isLoading ? 'Creating...' : 'Register Organizer')}
          </motion.button>
        </form>

        <div className="mt-8 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-slate-500 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors"
          >
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
