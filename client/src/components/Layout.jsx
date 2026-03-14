import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Activity, Sparkles, Settings, User, LogOut, FolderGit2, MessageSquare, Brain } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Layout = ({ children }) => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Activity, label: 'Activity', path: '/activity' },
    { icon: FolderGit2, label: 'Repositories', path: '/repositories' },
    { icon: Sparkles, label: 'AI Insights', path: '/ai-insights' },
    { icon: Brain, label: 'AI Assistant', path: '/ai-assistant' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <div className="min-h-screen bg-brand-dark text-white flex">
      {/* Sidebar - Desktop */}
      <aside className="w-64 border-r border-white/5 bg-brand-dark/50 backdrop-blur-xl hidden md:flex flex-col fixed h-full z-10 glass">
        <div className="p-6 border-b border-white/5">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
              DevTrack
            </span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive 
                    ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 text-white' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-blue-400' : 'text-gray-500 group-hover:text-gray-300'}`} />
                <span className="font-medium">{item.label}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.5)]" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5">
          <div className="flex items-center space-x-3 px-4 py-3 w-full rounded-xl bg-white/5 text-gray-400 mb-2">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name || user.username} className="w-8 h-8 rounded-full" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center text-white font-bold text-xs">
                {(user?.name || user?.username || 'U')[0].toUpperCase()}
              </div>
            )}
            <div className="flex-1 text-left">
              <div className="text-sm font-medium text-white">{user?.name || user?.username || 'User'}</div>
              <div className="text-xs text-gray-500">{user?.email || 'Pro Plan'}</div>
            </div>
          </div>
          <button 
            onClick={logout}
            className="flex items-center space-x-3 px-4 py-2 w-full rounded-xl hover:bg-red-500/10 transition-colors text-gray-400 hover:text-red-400"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-brand-dark/80 backdrop-blur-xl border-t border-white/10 z-50 px-6 py-4 flex justify-between items-center">
         {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path} className={`flex flex-col items-center space-y-1 ${isActive ? 'text-blue-400' : 'text-gray-500'}`}>
                <Icon className="w-6 h-6" />
                <span className="text-[10px]">{item.label}</span>
              </Link>
            )
         })}
      </div>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 overflow-y-auto">
        {/* Dynamic header for mobile could go here */}
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>

       {/* Background Elements */}
       <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
          <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[100px]" />
       </div>
    </div>
  );
};

export default Layout;
