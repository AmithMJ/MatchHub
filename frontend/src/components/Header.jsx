import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, User, LayoutDashboard, Target, Trophy, Users, LogOut, Settings, ShieldCheck, Mail, MessageSquare } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';
import TournamentSettingsModal from './TournamentSettingsModal';
import LoadingSpinner from './LoadingSpinner';

const Header = ({ title, subtitle }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Real Notification Logic: Fetch pending players
  const { data: players, isLoading: loadingNotifs } = useQuery({
    queryKey: ['players-notifs'],
    queryFn: async () => {
      const response = await api.get('/players');
      return response.data.filter(p => p.payment_status === 'Pending').slice(0, 5);
    },
    enabled: !!token,
    refetchInterval: 10000, // Check every 10s
  });
  
  const navItems = [
    ...(token ? [{ icon: LayoutDashboard, label: 'Stats', path: '/' }] : []),
    { icon: Target, label: 'Entry', path: '/tournaments' },
    { icon: Trophy, label: 'Squads', path: '/teams' },
    { icon: Users, label: 'Players', path: '/players' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user_phone');
    setShowUserMenu(false);
    navigate('/login');
  };

  const handleMessages = () => {
    setShowUserMenu(false);
    alert('Tournament Support: Open for verified organizers only. Linking to support center...');
    // Real link could be: window.open('https://wa.me/yournumber', '_blank');
  };

  return (
    <>
    <header className="sticky top-0 z-50 px-3 py-3">
      <div className="premium-glass px-4 py-3 border-white/5 flex flex-col gap-4 relative">
        {/* Top Section: Brand and Profile */}
        <div className="flex justify-between items-center">
          <div className="flex flex-col">
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-2xl font-black tracking-tighter text-elite"
            >
              {title || "Match"}<span className="text-emerald-400">{subtitle || "Hub"}</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="subtext-elite"
            >
              Elite Tournament Dashboard
            </motion.p>
          </div>

          <div className="flex items-center gap-3">
            {token ? (
              <>
                {/* Notifications Toggle */}
                <div className="relative">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      setShowNotifications(!showNotifications);
                      setShowUserMenu(false);
                    }}
                    className={`p-2.5 rounded-2xl border transition-all duration-300 ${showNotifications ? 'bg-emerald-500 text-white border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.4)]' : 'bg-white/5 text-emerald-400 border-white/5 hover:bg-white/10'}`}
                  >
                    <Bell size={18} />
                    {players?.length > 0 && (
                      <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full border-2 border-slate-900 animate-pulse" />
                    )}
                  </motion.button>

                  <AnimatePresence>
                    {showNotifications && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-3 w-72 premium-glass p-5 border-white/10 shadow-2xl z-[60]"
                      >
                        <h4 className="subtext-elite mb-4 text-emerald-400">Pending Approvals</h4>
                        <div className="space-y-3">
                          {loadingNotifs ? (
                            <div className="py-10 flex justify-center"><LoadingSpinner /></div>
                          ) : players?.length > 0 ? (
                            players.map(p => (
                              <div 
                                key={p.id} 
                                onClick={() => { setShowNotifications(false); navigate('/players'); }}
                                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-all cursor-pointer group"
                              >
                                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500/20 transition-colors">
                                  <Users size={16} />
                                </div>
                                <div className="flex-1">
                                  <p className="text-xs font-bold text-white leading-none mb-1 group-hover:text-emerald-400 transition-colors">{p.player_name}</p>
                                  <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest">{p.team_name}</p>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-[10px] text-center text-slate-600 py-6 font-bold italic">All entries verified!</p>
                          )}
                          {players?.length > 0 && (
                            <button 
                              onClick={() => { setShowNotifications(false); navigate('/players'); }}
                              className="w-full text-center py-3 text-[9px] font-black uppercase text-emerald-500/60 hover:text-emerald-400 border-t border-white/5 mt-2 transition-colors"
                            >
                              View All Records
                            </button>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                
                {/* User Menu Toggle */}
                <div className="relative">
                  <motion.button 
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      setShowUserMenu(!showUserMenu);
                      setShowNotifications(false);
                    }}
                    className={`w-10 h-10 rounded-2xl p-[2px] transition-all duration-300 shadow-xl ${showUserMenu ? 'bg-emerald-400' : 'bg-gradient-to-tr from-emerald-500 via-amber-400 to-emerald-400'}`}
                  >
                    <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center font-black text-emerald-400 group">
                      <User size={20} className="group-hover:scale-110 transition-transform" />
                    </div>
                  </motion.button>

                  <AnimatePresence>
                    {showUserMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-3 w-52 premium-glass p-2.5 border-white/10 shadow-2xl z-[60]"
                      >
                        <div className="p-4 border-b border-white/5 mb-2">
                          <p className="text-xs font-black text-white">Organizer Pro</p>
                          <p className="subtext-elite mt-1">Super Admin Account</p>
                        </div>
                        <button 
                          onClick={() => { setShowSettings(true); setShowUserMenu(false); }}
                          className="w-full flex items-center gap-3 p-3 rounded-xl text-slate-400 hover:text-white hover:bg-emerald-500/10 transition-all text-xs font-bold"
                        >
                          <Settings size={14} /> Settings
                        </button>
                        <button 
                          onClick={handleMessages}
                          className="w-full flex items-center gap-3 p-3 rounded-xl text-slate-400 hover:text-white hover:bg-emerald-500/10 transition-all text-xs font-bold"
                        >
                          <Mail size={14} /> Messages
                        </button>
                        <button 
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 p-3 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all text-[10px] font-black uppercase tracking-widest mt-2 border-t border-white/5 pt-4"
                        >
                          <LogOut size={14} /> Logout Account
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/login')}
                className="btn-primary !px-6 !py-3 !rounded-xl"
              >
                Sign In
              </motion.button>
            )}
          </div>
        </div>

        {/* Bottom Section: Navigation Tabs */}
        <nav className="flex items-center justify-between bg-white/[0.03] rounded-2xl p-1.5 border border-white/5">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex-1 flex items-center justify-center gap-2.5 py-3 rounded-xl transition-all duration-500 relative ${
                  isActive ? 'text-white' : 'text-slate-500 hover:text-emerald-400'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon size={18} className={isActive ? 'stroke-[2.5px]' : 'stroke-[2px]'} />
                  <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${isActive ? 'block' : 'hidden sm:block'}`}>
                    {item.label}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="header-nav-active"
                      className="absolute inset-0 bg-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.4)] rounded-xl -z-10"
                      transition={{ type: 'spring', bounce: 0.3, duration: 0.6 }}
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
    <TournamentSettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </>
  );
};

export default Header;
