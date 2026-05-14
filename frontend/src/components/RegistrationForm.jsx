import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery } from '@tanstack/react-query';
import api from '../utils/api';
import { Camera, Upload, CheckCircle2, ChevronRight, ChevronLeft, ShieldCheck, Trophy, Phone, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Configuration for Tournament Details (Dynamic)
const getTournamentConfig = () => {
  const saved = localStorage.getItem('tournament_settings');
  const defaults = {
    registrationFee: "₹500.00",
    upiId: "tournament@upi",
    qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=tournament@upi&pn=MatchHub&am=500"
  };
  const config = saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
  if (config.qrCodeUrl && !config.qrCodeUrl.startsWith('http')) {
    config.qrCodeUrl = `${import.meta.env.VITE_API_URL || ''}${config.qrCodeUrl}`;
  }
  return config;
};

const RegistrationForm = () => {
  const TOURNAMENT_CONFIG = getTournamentConfig();
  const [step, setStep] = useState(1);
  const [previews, setPreviews] = useState({ photo: null, payment_screenshot: null });
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm();

  // Manually register file fields
  React.useEffect(() => {
    register('photo', { required: true });
    register('payment_screenshot', { required: true });
  }, [register]);

  const { data: teams } = useQuery({
    queryKey: ['teams'],
    queryFn: async () => {
      const response = await api.get('/teams');
      return response.data;
    },
  });

  const mutation = useMutation({
    mutationFn: (formData) => api.post('/players/register', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    onSuccess: () => setStep(4),
    onError: (err) => {
      const detail = err.response?.data?.detail;
      alert(typeof detail === 'string' ? detail : (Array.isArray(detail) ? detail[0].msg : 'Registration failed'));
    }
  });

  const handleImageChange = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      setValue(field, file, { shouldValidate: true });
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews(prev => ({ ...prev, [field]: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (data) => {
    const formData = new FormData();
    // Explicitly add all fields to ensure files are included
    Object.keys(data).forEach(key => {
      if (data[key] !== undefined && data[key] !== null) {
        formData.append(key, data[key]);
      }
    });
    
    // Debug check: ensure files are present
    if (!data.photo || !data.payment_screenshot) {
      alert("Please make sure both photos are uploaded before submitting.");
      return;
    }

    mutation.mutate(formData);
  };

  return (
    <div className="pb-32 px-5 pt-4 max-w-lg mx-auto">
      <div className="mb-10">
        <h2 className="text-2xl font-black text-white tracking-tighter uppercase mb-6">Tournament Entry</h2>
        <div className="flex gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex-1">
              <div className={`h-2 rounded-full mb-2 transition-all duration-700 ${step >= i ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-emerald-950/50'}`} />
              <p className={`text-[10px] font-black uppercase text-center tracking-widest ${step >= i ? 'text-emerald-400' : 'text-emerald-900/40'}`}>Step 0{i}</p>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="premium-glass p-8 flex flex-col items-center border-emerald-500/10">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-3xl bg-emerald-950 border-2 border-dashed border-emerald-500/20 flex items-center justify-center relative overflow-hidden transition-all group-hover:border-emerald-500/50">
                    {previews.photo ? (
                      <img src={previews.photo} className="w-full h-full object-cover" alt="Preview" />
                    ) : (
                      <Camera className="text-emerald-800 group-hover:text-emerald-400 transition-colors" size={40} />
                    )}
                    <input
                      type="file"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={(e) => handleImageChange(e, 'photo')}
                      accept="image/*"
                    />
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-emerald-500 p-2.5 rounded-2xl shadow-[0_4px_15px_rgba(16,185,129,0.4)] border-2 border-emerald-950">
                    <Upload size={16} className="text-white" />
                  </div>
                </div>
                <p className="text-[10px] text-emerald-400 mt-6 uppercase font-black tracking-[0.25em]">Player Identity Card</p>
              </div>

              <div className="space-y-4">
                <div className="premium-glass p-1 focus-within:ring-2 ring-emerald-500/50 transition-all rounded-2xl border-emerald-500/5">
                  <input
                    {...register('player_name', { required: true })}
                    className="w-full bg-transparent border-none px-6 py-5 focus:outline-none font-bold placeholder:text-emerald-100/30 text-white"
                    placeholder="Full Name"
                  />
                </div>

                <div className="premium-glass p-1 focus-within:ring-2 ring-emerald-500/50 transition-all rounded-2xl border-emerald-500/5 flex items-center">
                  <Lock className="ml-4 text-emerald-800" size={18} />
                  <input
                    type="password"
                    {...register('password', { required: true })}
                    className="w-full bg-transparent border-none px-4 py-5 focus:outline-none font-bold placeholder:text-emerald-100/30 text-white"
                    placeholder="Create Password (for Login)"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="premium-glass p-1 focus-within:ring-2 ring-emerald-500/50 transition-all rounded-2xl border-emerald-500/5">
                    <input
                      {...register('phone', { required: true })}
                      className="w-full bg-transparent border-none px-6 py-5 focus:outline-none font-bold placeholder:text-emerald-100/30 text-white"
                      placeholder="Phone"
                    />
                  </div>
                  <div className="premium-glass p-1 focus-within:ring-2 ring-emerald-500/50 transition-all rounded-2xl border-emerald-500/5">
                    <input
                      type="number"
                      {...register('age', { required: true })}
                      className="w-full bg-transparent border-none px-6 py-5 focus:outline-none font-bold placeholder:text-emerald-100/30 text-white"
                      placeholder="Age"
                    />
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setStep(2)}
                className="btn-primary w-full group py-5"
              >
                Proceed to Squad Selection
                <ChevronRight size={20} className="group-hover:translate-x-2 transition-transform" />
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-4">
                <div className="premium-glass p-1 focus-within:ring-2 ring-primary transition-all rounded-2xl">
                  <select
                    {...register('role', { required: true })}
                    className="w-full bg-transparent border-none px-5 py-4 focus:outline-none font-semibold text-slate-300"
                  >
                    <option value="" className="bg-slate-900">Select Player Role</option>
                    <option value="Batsman" className="bg-slate-900">Batsman</option>
                    <option value="Bowler" className="bg-slate-900">Bowler</option>
                    <option value="All Rounder" className="bg-slate-900">All Rounder</option>
                    <option value="Wicket Keeper" className="bg-slate-900">Wicket Keeper</option>
                  </select>
                </div>

                <div className="premium-glass p-1 focus-within:ring-2 ring-primary transition-all rounded-2xl">
                  <select
                    {...register('team_id', { required: true })}
                    className="w-full bg-transparent border-none px-5 py-4 focus:outline-none font-semibold text-slate-300"
                  >
                    <option value="" className="bg-slate-900">Join a Team</option>
                    {teams?.map(team => (
                      <option key={team.id} value={team.id} className="bg-slate-900">{team.team_name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="premium-glass p-1 focus-within:ring-2 ring-primary transition-all rounded-2xl">
                    <input
                      {...register('jersey_no', { required: true })}
                      className="w-full bg-transparent border-none px-5 py-4 focus:outline-none font-semibold placeholder:text-slate-600"
                      placeholder="Jersey No"
                    />
                  </div>
                  <div className="premium-glass p-1 focus-within:ring-2 ring-primary transition-all rounded-2xl">
                    <input
                      {...register('emergency_contact', { required: true })}
                      className="w-full bg-transparent border-none px-5 py-4 focus:outline-none font-semibold placeholder:text-slate-600"
                      placeholder="Emergency No"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button type="button" onClick={() => setStep(1)} className="premium-glass flex-1 py-4 font-bold rounded-2xl flex items-center justify-center gap-2">
                  <ChevronLeft size={18} /> Back
                </button>
                <button type="button" onClick={() => setStep(3)} className="btn-primary flex-[2]">
                  Payment Step <ChevronRight size={18} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="premium-glass p-8 bg-gradient-to-br from-emerald-500/10 via-transparent to-amber-500/5 relative overflow-hidden border-emerald-500/10">
                <div className="absolute top-0 right-0 p-4 opacity-5 text-emerald-500">
                  <ShieldCheck size={120} />
                </div>
                <h3 className="text-xl font-black mb-6 flex items-center gap-2 text-white uppercase tracking-tighter">
                  Secure Payment <ShieldCheck className="text-emerald-400" size={20} />
                </h3>
                
                <div className="bg-white p-6 rounded-3xl mb-8 flex flex-col items-center shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
                  <div className="w-48 h-48 bg-slate-50 flex items-center justify-center border-2 border-slate-100 rounded-2xl overflow-hidden">
                    <img 
                      src={TOURNAMENT_CONFIG.qrCodeUrl} 
                      alt="Payment QR Code" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="mt-6 text-center">
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.25em] mb-1">Registration Fee</p>
                    <p className="text-4xl font-black text-slate-900 tracking-tighter">{TOURNAMENT_CONFIG.registrationFee}</p>
                    <div className="mt-4 px-5 py-2.5 bg-slate-100 rounded-xl flex items-center gap-2 text-slate-600 font-bold text-xs cursor-pointer active:scale-95 transition-all hover:bg-slate-200">
                      <Phone size={14} className="text-emerald-600" /> {TOURNAMENT_CONFIG.upiId}
                    </div>
                  </div>
                </div>

                <div className="relative h-52 rounded-3xl bg-emerald-950/50 border-2 border-dashed border-emerald-500/20 flex flex-col items-center justify-center group hover:border-emerald-500/50 transition-all overflow-hidden">
                  {previews.payment_screenshot ? (
                    <img src={previews.payment_screenshot} className="w-full h-full object-contain" alt="Payment Screenshot" />
                  ) : (
                    <>
                      <div className="p-4 bg-emerald-500/10 rounded-2xl mb-3 group-hover:bg-emerald-500/20 transition-colors">
                        <Upload className="text-emerald-400" />
                      </div>
                      <span className="text-[10px] text-emerald-500/60 font-black uppercase tracking-widest group-hover:text-emerald-400 transition-colors">Upload Payment Screenshot</span>
                    </>
                  )}
                  <input
                    type="file"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) => handleImageChange(e, 'payment_screenshot')}
                    accept="image/*"
                    required
                  />
                </div>
              </div>

              <div className="flex items-start gap-4 px-3">
                <input type="checkbox" className="mt-1 w-6 h-6 rounded-lg accent-emerald-500 bg-emerald-950/50 border-emerald-500/20" required />
                <span className="text-[11px] text-emerald-100/40 font-medium leading-relaxed">
                  I certify that I am physically fit to participate and agree to the tournament's code of conduct.
                </span>
              </div>

              <div className="flex gap-4">
                <button type="button" onClick={() => setStep(2)} className="premium-glass flex-1 py-4 font-bold rounded-2xl">
                  Back
                </button>
                <button 
                  type="submit" 
                  disabled={mutation.isLoading}
                  className="btn-primary flex-[2] bg-accent shadow-accent/20"
                >
                  {mutation.isLoading ? 'Verifying...' : 'Complete Entry'}
                </button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <div className="w-24 h-24 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_40px_rgba(16,185,129,0.2)]">
                <CheckCircle2 size={56} className="animate-pulse" />
              </div>
              <h2 className="text-3xl font-extrabold mb-4 text-white">Welcome to the League!</h2>
              <p className="text-slate-400 mb-10 px-6 font-medium leading-relaxed">
                Your registration is locked in. We're verifying your payment and you'll receive a confirmation soon.
              </p>
              <button 
                type="button" 
                onClick={() => window.location.href = '/'} 
                className="btn-primary w-full"
              >
                Go to Dashboard
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </div>
  );
};

export default RegistrationForm;
