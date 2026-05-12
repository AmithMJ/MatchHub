import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Dashboard from './pages/Dashboard';
import RegistrationForm from './components/RegistrationForm';
import PlayerList from './pages/PlayerList';
import TeamsList from './pages/TeamsList';
import LoginPage from './pages/LoginPage';
import PlayerDashboard from './pages/PlayerDashboard';

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" />;
  return children;
};

import Header from './components/Header';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="mesh-bg cricket-bg-overlay min-h-screen relative font-['Outfit']">
          {/* Enhanced Background Glows */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-primary/20 blur-[150px] rounded-full animate-pulse" />
            <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] bg-accent/10 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] left-[20%] w-[30%] h-[30%] bg-emerald-500/10 blur-[100px] rounded-full" />
          </div>

          <div className="relative z-10 flex flex-col min-h-screen">
            <Header />
            
            <main className="flex-1">
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/tournaments" element={<RegistrationForm />} />
                <Route path="/player-dashboard" element={<PlayerDashboard />} />
                <Route path="/teams" element={<TeamsList />} />
                <Route path="/players" element={<PlayerList />} />
              </Routes>
            </main>
          </div>
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
