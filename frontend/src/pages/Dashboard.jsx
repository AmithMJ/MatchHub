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
    className="premium-glass p-6 relative overflow-hidden group border-white/5"
  >
    <div className={`absolute -right-4 -top-4 w-24 h-24 opacity-5 group-hover:opacity-10 group-hover:scale-125 transition-all duration-700 rounded-full ${gradient}`} />
    <div className="flex items-start justify-between mb-6">
      <div className={`p-3.5 rounded-2xl ${gradient} shadow-2xl border border-white/10 group-hover:rotate-6 transition-transform duration-500`}>
        <Icon className="text-white" size={20} />
      </div>
      <div className="flex flex-col items-end">
        <TrendingUp size={14} className="text-emerald-400 opacity-40 mb-1" />
        <span className="text-[8px] font-black text-emerald-500/40 uppercase tracking-widest">+12%</span>
      </div>
    </div>
    <div>
      <p className="subtext-elite mb-2">{title}</p>
      <h3 className="text-3xl font-black text-white tracking-tighter text-elite">{value}</h3>
    </div>
  </motion.div>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview'); // overview, standings, matches
  const [showSettings, setShowSettings] = useState(false);
  const [showTournamentModal, setShowTournamentModal] = useState(false);
  const [settingsPreview, setSettingsPreview] = useState(null);

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await api.get('/dashboard/stats');
      return response.data;
    },
    refetchInterval: 10000,
  });

  const { data: standings } = useQuery({
    queryKey: ['standings', stats?.upcoming_tournament?.id],
    queryFn: async () => {
      const response = await api.get(`/standings/${stats.upcoming_tournament.id}`);
      return response.data;
    },
    enabled: !!stats?.upcoming_tournament?.id,
  });

  const { data: matches } = useQuery({
    queryKey: ['matches'],
    queryFn: async () => {
      const response = await api.get('/matches');
      return response.data;
    },
  });

  if (isLoading) return <LoadingSpinner fullPage={true} />;

  if (!stats) return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
      <div className="p-8 bg-rose-500/5 rounded-[40px] mb-8 border border-rose-500/10 shadow-2xl">
        <Users className="text-rose-500" size={56} />
      </div>
      <h2 className="text-3xl font-black mb-4 uppercase tracking-tighter text-elite">Access Restricted</h2>
      <p className="text-slate-500 font-bold max-w-xs mx-auto">This dashboard is reserved for verified Tournament Organizers only.</p>
      <button onClick={() => window.location.href = '/login'} className="btn-primary mt-10 !px-12">Return to Base</button>
    </div>
  );

  return (
    <div className="pb-32 px-5 pt-4 max-w-2xl mx-auto">
      {/* Mesh Background Overlay */}
      <div className="mesh-overlay" />

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-10 bg-white/[0.03] p-1.5 rounded-3xl border border-white/5">
        {['overview', 'standings', 'schedule'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all duration-500 relative ${
              activeTab === tab ? 'text-white' : 'text-slate-500 hover:text-emerald-400'
            }`}
          >
            {tab}
            {activeTab === tab && (
              <motion.div
                layoutId="dashboard-tab"
                className="absolute inset-0 bg-emerald-500 rounded-2xl -z-10 shadow-[0_10px_30px_rgba(16,185,129,0.5)]"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
              />
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="grid grid-cols-2 gap-5 mb-10">
              <StatCard
                title="Total Admins"
                value={stats?.total_users || 0}
                icon={ShieldCheck}
                gradient="bg-gradient-to-br from-indigo-500 to-purple-600"
                delay={0.05}
              />
              <StatCard
                title="Total Players"
                value={stats?.total_players || 0}
                icon={Users}
                gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
                delay={0.1}
              />
              <StatCard
                title="Active Teams"
                value={stats?.total_teams || 0}
                icon={Trophy}
                gradient="bg-gradient-to-br from-amber-400 to-orange-500"
                delay={0.2}
              />
              <StatCard
                title="Revenue"
                value={`₹${((stats?.approved_players || 0) * (stats?.upcoming_tournament?.entry_fee || 500)).toLocaleString()}`}
                icon={DollarSign}
                gradient="bg-gradient-to-br from-emerald-600 to-emerald-900"
                delay={0.3}
              />
            </div>

            {stats?.upcoming_tournament && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="premium-glass p-8 mb-12 border-white/10 relative overflow-hidden group"
              >
                <div className="absolute -right-12 -bottom-12 opacity-[0.05] group-hover:rotate-12 transition-transform duration-1000">
                  <Trophy size={240} className="text-emerald-400" />
                </div>
                
                <div className="flex justify-between items-start mb-8 relative z-10">
                  <div className="space-y-2">
                    <span className="badge badge-approved mb-2 inline-block">Live Tournament</span>
                    <h2 className="text-4xl font-black text-white tracking-tighter text-elite">
                      {stats.upcoming_tournament.name}
                    </h2>
                    <p className="subtext-elite !text-emerald-500/40">Official Series 2026</p>
                  </div>
                  <div className="premium-glass-light p-3 px-5 border-white/5 text-center">
                    <p className="subtext-elite !text-[8px] mb-1">Current Status</p>
                    <p className="text-xs font-black text-emerald-400 uppercase tracking-[0.2em] animate-pulse">
                      {stats.upcoming_tournament.status}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-10 relative z-10">
                  <div className="flex items-center gap-4 group/item">
                    <div className="p-3 bg-white/5 rounded-2xl border border-white/10 group-hover/item:border-emerald-500/50 transition-colors">
                      <Calendar size={20} className="text-emerald-400" />
                    </div>
                    <div>
                      <p className="subtext-elite !text-[8px]">Match Date</p>
                      <p className="text-xs font-black text-white">{new Date(stats.upcoming_tournament.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 group/item">
                    <div className="p-3 bg-white/5 rounded-2xl border border-white/10 group-hover/item:border-emerald-500/50 transition-colors">
                      <MapPin size={20} className="text-emerald-400" />
                    </div>
                    <div>
                      <p className="subtext-elite !text-[8px]">Venue</p>
                      <p className="text-xs font-black text-white">{stats.upcoming_tournament.location}</p>
                    </div>
                  </div>
                </div>

                <div className="relative z-10 p-1">
                  <div className="w-full bg-slate-900/50 h-3 rounded-full overflow-hidden mb-4 border border-white/5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(stats.total_teams / stats.upcoming_tournament.max_teams) * 100}%` }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-emerald-600 via-emerald-400 to-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="subtext-elite">Team Registration Progress</p>
                    <div className="flex items-center gap-2">
                       <span className="text-xs font-black text-white">{stats.total_teams}</span>
                       <span className="text-[10px] font-bold text-slate-500">/ {stats.upcoming_tournament.max_teams}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            <div className="space-y-8 mb-12">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter text-elite">Live Feed</h3>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                   <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                   <span className="text-[9px] text-emerald-500 font-black uppercase tracking-[0.2em]">Live Stream</span>
                </div>
              </div>
              <div className="space-y-4">
                {stats?.recent_registrations?.map((reg, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="premium-glass p-5 border-white/5 flex items-center justify-between group hover:border-emerald-500/20 transition-all hover:scale-[1.01]"
                  >
                    <div className="flex items-center gap-5">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg border border-white/5 shadow-xl transition-transform group-hover:rotate-6 ${
                        reg.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                      }`}>
                        {reg.player_name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-black text-white leading-none mb-1 group-hover:text-emerald-400 transition-colors">{reg.player_name}</p>
                        <p className="subtext-elite !text-[8px]">{reg.team_name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-[10px] font-black uppercase tracking-widest mb-1.5 ${
                        reg.status === 'Approved' ? 'text-emerald-500' : 'text-amber-500'
                      }`}>{reg.status}</p>
                      <div className="flex items-center gap-2 justify-end">
                         <Clock size={10} className="text-slate-600" />
                         <p className="text-[9px] text-slate-500 font-bold">{new Date(reg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'standings' && (
          <motion.div
            key="standings"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="premium-glass p-6 border-emerald-500/10">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2.5 bg-amber-500/10 rounded-xl border border-amber-500/20">
                  <Trophy className="text-amber-500" size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white leading-none">Points Table</h3>
                  <p className="text-[10px] text-emerald-500/60 font-black uppercase tracking-widest mt-1">Live Standings</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="py-4 text-[10px] font-black uppercase text-emerald-500/40 tracking-widest px-2">Team</th>
                      <th className="py-4 text-[10px] font-black uppercase text-emerald-500/40 tracking-widest text-center">P</th>
                      <th className="py-4 text-[10px] font-black uppercase text-emerald-500/40 tracking-widest text-center">W</th>
                      <th className="py-4 text-[10px] font-black uppercase text-emerald-500/40 tracking-widest text-center">L</th>
                      <th className="py-4 text-[10px] font-black uppercase text-emerald-400 tracking-widest text-center bg-emerald-500/5 rounded-t-lg">Pts</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {standings?.map((team, idx) => (
                      <tr key={team.team_id} className="group hover:bg-white/[0.02] transition-colors">
                        <td className="py-4 px-2">
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black text-emerald-500/40 w-4">{idx + 1}</span>
                            <span className="text-sm font-bold text-white truncate max-w-[120px]">{team.team_name}</span>
                          </div>
                        </td>
                        <td className="py-4 text-center text-xs font-bold text-slate-400">{team.played}</td>
                        <td className="py-4 text-center text-xs font-bold text-emerald-400">{team.won}</td>
                        <td className="py-4 text-center text-xs font-bold text-rose-400">{team.lost}</td>
                        <td className="py-4 text-center text-sm font-black text-white bg-emerald-500/5">{team.points}</td>
                      </tr>
                    ))}
                    {(!standings || standings.length === 0) && (
                      <tr>
                        <td colSpan="5" className="py-20 text-center text-[10px] font-black uppercase text-slate-500 tracking-widest italic">No matches recorded yet</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'schedule' && (
          <motion.div
            key="schedule"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {matches?.map((match) => (
              <div key={match.id} className="premium-glass p-5 border-white/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Calendar size={40} className="text-emerald-500" />
                </div>
                
                <div className="flex justify-between items-center mb-4">
                  <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${
                    match.status === 'Completed' ? 'bg-slate-500/20 text-slate-400' : 
                    match.status === 'Live' ? 'bg-rose-500/20 text-rose-500 animate-pulse' : 'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    {match.status}
                  </span>
                  <span className="text-[9px] font-bold text-slate-500">{new Date(match.match_date).toLocaleDateString()} · {match.venue}</span>
                </div>

                <div className="flex items-center justify-between gap-4 py-2">
                  <div className="flex-1 text-center">
                    <p className="text-sm font-black text-white truncate mb-1">{match.team1_name}</p>
                    <p className="text-[9px] text-emerald-500/40 uppercase font-black tracking-widest">Squad A</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[10px] font-black text-emerald-500/40 border border-white/5">VS</div>
                  </div>
                  <div className="flex-1 text-center">
                    <p className="text-sm font-black text-white truncate mb-1">{match.team2_name}</p>
                    <p className="text-[9px] text-emerald-500/40 uppercase font-black tracking-widest">Squad B</p>
                  </div>
                </div>

                {match.result && (
                  <div className="mt-4 pt-4 border-t border-white/5 text-center">
                    <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest">{match.result}</p>
                  </div>
                )}
              </div>
            ))}
            {(!matches || matches.length === 0) && (
              <div className="premium-glass py-20 text-center border-dashed border-white/10">
                <Calendar className="mx-auto text-white/5 mb-4" size={48} />
                <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">No matches scheduled</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-12 space-y-6">
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
