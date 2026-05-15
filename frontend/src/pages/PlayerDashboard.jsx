import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';
import { User, Trophy, ShieldCheck, MapPin, Calendar, CreditCard, ChevronRight, MessageSquare, Info, Star, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import LoadingSpinner from '../components/LoadingSpinner';

const StatCard = ({ title, value, icon: Icon, gradient, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="premium-glass p-5 flex flex-col gap-4 border-white/5 group relative overflow-hidden"
  >
    <div className={`absolute -right-3 -top-3 w-16 h-16 rounded-full opacity-5 group-hover:opacity-10 group-hover:scale-125 transition-all duration-700 ${gradient}`} />
    <div className={`p-3 rounded-2xl w-fit ${gradient} border border-white/10 shadow-xl group-hover:rotate-6 transition-transform duration-500`}>
      <Icon className="text-white" size={18} />
    </div>
    <div>
      <p className="subtext-elite mb-1">{title}</p>
      <p className="text-lg font-black text-white tracking-tighter text-elite">{value}</p>
    </div>
  </motion.div>
);

const getSafeUrl = (url, name = 'User') => {
  if (!url || url.includes('placeholder.com') || url.includes('via.placeholder')) {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff`;
  }
  if (url.startsWith('http') || url.includes('cloudinary')) return url;
  if (url.includes('/uploads/')) {
    const filename = url.split('/uploads/')[1];
    return `${import.meta.env.VITE_API_URL || ''}/uploads/${filename}`;
  }
  return `${import.meta.env.VITE_API_URL || ''}/uploads/${url}`;
};

const PlayerDashboard = () => {
  const phone = localStorage.getItem('user_phone');

  const { data: status, isLoading } = useQuery({
    queryKey: ['player-status', phone],
    queryFn: async () => {
      const response = await api.get(`/players/status/${phone}`);
      return response.data;
    },
    enabled: !!phone
  });

  if (isLoading) return <LoadingSpinner fullPage={true} />;

  if (!status) return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-8 text-center">
      <div className="w-24 h-24 bg-rose-500/5 rounded-[36px] flex items-center justify-center mx-auto mb-8 border border-rose-500/10 shadow-2xl">
        <Info className="text-rose-500" size={48} />
      </div>
      <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-3 text-elite">No Profile Found</h3>
      <p className="text-slate-500 font-bold max-w-xs mx-auto">Register for the tournament to access your personal player hub.</p>
      <a href="/tournaments" className="btn-primary mt-10 !px-10">Register Now</a>
    </div>
  );

  const isApproved = status.payment_status === 'Approved';

  return (
    <div className="pb-32 px-5 pt-6 max-w-2xl mx-auto space-y-8 relative">
      {/* Mesh Overlay */}
      <div className="mesh-overlay" />

      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="space-y-1">
          <p className="subtext-elite">Welcome back</p>
          <h2 className="text-3xl font-black tracking-tighter uppercase text-elite">
            {status.player_name?.split(' ')[0]} <span className="text-emerald-400">{status.player_name?.split(' ').slice(1).join(' ')}</span>
          </h2>
        </div>

        {/* Profile Avatar */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="relative"
        >
          <div className="w-16 h-16 rounded-[22px] p-[2px] bg-gradient-to-br from-emerald-500 via-amber-400 to-emerald-400 shadow-[0_10px_30px_rgba(16,185,129,0.3)]">
            <div className="w-full h-full rounded-[20px] overflow-hidden bg-slate-950">
              <img
                src={getSafeUrl(status.photo_url, status.player_name)}
                className="w-full h-full object-cover"
                alt="Profile"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(status.player_name || 'User')}&background=random`;
                }}
              />
            </div>
          </div>
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-md flex items-center justify-center border-2 border-slate-950 shadow-lg">
            <Star size={10} className="text-white fill-white" />
          </div>
        </motion.div>
      </motion.div>

      {/* Status Hero Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className={`premium-glass p-8 relative overflow-hidden border-2 ${
          isApproved
            ? 'border-emerald-500/20 shadow-[0_0_60px_rgba(16,185,129,0.08)]'
            : 'border-amber-500/20 shadow-[0_0_60px_rgba(245,158,11,0.08)]'
        }`}
      >
        {/* Glow Orb */}
        <div className={`absolute -right-16 -top-16 w-48 h-48 rounded-full blur-[60px] opacity-10 ${
          isApproved ? 'bg-emerald-500' : 'bg-amber-500'
        }`} />
        <div className="absolute -right-8 -top-8 opacity-[0.04] rotate-12">
          <ShieldCheck size={200} />
        </div>

        <div className="flex flex-col items-center text-center relative z-10 gap-4">
          <p className="subtext-elite">Entry Status</p>

          <div className={`text-6xl font-black tracking-tighter ${
            isApproved ? 'text-emerald-400' : 'text-amber-400'
          } text-elite`}>
            {status.payment_status}
          </div>

          <div className={`flex items-center gap-3 px-5 py-2.5 rounded-2xl border ${
            isApproved
              ? 'bg-emerald-500/10 border-emerald-500/20'
              : 'bg-amber-500/10 border-amber-500/20'
          }`}>
            <div className={`w-2 h-2 rounded-full animate-ping ${
              isApproved ? 'bg-emerald-500' : 'bg-amber-500'
            }`} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">
              {isApproved ? 'Verified for Tournament' : 'Awaiting Organizer Review'}
            </span>
          </div>

          {isApproved && (
            <div className="flex items-center gap-2 mt-1">
              <Zap size={12} className="text-emerald-400 fill-emerald-400" />
              <p className="text-[10px] font-black text-emerald-400/70 uppercase tracking-widest">Tournament Clearance Granted</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard title="Squad" value={status.team_name} icon={Trophy} gradient="bg-gradient-to-br from-amber-500 to-orange-600" delay={0.1} />
        <StatCard title="Role" value={status.role} icon={ShieldCheck} gradient="bg-gradient-to-br from-emerald-500 to-teal-600" delay={0.15} />
        <StatCard title="Jersey" value={`#${status.jersey_no}`} icon={CreditCard} gradient="bg-gradient-to-br from-indigo-500 to-purple-600" delay={0.2} />
        <StatCard title="Joined" value={new Date(status.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} icon={Calendar} gradient="bg-gradient-to-br from-slate-500 to-slate-700" delay={0.25} />
      </div>

      {/* Quick Links */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-xl font-black text-white uppercase tracking-tighter text-elite">Next Steps</h4>
          <ChevronRight size={18} className="text-emerald-500" />
        </div>

        <div className="space-y-4">
          {[
            { icon: MessageSquare, label: 'Join Squad Chat', sub: 'Connect with your teammates', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20 group-hover:bg-emerald-500/20' },
            { icon: MapPin, label: 'Tournament Venue', sub: 'Get directions & full details', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20 group-hover:bg-amber-500/20' },
          ].map(({ icon: Icon, label, sub, color, bg }, i) => (
            <motion.button
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="w-full premium-glass p-5 flex items-center justify-between group border-white/5 hover:border-white/10 transition-all duration-500 hover:scale-[1.01]"
            >
              <div className="flex items-center gap-5">
                <div className={`p-3.5 rounded-2xl border transition-all duration-500 ${bg}`}>
                  <Icon className={color} size={20} />
                </div>
                <div className="text-left">
                  <p className="text-sm font-black text-white group-hover:text-emerald-400 transition-colors">{label}</p>
                  <p className="subtext-elite !text-[8px] mt-1">{sub}</p>
                </div>
              </div>
              <div className="p-2 bg-white/5 rounded-xl opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                <ChevronRight className="text-emerald-400" size={18} />
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlayerDashboard;

