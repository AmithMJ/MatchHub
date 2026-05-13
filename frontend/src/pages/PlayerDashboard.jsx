import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';
import { User, Trophy, ShieldCheck, MapPin, Calendar, CreditCard, ChevronRight, MessageSquare, Info } from 'lucide-react';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="premium-glass p-5 flex items-center gap-4 border-white/5">
    <div className={`p-3 rounded-2xl ${color} bg-opacity-10`}>
      <Icon className={color.replace('bg-', 'text-')} size={22} />
    </div>
    <div>
      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-0.5">{title}</p>
      <p className="text-xl font-black text-white tracking-tighter">{value}</p>
    </div>
  </div>
);

const PlayerDashboard = () => {
  const phone = localStorage.getItem('user_phone'); // Assuming we store this on login
  
  const { data: status, isLoading } = useQuery({
    queryKey: ['player-status', phone],
    queryFn: async () => {
      const response = await api.get(`/players/status/${phone}`);
      return response.data;
    },
    enabled: !!phone
  });

  if (isLoading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>;

  if (!status) return (
    <div className="p-8 text-center">
      <div className="w-20 h-20 bg-rose-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-rose-500/20">
        <Info className="text-rose-500" size={40} />
      </div>
      <h3 className="text-2xl font-black text-white uppercase mb-2">No Profile Found</h3>
      <p className="text-slate-400 text-sm">Please register for the tournament to see your dashboard.</p>
    </div>
  );

  return (
    <div className="pb-32 px-5 pt-8 max-w-2xl mx-auto space-y-8">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">Player <span className="text-emerald-400">Hub</span></h2>
          <p className="text-emerald-500/60 text-[10px] font-black uppercase tracking-[0.2em] mt-2">Welcome back, {status.player_name.split(' ')[0]}</p>
        </div>
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center overflow-hidden">
           {status.photo_url ? (
             <img src={status.photo_url} className="w-full h-full object-cover" alt="Profile" onError={(e) => e.target.style.display = 'none'} />
           ) : (
             <User className="text-emerald-400" size={28} />
           )}
        </div>
      </div>

      {/* Status Hero */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`premium-glass p-8 relative overflow-hidden border-2 ${
          status.payment_status === 'Approved' ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-amber-500/30 bg-amber-500/5'
        }`}
      >
        <div className="absolute -right-10 -top-10 opacity-5 rotate-12">
          <ShieldCheck size={180} />
        </div>
        <div className="flex flex-col items-center text-center relative z-10">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mb-2">Entry Status</p>
          <h3 className={`text-5xl font-black tracking-tighter mb-4 ${
            status.payment_status === 'Approved' ? 'text-emerald-400' : 'text-amber-400'
          }`}>
            {status.payment_status}
          </h3>
          <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/5">
            <div className={`w-2 h-2 rounded-full animate-pulse ${
              status.payment_status === 'Approved' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,1)]' : 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,1)]'
            }`} />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">
              {status.payment_status === 'Approved' ? 'Verified for Tournament' : 'Awaiting Organizer Check'}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard title="Squad" value={status.team_name} icon={Trophy} color="bg-amber-500" />
        <StatCard title="Role" value={status.role} icon={ShieldCheck} color="bg-emerald-500" />
        <StatCard title="Jersey" value={`#${status.jersey_no}`} icon={CreditCard} color="bg-indigo-500" />
        <StatCard title="Joined" value={new Date(status.created_at).toLocaleDateString()} icon={Calendar} color="bg-slate-500" />
      </div>

      {/* Quick Links */}
      <div className="space-y-4">
        <h4 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
          Next Steps <ChevronRight size={14} className="text-emerald-500" />
        </h4>
        <div className="space-y-3">
          <button className="w-full premium-glass p-5 flex items-center justify-between group border-white/5 hover:bg-emerald-500/5 transition-all">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/5 rounded-xl group-hover:bg-emerald-500/20 transition-colors">
                <MessageSquare className="text-emerald-400" size={20} />
              </div>
              <div className="text-left">
                <p className="text-sm font-black text-white">Join Squad Chat</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Connect with teammates</p>
              </div>
            </div>
            <ChevronRight className="text-slate-700 group-hover:text-emerald-400 transition-all" size={20} />
          </button>
          
          <button className="w-full premium-glass p-5 flex items-center justify-between group border-white/5 hover:bg-emerald-500/5 transition-all">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/5 rounded-xl group-hover:bg-emerald-500/20 transition-colors">
                <MapPin className="text-emerald-400" size={20} />
              </div>
              <div className="text-left">
                <p className="text-sm font-black text-white">Tournament Venue</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Get directions & details</p>
              </div>
            </div>
            <ChevronRight className="text-slate-700 group-hover:text-emerald-400 transition-all" size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlayerDashboard;
