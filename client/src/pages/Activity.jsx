import { useState, useEffect } from 'react';
import axios from 'axios';
import Card from '../components/Card';
import { API_URL } from '../api';
import { 
  GitCommit, 
  Calendar, 
  TrendingUp, 
  GitPullRequest, 
  AlertCircle, 
  Clock,
  Loader2,
  Github,
  GitBranch,
  Plus,
  Minus,
  Code2
} from 'lucide-react';

const Activity = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pushes, prs, issues

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/github/activity`, {
          withCredentials: true
        });
        setData(response.data);
      } catch (err) {
        console.error('Fetch error:', err);
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

  const filteredActivities = filter === 'all' 
    ? data?.activities 
    : data?.activities?.filter(a => {
        if (filter === 'pushes') return a.type === 'PushEvent';
        if (filter === 'prs') return a.type === 'PullRequestEvent';
        if (filter === 'issues') return a.type === 'IssuesEvent';
        return true;
      });

  const getActivityIcon = (type) => {
    switch (type) {
      case 'PushEvent': return <GitCommit className="w-4 h-4" />;
      case 'PullRequestEvent': return <GitPullRequest className="w-4 h-4" />;
      case 'IssuesEvent': return <AlertCircle className="w-4 h-4" />;
      case 'CreateEvent': return <GitBranch className="w-4 h-4" />;
      default: return <Code2 className="w-4 h-4" />;
    }
  };

  const getActivityColor = (type) => {
    const colors = {
      'PushEvent': 'text-blue-400 bg-blue-500/10 border-blue-500/20',
      'PullRequestEvent': 'text-purple-400 bg-purple-500/10 border-purple-500/20',
      'IssuesEvent': 'text-orange-400 bg-orange-500/10 border-orange-500/20',
      'CreateEvent': 'text-green-400 bg-green-500/10 border-green-500/20',
      'ReleaseEvent': 'text-pink-400 bg-pink-500/10 border-pink-500/20'
    };
    return colors[type] || 'text-gray-400 bg-gray-500/10 border-gray-500/20';
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  return (
    <div className="animate-fade-in pb-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-outfit text-white mb-2">Activity</h1>
        <p className="text-gray-400">Your recent GitHub contributions and timeline</p>
      </div>

      {/* Weekly Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
        {[
          { label: 'Commits', value: data?.weeklyStats?.commits || 0, icon: GitCommit, color: 'blue' },
          { label: 'PRs Opened', value: data?.weeklyStats?.prsOpened || 0, icon: GitPullRequest, color: 'purple' },
          { label: 'PRs Merged', value: data?.weeklyStats?.prsMerged || 0, icon: GitPullRequest, color: 'green' },
          { label: 'Issues Opened', value: data?.weeklyStats?.issuesOpened || 0, icon: AlertCircle, color: 'orange' },
          { label: 'Issues Closed', value: data?.weeklyStats?.issuesClosed || 0, icon: AlertCircle, color: 'green' },
          { label: 'Additions', value: data?.weeklyStats?.additions || 0, icon: Plus, color: 'green' },
          { label: 'Deletions', value: data?.weeklyStats?.deletions || 0, icon: Minus, color: 'red' }
        ].map((stat, i) => {
          const Icon = stat.icon;
          const colorClass = {
            blue: 'text-blue-400 bg-blue-500/10',
            purple: 'text-purple-400 bg-purple-500/10',
            green: 'text-green-400 bg-green-500/10',
            orange: 'text-orange-400 bg-orange-500/10',
            red: 'text-red-400 bg-red-500/10'
          }[stat.color];

          return (
            <Card key={i} className="p-4 hover:scale-105 transition-transform">
              <div className={`p-2 rounded-lg ${colorClass} w-fit mb-2`}>
                <Icon className="w-4 h-4" />
              </div>
              <p className="text-2xl font-bold text-white font-outfit mb-1">{stat.value}</p>
              <p className="text-xs text-gray-400">{stat.label}</p>
              <p className="text-[10px] text-gray-500 mt-1">This week</p>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          {['all', 'pushes', 'prs', 'issues'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === f
                  ? 'bg-blue-500 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {f !== 'all' && (
                <span className="ml-2 text-xs opacity-60">
                  ({data?.activities?.filter(a => {
                    if (f === 'pushes') return a.type === 'PushEvent';
                    if (f === 'prs') return a.type === 'PullRequestEvent';
                    if (f === 'issues') return a.type === 'IssuesEvent';
                    return false;
                  }).length || 0})
                </span>
              )}
            </button>
          ))}
        </div>
        <span className="text-sm text-gray-500">
          {filteredActivities?.length || 0} activities
        </span>
      </div>

      {/* Activity Timeline */}
      <Card className="p-0 overflow-hidden">
        <div className="p-6 border-b border-white/5 bg-gradient-to-r from-blue-500/5 to-purple-500/5">
          <h2 className="text-xl font-semibold text-white flex items-center space-x-2">
            <Clock className="w-5 h-5 text-blue-400" />
            <span>Activity Timeline</span>
          </h2>
        </div>

        <div className="divide-y divide-white/5 max-h-[800px] overflow-y-auto">
          {filteredActivities && filteredActivities.length > 0 ? (
            filteredActivities.map((activity, index) => (
              <div
                key={activity.id || index}
                className="group flex items-start p-6 hover:bg-white/[0.02] transition-colors"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${getActivityColor(activity.type)} group-hover:scale-110 transition-transform flex-shrink-0`}>
                  {getActivityIcon(activity.type)}
                </div>
                
                <div className="ml-4 flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-white font-medium text-lg mb-1 group-hover:text-blue-400 transition-colors">
                        {activity.repo}
                      </h3>
                      <p className="text-gray-400 text-sm leading-relaxed">{activity.msg}</p>
                    </div>
                    <div className="text-right ml-4 flex-shrink-0">
                      <span className="text-xs text-gray-500 block mb-1">{formatTimeAgo(activity.time)}</span>
                      <span className="text-[10px] text-gray-600">
                        {new Date(activity.time).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 text-xs mt-3">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full border ${getActivityColor(activity.type)}`}>
                      {activity.type.replace('Event', '')}
                    </span>
                    
                    {activity.commits && (
                      <span className="inline-flex items-center space-x-1 text-gray-400">
                        <GitCommit className="w-3 h-3" />
                        <span>{activity.commits} commit{activity.commits > 1 ? 's' : ''}</span>
                      </span>
                    )}
                    
                    {activity.additions !== undefined && (
                      <span className="inline-flex items-center space-x-1 text-green-400">
                        <Plus className="w-3 h-3" />
                        <span>{activity.additions}</span>
                      </span>
                    )}
                    
                    {activity.deletions !== undefined && (
                      <span className="inline-flex items-center space-x-1 text-red-400">
                        <Minus className="w-3 h-3" />
                        <span>{activity.deletions}</span>
                      </span>
                    )}
                    
                    {activity.language && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-white/5 text-gray-300 border border-white/10">
                        {activity.language}
                      </span>
                    )}
                    
                    {activity.action && (
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full ${
                        activity.action === 'opened' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                        activity.action === 'merged' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                        activity.action === 'closed' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                        'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                      }`}>
                        {activity.action}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center">
              <Github className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No activity found</p>
              <p className="text-sm text-gray-600 mt-1">Start contributing to see your activity here</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Activity;
