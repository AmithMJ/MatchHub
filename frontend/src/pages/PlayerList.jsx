import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';
import { Search, Filter, Check, X, Eye, Phone, ChevronRight, User, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSpinner from '../components/LoadingSpinner';

const StatusBadge = ({ status }) => {
  const styles = {
    Pending: 'badge-pending',
    Approved: 'badge-approved',
    Rejected: 'badge-rejected',
  };
  return (
    <span className={`badge ${styles[status]}`}>
      {status}
    </span>
  );
};

// Safety filter for old database records with dead placeholder links
  const getSafeUrl = (url, name = 'User') => {
    if (!url || url.includes('placeholder.com') || url.includes('via.placeholder')) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff`;
    }
    
    // If it's already a full Cloudinary URL or absolute URL, return it
    if (url.startsWith('http') || url.includes('cloudinary')) {
      return url;
    }
    
    // If it's a local upload, always use the current VITE_API_URL
    if (url.includes('/uploads/')) {
      const filename = url.split('/uploads/')[1];
      return `${import.meta.env.VITE_API_URL || ''}/uploads/${filename}`;
    }
    
    return `${import.meta.env.VITE_API_URL || ''}/uploads/${url}`;
  };

const PlayerList = () => {
  const token = localStorage.getItem('token');
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [tournamentFilter, setTournamentFilter] = useState('All');
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  const { data: players, isLoading } = useQuery({
    queryKey: ['players'],
    queryFn: async () => {
      const response = await api.get('/players');
      return response.data;
    },
  });

  const approveMutation = useMutation({
    mutationFn: (id) => api.put(`/players/${id}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries(['players']);
      setSelectedPlayer(null);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (id) => api.put(`/players/${id}/reject`),
    onSuccess: () => {
      queryClient.invalidateQueries(['players']);
      setSelectedPlayer(null);
    },
  });

  const filteredPlayers = players?.filter(p => {
    const matchesSearch = p.player_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.phone.includes(searchTerm);
    const matchesTournament = tournamentFilter === 'All' || p.tournament_name === tournamentFilter;
    return matchesSearch && matchesTournament;
  });

  const tournaments = ['All', ...new Set(players?.map(p => p.tournament_name).filter(Boolean) || [])];

  if (isLoading) return <LoadingSpinner fullPage={true} />;

  return (
    <div className="pb-32 px-5 pt-4 max-w-lg mx-auto">

      <div className="relative mb-6">
        <div className="absolute inset-0 bg-emerald-500/5 blur-3xl rounded-full" />
        <div className="relative premium-glass p-1.5 flex items-center rounded-2xl border-emerald-500/10">
          <div className="p-3 bg-emerald-500/10 rounded-xl ml-1">
            <Search className="text-emerald-400" size={18} />
          </div>
          <input
            type="text"
            placeholder="Search players or teams..."
            className="w-full bg-transparent border-none px-4 py-4 focus:outline-none font-bold text-white placeholder:text-emerald-100/30"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Tournament filter chips */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
        {tournaments.map(t => (
          <button
            key={t}
            onClick={() => setTournamentFilter(t)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
              tournamentFilter === t
                ? 'bg-emerald-500 text-white border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                : 'premium-glass text-emerald-500/60 border-emerald-500/10 hover:text-emerald-400'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between mb-4">
        <p className="text-[10px] font-black text-emerald-500/60 uppercase tracking-widest">
          {filteredPlayers?.length || 0} Players
          {tournamentFilter !== 'All' && <span className="ml-1 text-emerald-400">· {tournamentFilter}</span>}
        </p>
      </div>

      <div className="space-y-4">
        {filteredPlayers?.map((player, index) => (
          <motion.div
            key={player.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => setSelectedPlayer(player)}
            className="premium-glass p-4 flex items-center gap-5 active:scale-[0.98] transition-all cursor-pointer hover:bg-emerald-500/5 group border-emerald-500/5"
          >
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-emerald-950 overflow-hidden border-2 border-emerald-500/10 group-hover:border-emerald-500/30 transition-colors">
                <img
                  src={getSafeUrl(player.photo_url, player.player_name)}
                  alt={player.player_name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(player.player_name)}&background=random`;
                  }}
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-900 rounded-lg flex items-center justify-center border-2 border-emerald-950 shadow-lg">
                <Trophy size={12} className="text-emerald-400" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-black text-lg text-white mb-0.5 leading-none truncate">{player.player_name}</h3>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-black uppercase text-emerald-500/60 tracking-[0.2em]">{player.role}</span>
                <div className="w-1 h-1 rounded-full bg-emerald-800" />
                <span className="text-[10px] font-black uppercase text-emerald-400 tracking-widest">#{player.jersey_no}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Trophy size={10} className="text-amber-400" />
                <span className="text-[9px] font-black text-amber-400/80 uppercase tracking-widest truncate">{player.tournament_name || 'No Tournament'}</span>
              </div>
            </div>

            <div className="flex flex-col items-end gap-3">
              <StatusBadge status={player.payment_status} />
              <div className="p-1.5 bg-white/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronRight size={16} className="text-emerald-400" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedPlayer && (
          <div className="fixed inset-0 z-[110] flex items-end justify-center sm:items-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPlayer(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-lg bg-slate-950 rounded-t-[40px] sm:rounded-[40px] border-t sm:border border-emerald-500/20 shadow-2xl flex flex-col max-h-[92vh]"
            >
              <div className="w-12 h-1.5 bg-emerald-900/50 rounded-full mx-auto my-4 flex-shrink-0" onClick={() => setSelectedPlayer(null)} />

              <div className="overflow-y-auto px-8 pb-8 pt-2 custom-scrollbar">
                <div className="flex justify-between items-start mb-8">
                  <div className="flex gap-5">
                    <div className="w-20 h-20 rounded-3xl bg-emerald-950 overflow-hidden border-2 border-emerald-500 shadow-2xl shadow-emerald-500/20">
                      <img
                        src={getSafeUrl(selectedPlayer.photo_url, selectedPlayer.player_name)}
                        className="w-full h-full object-cover"
                        alt=""
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedPlayer.player_name)}&background=random`;
                        }}
                      />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-white mb-1 leading-none">{selectedPlayer.player_name}</h2>
                      <p className="text-emerald-500/60 font-bold text-sm flex items-center gap-2 mb-3">
                        <Phone size={14} className="text-emerald-400" /> {selectedPlayer.phone}
                      </p>
                      <StatusBadge status={selectedPlayer.payment_status} />
                    </div>
                  </div>
                </div>

                <div className="space-y-6 mb-8">
                  <div className="premium-glass p-5 bg-emerald-950/20 border-emerald-500/10">
                    <p className="text-[10px] text-emerald-500/60 uppercase font-black tracking-[0.2em] mb-4">Payment Proof</p>
                    <div className="w-full h-72 bg-emerald-950 rounded-2xl overflow-hidden border border-emerald-900 shadow-inner flex items-center justify-center">
                      <img
                        src={getSafeUrl(selectedPlayer.payment_image_url, 'Payment')}
                        className="w-full h-full object-contain"
                        alt="Payment"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://ui-avatars.com/api/?name=No+Proof&background=334155&color=fff&length=2';
                        }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="premium-glass p-4 rounded-2xl bg-white/5 border-white/5">
                      <p className="text-[10px] text-emerald-500/40 uppercase font-black mb-1">Role</p>
                      <p className="font-bold text-white">{selectedPlayer.role}</p>
                    </div>
                    <div className="premium-glass p-4 rounded-2xl bg-white/5 border-white/5">
                      <p className="text-[10px] text-emerald-500/40 uppercase font-black mb-1">Age</p>
                      <p className="font-bold text-white">{selectedPlayer.age} Years</p>
                    </div>
                    <div className="premium-glass p-4 rounded-2xl bg-white/5 border-white/5 col-span-2">
                      <p className="text-[10px] text-amber-500/60 uppercase font-black mb-1 flex items-center gap-1.5"><Trophy size={10} className="text-amber-400" /> Tournament</p>
                      <p className="font-black text-white">{selectedPlayer.tournament_name || 'No Tournament'}</p>
                      {selectedPlayer.tournament_status && (
                        <span className={`text-[9px] font-black uppercase tracking-widest mt-1 inline-block px-2 py-0.5 rounded-full ${
                          selectedPlayer.tournament_status === 'Open' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-500/20 text-slate-400'
                        }`}>{selectedPlayer.tournament_status}</span>
                      )}
                    </div>
                  </div>
                </div>

                {token && selectedPlayer.payment_status === 'Pending' && (
                  <div className="flex gap-4 sticky bottom-0 bg-slate-950 pt-4 pb-2">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => rejectMutation.mutate(selectedPlayer.id)}
                      className="flex-1 py-4 rounded-2xl bg-rose-500/10 text-rose-500 font-black uppercase tracking-widest text-[10px] border border-rose-500/20 flex items-center justify-center gap-2 hover:bg-rose-500/20 transition-colors"
                    >
                      <X size={16} /> Reject
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => approveMutation.mutate(selectedPlayer.id)}
                      className="flex-[2] btn-primary py-4 text-[10px]"
                    >
                      <Check size={16} /> Approve Entry
                    </motion.button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PlayerList;
