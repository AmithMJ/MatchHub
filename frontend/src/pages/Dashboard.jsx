import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';
import { Users, Trophy, DollarSign, Clock, TrendingUp, Calendar, ShieldCheck, MapPin, ChevronRight, AlertCircle, Settings, X, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSpinner from '../components/LoadingSpinner';

const StatCard = ({ title, value, icon: Icon, gradient, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="premium-glass p-5 relative overflow-hidden group"
  >
    <div className={`absolute -right-2 -top-2 w-16 h-16 opacity-10 group-hover:scale-110 transition-transform duration-500 rounded-full bg-white`} />
    <div className="flex items-start justify-between mb-4">
      <div className={`p-3 rounded-2xl ${gradient} shadow-lg`}>
        <Icon className="text-white" size={22} />
      </div>
      <TrendingUp size={16} className="text-emerald-400 opacity-50" />
    </div>
    <div>
      <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">{title}</p>
      <h3 className="text-3xl font-extrabold text-white tracking-tight">{value}</h3>
    </div>
  </motion.div>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const [showSettings, setShowSettings] = useState(false);
  const [showTournamentModal, setShowTournamentModal] = useState(false);
  const [settingsPreview, setSettingsPreview] = useState(null);
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await api.get('/dashboard/stats');
      return response.data;
    },
    refetchInterval: 5000,
  });

  if (isLoading) return <LoadingSpinner fullPage={true} />;

  if (!stats) return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
      <div className="p-6 bg-rose-500/10 rounded-full mb-6 border border-rose-500/20">
        <Users className="text-rose-500" size={48} />
      </div>
      <h2 className="text-2xl font-black mb-2 uppercase tracking-tight">Access Denied</h2>
      <p className="text-emerald-200/60 font-medium">Please make sure you are logged in as an Organizer.</p>
      <button onClick={() => window.location.href = '/login'} className="btn-primary mt-8">Back to Login</button>
    </div>
  );

  return (
    <div className="pb-32 px-5 pt-4 max-w-2xl mx-auto">

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 mb-10">
        <StatCard
          title="Total Admins"
          value={stats?.total_users || 0}
          icon={ShieldCheck}
          gradient="bg-gradient-to-br from-indigo-500 to-purple-700"
          delay={0.05}
        />
        <StatCard
          title="Total Players"
          value={stats?.total_players || 0}
          icon={Users}
          gradient="bg-gradient-to-br from-emerald-500 to-green-700"
          delay={0.1}
        />
        <StatCard
          title="Active Teams"
          value={stats?.total_teams || 0}
          icon={Trophy}
          gradient="bg-gradient-to-br from-emerald-400 to-teal-600"
          delay={0.2}
        />
        <StatCard
          title="Pending Pay"
          value={stats?.pending_payments || 0}
          icon={Clock}
          gradient="bg-gradient-to-br from-amber-400 to-orange-600"
          delay={0.3}
        />
        <StatCard
          title="Revenue"
          value={`₹${(stats?.approved_players || 0) * (stats?.upcoming_tournament?.entry_fee || 500)}`}
          icon={DollarSign}
          gradient="bg-gradient-to-br from-emerald-600 to-emerald-900"
          delay={0.4}
        />
      </div>

      {stats?.upcoming_tournament && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="premium-glass p-6 mb-10 border-l-4 border-emerald-500 relative overflow-hidden group shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
        >
          <div className="absolute -right-8 -bottom-8 opacity-[0.03] rotate-12 group-hover:rotate-0 transition-transform duration-700">
            <Trophy size={180} />
          </div>
          <div className="flex justify-between items-start mb-6 relative z-10">
            <div>
              <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest mb-3 inline-block border border-emerald-500/20">
                Live Tournament
              </span>
              <h2 className="text-3xl font-black text-white mb-2 leading-none">{stats.upcoming_tournament.name}</h2>
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-2 px-3 rounded-xl text-center min-w-[70px]">
              <p className="text-[10px] text-emerald-500/60 uppercase font-black">Status</p>
              <p className="text-xs font-black text-emerald-400 uppercase tracking-tighter">{stats.upcoming_tournament.status}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm mb-8 relative z-10">
            <div className="flex items-center gap-3 text-emerald-100/70 font-medium">
              <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/10"><Calendar size={18} className="text-emerald-400" /></div>
              <span>{new Date(stats.upcoming_tournament.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
            <div className="flex items-center gap-3 text-emerald-100/70 font-medium">
              <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/10"><MapPin size={18} className="text-emerald-400" /></div>
              <span>{stats.upcoming_tournament.location}</span>
            </div>
          </div>

          <div className="relative z-10">
            <div className="w-full bg-emerald-950 h-3 rounded-full overflow-hidden mb-3 border border-emerald-900">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(stats.total_teams / stats.upcoming_tournament.max_teams) * 100}%` }}
                className="h-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.5)]"
              />
            </div>
            <div className="flex justify-between text-[11px] font-black text-emerald-500/60 uppercase tracking-[0.2em]">
              <span>Registration Progress</span>
              <span className="text-white bg-emerald-500 px-2 rounded-md py-0.5">{stats.total_teams} / {stats.upcoming_tournament.max_teams}</span>
            </div>
          </div>
        </motion.div>
      )}

      <div className="space-y-6 mb-10">
        <h3 className="text-xl font-black text-white flex items-center justify-between uppercase tracking-tighter">
          Recent Activity
          <div className="flex items-center gap-1">
             <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
             <span className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">Live</span>
          </div>
        </h3>
        <div className="space-y-3">
          {stats?.recent_registrations?.map((reg, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="premium-glass p-4 border-white/5 flex items-center justify-between group hover:bg-emerald-500/5 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${
                  reg.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                }`}>
                  {reg.player_name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-black text-white leading-none mb-1">{reg.player_name}</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{reg.team_name}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${
                  reg.status === 'Approved' ? 'text-emerald-500' : 'text-amber-500'
                }`}>{reg.status}</p>
                <p className="text-[8px] text-slate-600 font-bold uppercase">{new Date(reg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </motion.div>
          ))}
          {!stats?.recent_registrations?.length && (
            <p className="text-center text-slate-500 text-xs font-medium py-10 italic">No registrations yet for this match.</p>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-xl font-black text-white flex items-center justify-between uppercase tracking-tighter">
          Quick Actions
          <div className="p-1.5 bg-emerald-500/10 rounded-lg">
            <ChevronRight size={18} className="text-emerald-500" />
          </div>
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/teams', { state: { openAddModal: true } })}
            className="btn-primary py-4 text-[10px]"
          >
            Create Squad
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowTournamentModal(true)}
            className="premium-glass p-3 font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 border-emerald-500/10 hover:bg-emerald-500/5 transition-all text-emerald-400"
          >
            Schedule Match
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowSettings(true)}
            className="premium-glass p-3 font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 border-emerald-500/10 hover:bg-emerald-500/5 transition-all text-emerald-400"
          >
            Settings
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {showTournamentModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowTournamentModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-lg premium-glass p-8 border-emerald-500/20 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Match Scheduler</h3>
                  <p className="text-emerald-500/60 text-[10px] font-black uppercase tracking-widest">Plan your next tournament</p>
                </div>
                <button onClick={() => setShowTournamentModal(false)} className="p-2 hover:bg-white/5 rounded-xl">
                  <X size={20} className="text-emerald-500" />
                </button>
              </div>

              {stats.upcoming_tournament && stats.upcoming_tournament.status === 'Open' && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl mb-8 flex items-center justify-between">
                  <div>
                    <p className="text-[9px] font-black text-emerald-500/60 uppercase mb-1">Active Tournament</p>
                    <p className="text-sm font-black text-white">{stats.upcoming_tournament.name}</p>
                  </div>
                  <button 
                    onClick={async () => {
                      if (window.confirm("Finish this tournament? This will archive it and allow scheduling the next match.")) {
                        await api.put(`/tournaments/${stats.upcoming_tournament.id}`, {
                          ...stats.upcoming_tournament,
                          status: 'Closed'
                        });
                        window.location.reload();
                      }
                    }}
                    className="px-4 py-2 bg-emerald-500 text-white text-[10px] font-black uppercase rounded-xl"
                  >
                    Finish
                  </button>
                </div>
              )}

              <form onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const data = {
                  name: formData.get('name'),
                  date: formData.get('date'),
                  location: formData.get('location'),
                  entry_fee: parseFloat(formData.get('fee')),
                  max_teams: parseInt(formData.get('max')),
                  status: 'Open'
                };
                try {
                  await api.post('/tournaments', data);
                  setShowTournamentModal(false);
                  window.location.reload();
                } catch (err) {
                  alert("Failed to schedule tournament. Check inputs.");
                }
              }} className="space-y-4">
                <div className="premium-glass p-1 border-white/5 rounded-2xl">
                  <label className="block text-[9px] font-black text-emerald-500/60 uppercase tracking-widest px-4 pt-2">Tournament Name</label>
                  <input name="name" required placeholder="e.g. Summer Cup 2026" className="w-full bg-transparent border-none px-4 pb-3 focus:outline-none font-bold text-white placeholder:text-emerald-900/40" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="premium-glass p-1 border-white/5 rounded-2xl">
                    <label className="block text-[9px] font-black text-emerald-500/60 uppercase tracking-widest px-4 pt-2">Date</label>
                    <input name="date" type="date" required className="w-full bg-transparent border-none px-4 pb-3 focus:outline-none font-bold text-white" />
                  </div>
                  <div className="premium-glass p-1 border-white/5 rounded-2xl">
                    <label className="block text-[9px] font-black text-emerald-500/60 uppercase tracking-widest px-4 pt-2">Location</label>
                    <input name="location" required placeholder="Stadium Name" className="w-full bg-transparent border-none px-4 pb-3 focus:outline-none font-bold text-white placeholder:text-emerald-900/40" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="premium-glass p-1 border-white/5 rounded-2xl">
                    <label className="block text-[9px] font-black text-emerald-500/60 uppercase tracking-widest px-4 pt-2">Entry Fee (₹)</label>
                    <input name="fee" type="number" defaultValue="500" required className="w-full bg-transparent border-none px-4 pb-3 focus:outline-none font-bold text-white" />
                  </div>
                  <div className="premium-glass p-1 border-white/5 rounded-2xl">
                    <label className="block text-[9px] font-black text-emerald-500/60 uppercase tracking-widest px-4 pt-2">Max Teams</label>
                    <input name="max" type="number" defaultValue="16" required className="w-full bg-transparent border-none px-4 pb-3 focus:outline-none font-bold text-white" />
                  </div>
                </div>
                <button type="submit" className="btn-primary w-full py-5 mt-4">
                  Start Registration
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSettings(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md premium-glass p-8 border-emerald-500/20 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Tournament Settings</h3>
                  <p className="text-emerald-500/60 text-[10px] font-black uppercase tracking-widest">Update fee & payment info</p>
                </div>
                <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
                  <AlertCircle size={20} className="text-emerald-500 rotate-45" />
                </button>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const settings = {
                  registrationFee: formData.get('fee'),
                  upiId: formData.get('upi'),
                  qrCodeUrl: settingsPreview || stats?.upcoming_tournament?.qr_url
                };
                localStorage.setItem('tournament_settings', JSON.stringify(settings));
                setShowSettings(false);
                alert('Settings saved successfully! Registration form will now show updated info.');
              }} className="space-y-6">
                <div className="space-y-4">
                  <div className="premium-glass p-1 border-white/5 focus-within:ring-2 ring-emerald-500 transition-all rounded-2xl">
                    <label className="block text-[10px] font-black text-emerald-500/60 uppercase tracking-widest px-4 pt-2">Registration Fee</label>
                    <input name="fee" defaultValue={JSON.parse(localStorage.getItem('tournament_settings'))?.registrationFee || "₹500.00"} className="w-full bg-transparent border-none px-4 pb-3 focus:outline-none font-bold text-white placeholder:text-emerald-900/40" />
                  </div>
                  <div className="premium-glass p-1 border-white/5 focus-within:ring-2 ring-emerald-500 transition-all rounded-2xl">
                    <label className="block text-[10px] font-black text-emerald-500/60 uppercase tracking-widest px-4 pt-2">UPI ID</label>
                    <input name="upi" defaultValue={JSON.parse(localStorage.getItem('tournament_settings'))?.upiId || "tournament@upi"} className="w-full bg-transparent border-none px-4 pb-3 focus:outline-none font-bold text-white placeholder:text-emerald-900/40" />
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] font-black text-emerald-500/60 uppercase tracking-widest text-center">QR Code Image</p>
                  <div className="relative h-48 rounded-2xl bg-emerald-950/50 border-2 border-dashed border-emerald-500/20 flex flex-col items-center justify-center group overflow-hidden">
                    {(settingsPreview || JSON.parse(localStorage.getItem('tournament_settings'))?.qrCodeUrl) ? (
                      <img src={settingsPreview || JSON.parse(localStorage.getItem('tournament_settings'))?.qrCodeUrl} className="w-full h-full object-contain" alt="QR Preview" />
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <MapPin size={24} className="text-emerald-500/40" />
                        <span className="text-[9px] font-black text-emerald-500/40 uppercase">Upload QR Code</span>
                      </div>
                    )}
                    <input
                      type="file"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => setSettingsPreview(reader.result);
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </div>
                </div>

                <button type="submit" className="btn-primary w-full py-5">
                  Save Tournament Config
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
