import Card from '../components/Card';
import Button from '../components/Button';
import { Github, Moon, Sun, LogOut, CheckCircle2, User, Bell, Shield, AlertCircle, RefreshCw, X, Check, Trash2, Plus, Globe, Mail, Lock, Key, Settings as SettingsIcon, ChevronRight } from 'lucide-react';
import { API_URL } from '../api';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useGithubConnection } from '../hooks/useGithubConnection';
import axios from 'axios';

const Settings = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [showUnlinkConfirm, setShowUnlinkConfirm] = useState(false);
  const [unlinking, setUnlinking] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [accountStats, setAccountStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const githubConnection = useGithubConnection();

  useEffect(() => {
    fetchUserProfile();
    if (githubConnection.connected) {
      fetchAccountStats();
    }
  }, [githubConnection.connected]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/user/profile`, {
        withCredentials: true
      });
      setUserProfile(response.data);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAccountStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/github/dashboard`, {
        withCredentials: true
      });
      setAccountStats(response.data.stats);
    } catch (error) {
      console.error('Failed to fetch account stats:', error);
    }
  };

  const handleUnlinkAccount = async () => {
    setUnlinking(true);
    try {
      const response = await axios.post(`${API_URL}/api/github/unlink`, {}, {
        withCredentials: true
      });
      if (response.data.success) {
        setShowUnlinkConfirm(false);
        setAccountStats(null);
        await githubConnection.refreshConnection();
        alert('GitHub account unlinked successfully');
      }
    } catch (error) {
      console.error('Failed to unlink account:', error);
      alert('Failed to unlink account. Please try again.');
    } finally {
      setUnlinking(false);
    }
  };

  const handleAddGithubAccount = () => {
    // Redirect to GitHub OAuth
    window.location.href = `${API_URL}/api/auth/github`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  const getMemberSince = (dateString) => {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
            <SettingsIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Settings
            </h1>
            <p className="text-gray-400 text-sm">Manage your account preferences and connected services</p>
          </div>
        </div>
      </div>

      {/* Account Information */}
      <Card className="p-6 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Profile Information</h2>
            <p className="text-sm text-gray-400">Your account details</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 text-purple-400 animate-spin" />
          </div>
        ) : (
          <div className="flex items-start gap-6 p-5 bg-gray-800/50 rounded-xl border border-gray-700/50">
            {userProfile?.avatarUrl ? (
              <img 
                src={userProfile.avatarUrl} 
                alt="Profile" 
                className="w-20 h-20 rounded-full border-4 border-purple-500/30 shadow-lg shadow-purple-500/20"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
                <User className="w-10 h-10 text-white" />
              </div>
            )}
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-white mb-1">{userProfile?.name || user?.username}</h3>
              <p className="text-sm text-gray-400 flex items-center gap-2 mb-3">
                <Mail className="w-4 h-4" />
                {userProfile?.email || user?.email || 'No email provided'}
              </p>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                  Member since {getMemberSince(user?.createdAt)}
                </span>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Connected Accounts */}
      <Card className="p-6 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
              <Github className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Connected Accounts</h2>
              <p className="text-sm text-gray-400">Manage your GitHub integrations</p>
            </div>
          </div>
          <Button
            variant="primary"
            onClick={() => setShowAddAccount(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
          >
            <Plus className="w-4 h-4" />
            Add Account
          </Button>
        </div>

        {/* Primary Account */}
        {githubConnection.connected ? (
          <div className="space-y-4">
            <div className="group p-5 bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-2 border-purple-500/30 rounded-xl hover:border-purple-500/50 transition-all duration-300">
              <div className="flex items-center gap-4 mb-4">
                <div className="relative">
                  {githubConnection.avatarUrl ? (
                    <img 
                      src={githubConnection.avatarUrl} 
                      alt={githubConnection.githubUsername}
                      className="w-16 h-16 rounded-full border-3 border-purple-500 shadow-lg shadow-purple-500/30"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg">
                      <Github className="w-8 h-8 text-white" />
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-3 border-gray-900 flex items-center justify-center shadow-lg">
                    <Check className="w-3.5 h-3.5 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xl font-bold text-white">{githubConnection.githubUsername}</h3>
                    <span className="px-3 py-1 text-xs font-bold bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full border border-purple-400/30 shadow-lg shadow-purple-500/30">
                      PRIMARY
                    </span>
                    {githubConnection.isMockAccount && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-orange-500/20 text-orange-400 rounded-full border border-orange-500/30">
                        DEV MODE
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-300 flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                    {githubConnection.needsReconnect ? 'Connection expired - Reconnect needed' : 'Active & Syncing'}
                  </p>
                  <p className="text-xs text-gray-400">
                    Last synced: {formatDate(githubConnection.lastSynced)}
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <Button
                    variant="ghost"
                    onClick={() => window.location.href = `${API_URL}/api/auth/github`}
                    className="text-sm flex items-center gap-2 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Resync
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setShowUnlinkConfirm(true)}
                    className="text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/30 flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Unlink
                  </Button>
                </div>
              </div>

              {/* Account Stats */}
              {!githubConnection.needsReconnect && accountStats && (
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-700/50">
                  <div className="text-center p-3 bg-gray-800/30 rounded-lg">
                    <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                      {accountStats.totalCommits || 0}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">Commits</div>
                  </div>
                  <div className="text-center p-3 bg-gray-800/30 rounded-lg">
                    <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                      {accountStats.totalRepos || 0}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">Repositories</div>
                  </div>
                  <div className="text-center p-3 bg-gray-800/30 rounded-lg">
                    <div className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                      {accountStats.totalPRs || 0}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">Pull Requests</div>
                  </div>
                </div>
              )}

              {githubConnection.needsReconnect && (
                <div className="mt-4 p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-orange-200 font-medium mb-1">Connection Expired</p>
                    <p className="text-xs text-orange-300/80">
                      Your GitHub connection has expired. Please reconnect to continue syncing your data.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Info Banner */}
            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-blue-200">
                  <strong className="font-semibold">Read-only access:</strong> DevTrack AI only requests read permissions. 
                  We never modify your repositories or access private information.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 px-4">
            <div className="w-20 h-20 rounded-full bg-gray-800/50 flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-gray-700">
              <Github className="w-10 h-10 text-gray-500" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No GitHub Account Connected</h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              Connect your GitHub account to start tracking your development activity and get AI-powered insights
            </p>
            <Button
              variant="primary"
              onClick={handleAddGithubAccount}
              className="flex items-center gap-2 mx-auto bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
            >
              <Github className="w-5 h-5" />
              Connect GitHub
            </Button>
          </div>
        )}
      </Card>

      {/* Preferences */}
      <Card className="p-6 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
            {isDarkMode ? <Moon className="w-5 h-5 text-white" /> : <Sun className="w-5 h-5 text-white" />}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Preferences</h2>
            <p className="text-sm text-gray-400">Customize your experience</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-5 bg-gray-800/50 rounded-xl border border-gray-700/50 hover:border-gray-600/50 transition-all">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                {isDarkMode ? <Moon className="w-5 h-5 text-purple-400" /> : <Sun className="w-5 h-5 text-yellow-400" />}
              </div>
              <div>
                <h3 className="font-semibold text-white">Dark Mode</h3>
                <p className="text-sm text-gray-400">Use dark theme across the app</p>
              </div>
            </div>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`relative w-14 h-7 rounded-full transition-all duration-300 ${
                isDarkMode ? 'bg-gradient-to-r from-purple-500 to-blue-500' : 'bg-gray-600'
              }`}
            >
              <div
                className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform duration-300 shadow-lg ${
                  isDarkMode ? 'translate-x-7' : ''
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-5 bg-gray-800/50 rounded-xl border border-gray-700/50 hover:border-gray-600/50 transition-all">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Bell className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Email Notifications</h3>
                <p className="text-sm text-gray-400">Receive updates about your activity</p>
              </div>
            </div>
            <button
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              className={`relative w-14 h-7 rounded-full transition-all duration-300 ${
                notificationsEnabled ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gray-600'
              }`}
            >
              <div
                className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform duration-300 shadow-lg ${
                  notificationsEnabled ? 'translate-x-7' : ''
                }`}
              />
            </button>
          </div>
        </div>
      </Card>

      {/* Security */}
      <Card className="p-6 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Security</h2>
            <p className="text-sm text-gray-400">Manage your account security</p>
          </div>
        </div>

        <div className="space-y-3">
          <button className="w-full p-5 bg-gray-800/50 hover:bg-gray-800/80 rounded-xl border border-gray-700/50 hover:border-gray-600/50 transition-all text-left flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Key className="w-5 h-5 text-purple-400 group-hover:text-purple-300 transition-colors" />
              </div>
              <div>
                <h3 className="font-semibold text-white group-hover:text-purple-400 transition-colors">Change Password</h3>
                <p className="text-sm text-gray-400">Update your account password</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-400 transition-colors" />
          </button>

          <button className="w-full p-5 bg-gray-800/50 hover:bg-gray-800/80 rounded-xl border border-gray-700/50 hover:border-gray-600/50 transition-all text-left flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Shield className="w-5 h-5 text-blue-400 group-hover:text-blue-300 transition-colors" />
              </div>
              <div>
                <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors">Two-Factor Authentication</h3>
                <p className="text-sm text-gray-400">Add an extra layer of security</p>
              </div>
            </div>
            <span className="px-3 py-1 text-xs font-medium bg-gray-700/50 text-gray-400 rounded-full border border-gray-600/30">
              Coming Soon
            </span>
          </button>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card className="p-6 bg-gradient-to-br from-red-500/5 to-red-600/5 backdrop-blur-sm border-2 border-red-500/30">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-red-400">Danger Zone</h2>
            <p className="text-sm text-red-300/70">Irreversible and destructive actions</p>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            variant="ghost"
            onClick={logout}
            className="w-full text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/30 hover:border-red-500/50 flex items-center justify-center gap-2 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>

          <button 
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full p-4 border-2 border-red-500/30 hover:border-red-500/50 text-red-400 hover:bg-red-500/10 rounded-xl transition-all flex items-center justify-center gap-2 font-semibold"
          >
            <Trash2 className="w-4 h-4" />
            Delete Account
          </button>
        </div>
      </Card>

      {/* Modals */}
      {/* Unlink Confirmation Modal */}
      {showUnlinkConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 max-w-md w-full mx-4 border-2 border-red-500/30 shadow-2xl shadow-red-500/20 animate-scale-in">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-full bg-red-500/20 flex items-center justify-center">
                <AlertCircle className="w-7 h-7 text-red-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Unlink GitHub Account</h3>
                <p className="text-sm text-gray-400">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Are you sure you want to unlink your GitHub account? You'll lose access to all synced data, 
              analytics, and insights. You can reconnect later, but historical data may not be recoverable.
            </p>
            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={() => setShowUnlinkConfirm(false)}
                disabled={unlinking}
                className="flex-1 border border-gray-600 hover:border-gray-500"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleUnlinkAccount}
                disabled={unlinking}
                className="flex-1 bg-red-500 hover:bg-red-600 border-0"
              >
                {unlinking ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Unlinking...
                  </span>
                ) : (
                  'Unlink Account'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add Account Modal */}
      {showAddAccount && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 max-w-md w-full mx-4 border border-gray-700 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-white">Add Account</h3>
                <p className="text-sm text-gray-400">Connect additional developer accounts</p>
              </div>
              <button 
                onClick={() => setShowAddAccount(false)}
                className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-3">
              <button 
                onClick={handleAddGithubAccount}
                className="w-full p-5 bg-gradient-to-br from-gray-700/50 to-gray-800/50 hover:from-gray-700 hover:to-gray-800 rounded-xl border-2 border-gray-600 hover:border-purple-500/50 transition-all flex items-center gap-4 group"
              >
                <div className="w-12 h-12 rounded-full bg-gray-900 flex items-center justify-center group-hover:bg-purple-500/20 transition-all">
                  <Github className="w-6 h-6 text-white group-hover:text-purple-400 transition-colors" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-bold text-white group-hover:text-purple-400 transition-colors">GitHub</div>
                  <div className="text-xs text-gray-400">Connect another GitHub account</div>
                </div>
                <Plus className="w-5 h-5 text-gray-400 group-hover:text-purple-400 transition-colors" />
              </button>

              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-700/50 to-transparent h-px top-1/2" />
                <div className="relative flex justify-center">
                  <span className="px-3 py-1 text-xs text-gray-500 bg-gray-800 rounded-full">Coming Soon</span>
                </div>
              </div>

              <button className="w-full p-5 bg-gray-700/20 rounded-xl border-2 border-gray-700/50 transition-all flex items-center gap-4 opacity-50 cursor-not-allowed">
                <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center">
                  <Globe className="w-6 h-6 text-gray-500" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-bold text-gray-500">GitLab</div>
                  <div className="text-xs text-gray-600">GitLab integration</div>
                </div>
                <Lock className="w-5 h-5 text-gray-600" />
              </button>

              <button className="w-full p-5 bg-gray-700/20 rounded-xl border-2 border-gray-700/50 transition-all flex items-center gap-4 opacity-50 cursor-not-allowed">
                <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center">
                  <Globe className="w-6 h-6 text-gray-500" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-bold text-gray-500">Bitbucket</div>
                  <div className="text-xs text-gray-600">Bitbucket integration</div>
                </div>
                <Lock className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 max-w-md w-full mx-4 border-2 border-red-500/30 shadow-2xl shadow-red-500/20 animate-scale-in">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-full bg-red-500/20 flex items-center justify-center">
                <Trash2 className="w-7 h-7 text-red-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Delete Account</h3>
                <p className="text-sm text-gray-400">This is permanent and irreversible</p>
              </div>
            </div>
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-200 font-medium mb-2">⚠️ Warning: This will permanently:</p>
              <ul className="text-xs text-red-300/80 space-y-1 ml-4 list-disc">
                <li>Delete all your synced GitHub data</li>
                <li>Remove all AI insights and analytics</li>
                <li>Unlink all connected accounts</li>
                <li>Erase your account from our systems</li>
              </ul>
            </div>
            <p className="text-gray-300 mb-6 text-sm">
              This action cannot be undone. Are you absolutely sure you want to proceed?
            </p>
            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 border border-gray-600 hover:border-gray-500"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={() => alert('Account deletion will be implemented in production')}
                className="flex-1 bg-red-500 hover:bg-red-600 border-0"
              >
                Delete Forever
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
