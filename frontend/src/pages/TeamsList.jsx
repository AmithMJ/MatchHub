import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';
import { Plus, Trophy, Phone, User, Camera, X, Shield, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const getSafeUrl = (url, name = 'Team') => {
  if (!url || url.includes('placeholder.com') || url.includes('via.placeholder')) {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
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

const TeamsList = () => {
  const token = localStorage.getItem('token');
  const location = useLocation();
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(location.state?.openAddModal || false);
  const [logoPreview, setLogoPreview] = useState(null);

  useEffect(() => {
    if (location.state?.openAddModal && token) {
      setShowAddModal(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state, token]);

  const { data: teams, isLoading } = useQuery({
    queryKey: ['teams'],
    queryFn: async () => {
      const response = await api.get('/teams');
      return response.data;
    },
  });

  const addTeamMutation = useMutation({
    mutationFn: (formData) => api.post('/teams', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['teams']);
      setShowAddModal(false);
      setLogoPreview(null);
    },
    onError: (err) => {
      const detail = err.response?.data?.detail;
      alert(typeof detail === 'string' ? detail : (Array.isArray(detail) ? detail[0].msg : 'Failed to add team'));
    }
  });

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    addTeamMutation.mutate(formData);
  };

  if (isLoading) return <div className="p-10 text-center text-slate-500 font-bold">Loading Squads...</div>;

  return (
    <div className="pb-32 px-5 pt-4 max-w-lg mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tighter uppercase">Elite Squads</h2>
          <p className="text-emerald-500/60 text-[10px] font-black uppercase tracking-[0.2em]">Verified Tournament Teams</p>
        </div>
        {token && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddModal(true)}
            className="w-14 h-14 rounded-2xl bg-emerald-500 shadow-[0_8px_20px_rgba(16,185,129,0.3)] flex items-center justify-center p-0 text-white"
          >
            <Plus size={28} strokeWidth={3} />
          </motion.button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-5">
        {teams?.map((team, index) => (
          <motion.div
            key={team.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="premium-glass p-5 flex flex-col items-center text-center relative group border-emerald-500/5 hover:border-emerald-500/20 transition-all duration-500"
          >
            <div className="absolute top-2 right-2 opacity-[0.03] group-hover:opacity-10 transition-opacity">
              <Shield size={60} className="text-emerald-400" />
            </div>
            <div className="w-24 h-24 rounded-[32px] bg-emerald-950 border-2 border-emerald-500/10 overflow-hidden mb-5 shadow-2xl group-hover:border-emerald-400 transition-all duration-500 relative z-10">
              <img 
                src={getSafeUrl(team.logo, 'https://ui-avatars.com/api/?name=' + team.team_name)} 
                alt={team.team_name} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                onError={(e) => e.target.src = 'https://ui-avatars.com/api/?name=' + team.team_name}
              />
            </div>
            <h3 className="font-black text-white leading-tight mb-3 text-lg tracking-tight relative z-10">{team.team_name}</h3>
            <div className="space-y-2 relative z-10">
              <div className="px-3 py-1 bg-emerald-500/10 rounded-lg flex items-center justify-center gap-2 border border-emerald-500/10">
                <User size={12} className="text-emerald-400" /> 
                <span className="text-[9px] text-emerald-200 font-bold uppercase tracking-widest">{team.captain}</span>
              </div>
              <div className="flex items-center justify-center gap-1.5 opacity-60">
                <Users size={12} className="text-emerald-500" />
                <span className="text-[10px] text-white font-black uppercase tracking-widest">11 Squad</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-5">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm bg-slate-950 border border-slate-800 rounded-[40px] p-8 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-extrabold text-white">New Squad</h2>
                <button onClick={() => setShowAddModal(false)} className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="flex flex-col items-center mb-6">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-[32px] bg-slate-900 border-2 border-dashed border-slate-700 flex items-center justify-center relative overflow-hidden transition-all group-hover:border-primary">
                      {logoPreview ? (
                        <img src={logoPreview} className="w-full h-full object-cover" alt="Logo" />
                      ) : (
                        <Camera className="text-slate-500 group-hover:text-primary transition-colors" size={32} />
                      )}
                      <input
                        name="logo"
                        type="file"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={handleLogoChange}
                        accept="image/*"
                      />
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-primary p-2 rounded-xl">
                      <Camera size={14} className="text-white" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="premium-glass p-1 focus-within:ring-2 ring-primary transition-all rounded-2xl">
                    <input
                      name="team_name"
                      required
                      className="w-full bg-transparent border-none px-5 py-4 focus:outline-none font-bold placeholder:text-emerald-100/30 text-white"
                      placeholder="Team Name"
                    />
                  </div>

                  <div className="premium-glass p-1 focus-within:ring-2 ring-primary transition-all rounded-2xl">
                    <input
                      name="captain"
                      required
                      className="w-full bg-transparent border-none px-5 py-4 focus:outline-none font-bold placeholder:text-emerald-100/30 text-white"
                      placeholder="Captain Name"
                    />
                  </div>

                  <div className="premium-glass p-1 focus-within:ring-2 ring-primary transition-all rounded-2xl">
                    <input
                      name="contact"
                      required
                      className="w-full bg-transparent border-none px-5 py-4 focus:outline-none font-bold placeholder:text-emerald-100/30 text-white"
                      placeholder="Contact No"
                    />
                  </div>
                </div>

                <motion.button
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={addTeamMutation.isLoading}
                  className="btn-primary w-full mt-4"
                >
                  {addTeamMutation.isLoading ? 'Registering...' : 'Create Squad'}
                </motion.button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TeamsList;
