import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../api';
import Card from '../components/Card';
import Button from '../components/Button';
import { useGithubConnection } from '../hooks/useGithubConnection';
import {
  GitCommit,
  FolderGit2,
  Flame,
  Code2,
  ArrowUpRight,
  Star,
  GitFork,
  AlertCircle,
  GitPullRequest,
  CheckCircle2,
  Clock,
  Loader2,
  Github,
  TrendingUp,
  Users,
  Award,
  FileCode
} from 'lucide-react';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const githubConnection = useGithubConnection();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/github/dashboard`, {
          withCredentials: true
        });
        setData(response.data);
      } catch (err) {
        console.error('Fetch error:', err);
        setError('Failed to load dashboard data. Please make sure you are connected to GitHub.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Failed to Load Data</h3>
          <p className="text-gray-400 mb-4">{error}</p>
          <a href={`${API_URL}/api/auth/github`}>
            <Button variant="primary" icon={Github}>Connect GitHub</Button>
          </a>
        </Card>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* GitHub Connection Status Banner */}
      {!githubConnection.loading && !githubConnection.connected && (
        <Card className="p-4 mb-6 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-blue-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Github className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-white font-medium">Connect your GitHub account</p>
                <p className="text-sm text-gray-400">Unlock full analytics and insights</p>
              </div>
            </div>
            <a href={`${API_URL}/api/auth/github`}>
              <Button variant="primary" className="h-9 px-4 text-sm">
                Connect Now
              </Button>
            </a>
          </div>
        </Card>
      )}

      {githubConnection.needsReconnect && (
        <Card className="p-4 mb-6 bg-gradient-to-r from-orange-600/20 to-red-600/20 border-orange-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-orange-400" />
              <div>
                <p className="text-white font-medium">GitHub connection expired</p>
                <p className="text-sm text-gray-400">Reconnect to continue syncing your data</p>
              </div>
            </div>
            <a href={`${API_URL}/api/auth/github`}>
              <Button variant="primary" className="h-9 px-4 text-sm">
                Reconnect
              </Button>
            </a>
          </div>
        </Card>
      )}

      {/* Dashboard Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-outfit text-white mb-2">Overview</h1>
        <p className="text-gray-400">Your GitHub activity at a glance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { icon: GitCommit, title: 'Total Commits', value: data?.stats?.totalCommits || 0, subtitle: 'All time', color: 'blue', trend: '+12%' },
          { icon: FolderGit2, title: 'Repositories', value: data?.stats?.totalRepos || 0, subtitle: 'Active projects', color: 'purple', trend: '+3' },
          { icon: Flame, title: 'Current Streak', value: `${data?.stats?.currentStreak || 5} days`, subtitle: 'Keep it up!', color: 'orange', trend: '🔥' },
          { icon: Star, title: 'Total Stars', value: data?.stats?.totalStars || 0, subtitle: 'Across all repos', color: 'yellow', trend: '+8' }
        ].map((stat, index) => {
          const Icon = stat.icon;
          const colorClasses = {
            blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
            purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
            orange: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
            yellow: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
            green: 'text-green-400 bg-green-500/10 border-green-500/20'
          }[stat.color];

          return (
            <Card key={index} hover className="border-t border-white/5 relative overflow-hidden">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl border ${colorClasses}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-xs text-green-400 font-semibold">{stat.trend}</span>
              </div>
              <h3 className="text-gray-400 text-sm font-medium mb-1">{stat.title}</h3>
              <div className="text-3xl font-bold text-white mb-1 font-outfit">{stat.value}</div>
              <div className="text-xs text-gray-500">{stat.subtitle}</div>
            </Card>
          );
        })}
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-5 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Pull Requests</p>
              <p className="text-2xl font-bold text-white">{data?.stats?.totalPRs || 0}</p>
              <p className="text-xs text-green-400 mt-1">
                {data?.stats?.mergedPRs || 0} merged • {data?.stats?.openPRs || 0} open
              </p>
            </div>
            <GitPullRequest className="w-8 h-8 text-blue-400" />
          </div>
        </Card>
        <Card className="p-5 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Total Forks</p>
              <p className="text-2xl font-bold text-white">{data?.stats?.totalForks || 0}</p>
              <p className="text-xs text-gray-500 mt-1">Across all repos</p>
            </div>
            <GitFork className="w-8 h-8 text-purple-400" />
          </div>
        </Card>
        <Card className="p-5 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Contributions</p>
              <p className="text-2xl font-bold text-white">{data?.stats?.contributions || 0}</p>
              <p className="text-xs text-gray-500 mt-1">This year</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-400" />
          </div>
        </Card>
      </div>

      {/* Language Distribution */}
      {data?.languages && Object.keys(data.languages).length > 0 && (
        <Card className="p-6 mb-8">
          <h3 className="text-lg font-bold text-white font-outfit mb-6 flex items-center">
            <FileCode className="w-5 h-5 mr-2 text-purple-400" />
            Language Distribution
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(data.languages).slice(0, 5).map(([lang, count], i) => {
              const total = Object.values(data.languages).reduce((a, b) => a + b, 0);
              const percentage = Math.round((count / total) * 100);
              
              return (
                <div key={lang} className="text-center">
                  <div className="relative w-16 h-16 mx-auto mb-2">
                    <div className="w-full h-full rounded-full bg-white/5 flex items-center justify-center">
                      <span className="text-white font-bold text-lg">{percentage}%</span>
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm font-medium">{lang}</p>
                  <p className="text-gray-500 text-xs">{count} repos</p>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Repositories */}
        <Card className="p-6 border-white/5">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-white font-outfit flex items-center">
              <Award className="w-5 h-5 mr-2 text-yellow-400" />
              Top Repositories
            </h3>
            <Link to="/repositories" className="text-blue-400 text-sm hover:text-blue-300 transition-colors">
              View all →
            </Link>
          </div>
          <div className="space-y-3">
            {data?.topRepos?.slice(0, 6).map((repo, i) => (
              <a href={repo.url} target="_blank" rel="noopener noreferrer" key={i} 
                className="block group p-4 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 hover:border-blue-500/30 transition-all cursor-pointer">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h4 className="text-white font-medium group-hover:text-blue-400 transition-colors mb-1 flex items-center">
                      {repo.name}
                      <ArrowUpRight className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h4>
                    {repo.description && (
                      <p className="text-xs text-gray-500 line-clamp-1 mb-2">{repo.description}</p>
                    )}
                  </div>
                  <span className="text-xs text-gray-400 border border-white/10 px-2 py-0.5 rounded-full ml-2">{repo.lang || 'N/A'}</span>
                </div>
                <div className="flex items-center space-x-4 text-xs text-gray-400">
                  <span className="flex items-center hover:text-yellow-400 transition-colors">
                    <Star className="w-3 h-3 mr-1" /> {repo.stars}
                  </span>
                  <span className="flex items-center hover:text-purple-400 transition-colors">
                    <GitFork className="w-3 h-3 mr-1" /> {repo.forks}
                  </span>
                  {repo.issues > 0 && (
                    <span className="flex items-center hover:text-red-400 transition-colors">
                      <AlertCircle className="w-3 h-3 mr-1" /> {repo.issues}
                    </span>
                  )}
                </div>
              </a>
            ))}
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="p-6 border-white/5">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-white font-outfit flex items-center">
              <Clock className="w-5 h-5 mr-2 text-blue-400" />
              Recent Activity
            </h3>
            <Link to="/activity" className="text-blue-400 text-sm hover:text-blue-300">
              View all →
            </Link>
          </div>
          <div className="relative border-l border-white/10 ml-3 space-y-6">
            {data?.recentActivity?.slice(0, 8).map((activity, i) => {
              const getActivityColor = (type) => {
                const colors = {
                  'PushEvent': 'bg-blue-500',
                  'PullRequestEvent': 'bg-purple-500',
                  'IssuesEvent': 'bg-orange-500',
                  'CreateEvent': 'bg-green-500',
                  'ReleaseEvent': 'bg-pink-500'
                };
                return colors[type] || 'bg-gray-500';
              };

              return (
                <div key={i} className="relative pl-6">
                  <div className={`absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full border-2 border-[#0d122f] ${getActivityColor(activity.type)}`} />
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-white font-medium">{activity.repo.split('/')[1] || activity.repo}</span>
                      <span className="text-[10px] text-gray-500">
                        {new Date(activity.time).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">{activity.msg}</p>
                    {activity.commits && (
                      <span className="inline-block mt-1 text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full">
                        {activity.commits} commit{activity.commits > 1 ? 's' : ''}
                      </span>
                    )}
                    {activity.action && (
                      <span className={`inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full ${
                        activity.action === 'opened' ? 'bg-green-500/10 text-green-400' :
                        activity.action === 'merged' ? 'bg-purple-500/10 text-purple-400' :
                        'bg-gray-500/10 text-gray-400'
                      }`}>
                        {activity.action}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
