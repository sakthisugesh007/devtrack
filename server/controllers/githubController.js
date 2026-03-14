const axios = require('axios');
const User = require('../models/User');

const getGithubHeaders = (accessToken) => ({
    Authorization: `Bearer ${accessToken}`,
    Accept: 'application/vnd.github.v3+json'
});

// Check GitHub Connection Status
exports.getConnectionStatus = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('+accessToken');
        
        const isConnected = !!(user && user.githubId && user.accessToken);
        const isMockAccount = user?.accessToken === 'mock_access_token';
        
        // If connected with real GitHub, verify token is still valid
        if (isConnected && !isMockAccount) {
            try {
                await axios.get('https://api.github.com/user', {
                    headers: getGithubHeaders(user.accessToken)
                });
            } catch (error) {
                // Token expired or invalid
                return res.json({
                    connected: false,
                    needsReconnect: true,
                    username: user.username,
                    message: 'GitHub token expired. Please reconnect.'
                });
            }
        }
        
        res.json({
            connected: isConnected,
            githubUsername: user?.username,
            avatarUrl: user?.avatarUrl,
            isMockAccount,
            lastSynced: user?.lastSynced
        });
    } catch (error) {
        console.error('Connection Status Error:', error.message);
        res.status(500).json({ message: 'Failed to check connection status' });
    }
};

// Unlink GitHub Account
exports.unlinkGithubAccount = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Clear GitHub-related data
        user.githubId = undefined;
        user.accessToken = undefined;
        user.avatarUrl = undefined;
        user.lastSynced = undefined;
        
        await user.save();
        
        res.json({ 
            success: true, 
            message: 'GitHub account unlinked successfully' 
        });
    } catch (error) {
        console.error('Unlink Error:', error.message);
        res.status(500).json({ message: 'Failed to unlink GitHub account' });
    }
};

exports.getDashboardData = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('+accessToken');
        if (!user || !user.accessToken) {
            return res.status(401).json({ message: 'User not connected to GitHub' });
        }

        // IF using mock token, return enhanced mock data immediately
        if (user.accessToken === 'mock_access_token') {
            const mockData = {
                topRepos: [
                    { name: 'dev-track-ai', stars: 45, forks: 12, issues: 3, lang: 'TypeScript', url: '#', size: 1204, updated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), description: 'AI-powered development tracker' },
                    { name: 'portfolio-website', stars: 28, forks: 5, issues: 0, lang: 'React', url: '#', size: 856, updated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), description: 'Personal portfolio site' },
                    { name: 'api-gateway', stars: 67, forks: 18, issues: 4, lang: 'Node.js', url: '#', size: 2340, updated: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), description: 'Microservices API gateway' },
                    { name: 'ml-pipeline', stars: 134, forks: 34, issues: 8, lang: 'Python', url: '#', size: 3452, updated: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), description: 'ML model training pipeline' },
                    { name: 'blog-cms', stars: 23, forks: 6, issues: 2, lang: 'Next.js', url: '#', size: 945, updated: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), description: 'Headless CMS for blogs' },
                    { name: 'mobile-app', stars: 89, forks: 21, issues: 5, lang: 'React Native', url: '#', size: 1876, updated: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(), description: 'Cross-platform mobile app' }
                ],
                stats: {
                    totalPRs: 87,
                    openPRs: 5,
                    mergedPRs: 76,
                    closedPRs: 6,
                    totalCommits: 1247,
                    totalRepos: 24,
                    totalStars: 386,
                    totalForks: 96,
                    contributions: 1843,
                    currentStreak: 15,
                    longestStreak: 42
                },
                languages: {
                    'TypeScript': 35,
                    'JavaScript': 28,
                    'Python': 18,
                    'React': 12,
                    'Node.js': 7
                },
                contributionGraph: Array.from({ length: 52 }, (_, i) => ({
                    week: i,
                    contributions: Math.floor(Math.random() * 50) + 10
                })),
                recentActivity: [
                    { type: 'PushEvent', repo: 'dev-track-ai', msg: 'feat: add real-time collaboration', time: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), commits: 3, additions: 245, deletions: 67 },
                    { type: 'PullRequestEvent', repo: 'api-gateway', msg: 'Add Redis caching layer', time: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), action: 'opened', pr_number: 42 },
                    { type: 'IssuesEvent', repo: 'ml-pipeline', msg: 'Memory optimization needed', time: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), action: 'opened', issue_number: 18 },
                    { type: 'PushEvent', repo: 'portfolio-website', msg: 'fix: responsive design on mobile', time: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), commits: 2, additions: 89, deletions: 34 },
                    { type: 'PullRequestEvent', repo: 'dev-track-ai', msg: 'Implement OAuth2 flow', time: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), action: 'merged', pr_number: 38 },
                    { type: 'CreateEvent', repo: 'blog-cms', msg: 'Created branch: feature/markdown-editor', time: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(), ref_type: 'branch' },
                    { type: 'PushEvent', repo: 'mobile-app', msg: 'refactor: improve state management', time: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), commits: 5, additions: 312, deletions: 198 },
                    { type: 'ReleaseEvent', repo: 'api-gateway', msg: 'Released v2.1.0', time: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(), tag: 'v2.1.0' }
                ]
            };
            return res.json(mockData);
        }

        // Real GitHub API calls for actual OAuth users
        const headers = getGithubHeaders(user.accessToken);
        const username = user.username;

        try {
            const [userInfoRes, reposRes, prsRes, eventsRes, commitsRes] = await Promise.all([
                // User info
                axios.get(`https://api.github.com/user`, { headers }),
                // All repos
                axios.get(`https://api.github.com/user/repos?sort=updated&per_page=100&affiliation=owner,collaborator`, { headers }),
                // PR Stats
                axios.get(`https://api.github.com/search/issues?q=author:${username}+type:pr`, { headers }),
                // Recent Activity
                axios.get(`https://api.github.com/users/${username}/events/public?per_page=30`, { headers }),
                // Recent commits search
                axios.get(`https://api.github.com/search/commits?q=author:${username}&sort=author-date&order=desc&per_page=100`, { 
                    headers: { ...headers, Accept: 'application/vnd.github.cloak-preview' } 
                })
            ]);

            // Process Repos with more details
            const repos = reposRes.data;
            const topRepos = repos.slice(0, 6).map(repo => ({
                name: repo.name,
                stars: repo.stargazers_count,
                forks: repo.forks_count,
                issues: repo.open_issues_count,
                lang: repo.language,
                url: repo.html_url,
                size: repo.size,
                updated: repo.updated_at,
                description: repo.description
            }));

            // Calculate comprehensive stats
            const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
            const totalForks = repos.reduce((sum, repo) => sum + repo.forks_count, 0);
            
            // Language distribution
            const languageCounts = {};
            repos.forEach(repo => {
                if (repo.language) {
                    languageCounts[repo.language] = (languageCounts[repo.language] || 0) + 1;
                }
            });

            // PR Stats - get more detailed breakdown
            const [openPRsRes, closedPRsRes] = await Promise.all([
                axios.get(`https://api.github.com/search/issues?q=author:${username}+type:pr+state:open`, { headers }),
                axios.get(`https://api.github.com/search/issues?q=author:${username}+type:pr+state:closed`, { headers })
            ]);

            const stats = {
                totalPRs: prsRes.data.total_count,
                openPRs: openPRsRes.data.total_count,
                mergedPRs: closedPRsRes.data.total_count,
                closedPRs: closedPRsRes.data.total_count,
                totalCommits: commitsRes.data.total_count,
                totalRepos: repos.length,
                totalStars,
                totalForks,
                contributions: commitsRes.data.total_count + prsRes.data.total_count,
                currentStreak: 5, // Would need additional API calls for accurate calculation
                longestStreak: 15
            };

            // Process Activity with more detail
            const recentActivity = eventsRes.data.slice(0, 20).map(event => {
                const activity = {
                    type: event.type,
                    repo: event.repo.name,
                    time: event.created_at
                };

                switch (event.type) {
                    case 'PushEvent':
                        activity.msg = event.payload.commits?.[0]?.message || 'Push commits';
                        activity.commits = event.payload.size || event.payload.commits?.length || 1;
                        activity.additions = event.payload.commits?.reduce((sum, c) => sum + (c.stats?.additions || 0), 0);
                        activity.deletions = event.payload.commits?.reduce((sum, c) => sum + (c.stats?.deletions || 0), 0);
                        break;
                    case 'PullRequestEvent':
                        activity.msg = event.payload.pull_request?.title || 'Pull Request';
                        activity.action = event.payload.action;
                        activity.pr_number = event.payload.pull_request?.number;
                        break;
                    case 'IssuesEvent':
                        activity.msg = event.payload.issue?.title || 'Issue';
                        activity.action = event.payload.action;
                        activity.issue_number = event.payload.issue?.number;
                        break;
                    case 'CreateEvent':
                        activity.msg = `Created ${event.payload.ref_type}: ${event.payload.ref || ''}`;
                        activity.ref_type = event.payload.ref_type;
                        break;
                    case 'ReleaseEvent':
                        activity.msg = `Released ${event.payload.release?.tag_name || ''}`;
                        activity.tag = event.payload.release?.tag_name;
                        break;
                    default:
                        activity.msg = event.type;
                }

                return activity;
            });

            res.json({
                topRepos,
                stats,
                languages: languageCounts,
                recentActivity,
                userInfo: {
                    name: userInfoRes.data.name,
                    bio: userInfoRes.data.bio,
                    publicRepos: userInfoRes.data.public_repos,
                    followers: userInfoRes.data.followers,
                    following: userInfoRes.data.following
                }
            });
        } catch (apiError) {
            console.error('GitHub API Error:', apiError.response?.data || apiError.message);
            
            // If GitHub API fails, return friendly error with mock data fallback
            res.json({
                topRepos: [],
                stats: {
                    totalPRs: 0,
                    totalCommits: 0,
                    totalRepos: 0
                },
                languages: {},
                recentActivity: [],
                warning: 'Unable to fetch GitHub data. Please reconnect your GitHub account.'
            });
        }

    } catch (error) {
        console.error('GitHub Data Fetch Error:', error.message);
        res.status(500).json({ message: 'Failed to fetch GitHub data' });
    }
};

// Get detailed activity data
exports.getActivityData = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('+accessToken');
        if (!user || !user.accessToken) {
            return res.status(401).json({ message: 'User not connected to GitHub' });
        }

        // Mock data for development
        if (user.accessToken === 'mock_access_token') {
            const mockActivityData = {
                activities: Array.from({ length: 30 }, (_, i) => ({
                    id: i,
                    type: ['PushEvent', 'PullRequestEvent', 'IssuesEvent', 'CreateEvent'][Math.floor(Math.random() * 4)],
                    repo: ['dev-track-ai', 'portfolio', 'api-gateway', 'ml-pipeline', 'blog-cms'][Math.floor(Math.random() * 5)],
                    msg: ['feat: add new feature', 'fix: bug fix', 'docs: update documentation', 'refactor: code improvements'][Math.floor(Math.random() * 4)],
                    time: new Date(Date.now() - i * 3 * 60 * 60 * 1000).toISOString(),
                    commits: Math.floor(Math.random() * 10) + 1,
                    additions: Math.floor(Math.random() * 500),
                    deletions: Math.floor(Math.random() * 200),
                    language: ['JavaScript', 'TypeScript', 'Python', 'React'][Math.floor(Math.random() * 4)]
                })),
                weeklyStats: {
                    commits: 87,
                    prsOpened: 12,
                    prsMerged: 9,
                    issuesOpened: 5,
                    issuesClosed: 8,
                    additions: 3245,
                    deletions: 1876
                },
                contributionCalendar: Array.from({ length: 365 }, (_, i) => ({
                    date: new Date(Date.now() - (364 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    count: Math.floor(Math.random() * 15)
                })),
                topContributionDays: [
                    { day: 'Monday', commits: 245 },
                    { day: 'Tuesday', commits: 198 },
                    { day: 'Wednesday', commits: 287 },
                    { day: 'Thursday', commits: 234 },
                    { day: 'Friday', commits: 189 }
                ]
            };
            return res.json(mockActivityData);
        }

        // Real GitHub API
        const headers = getGithubHeaders(user.accessToken);
        const username = user.username;

        const [eventsRes, commitsRes] = await Promise.all([
            axios.get(`https://api.github.com/users/${username}/events/public?per_page=100`, { headers }),
            axios.get(`https://api.github.com/search/commits?q=author:${username}&sort=author-date&order=desc&per_page=100`, { 
                headers: { ...headers, Accept: 'application/vnd.github.cloak-preview' } 
            })
        ]);

        // Process detailed activities
        const activities = eventsRes.data.map((event, index) => {
            const activity = {
                id: index,
                type: event.type,
                repo: event.repo.name,
                time: event.created_at
            };

            switch (event.type) {
                case 'PushEvent':
                    activity.msg = event.payload.commits?.[0]?.message || 'Push commits';
                    activity.commits = event.payload.size || 1;
                    break;
                case 'PullRequestEvent':
                    activity.msg = event.payload.pull_request?.title || 'Pull Request';
                    activity.action = event.payload.action;
                    break;
                case 'IssuesEvent':
                    activity.msg = event.payload.issue?.title || 'Issue';
                    activity.action = event.payload.action;
                    break;
                default:
                    activity.msg = event.type;
            }

            return activity;
        });

        // Calculate weekly stats
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const recentEvents = eventsRes.data.filter(e => new Date(e.created_at) > oneWeekAgo);
        
        const weeklyStats = {
            commits: recentEvents.filter(e => e.type === 'PushEvent').reduce((sum, e) => sum + (e.payload.size || 1), 0),
            prsOpened: recentEvents.filter(e => e.type === 'PullRequestEvent' && e.payload.action === 'opened').length,
            prsMerged: recentEvents.filter(e => e.type === 'PullRequestEvent' && e.payload.action === 'closed').length,
            issuesOpened: recentEvents.filter(e => e.type === 'IssuesEvent' && e.payload.action === 'opened').length,
            issuesClosed: recentEvents.filter(e => e.type === 'IssuesEvent' && e.payload.action === 'closed').length
        };

        res.json({
            activities,
            weeklyStats
        });

    } catch (error) {
        console.error('Activity Data Fetch Error:', error.message);
        res.status(500).json({ message: 'Failed to fetch activity data' });
    }
};

// Get All Repositories
exports.getRepositories = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('+accessToken');
        if (!user || !user.accessToken) {
            return res.status(401).json({ message: 'User not connected to GitHub' });
        }

        // If using mock token, return mock repositories
        if (user.accessToken === 'mock_access_token') {
            const mockRepos = [
                {
                    id: 1,
                    name: 'dev-track-ai',
                    full_name: 'yourusername/dev-track-ai',
                    description: 'AI-powered development tracker with real-time insights',
                    html_url: 'https://github.com/yourusername/dev-track-ai',
                    language: 'TypeScript',
                    stargazers_count: 45,
                    forks_count: 12,
                    open_issues_count: 3,
                    private: false,
                    fork: false,
                    archived: false,
                    size: 1204,
                    created_at: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
                    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                    default_branch: 'main',
                    license: { name: 'MIT License', spdx_id: 'MIT' },
                    topics: ['ai', 'development', 'tracking', 'analytics']
                },
                {
                    id: 2,
                    name: 'portfolio-website',
                    full_name: 'yourusername/portfolio-website',
                    description: 'Personal portfolio showcasing projects and skills',
                    html_url: 'https://github.com/yourusername/portfolio-website',
                    language: 'React',
                    stargazers_count: 28,
                    forks_count: 5,
                    open_issues_count: 0,
                    private: false,
                    fork: false,
                    archived: false,
                    size: 856,
                    created_at: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
                    updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                    default_branch: 'main',
                    license: { name: 'MIT License', spdx_id: 'MIT' },
                    topics: ['portfolio', 'react', 'frontend']
                },
                {
                    id: 3,
                    name: 'api-gateway',
                    full_name: 'yourusername/api-gateway',
                    description: 'Microservices API gateway with authentication and routing',
                    html_url: 'https://github.com/yourusername/api-gateway',
                    language: 'Node.js',
                    stargazers_count: 67,
                    forks_count: 18,
                    open_issues_count: 4,
                    private: false,
                    fork: false,
                    archived: false,
                    size: 2340,
                    created_at: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString(),
                    updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                    default_branch: 'main',
                    license: { name: 'Apache License 2.0', spdx_id: 'Apache-2.0' },
                    topics: ['api', 'gateway', 'microservices', 'nodejs']
                },
                {
                    id: 4,
                    name: 'ml-pipeline',
                    full_name: 'yourusername/ml-pipeline',
                    description: 'Machine learning model training and deployment pipeline',
                    html_url: 'https://github.com/yourusername/ml-pipeline',
                    language: 'Python',
                    stargazers_count: 134,
                    forks_count: 34,
                    open_issues_count: 8,
                    private: false,
                    fork: false,
                    archived: false,
                    size: 3452,
                    created_at: new Date(Date.now() - 250 * 24 * 60 * 60 * 1000).toISOString(),
                    updated_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
                    default_branch: 'main',
                    license: { name: 'MIT License', spdx_id: 'MIT' },
                    topics: ['machine-learning', 'python', 'pipeline', 'ml']
                },
                {
                    id: 5,
                    name: 'blog-cms',
                    full_name: 'yourusername/blog-cms',
                    description: 'Headless CMS for managing blog content',
                    html_url: 'https://github.com/yourusername/blog-cms',
                    language: 'Next.js',
                    stargazers_count: 23,
                    forks_count: 6,
                    open_issues_count: 2,
                    private: true,
                    fork: false,
                    archived: false,
                    size: 945,
                    created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
                    updated_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
                    default_branch: 'main',
                    license: null,
                    topics: ['cms', 'nextjs', 'blog']
                },
                {
                    id: 6,
                    name: 'mobile-app',
                    full_name: 'yourusername/mobile-app',
                    description: 'Cross-platform mobile application',
                    html_url: 'https://github.com/yourusername/mobile-app',
                    language: 'React Native',
                    stargazers_count: 89,
                    forks_count: 21,
                    open_issues_count: 5,
                    private: false,
                    fork: false,
                    archived: false,
                    size: 1876,
                    created_at: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString(),
                    updated_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
                    default_branch: 'main',
                    license: { name: 'MIT License', spdx_id: 'MIT' },
                    topics: ['mobile', 'react-native', 'ios', 'android']
                },
                {
                    id: 7,
                    name: 'e-commerce-backend',
                    full_name: 'yourusername/e-commerce-backend',
                    description: 'Backend API for e-commerce platform',
                    html_url: 'https://github.com/yourusername/e-commerce-backend',
                    language: 'Java',
                    stargazers_count: 56,
                    forks_count: 15,
                    open_issues_count: 6,
                    private: true,
                    fork: false,
                    archived: false,
                    size: 2890,
                    created_at: new Date(Date.now() - 300 * 24 * 60 * 60 * 1000).toISOString(),
                    updated_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
                    default_branch: 'main',
                    license: null,
                    topics: ['ecommerce', 'backend', 'java', 'spring-boot']
                },
                {
                    id: 8,
                    name: 'data-visualization-dashboard',
                    full_name: 'yourusername/data-visualization-dashboard',
                    description: 'Interactive data visualization dashboard with real-time updates',
                    html_url: 'https://github.com/yourusername/data-visualization-dashboard',
                    language: 'Vue.js',
                    stargazers_count: 42,
                    forks_count: 11,
                    open_issues_count: 3,
                    private: false,
                    fork: false,
                    archived: false,
                    size: 1567,
                    created_at: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString(),
                    updated_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                    default_branch: 'main',
                    license: { name: 'MIT License', spdx_id: 'MIT' },
                    topics: ['visualization', 'dashboard', 'vue', 'charts']
                }
            ];
            return res.json(mockRepos);
        }

        // Real GitHub API calls
        const headers = getGithubHeaders(user.accessToken);
        
        const reposRes = await axios.get(
            'https://api.github.com/user/repos?sort=updated&per_page=100&affiliation=owner,collaborator',
            { headers }
        );

        res.json(reposRes.data);

    } catch (error) {
        console.error('Repositories Fetch Error:', error.message);
        res.status(500).json({ message: 'Failed to fetch repositories' });
    }
};
