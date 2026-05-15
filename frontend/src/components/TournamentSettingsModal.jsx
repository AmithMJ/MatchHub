import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, MapPin, DollarSign, Phone } from 'lucide-react';
import api from '../utils/api';

const TournamentSettingsModal = ({ isOpen, onClose, onSave }) => {
  const [settingsPreview, setSettingsPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const currentSettings = JSON.parse(localStorage.getItem('tournament_settings')) || {
    registrationFee: "₹500.00",
    upiId: "tournament@upi",
    qrCodeUrl: ""
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);
    
    const settings = {
      registrationFee: formData.get('fee'),
      upiId: formData.get('upi'),
      qrCodeUrl: settingsPreview || currentSettings.qrCodeUrl
    };

    localStorage.setItem('tournament_settings', JSON.stringify(settings));
    if (onSave) onSave(settings);
    setLoading(false);
    onClose();
    alert('Settings synchronized across all pages!');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
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
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Tournament Control</h3>
                <p className="text-emerald-500/60 text-[10px] font-black uppercase tracking-widest">Global Configuration</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
                <X size={20} className="text-emerald-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="premium-glass p-1 border-white/5 focus-within:ring-2 ring-emerald-500 transition-all rounded-2xl">
                  <label className="block text-[10px] font-black text-emerald-500/60 uppercase tracking-widest px-4 pt-2">Registration Fee</label>
                  <input 
                    name="fee" 
                    defaultValue={currentSettings.registrationFee} 
                    className="w-full bg-transparent border-none px-4 pb-3 focus:outline-none font-bold text-white placeholder:text-emerald-900/40" 
                  />
                </div>
                <div className="premium-glass p-1 border-white/5 focus-within:ring-2 ring-emerald-500 transition-all rounded-2xl">
                  <label className="block text-[10px] font-black text-emerald-500/60 uppercase tracking-widest px-4 pt-2">UPI ID</label>
                  <input 
                    name="upi" 
                    defaultValue={currentSettings.upiId} 
                    className="w-full bg-transparent border-none px-4 pb-3 focus:outline-none font-bold text-white placeholder:text-emerald-900/40" 
                  />
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-[10px] font-black text-emerald-500/60 uppercase tracking-widest text-center">QR Code Image</p>
                <div className="relative h-48 rounded-2xl bg-emerald-950/50 border-2 border-dashed border-emerald-500/20 flex flex-col items-center justify-center group overflow-hidden">
                  {(settingsPreview || currentSettings.qrCodeUrl) ? (
                    <img src={settingsPreview || currentSettings.qrCodeUrl} className="w-full h-full object-contain" alt="QR Preview" />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-emerald-500/40">
                      <DollarSign size={24} />
                      <span className="text-[9px] font-black uppercase">Upload QR Code</span>
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

              <button 
                type="submit" 
                disabled={loading}
                className="btn-primary w-full py-5"
              >
                {loading ? 'Syncing...' : 'Update Tournament Config'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default TournamentSettingsModal;
