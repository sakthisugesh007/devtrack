import { useState, useEffect, useRef } from 'react';
import { Brain, Sparkles, Battery, TrendingUp, Clock, Target, Zap, Send, AlertCircle, RefreshCw, 
         Code, GitBranch, GitCommit, Star, Users, BookOpen, MessageSquare, Lightbulb, 
         Activity, BarChart3, PieChart, Calendar, Award, TrendingDown, Maximize2, Minimize2,
         ChevronDown, ChevronUp, Github, FolderGit2, Hash, Eye, GitPullRequest, Info, 
         Flame, Trophy, Coffee, Moon, Sun, Download, Share2, Filter, Search, 
         ArrowUpRight, ArrowDownRight, Minus, CheckCircle2, XCircle, Timer, Shield, Lock } from 'lucide-react';
import Card from '../components/Card';
import axios from 'axios';
import { API_URL } from '../api';

const AIInsights = () => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [mode, setMode] = useState('loading');
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedSections, setExpandedSections] = useState({});
  const [repos, setRepos] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [timeRange, setTimeRange] = useState('week');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [animateStats, setAnimateStats] = useState(false);
  const chatEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    fetchInsights();
    fetchRepositories();
    setAnimateStats(true);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const fetchRepositories = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/github/repos`, {
        withCredentials: true
      });
      if (response.data) {
        setRepos(response.data.slice(0, 20));
      }
    } catch (err) {
      console.error('Error fetching repos:', err);
    }
  };

  const fetchInsights = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/api/ai/insights`, {
        withCredentials: true
      });

      if (response.data.success) {
        setInsights(response.data.data);
        setMode(response.data.mode);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load AI insights');
      console.error('Error fetching insights:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChat = async (e) => {
    e.preventDefault();
    if (!chatMessage.trim() || chatLoading) return;

    const userMessage = chatMessage;
    setChatMessage('');
    setChatHistory(prev => [...prev, { type: 'user', message: userMessage, timestamp: new Date() }]);
    setChatLoading(true);

    try {
      const response = await axios.post(`${API_URL}/api/ai/chat`, 
        { message: userMessage },
        { withCredentials: true }
      );

      if (response.data.success) {
        setChatHistory(prev => [...prev, { 
          type: 'ai', 
          message: response.data.data.response,
          suggestions: response.data.data.suggestions,
          timestamp: new Date()
        }]);
      }
    } catch (err) {
      setChatHistory(prev => [...prev, { 
        type: 'error', 
        message: 'Failed to get response. Please try again.',
        timestamp: new Date()
      }]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setChatMessage(suggestion);
    const textarea = document.querySelector('textarea, input[type="text"]');
    textarea?.focus();
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const quickPrompts = [
    "Analyze my most productive repositories",
    "What languages should I focus on?",
    "How can I improve code quality?",
    "Show me collaboration patterns",
    "What are my peak productivity hours?",
    "Suggest areas for skill development",
    "Analyze my commit patterns",
    "Which repos need more attention?"
  ];

  const exportReport = (format) => {
    const reportData = {
      generatedAt: new Date().toISOString(),
      vitalityScore,
      productivityScore,
      burnoutLevel,
      recommendations,
      repos: repos.length,
      timeRange
    };

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dev-insights-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
    } else if (format === 'text') {
      const text = `
Developer Insights Report
Generated: ${new Date().toLocaleString()}
==========================================

Vitality Score: ${vitalityScore.score}/100
Productivity Score: ${productivityScore.score}/100
Energy Level: ${100 - burnoutLevel.level}%
Repositories Analyzed: ${repos.length}

Key Recommendations:
${recommendations?.map((r, i) => `${i + 1}. ${r.message}`).join('\n') || 'None'}
      `;
      const blob = new Blob([text], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dev-insights-${new Date().toISOString().split('T')[0]}.txt`;
      a.click();
    }
    setShowExportMenu(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen p-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <Brain className="w-20 h-20 text-blue-500 animate-pulse mx-auto mb-6" />
            <Sparkles className="w-8 h-8 text-purple-400 absolute top-0 right-1/3 animate-ping" />
          </div>
          <p className="text-white text-2xl font-outfit font-bold mb-2">Analyzing Your GitHub Activity</p>
          <p className="text-gray-400 text-sm">Processing commits, repos, and patterns...</p>
          <div className="mt-6 flex justify-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-4 md:p-8 flex items-center justify-center">
        <Card className="p-8 max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white text-center mb-2">Unable to Load Insights</h2>
          <p className="text-gray-400 text-center mb-6">{error}</p>
          <button
            onClick={fetchInsights}
            className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl transition-all font-medium"
          >
            Try Again
          </button>
        </Card>
      </div>
    );
  }

  if (!insights) return null;

  const { vitalityScore, productivityScore, burnoutLevel, deepWorkClock, focusBalance, recommendations, cognitiveLoadPattern, insightsData } = insights;

  return (
    <div className="min-h-screen p-4 md:p-8 pb-32 relative overflow-x-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-pink-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Enhanced Header with Stats Bar */}
      <div className="mb-8 relative z-10">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="relative">
                <Brain className="w-10 h-10 text-blue-400" />
                <Sparkles className="w-4 h-4 text-purple-400 absolute -top-1 -right-1 animate-pulse" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-transparent bg-clip-text font-outfit">
                AI Insights Studio
              </h1>
            </div>
            <div className="flex items-center gap-4 flex-wrap mt-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10">
                {mode === 'mock' ? (
                  <>
                    <Brain className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm text-gray-300">Demo Mode</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />
                    <span className="text-sm text-gray-300">Live Analysis</span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10">
                <FolderGit2 className="w-4 h-4 text-green-400" />
                <span className="text-sm text-gray-300">{repos.length} repos</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10">
                <Clock className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-gray-300">Last updated: {new Date().toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3 flex-wrap">
            {/* Time Range Selector */}
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="day">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>

            {/* Export Menu */}
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all flex items-center space-x-2 border border-white/10"
              >
                <Download className="w-4 h-4" />
                <span className="font-medium">Export</span>
              </button>
              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-white/10 rounded-xl shadow-xl overflow-hidden z-50">
                  <button
                    onClick={() => exportReport('json')}
                    className="w-full px-4 py-3 text-left text-white hover:bg-white/10 transition-colors flex items-center gap-2"
                  >
                    <Code className="w-4 h-4 text-blue-400" />
                    Export as JSON
                  </button>
                  <button
                    onClick={() => exportReport('text')}
                    className="w-full px-4 py-3 text-left text-white hover:bg-white/10 transition-colors flex items-center gap-2"
                  >
                    <BookOpen className="w-4 h-4 text-green-400" />
                    Export as Text
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowChat(!showChat)}
              className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl transition-all flex items-center space-x-2 shadow-lg"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="font-medium">AI Assistant</span>
            </button>
            
            <button
              onClick={fetchInsights}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl transition-all flex items-center space-x-2 shadow-lg hover:shadow-xl"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="font-medium">Refresh</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {[
            { label: 'Vitality', value: vitalityScore?.score || 0, icon: Brain, color: 'blue', suffix: '/100' },
            { label: 'Productivity', value: productivityScore?.score || 0, icon: Zap, color: 'purple', suffix: '/100' },
            { label: 'Energy', value: (100 - (burnoutLevel?.level || 0)), icon: Battery, color: 'green', suffix: '%' },
            { label: 'Focus Time', value: deepWorkClock?.totalHours || 0, icon: Clock, color: 'yellow', suffix: 'h' },
            { label: 'Active Repos', value: repos.length, icon: FolderGit2, color: 'pink', suffix: '' },
            { label: 'Recommendations', value: recommendations?.length || 0, icon: Lightbulb, color: 'orange', suffix: '' },
          ].map((stat, idx) => (
            <div
              key={idx}
              className={`bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/10 hover:bg-white/10 transition-all ${
                animateStats ? 'animate-fade-in' : ''
              }`}
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className="flex items-center justify-between mb-2">
                <stat.icon className={`w-4 h-4 text-${stat.color}-400`} />
                <span className="text-xs text-gray-500 uppercase tracking-wider">{stat.label}</span>
              </div>
              <p className="text-2xl font-bold text-white">
                {stat.value}<span className="text-sm text-gray-400">{stat.suffix}</span>
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-2 scrollbar-thin relative z-10">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'insights', label: 'Deep Insights', icon: Brain },
          { id: 'activity', label: 'Activity Matrix', icon: Calendar },
          { id: 'performance', label: 'Performance', icon: TrendingUp },
          { id: 'advanced', label: 'Advanced Analytics', icon: Award },
          { id: 'repos', label: 'Repositories', icon: FolderGit2 },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-105'
                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white hover:scale-105'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="relative z-10">
          {/* Top Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            
            {/* Vitality Score */}
            <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20 hover:scale-105 transition-transform duration-300 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <Brain className="w-5 h-5 text-blue-400" />
                    </div>
                    <h3 className="text-sm font-bold text-white font-outfit">Developer Vitality</h3>
                  </div>
                  <div className={`p-1.5 rounded-full ${
                    vitalityScore.trend === 'up' ? 'bg-green-500/20' : 
                    vitalityScore.trend === 'down' ? 'bg-red-500/20' : 'bg-yellow-500/20'
                  }`}>
                    {vitalityScore.trend === 'up' ? <ArrowUpRight className="w-4 h-4 text-green-400" /> :
                     vitalityScore.trend === 'down' ? <ArrowDownRight className="w-4 h-4 text-red-400" /> :
                     <Minus className="w-4 h-4 text-yellow-400" />}
                  </div>
                </div>
                
                <div className="text-center py-4">
                  <div className="relative inline-block">
                    <svg className="w-32 h-32 transform -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className="text-white/10"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="url(#gradient1)"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 56}`}
                        strokeDashoffset={`${2 * Math.PI * 56 * (1 - vitalityScore.score / 100)}`}
                        className="transition-all duration-1000"
                        strokeLinecap="round"
                      />
                      <defs>
                        <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#3b82f6" />
                          <stop offset="100%" stopColor="#a855f7" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-white">
                          {vitalityScore.score}
                        </div>
                        <div className="text-xs text-gray-400">out of 100</div>
                      </div>
                    </div>
                  </div>
                  <div className={`inline-flex items-center gap-1 mt-3 px-3 py-1 rounded-full text-xs font-semibold ${
                    vitalityScore.trend === 'up' ? 'bg-green-500/20 text-green-400' :
                    vitalityScore.trend === 'down' ? 'bg-red-500/20 text-red-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {vitalityScore.trend === 'up' ? '↗ Improving' :
                     vitalityScore.trend === 'down' ? '↘ Needs Attention' :
                     '→ Stable'}
                  </div>
                </div>
              </div>
            </Card>

            {/* Productivity Score */}
            <Card className="p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20 hover:scale-105 transition-transform duration-300 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all"></div>
              <div className="relative z-10">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
                  </div>
                  <h3 className="text-sm font-bold text-white font-outfit">Productivity</h3>
                </div>
                
                <div className="text-center py-4">
                  <div className="relative inline-block mb-4">
                    <div className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text">
                      {productivityScore.score}
                    </div>
                    <div className="text-sm text-gray-400 mt-1">Performance Index</div>
                  </div>
                  <div className="space-y-2">
                    {productivityScore.factors?.slice(0, 2).map((factor, idx) => (
                      <div key={idx} className="text-xs text-gray-400 flex items-center gap-2">
                        <CheckCircle2 className="w-3 h-3 text-purple-400" />
                        <span className="truncate">{factor}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            {/* Sustainability */}
            <Card className="p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20 hover:scale-105 transition-transform duration-300 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-2xl group-hover:bg-green-500/20 transition-all"></div>
              <div className="relative z-10">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <Battery className="w-5 h-5 text-green-400" />
                  </div>
                  <h3 className="text-sm font-bold text-white font-outfit">Energy Level</h3>
                </div>

                <div className="text-center py-4">
                  <div className="relative mb-4">
                    <div className="text-5xl font-bold text-white">
                      {100 - burnoutLevel.level}%
                    </div>
                    <div className="text-sm text-gray-400 mt-1">Remaining Energy</div>
                  </div>
                  
                  {/* Battery Visualization */}
                  <div className="relative w-full h-8 bg-white/5 rounded-full overflow-hidden border-2 border-white/20">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${
                        burnoutLevel.risk === 'high' ? 'bg-gradient-to-r from-red-500 to-red-600' :
                        burnoutLevel.risk === 'medium' ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                        'bg-gradient-to-r from-green-500 to-green-600'
                      }`}
                      style={{ width: `${100 - burnoutLevel.level}%` }}
                    >
                      <div className="w-full h-full animate-pulse opacity-50 bg-white"></div>
                    </div>
                  </div>
                  
                  <div className={`inline-flex items-center gap-2 mt-3 px-3 py-1 rounded-full text-xs font-semibold ${
                    burnoutLevel.risk === 'high' ? 'bg-red-500/20 text-red-400' :
                    burnoutLevel.risk === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-green-500/20 text-green-400'
                  }`}>
                    {burnoutLevel.risk === 'high' ? <AlertCircle className="w-3 h-3" /> :
                     burnoutLevel.risk === 'medium' ? <Clock className="w-3 h-3" /> :
                     <CheckCircle2 className="w-3 h-3" />}
                    {burnoutLevel.risk === 'high' ? 'High Risk' :
                     burnoutLevel.risk === 'medium' ? 'Moderate' :
                     'Healthy'}
                  </div>
                </div>
              </div>
            </Card>

            {/* Quick Stats */}
            <Card className="p-6 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/20 hover:scale-105 transition-transform duration-300 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-2xl group-hover:bg-yellow-500/20 transition-all"></div>
              <div className="relative z-10">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="p-2 bg-yellow-500/20 rounded-lg">
                    <Activity className="w-5 h-5 text-yellow-400" />
                  </div>
                  <h3 className="text-sm font-bold text-white font-outfit">Activity Stats</h3>
                </div>
                
                <div className="space-y-4 py-2">
                  <div className="flex justify-between items-center p-2 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-2">
                      <FolderGit2 className="w-4 h-4 text-yellow-400" />
                      <span className="text-xs text-gray-400">Repositories</span>
                    </div>
                    <span className="text-lg font-bold text-white">{repos.length}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Flame className="w-4 h-4 text-orange-400" />
                      <span className="text-xs text-gray-400">Peak Hour</span>
                    </div>
                    <span className="text-lg font-bold text-white">{deepWorkClock?.peakHours?.[0] || 14}:00</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-green-400" />
                      <span className="text-xs text-gray-400">Focus Area</span>
                    </div>
                    <span className="text-sm font-bold text-white capitalize">{focusBalance?.recommendation || 'Balanced'}</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Detailed Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Deep Work Clock */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-blue-400" />
                  <h3 className="text-lg font-bold text-white font-outfit">Peak Hours</h3>
                </div>
                <Info className="w-4 h-4 text-gray-500" />
              </div>
              
              <div className="space-y-3">
                {deepWorkClock?.peakHours?.map((hour, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-16 text-sm text-gray-400 font-mono">{hour}:00</div>
                    <div className="flex-1 h-8 bg-white/5 rounded-lg overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg transition-all duration-500"
                        style={{ width: `${85 - idx * 10}%` }}
                      />
                    </div>
                    <Zap className="w-4 h-4 text-blue-400" />
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-4">{deepWorkClock?.explanation}</p>
            </Card>

            {/* Focus Balance */}
            <Card className="p-6">
              <div className="flex items-center space-x-2 mb-6">
                <Target className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-bold text-white font-outfit">Work Distribution</h3>
              </div>
              
              <div className="space-y-3">
                {[
                  { label: 'Features', value: focusBalance?.features || 0, color: 'blue' },
                  { label: 'Code Review', value: focusBalance?.reviews || 0, color: 'purple' },
                  { label: 'Refactoring', value: focusBalance?.refactor || 0, color: 'pink' },
                  { label: 'Testing', value: focusBalance?.testing || 0, color: 'green' },
                  { label: 'Documentation', value: focusBalance?.documentation || 0, color: 'yellow' },
                  { label: 'Bug Fixes', value: focusBalance?.bugfixes || 0, color: 'red' },
                ].map((item, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">{item.label}</span>
                      <span className="text-white font-bold">{item.value}%</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500`}
                        style={{ 
                          width: `${item.value}%`,
                          backgroundColor: item.color === 'blue' ? '#3b82f6' :
                                         item.color === 'purple' ? '#a855f7' :
                                         item.color === 'pink' ? '#ec4899' :
                                         item.color === 'green' ? '#10b981' :
                                         item.color === 'yellow' ? '#f59e0b' : '#ef4444'
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Recommendations */}
            <Card className="p-6">
              <div className="flex items-center space-x-2 mb-6">
                <Lightbulb className="w-5 h-5 text-yellow-400" />
                <h3 className="text-lg font-bold text-white font-outfit">Quick Wins</h3>
              </div>

              <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar">
                {recommendations?.slice(0, 5).map((item, i) => (
                  <div key={i} className="bg-white/5 p-4 rounded-lg border border-white/5 hover:bg-white/10 transition-all group">
                    <div className="flex items-start justify-between mb-2">
                      <span className={`text-xs font-bold uppercase tracking-wider ${
                        item.priority === 'high' ? 'text-red-400' :
                        item.priority === 'medium' ? 'text-blue-400' :
                        'text-green-400'
                      }`}>
                        {item.type}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                        item.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                        item.priority === 'medium' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-green-500/20 text-green-400'
                      }`}>
                        {item.priority}
                      </span>
                    </div>
                    <p className="text-sm text-white mb-2 font-medium">{item.message}</p>
                    <p className="text-xs text-gray-400">💡 {item.impact}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Cognitive Load & Insights */}
          <div className="grid grid-cols-1 gap-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <Brain className="w-5 h-5 text-pink-400" />
                  <h3 className="text-lg font-bold text-white font-outfit">Weekly Cognitive Load</h3>
                </div>
                <div className="flex space-x-3 text-xs">
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-blue-500/20"></div>
                    <span className="text-gray-400">Low</span>
                  </span>
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-blue-500"></div>
                    <span className="text-gray-400">High</span>
                  </span>
                </div>
              </div>

              {cognitiveLoadPattern?.alert && (
                <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <p className="text-sm text-yellow-400 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    {cognitiveLoadPattern.alert}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-7 gap-3">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
                  const intensity = cognitiveLoadPattern?.dailyPattern?.[i] || (45 + i * 10);
                  const height = `${Math.max(20, intensity)}%`;
                  return (
                    <div key={i} className="flex flex-col items-center gap-2">
                      <div className="flex-1 w-full flex items-end min-h-[120px]">
                        <div
                          className="w-full rounded-t-lg transition-all duration-300 hover:opacity-80 cursor-pointer relative group"
                          style={{ 
                            height,
                            backgroundColor: `rgba(59, 130, 246, ${Math.max(0.2, intensity / 100)})`
                          }}
                        >
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap transition-opacity">
                            {intensity}% load
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-gray-400 font-medium">{day}</span>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Deep Insights Tab */}
      {activeTab === 'insights' && (
        <div className="space-y-6">
          {/* Key Insights */}
          {insights?.insights && insights.insights.length > 0 && (
            <Card className="p-6">
              <div className="flex items-center space-x-2 mb-6">
                <Sparkles className="w-6 h-6 text-blue-400" />
                <h2 className="text-2xl font-bold text-white font-outfit">AI-Generated Insights</h2>
              </div>
              <div className="grid gap-4">
                {insights.insights.map((insight, i) => (
                  <div key={i} className="flex gap-4 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl border border-blue-500/20">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold">
                      {i + 1}
                    </div>
                    <p className="text-gray-200 leading-relaxed flex-1">{insight}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Detailed Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                Productivity Analysis
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-gray-400 text-sm mb-2">Current Score</p>
                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-bold text-white">{productivityScore.score}</span>
                    <span className="text-gray-500 mb-1">/100</span>
                  </div>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-3">Contributing Factors</p>
                  <div className="space-y-2">
                    {productivityScore.factors?.map((factor, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-2"></div>
                        <span className="text-gray-300 text-sm">{factor}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="pt-4 border-t border-white/10">
                  <p className="text-gray-400 text-sm italic">{productivityScore.explanation}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Battery className="w-5 h-5 text-yellow-400" />
                Burnout Assessment
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-gray-400 text-sm mb-2">Risk Level</p>
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${
                    burnoutLevel.risk === 'high' ? 'bg-red-500/20 text-red-400' :
                    burnoutLevel.risk === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-green-500/20 text-green-400'
                  }`}>
                    <span className="text-2xl font-bold capitalize">{burnoutLevel.risk}</span>
                  </div>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-3">Warning Signs</p>
                  <div className="space-y-2">
                    {burnoutLevel.indicators?.map((indicator, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5" />
                        <span className="text-gray-300 text-sm">{indicator}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="pt-4 border-t border-white/10">
                  <p className="text-sm text-gray-400">
                    <strong className="text-white">Recommendation:</strong> {burnoutLevel.recommendation}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* All Recommendations */}
          <Card className="p-6">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              Complete Action Plan
            </h3>
            <div className="grid gap-4">
              {recommendations?.map((item, i) => (
                <div key={i} className="p-5 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
                          item.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                          item.priority === 'medium' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-green-500/20 text-green-400'
                        }`}>
                          {item.type}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          item.priority === 'high' ? 'bg-red-500/10 text-red-400' :
                          item.priority === 'medium' ? 'bg-blue-500/10 text-blue-400' :
                          'bg-green-500/10 text-green-400'
                        }`}>
                          Priority: {item.priority}
                        </span>
                      </div>
                      <p className="text-white font-medium mb-2">{item.message}</p>
                      <p className="text-sm text-gray-400">
                        <strong className="text-gray-300">Expected Impact:</strong> {item.impact}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Activity Heatmap Tab */}
      {activeTab === 'activity' && (
        <div className="space-y-6">
          {/* Contribution Heatmap */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white font-outfit flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-green-400" />
                  Contribution Activity
                </h2>
                <p className="text-gray-400 text-sm mt-1">Your coding activity over the past year</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-white">{Math.floor(Math.random() * 500 + 200)}</p>
                <p className="text-xs text-gray-500">Total Contributions</p>
              </div>
            </div>

            {/* Heatmap Grid */}
            <div className="overflow-x-auto">
              <div className="inline-block min-w-full">
                {/* Month Labels */}
                <div className="flex gap-1 mb-2 ml-12">
                  {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, idx) => (
                    <div key={idx} className="text-xs text-gray-500" style={{ width: '84px' }}>
                      {month}
                    </div>
                  ))}
                </div>
                
                {/* Heatmap */}
                <div className="flex gap-1">
                  {/* Day Labels */}
                  <div className="flex flex-col justify-around text-xs text-gray-500 mr-2">
                    <span>Mon</span>
                    <span>Wed</span>
                    <span>Fri</span>
                  </div>
                  
                  {/* Grid */}
                  <div className="grid grid-flow-col gap-1" style={{ gridTemplateRows: 'repeat(7, 1fr)', gridAutoColumns: '12px' }}>
                    {Array.from({ length: 365 }).map((_, i) => {
                      const intensity = Math.random();
                      const contributions = Math.floor(intensity * 15);
                      return (
                        <div
                          key={i}
                          className="w-3 h-3 rounded-sm cursor-pointer transition-all hover:ring-2 hover:ring-blue-400 group relative"
                          style={{
                            backgroundColor: 
                              intensity > 0.8 ? '#10b981' :
                              intensity > 0.6 ? '#34d399' :
                              intensity > 0.4 ? '#6ee7b7' :
                              intensity > 0.2 ? '#a7f3d0' :
                              intensity > 0.05 ? '#d1fae5' : '#1e293b'
                          }}
                        >
                          <div className="opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10 pointer-events-none">
                            {contributions} contributions
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Legend */}
                <div className="flex items-center justify-end gap-2 mt-4 text-xs text-gray-500">
                  <span>Less</span>
                  <div className="flex gap-1">
                    {[0.05, 0.3, 0.5, 0.7, 0.9].map((intensity, idx) => (
                      <div
                        key={idx}
                        className="w-3 h-3 rounded-sm"
                        style={{
                          backgroundColor: 
                            intensity > 0.8 ? '#10b981' :
                            intensity > 0.6 ? '#34d399' :
                            intensity > 0.4 ? '#6ee7b7' :
                            intensity > 0.2 ? '#a7f3d0' : '#d1fae5'
                        }}
                      />
                    ))}
                  </div>
                  <span>More</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Activity Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-green-500/20 rounded-xl">
                  <GitCommit className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Current Streak</p>
                  <p className="text-3xl font-bold text-white">{Math.floor(Math.random() * 30 + 5)} days</p>
                </div>
              </div>
              <p className="text-xs text-gray-500">Keep it going! 🔥</p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-yellow-500/20 rounded-xl">
                  <Award className="w-6 h-6 text-yellow-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Longest Streak</p>
                  <p className="text-3xl font-bold text-white">{Math.floor(Math.random() * 60 + 30)} days</p>
                </div>
              </div>
              <p className="text-xs text-gray-500">Personal best 🏆</p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-blue-500/20 rounded-xl">
                  <Activity className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Avg Per Day</p>
                  <p className="text-3xl font-bold text-white">{Math.floor(Math.random() * 10 + 3)}</p>
                </div>
              </div>
              <p className="text-xs text-gray-500">Contributions/day</p>
            </Card>
          </div>

          {/* Monthly Activity Breakdown */}
          <Card className="p-6">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-400" />
              Monthly Activity Breakdown
            </h3>
            <div className="grid grid-cols-12 gap-2">
              {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, idx) => {
                const value = Math.floor(Math.random() * 80 + 20);
                return (
                  <div key={idx} className="flex flex-col items-center gap-2">
                    <div className="flex-1 flex items-end h-32 w-full">
                      <div
                        className="w-full bg-gradient-to-t from-blue-500 to-purple-500 rounded-t transition-all hover:opacity-80 cursor-pointer"
                        style={{ height: `${value}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-400">{month}</span>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {/* Performance Tab - NEW */}
      {activeTab === 'performance' && (
        <div className="space-y-6 relative z-10">
          {/* Performance Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Code Quality Score */}
            <Card className="p-6 bg-gradient-to-br from-indigo-500/10 to-blue-500/10 border-indigo-500/20">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Code className="w-6 h-6 text-indigo-400" />
                Code Quality Score
              </h3>
              
              <div className="flex items-center justify-center mb-6">
                <div className="relative">
                  <svg className="w-48 h-48 transform -rotate-90">
                    <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="none" className="text-white/10" />
                    <circle
                      cx="96"
                      cy="96"
                      r="88"
                      stroke="url(#qualityGradient)"
                      strokeWidth="12"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 88}`}
                      strokeDashoffset={`${2 * Math.PI * 88 * (1 - 0.87)}`}
                      className="transition-all duration-1000"
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient id="qualityGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#3b82f6" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-5xl font-bold text-white">87</div>
                    <div className="text-sm text-gray-400">Excellent</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Maintainability', value: 92, icon: CheckCircle2 },
                  { label: 'Reliability', value: 85, icon: Shield },
                  { label: 'Security', value: 89, icon: Lock },
                  { label: 'Coverage', value: 78, icon: Target },
                ].map((metric, idx) => (
                  <div key={idx} className="p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <metric.icon className="w-4 h-4 text-indigo-400" />
                      <span className="text-xs text-gray-400">{metric.label}</span>
                    </div>
                    <div className="flex items-end gap-1">
                      <span className="text-2xl font-bold text-white">{metric.value}</span>
                      <span className="text-xs text-gray-500 mb-1">%</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Performance Metrics */}
            <Card className="p-6 bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-emerald-500/20">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Zap className="w-6 h-6 text-emerald-400" />
                Development Velocity
              </h3>

              <div className="space-y-6">
                {[
                  { label: 'Commits/Week', current: 32, previous: 28, icon: GitCommit, color: 'blue' },
                  { label: 'PRs Merged', current: 8, previous: 6, icon: GitPullRequest, color: 'purple' },
                  { label: 'Issues Closed', current: 12, previous: 15, icon: CheckCircle2, color: 'green' },
                  { label: 'Code Reviews', current: 18, previous: 14, icon: Eye, color: 'yellow' },
                ].map((metric, idx) => {
                  const change = ((metric.current - metric.previous) / metric.previous * 100).toFixed(1);
                  const isPositive = metric.current > metric.previous;
                  return (
                    <div key={idx} className="p-4 bg-white/5 rounded-xl border border-white/5">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 bg-${metric.color}-500/20 rounded-lg`}>
                            <metric.icon className={`w-5 h-5 text-${metric.color}-400`} />
                          </div>
                          <span className="text-white font-medium">{metric.label}</span>
                        </div>
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${
                          isPositive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                          {Math.abs(parseFloat(change))}%
                        </div>
                      </div>
                      <div className="flex items-end gap-2">
                        <span className="text-3xl font-bold text-white">{metric.current}</span>
                        <span className="text-sm text-gray-500 mb-1">vs {metric.previous} last week</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Response Time Analytics */}
          <Card className="p-6">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Timer className="w-6 h-6 text-pink-400" />
              Response & Review Times
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { 
                  label: 'Avg PR Review Time', 
                  value: '2.4', 
                  unit: 'hours', 
                  status: 'excellent',
                  description: '45% faster than team average',
                  icon: Eye
                },
                { 
                  label: 'First Response Time', 
                  value: '18', 
                  unit: 'minutes', 
                  status: 'good',
                  description: 'Quick initial feedback',
                  icon: MessageSquare
                },
                { 
                  label: 'PR Merge Time', 
                  value: '4.2', 
                  unit: 'hours', 
                  status: 'average',
                  description: 'From approval to merge',
                  icon: GitBranch
                },
              ].map((metric, idx) => (
                <div key={idx} className="p-6 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all">
                  <div className={`inline-flex p-3 rounded-xl mb-4 ${
                    metric.status === 'excellent' ? 'bg-green-500/20' :
                    metric.status === 'good' ? 'bg-blue-500/20' : 'bg-yellow-500/20'
                  }`}>
                    <metric.icon className={`w-6 h-6 ${
                      metric.status === 'excellent' ? 'text-green-400' :
                      metric.status === 'good' ? 'text-blue-400' : 'text-yellow-400'
                    }`} />
                  </div>
                  <h4 className="text-gray-400 text-sm mb-2">{metric.label}</h4>
                  <div className="flex items-end gap-2 mb-2">
                    <span className="text-4xl font-bold text-white">{metric.value}</span>
                    <span className="text-lg text-gray-500 mb-1">{metric.unit}</span>
                  </div>
                  <p className="text-xs text-gray-500">{metric.description}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Productivity Patterns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-400" />
                Productivity Patterns
              </h3>
              
              <div className="space-y-4">
                {[
                  { day: 'Monday', productivity: 75, commits: 8 },
                  { day: 'Tuesday', productivity: 88, commits: 12 },
                  { day: 'Wednesday', productivity: 92, commits: 15 },
                  { day: 'Thursday', productivity: 85, commits: 11 },
                  { day: 'Friday', productivity: 68, commits: 6 },
                  { day: 'Saturday', productivity: 45, commits: 3 },
                  { day: 'Sunday', productivity: 35, commits: 2 },
                ].map((day, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">{day.day}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-500">{day.commits} commits</span>
                        <span className="text-sm font-bold text-white">{day.productivity}%</span>
                      </div>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-orange-500 to-pink-500 rounded-full transition-all duration-500"
                        style={{ width: `${day.productivity}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                Achievements & Milestones
              </h3>
              
              <div className="space-y-3">
                {[
                  { title: '100+ Commits Milestone', date: '2 days ago', icon: Star, color: 'yellow' },
                  { title: 'Code Quality Master', date: '1 week ago', icon: Award, color: 'purple' },
                  { title: '30 Day Streak', date: '3 days ago', icon: Flame, color: 'orange' },
                  { title: 'Team Contributor', date: '5 days ago', icon: Users, color: 'blue' },
                  { title: 'Bug Crusher', date: '1 week ago', icon: CheckCircle2, color: 'green' },
                ].map((achievement, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all border border-white/5">
                    <div className={`p-3 rounded-xl bg-${achievement.color}-500/20`}>
                      <achievement.icon className={`w-5 h-5 text-${achievement.color}-400`} />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-medium">{achievement.title}</h4>
                      <p className="text-xs text-gray-500">{achievement.date}</p>
                    </div>
                    <Sparkles className="w-4 h-4 text-yellow-400" />
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Advanced Analytics Tab */}
      {activeTab === 'advanced' && (
        <div className="space-y-6">
          {/* Language Evolution */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-white font-outfit mb-6 flex items-center gap-2">
              <Code className="w-6 h-6 text-blue-400" />
              Language Expertise Timeline
            </h2>
            <div className="space-y-4">
              {[
                { lang: 'JavaScript', level: 85, trend: 'up', color: 'yellow' },
                { lang: 'Python', level: 75, trend: 'up', color: 'blue' },
                { lang: 'TypeScript', level: 70, trend: 'stable', color: 'blue' },
                { lang: 'Java', level: 60, trend: 'down', color: 'orange' },
                { lang: 'Go', level: 45, trend: 'up', color: 'cyan' },
              ].map((item, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <span className="text-white font-medium">{item.lang}</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        item.trend === 'up' ? 'bg-green-500/20 text-green-400' :
                        item.trend === 'down' ? 'bg-red-500/20 text-red-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {item.trend === 'up' ? '↗ Growing' : item.trend === 'down' ? '↘ Declining' : '→ Stable'}
                      </span>
                    </div>
                    <span className="text-white font-bold">{item.level}%</span>
                  </div>
                  <div className="relative h-3 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`absolute h-full bg-gradient-to-r from-${item.color}-500 to-${item.color}-400 rounded-full transition-all duration-1000`}
                      style={{ width: `${item.level}%` }}
                    >
                      <div className="absolute inset-0 bg-white/20 animate-pulse" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Collaboration Network */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-400" />
                Collaboration Impact
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                      {Math.floor(Math.random() * 50 + 10)}
                    </div>
                    <div>
                      <p className="text-white font-medium">Pull Requests</p>
                      <p className="text-xs text-gray-400">Opened & reviewed</p>
                    </div>
                  </div>
                  <TrendingUp className="w-5 h-5 text-green-400" />
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center text-white font-bold">
                      {Math.floor(Math.random() * 100 + 50)}
                    </div>
                    <div>
                      <p className="text-white font-medium">Code Reviews</p>
                      <p className="text-xs text-gray-400">Given to teammates</p>
                    </div>
                  </div>
                  <TrendingUp className="w-5 h-5 text-green-400" />
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center text-white font-bold">
                      {Math.floor(Math.random() * 30 + 5)}
                    </div>
                    <div>
                      <p className="text-white font-medium">Collaborators</p>
                      <p className="text-xs text-gray-400">Active contributors</p>
                    </div>
                  </div>
                  <Users className="w-5 h-5 text-blue-400" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Target className="w-5 h-5 text-pink-400" />
                Code Quality Metrics
              </h3>
              <div className="space-y-4">
                {[
                  { label: 'Test Coverage', value: 78, color: 'green', icon: '✓' },
                  { label: 'Code Reusability', value: 85, color: 'blue', icon: '♻' },
                  { label: 'Documentation', value: 65, color: 'yellow', icon: '📚' },
                  { label: 'Bug Fix Rate', value: 92, color: 'purple', icon: '🐛' },
                ].map((metric, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-300 text-sm flex items-center gap-2">
                        <span>{metric.icon}</span>
                        {metric.label}
                      </span>
                      <span className="text-white font-bold">{metric.value}%</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-${metric.color}-500 rounded-full transition-all duration-500`}
                        style={{ width: `${metric.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Project Health Dashboard */}
          <Card className="p-6">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              Repository Health Scores
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {repos.slice(0, 6).map((repo, idx) => (
                <div key={idx} className="p-4 bg-gradient-to-br from-white/5 to-white/10 rounded-xl border border-white/10 hover:border-blue-500/30 transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="text-white font-bold text-sm truncate">{repo.name}</h4>
                      <p className="text-xs text-gray-400 mt-1">{repo.language || 'Unknown'}</p>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${
                        idx % 3 === 0 ? 'text-green-400' :
                        idx % 3 === 1 ? 'text-yellow-400' : 'text-blue-400'
                      }`}>
                        {Math.floor(Math.random() * 30 + 70)}
                      </div>
                      <p className="text-xs text-gray-500">Health</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Star className="w-3 h-3" />
                    <span>{repo.stargazers_count || 0}</span>
                    <GitBranch className="w-3 h-3 ml-2" />
                    <span>{repo.forks_count || 0}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Time Analysis */}
          <Card className="p-6">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 text-cyan-400" />
              Coding Time Patterns
            </h3>
            <div className="grid grid-cols-7 gap-4">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => (
                <div key={idx} className="text-center">
                  <p className="text-gray-400 text-xs mb-3">{day}</p>
                  <div className="space-y-1">
                    {Array.from({ length: 24 }).map((_, hour) => {
                      const activity = Math.random();
                      return (
                        <div
                          key={hour}
                          className="h-1 rounded-full"
                          style={{
                            backgroundColor: activity > 0.7 ? '#3b82f6' :
                                           activity > 0.4 ? '#60a5fa' :
                                           activity > 0.2 ? '#93c5fd' : '#1e293b'
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-center gap-3 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-blue-500"></div>
                <span>High Activity</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-blue-300"></div>
                <span>Medium</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-gray-700"></div>
                <span>Low</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Repositories Tab */}
      {activeTab === 'repos' && (
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white font-outfit flex items-center gap-2">
                <FolderGit2 className="w-6 h-6 text-purple-400" />
                Your Repositories
              </h2>
              <span className="text-gray-400 text-sm">{repos.length} total</span>
            </div>

            {repos.length === 0 ? (
              <div className="text-center py-12">
                <Github className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No repositories found</p>
                <p className="text-gray-500 text-sm mt-2">Connect your GitHub account to see your repos</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {repos.map((repo, idx) => (
                  <div 
                    key={idx} 
                    className="p-5 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 hover:border-blue-500/30 transition-all cursor-pointer group"
                    onClick={() => setSelectedRepo(selectedRepo === idx ? null : idx)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <FolderGit2 className="w-5 h-5 text-blue-400" />
                          <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
                            {repo.name}
                          </h3>
                          {repo.private && (
                            <span className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded">Private</span>
                          )}
                        </div>
                        {repo.description && (
                          <p className="text-gray-400 text-sm mb-3">{repo.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          {repo.language && (
                            <span className="flex items-center gap-1">
                              <Code className="w-4 h-4" />
                              {repo.language}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Star className="w-4 h-4" />
                            {repo.stargazers_count || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <GitBranch className="w-4 h-4" />
                            {repo.forks_count || 0} forks
                          </span>
                          {repo.open_issues_count > 0 && (
                            <span className="flex items-center gap-1">
                              <AlertCircle className="w-4 h-4" />
                              {repo.open_issues_count} issues
                            </span>
                          )}
                        </div>
                      </div>
                      <button className="text-gray-500 hover:text-white transition-colors">
                        {selectedRepo === idx ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </button>
                    </div>
                    
                    {selectedRepo === idx && (
                      <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Created</p>
                          <p className="text-sm text-white">{new Date(repo.created_at).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Updated</p>
                          <p className="text-sm text-white">{new Date(repo.updated_at).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Size</p>
                          <p className="text-sm text-white">{(repo.size / 1024).toFixed(2)} MB</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Watchers</p>
                          <p className="text-sm text-white flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {repo.watchers_count || 0}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Floating Chat Interface */}
      {showChat && (
        <div className="fixed bottom-6 right-6 w-96 max-w-[calc(100vw-3rem)] z-50">
          <Card className="flex flex-col h-[600px] max-h-[80vh] bg-[#0a0e27]/95 backdrop-blur-xl border-blue-500/30 shadow-2xl">
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white animate-pulse" />
                </div>
                <div>
                  <h3 className="text-white font-bold">AI Assistant</h3>
                  <p className="text-xs text-gray-400">Ask anything about your GitHub activity</p>
                </div>
              </div>
              <button
                onClick={() => setShowChat(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Minimize2 className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Prompts */}
            {chatHistory.length === 0 && (
              <div className="p-4 border-b border-white/10">
                <p className="text-xs text-gray-400 mb-3">Quick questions:</p>
                <div className="flex flex-wrap gap-2">
                  {quickPrompts.slice(0, 4).map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSuggestionClick(prompt)}
                      className="text-xs px-3 py-2 bg-white/5 hover:bg-blue-500/20 text-gray-300 hover:text-white rounded-lg transition-all border border-white/5 hover:border-blue-500/30"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Chat Messages */}
            <div 
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar"
            >
              {chatHistory.length === 0 ? (
                <div className="text-center py-8">
                  <Brain className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">Start a conversation with AI</p>
                  <p className="text-gray-600 text-xs mt-1">Ask about your repos, productivity, or get coding advice</p>
                </div>
              ) : (
                <>
                  {chatHistory.map((chat, i) => (
                    <div key={i} className={`flex ${chat.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] ${chat.type === 'user' ? 'order-2' : 'order-1'}`}>
                        <div className={`px-4 py-3 rounded-2xl ${
                          chat.type === 'user' 
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
                            : chat.type === 'error'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : 'bg-white/10 text-gray-200'
                        }`}>
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">{chat.message}</p>
                        </div>
                        {chat.suggestions && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {chat.suggestions.map((sug, idx) => (
                              <button
                                key={idx}
                                onClick={() => handleSuggestionClick(sug)}
                                className="text-xs px-3 py-1 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-full transition-colors"
                              >
                                {sug}
                              </button>
                            ))}
                          </div>
                        )}
                        <p className="text-[10px] text-gray-600 mt-1 px-2">
                          {chat.timestamp?.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {chatLoading && (
                    <div className="flex justify-start">
                      <div className="bg-white/10 px-4 py-3 rounded-2xl">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </>
              )}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleChat} className="p-4 border-t border-white/10">
              <div className="flex items-end gap-2">
                <textarea
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleChat(e);
                    }
                  }}
                  placeholder="Ask about your GitHub activity..."
                  className="flex-1 bg-white/5 border border-white/10 focus:border-blue-500/50 text-white placeholder-gray-500 px-4 py-3 rounded-xl outline-none resize-none transition-colors"
                  rows="2"
                  disabled={chatLoading}
                />
                <button 
                  type="submit"
                  disabled={chatLoading || !chatMessage.trim()}
                  className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AIInsights;
