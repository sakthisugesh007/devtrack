import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../api';
import Card from '../components/Card';
import { 
  FolderGit2, Star, GitFork, AlertCircle, Code, Eye, GitBranch, 
  Search, Filter, ArrowUpDown, ExternalLink, Calendar, Clock,
  TrendingUp, Package, Lock, Globe, ChevronDown, ChevronUp, 
  Activity, Download, Users, BookOpen, Archive, RefreshCw,
  GitCommit, BarChart3, PieChart, FileText, Tag, Zap, Target
} from 'lucide-react';

const Repositories = () => {
  const [repos, setRepos] = useState([]);
  const [filteredRepos, setFilteredRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('updated'); // updated, stars, forks, name, size
  const [filterLang, setFilterLang] = useState('all');
  const [filterType, setFilterType] = useState('all'); // all, public, private
  const [filterTopic, setFilterTopic] = useState('all');
  const [minStars, setMinStars] = useState(0);
  const [expandedRepo, setExpandedRepo] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRepos, setSelectedRepos] = useState(new Set());
  const [viewMode, setViewMode] = useState('grid'); // grid, list, analytics
  const navigate = useNavigate();

  useEffect(() => {
    fetchRepositories();
  }, []);

  useEffect(() => {
    filterAndSortRepos();
  }, [searchQuery, sortBy, filterLang, filterType, filterTopic, minStars, repos]);

  const fetchRepositories = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/github/repos`, {
        withCredentials: true
      });
      setRepos(response.data || []);
      setFilteredRepos(response.data || []);
    } catch (error) {
      console.error('Error fetching repositories:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortRepos = () => {
    let filtered = [...repos];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(repo =>
        repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        repo.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        repo.topics?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Language filter
    if (filterLang !== 'all') {
      filtered = filtered.filter(repo => repo.language === filterLang);
    }

    // Type filter (visibility)
    if (filterType === 'public') {
      filtered = filtered.filter(repo => !repo.private);
    } else if (filterType === 'private') {
      filtered = filtered.filter(repo => repo.private);
    }

    // Topic filter
    if (filterTopic !== 'all') {
      filtered = filtered.filter(repo => repo.topics?.includes(filterTopic));
    }

    // Stars filter
    if (minStars > 0) {
      filtered = filtered.filter(repo => (repo.stargazers_count || 0) >= minStars);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'stars':
          return (b.stargazers_count || 0) - (a.stargazers_count || 0);
        case 'forks':
          return (b.forks_count || 0) - (a.forks_count || 0);
        case 'size':
          return (b.size || 0) - (a.size || 0);
        case 'issues':
          return (b.open_issues_count || 0) - (a.open_issues_count || 0);
        case 'name':
          return a.name.localeCompare(b.name);
        case 'updated':
        default:
          return new Date(b.updated_at) - new Date(a.updated_at);
      }
    });

    setFilteredRepos(filtered);
  };

  const getLanguages = () => {
    const languages = new Set();
    repos.forEach(repo => {
      if (repo.language) languages.add(repo.language);
    });
    return Array.from(languages).sort();
  };

  const getTopics = () => {
    const topics = new Set();
    repos.forEach(repo => {
      if (repo.topics) {
        repo.topics.forEach(t => topics.add(t));
      }
    });
    return Array.from(topics).sort();
  };

  const getRepoStats = () => {
    return {
      total: repos.length,
      public: repos.filter(r => !r.private).length,
      private: repos.filter(r => r.private).length,
      totalStars: repos.reduce((sum, r) => sum + (r.stargazers_count || 0), 0),
      totalForks: repos.reduce((sum, r) => sum + (r.forks_count || 0), 0),
      totalIssues: repos.reduce((sum, r) => sum + (r.open_issues_count || 0), 0),
      archived: repos.filter(r => r.archived).length,
      forks: repos.filter(r => r.fork).length,
    };
  };

  const toggleRepoSelection = (repoId) => {
    const newSelected = new Set(selectedRepos);
    if (newSelected.has(repoId)) {
      newSelected.delete(repoId);
    } else {
      newSelected.add(repoId);
    }
    setSelectedRepos(newSelected);
  };

  const getLanguageStats = () => {
    const langCounts = {};
    repos.forEach(repo => {
      if (repo.language) {
        langCounts[repo.language] = (langCounts[repo.language] || 0) + 1;
      }
    });
    return Object.entries(langCounts)
      .map(([lang, count]) => ({ lang, count, percentage: ((count / repos.length) * 100).toFixed(1) }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  const stats = getRepoStats();
  const languages = getLanguages();
  const topics = getTopics();
  const languageStats = getLanguageStats();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Loading repositories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text mb-2 font-outfit">
              Your Repositories
            </h1>
            <p className="text-gray-400">Manage and explore all your GitHub repositories</p>
          </div>
          <button
            onClick={fetchRepositories}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <FolderGit2 className="w-8 h-8 text-blue-400" />
              <div>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
                <p className="text-xs text-gray-400">Total Repos</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Globe className="w-8 h-8 text-green-400" />
              <div>
                <p className="text-2xl font-bold text-white">{stats.public}</p>
                <p className="text-xs text-gray-400">Public</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 border-2 border-yellow-500/30">
            <div className="flex items-center gap-3">
              <Lock className="w-8 h-8 text-yellow-400" />
              <div>
                <p className="text-2xl font-bold text-yellow-300">{stats.private}</p>
                <p className="text-xs text-gray-400">Private</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Star className="w-8 h-8 text-yellow-400" />
              <div>
                <p className="text-2xl font-bold text-white">{stats.totalStars}</p>
                <p className="text-xs text-gray-400">Total Stars</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <GitFork className="w-8 h-8 text-purple-400" />
              <div>
                <p className="text-2xl font-bold text-white">{stats.totalForks}</p>
                <p className="text-xs text-gray-400">Total Forks</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-8 h-8 text-red-400" />
              <div>
                <p className="text-2xl font-bold text-white">{stats.totalIssues}</p>
                <p className="text-xs text-gray-400">Open Issues</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Archive className="w-8 h-8 text-gray-400" />
              <div>
                <p className="text-2xl font-bold text-white">{stats.archived}</p>
                <p className="text-xs text-gray-400">Archived</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="p-6 mb-6">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search repositories by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Filter Toggle */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <Filter className="w-4 h-4" />
              <span className="text-sm">{showFilters ? 'Hide' : 'Show'} Filters</span>
              {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            <div className="text-sm text-gray-400">
              Showing {filteredRepos.length} of {repos.length} repositories
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 pt-4 border-t border-white/10">
              {/* Sort By */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-900 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500 [&>option]:bg-gray-900 [&>option]:text-white [&>option]:py-2"
                >
                  <option value="updated">Recently Updated</option>
                  <option value="stars">Most Stars</option>
                  <option value="forks">Most Forks</option>
                  <option value="issues">Most Issues</option>
                  <option value="size">Largest Size</option>
                  <option value="name">Name (A-Z)</option>
                </select>
              </div>

              {/* Language Filter */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Language</label>
                <select
                  value={filterLang}
                  onChange={(e) => setFilterLang(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-900 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500 [&>option]:bg-gray-900 [&>option]:text-white [&>option]:py-2"
                >
                  <option value="all">All Languages</option>
                  {languages.map(lang => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
              </div>

              {/* Type Filter */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Visibility</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-900 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500 [&>option]:bg-gray-900 [&>option]:text-white [&>option]:py-2"
                >
                  <option value="all">All Types</option>
                  <option value="public">Public Only</option>
                  <option value="private">Private Only</option>
                </select>
              </div>

              {/* Topic Filter */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Topic</label>
                <select
                  value={filterTopic}
                  onChange={(e) => setFilterTopic(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-900 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500 [&>option]:bg-gray-900 [&>option]:text-white [&>option]:py-2"
                >
                  <option value="all">All Topics</option>
                  {topics.map(topic => (
                    <option key={topic} value={topic}>{topic}</option>
                  ))}
                </select>
              </div>

              {/* Min Stars Filter */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Min Stars</label>
                <input
                  type="number"
                  min="0"
                  value={minStars}
                  onChange={(e) => setMinStars(parseInt(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* View Mode Tabs & Language Analytics */}
      <div className="mb-6 flex flex-col lg:flex-row gap-4">
        {/* View Modes */}
        <Card className="flex-1 p-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              <FolderGit2 className="w-4 h-4" />
              Grid View
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              List View
            </button>
            <button
              onClick={() => setViewMode('analytics')}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                viewMode === 'analytics' ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Analytics
            </button>
          </div>
        </Card>

        {/* Language Distribution */}
        <Card className="flex-1 p-4">
          <h3 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
            <Code className="w-4 h-4" />
            Top Languages
          </h3>
          <div className="space-y-2">
            {languageStats.slice(0, 3).map((lang, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div className="w-24 text-xs text-gray-400">{lang.lang}</div>
                <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                    style={{ width: `${lang.percentage}%` }}
                  ></div>
                </div>
                <div className="w-12 text-xs text-gray-400 text-right">{lang.percentage}%</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Analytics View */}
      {viewMode === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card className="p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-blue-400" />
              Language Distribution
            </h3>
            <div className="space-y-3">
              {languageStats.map((lang, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-300">{lang.lang}</span>
                    <span className="text-sm text-gray-400">{lang.count} repos ({lang.percentage}%)</span>
                  </div>
                  <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                      style={{ width: `${lang.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-green-400" />
              Repository Health
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-green-400" />
                  <span className="text-sm text-gray-300">Active Repos</span>
                </div>
                <span className="text-xl font-bold text-green-400">
                  {repos.filter(r => !r.archived && new Date(r.updated_at) > new Date(Date.now() - 30*24*60*60*1000)).length}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-400" />
                  <span className="text-sm text-gray-300">Needs Attention</span>
                </div>
                <span className="text-xl font-bold text-yellow-400">
                  {repos.filter(r => (r.open_issues_count || 0) > 5).length}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-purple-400" />
                  <span className="text-sm text-gray-300">Popular (10+ stars)</span>
                </div>
                <span className="text-xl font-bold text-purple-400">
                  {repos.filter(r => (r.stargazers_count || 0) >= 10).length}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-500/10 border border-gray-500/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <Archive className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-300">Archived</span>
                </div>
                <span className="text-xl font-bold text-gray-400">{stats.archived}</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Repositories Grid/List */}
      {filteredRepos.length === 0 ? (
        <Card className="p-12 text-center">
          <Archive className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No repositories found</h3>
          <p className="text-gray-400">Try adjusting your search or filters</p>
        </Card>
      ) : (
        <div className={viewMode === 'list' ? 'space-y-3' : 'grid gap-4'}>
          {filteredRepos.map((repo, idx) => (
            <Card
              key={idx}
              className={`p-6 hover:bg-white/10 transition-all cursor-pointer ${
                repo.private 
                  ? 'border-2 border-yellow-500/50 bg-yellow-500/5' 
                  : 'border border-white/5 hover:border-blue-500/30'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1" onClick={() => setExpandedRepo(expandedRepo === idx ? null : idx)}>
                  <div className="flex items-start gap-3 mb-3">
                    <FolderGit2 className={`w-6 h-6 mt-1 flex-shrink-0 ${repo.private ? 'text-yellow-400' : 'text-blue-400'}`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <h3 className="text-xl font-bold text-white hover:text-blue-400 transition-colors">
                          {repo.name}
                        </h3>
                        {repo.private && (
                          <span className="px-3 py-1 text-xs font-semibold bg-yellow-500/30 text-yellow-300 rounded-full border-2 border-yellow-500/50 flex items-center gap-1.5 animate-pulse">
                            <Lock className="w-3.5 h-3.5" />
                            Private
                          </span>
                        )}
                        {!repo.private && (
                          <span className="px-2 py-1 text-xs bg-green-500/20 text-green-400 rounded border border-green-500/30 flex items-center gap-1">
                            <Globe className="w-3 h-3" />
                            Public
                          </span>
                        )}
                        {repo.fork && (
                          <span className="px-2 py-1 text-xs bg-purple-500/20 text-purple-400 rounded border border-purple-500/30 flex items-center gap-1">
                            <GitFork className="w-3 h-3" />
                            Fork
                          </span>
                        )}
                        {repo.archived && (
                          <span className="px-2 py-1 text-xs bg-gray-500/20 text-gray-400 rounded border border-gray-500/30 flex items-center gap-1">
                            <Archive className="w-3 h-3" />
                            Archived
                          </span>
                        )}
                      </div>
                      {repo.description && (
                        <p className="text-gray-400 text-sm mb-3 leading-relaxed">{repo.description}</p>
                      )}

                      {/* Stats Row */}
                      <div className="flex items-center gap-4 flex-wrap text-sm text-gray-400">
                        {repo.language && (
                          <span className="flex items-center gap-1.5">
                            <div className={`w-3 h-3 rounded-full ${
                              repo.language === 'TypeScript' ? 'bg-blue-400' :
                              repo.language === 'JavaScript' ? 'bg-yellow-400' :
                              repo.language === 'Python' ? 'bg-green-400' :
                              repo.language === 'Java' ? 'bg-red-400' :
                              repo.language === 'React' || repo.language === 'React Native' ? 'bg-cyan-400' :
                              repo.language === 'Vue.js' ? 'bg-emerald-400' :
                              repo.language === 'Node.js' ? 'bg-lime-400' :
                              'bg-gray-400'
                            }`}></div>
                            <span className="font-medium">{repo.language}</span>
                          </span>
                        )}
                        <span className="flex items-center gap-1 hover:text-yellow-400 transition-colors">
                          <Star className="w-4 h-4" />
                          {repo.stargazers_count || 0}
                        </span>
                        <span className="flex items-center gap-1 hover:text-purple-400 transition-colors">
                          <GitFork className="w-4 h-4" />
                          {repo.forks_count || 0}
                        </span>
                        {repo.open_issues_count > 0 && (
                          <span className="flex items-center gap-1 hover:text-red-400 transition-colors">
                            <AlertCircle className="w-4 h-4" />
                            {repo.open_issues_count}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {repo.watchers_count || 0}
                        </span>
                        <span className="flex items-center gap-1 text-xs">
                          <Clock className="w-3 h-3" />
                          Updated {new Date(repo.updated_at).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Topics (show even when not expanded in list view) */}
                      {repo.topics && repo.topics.length > 0 && viewMode === 'list' && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {repo.topics.slice(0, 5).map((topic, i) => (
                            <span key={i} className="px-2 py-1 text-xs bg-blue-500/20 text-blue-400 rounded flex items-center gap-1">
                              <Tag className="w-3 h-3" />
                              {topic}
                            </span>
                          ))}
                          {repo.topics.length > 5 && (
                            <span className="px-2 py-1 text-xs text-gray-500">+{repo.topics.length - 5} more</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedRepo === idx && (
                    <div className="mt-4 pt-4 border-t border-white/10 space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Created
                          </p>
                          <p className="text-sm text-white">{new Date(repo.created_at).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                            <Package className="w-3 h-3" />
                            Size
                          </p>
                          <p className="text-sm text-white">{(repo.size / 1024).toFixed(2)} MB</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                            <GitBranch className="w-3 h-3" />
                            Default Branch
                          </p>
                          <p className="text-sm text-white">{repo.default_branch || 'main'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                            <BookOpen className="w-3 h-3" />
                            License
                          </p>
                          <p className="text-sm text-white">{repo.license?.name || 'None'}</p>
                        </div>
                      </div>
                      {repo.topics && repo.topics.length > 0 && (
                        <div>
                          <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                            <Tag className="w-3 h-3" />
                            Topics
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {repo.topics.map((topic, i) => (
                              <span 
                                key={i} 
                                className="px-3 py-1.5 text-xs bg-blue-500/20 text-blue-400 rounded-full border border-blue-500/30 hover:bg-blue-500/30 transition-colors cursor-pointer"
                              >
                                {topic}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-3 pt-2">
                        <a
                          href={`${repo.html_url}/issues`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-1"
                        >
                          <AlertCircle className="w-3 h-3" />
                          View Issues
                        </a>
                        <a
                          href={`${repo.html_url}/commits`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-1"
                        >
                          <GitCommit className="w-3 h-3" />
                          View Commits
                        </a>
                        <a
                          href={`${repo.html_url}/network`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-1"
                        >
                          <Activity className="w-3 h-3" />
                          Network Graph
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2">
                  <a
                    href={repo.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    title="View on GitHub"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </a>
                  <button
                    onClick={() => setExpandedRepo(expandedRepo === idx ? null : idx)}
                    className="p-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors"
                    title="Toggle Details"
                  >
                    {expandedRepo === idx ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Repositories;
