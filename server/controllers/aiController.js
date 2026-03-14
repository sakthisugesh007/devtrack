const OpenAI = require('openai');
const User = require('../models/User');
const axios = require('axios');

// Initialize OpenAI client for Groq API
const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY || 'mock_key',
  baseURL: 'https://api.groq.com/openai/v1'
});

// Check if we're using mock mode
const isMockMode = !process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'your_groq_api_key_here' || process.env.GROQ_API_KEY === 'mock_key';

/**
 * Fetch comprehensive GitHub data for AI analysis
 */
const fetchGitHubDataForAI = async (accessToken) => {
  const headers = {
    'Authorization': `token ${accessToken}`,
    'Accept': 'application/vnd.github.v3+json'
  };

  try {
    // Fetch user info
    const userResponse = await axios.get('https://api.github.com/user', { headers });
    const user = userResponse.data;

    // Fetch repositories
    const reposResponse = await axios.get('https://api.github.com/user/repos', {
      headers,
      params: { per_page: 100, sort: 'updated' }
    });
    const repos = reposResponse.data;

    // Fetch recent activity
    const eventsResponse = await axios.get(`https://api.github.com/users/${user.login}/events`, {
      headers,
      params: { per_page: 100 }
    });
    const events = eventsResponse.data;

    // Analyze language distribution
    const languageStats = {};
    repos.forEach(repo => {
      if (repo.language) {
        languageStats[repo.language] = (languageStats[repo.language] || 0) + 1;
      }
    });

    // Analyze commit patterns
    const commitsByDay = {};
    const commitsByHour = Array(24).fill(0);
    events.filter(e => e.type === 'PushEvent').forEach(event => {
      const date = new Date(event.created_at);
      const day = date.toLocaleDateString();
      const hour = date.getHours();
      commitsByDay[day] = (commitsByDay[day] || 0) + (event.payload.commits?.length || 0);
      commitsByHour[hour] += (event.payload.commits?.length || 0);
    });

    // Analyze activity types
    const activityTypes = {};
    events.forEach(event => {
      activityTypes[event.type] = (activityTypes[event.type] || 0) + 1;
    });

    return {
      user: {
        login: user.login,
        name: user.name,
        bio: user.bio,
        public_repos: user.public_repos,
        followers: user.followers,
        following: user.following
      },
      repos: {
        total: repos.length,
        languages: languageStats,
        stars: repos.reduce((sum, r) => sum + r.stargazers_count, 0),
        forks: repos.reduce((sum, r) => sum + r.forks_count, 0),
        sizes: repos.map(r => ({ name: r.name, size: r.size }))
      },
      activity: {
        recentEvents: events.slice(0, 30).map(e => ({
          type: e.type,
          date: e.created_at,
          repo: e.repo?.name
        })),
        commitsByDay,
        commitsByHour,
        activityTypes,
        totalEvents: events.length
      }
    };
  } catch (error) {
    console.error('Error fetching GitHub data:', error.message);
    throw error;
  }
};

/**
 * Generate AI insights using Grok
 */
const generateAIInsights = async (githubData) => {
  if (isMockMode) {
    return generateMockInsights(githubData);
  }

  try {
    const prompt = `You are an expert developer productivity analyst. Analyze the following GitHub activity data and provide comprehensive insights:

GitHub Data:
${JSON.stringify(githubData, null, 2)}

Provide a detailed analysis in JSON format with the following structure:
{
  "vitalityScore": {
    "score": 0-100,
    "trend": "up/down/stable",
    "explanation": "brief explanation"
  },
  "productivityScore": {
    "score": 0-100,
    "factors": ["factor1", "factor2"],
    "explanation": "detailed explanation"
  },
  "burnoutLevel": {
    "level": 0-100,
    "risk": "low/medium/high",
    "indicators": ["indicator1", "indicator2"],
    "recommendation": "specific advice"
  },
  "deepWorkClock": {
    "peakHours": [14, 15, 16],
    "lowHours": [22, 23, 0],
    "explanation": "when you're most productive"
  },
  "focusBalance": {
    "features": 0-100,
    "reviews": 0-100,
    "refactor": 0-100,
    "testing": 0-100,
    "documentation": 0-100,
    "bugfixes": 0-100,
    "recommendation": "area to improve"
  },
  "recommendations": [
    {
      "priority": "high/medium/low",
      "type": "Health/Productivity/Code Quality",
      "message": "specific actionable recommendation",
      "impact": "expected positive outcome"
    }
  ],
  "cognitiveLoadPattern": {
    "dailyPattern": [0-100 for each day of week],
    "trend": "increasing/decreasing/stable",
    "alert": "warning if overworked"
  },
  "insights": [
    "insight 1",
    "insight 2",
    "insight 3"
  ]
}

Be specific, actionable, and encouraging. Focus on practical improvements.`;

    const completion = await openai.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: 'You are a developer productivity expert AI assistant.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const responseText = completion.choices[0].message.content;
    
    // Extract JSON from response (handle markdown code blocks)
    let jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/);
    if (!jsonMatch) {
      jsonMatch = responseText.match(/\{[\s\S]*\}/);
    }
    
    const insights = jsonMatch ? JSON.parse(jsonMatch[1] || jsonMatch[0]) : JSON.parse(responseText);
    
    return insights;
  } catch (error) {
    console.error('Error generating AI insights:', error.message);
    // Fallback to mock insights on error
    return generateMockInsights(githubData);
  }
};

/**
 * Generate mock insights for development/demo
 */
const generateMockInsights = (githubData) => {
  // Analyze the actual GitHub data to generate realistic mock insights
  const totalRepos = githubData.repos?.total || 0;
  const totalStars = githubData.repos?.stars || 0;
  const topLanguages = Object.entries(githubData.repos?.languages || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([lang]) => lang);
  
  const totalCommits = Object.values(githubData.activity?.commitsByDay || {})
    .reduce((sum, count) => sum + count, 0);
  
  const avgCommitsPerDay = totalCommits / Math.max(1, Object.keys(githubData.activity?.commitsByDay || {}).length);
  
  // Find peak hour
  const commitsByHour = githubData.activity?.commitsByHour || [];
  const peakHour = commitsByHour.indexOf(Math.max(...commitsByHour));
  
  // Calculate productivity score based on actual data
  const productivityScore = Math.min(100, Math.round(
    (totalRepos * 2) + 
    (totalStars * 0.5) + 
    (avgCommitsPerDay * 5) +
    (topLanguages.length * 5)
  ));

  // Calculate burnout level (inverse of consistency)
  const commitDays = Object.keys(githubData.activity?.commitsByDay || {}).length;
  const daysTracked = 30;
  const consistency = (commitDays / daysTracked) * 100;
  const burnoutLevel = Math.min(100, Math.max(0, 100 - consistency + (avgCommitsPerDay > 10 ? 20 : 0)));

  return {
    vitalityScore: {
      score: productivityScore,
      trend: avgCommitsPerDay > 3 ? 'up' : avgCommitsPerDay > 1 ? 'stable' : 'down',
      explanation: `Based on your ${totalRepos} repositories and ${totalCommits} recent commits, you're showing ${avgCommitsPerDay > 3 ? 'excellent' : 'good'} development velocity.`
    },
    productivityScore: {
      score: productivityScore,
      factors: [
        `Active in ${topLanguages.length} languages`,
        `${totalRepos} repositories maintained`,
        `${totalStars} total stars earned`,
        `${Math.round(avgCommitsPerDay)} avg commits/day`
      ],
      explanation: `Your productivity is ${productivityScore > 80 ? 'excellent' : productivityScore > 60 ? 'strong' : 'moderate'}. You're consistently contributing across multiple projects with focus on ${topLanguages[0] || 'various technologies'}.`
    },
    burnoutLevel: {
      level: burnoutLevel,
      risk: burnoutLevel > 70 ? 'high' : burnoutLevel > 40 ? 'medium' : 'low',
      indicators: [
        burnoutLevel > 70 ? 'Irregular commit patterns detected' : 'Consistent contribution rhythm',
        avgCommitsPerDay > 10 ? 'High daily commit volume' : 'Sustainable pace',
        consistency < 50 ? 'Sporadic activity periods' : 'Regular engagement'
      ],
      recommendation: burnoutLevel > 70 
        ? 'Consider taking scheduled breaks and spreading work more evenly throughout the week.'
        : burnoutLevel > 40
        ? 'Maintain your current pace and ensure adequate rest between intense coding sessions.'
        : 'Great balance! Continue your sustainable development rhythm.'
    },
    deepWorkClock: {
      peakHours: [peakHour, (peakHour + 1) % 24, (peakHour + 2) % 24],
      lowHours: [(peakHour + 12) % 24, (peakHour + 13) % 24, (peakHour + 14) % 24],
      explanation: `Your most productive hours are around ${peakHour}:00. Consider scheduling complex tasks during this window.`
    },
    focusBalance: {
      features: 75,
      reviews: 45,
      refactor: 60,
      testing: 35,
      documentation: 25,
      bugfixes: 55,
      recommendation: 'testing'
    },
    recommendations: [
      {
        priority: 'high',
        type: 'Code Quality',
        message: burnoutLevel > 60 
          ? 'Take a break - detected potential burnout indicators'
          : 'Increase test coverage in your repositories',
        impact: burnoutLevel > 60
          ? 'Improved mental health and long-term productivity'
          : 'Better code reliability and fewer bugs'
      },
      {
        priority: 'medium',
        type: 'Productivity',
        message: `Schedule deep work sessions during ${peakHour}:00-${(peakHour + 2) % 24}:00`,
        impact: 'Maximize output during peak performance hours'
      },
      {
        priority: 'medium',
        type: 'Best Practice',
        message: 'Add more documentation to your ${topLanguages[0] || "main"} projects',
        impact: 'Improved collaboration and project maintainability'
      },
      {
        priority: 'low',
        type: 'Health',
        message: avgCommitsPerDay > 8
          ? 'Consider shorter, more focused coding sessions'
          : 'Maintain your sustainable development pace',
        impact: 'Better work-life balance and sustained productivity'
      }
    ],
    cognitiveLoadPattern: {
      dailyPattern: [45, 60, 75, 80, 65, 30, 20], // Mon-Sun
      trend: 'stable',
      alert: burnoutLevel > 70 ? 'Warning: High workload detected in recent weeks. Consider reducing intensity.' : null
    },
    insights: [
      `🎯 You're most productive in ${topLanguages[0] || 'your primary language'} with ${githubData.repos?.languages[topLanguages[0]] || 0} repositories`,
      `⭐ Your work has earned ${totalStars} stars from the community`,
      `📊 Average of ${Math.round(avgCommitsPerDay)} commits per day shows ${avgCommitsPerDay > 5 ? 'high' : 'consistent'} activity`,
      `🕐 Peak productivity detected around ${peakHour}:00 - plan important tasks accordingly`,
      `${burnoutLevel < 40 ? '✅' : '⚠️'} Current burnout risk is ${burnoutLevel > 70 ? 'high' : burnoutLevel > 40 ? 'moderate' : 'low'} - ${burnoutLevel < 40 ? 'great balance!' : 'consider adjusting pace'}`
    ]
  };
};

/**
 * Main controller to get AI insights
 */
exports.getAIInsights = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('+accessToken');

    if (!user || !user.accessToken) {
      return res.status(400).json({
        success: false,
        message: 'GitHub account not connected. Please connect your GitHub account first.'
      });
    }

    // Check if using mock token
    const isMockToken = user.accessToken.startsWith('mock_token_');
    
    let githubData;
    
    if (isMockToken) {
      // Use mock GitHub data
      githubData = {
        user: {
          login: user.username || 'mockuser',
          name: user.name || 'Mock User',
          bio: 'Developer',
          public_repos: 15,
          followers: 45,
          following: 30
        },
        repos: {
          total: 15,
          languages: {
            'JavaScript': 8,
            'Python': 4,
            'Java': 2,
            'TypeScript': 1
          },
          stars: 127,
          forks: 34,
          sizes: []
        },
        activity: {
          recentEvents: [],
          commitsByDay: {
            '2024-01-15': 5,
            '2024-01-16': 8,
            '2024-01-17': 3,
            '2024-01-18': 12,
            '2024-01-19': 6
          },
          commitsByHour: [0, 0, 0, 0, 0, 0, 1, 2, 5, 8, 12, 15, 10, 8, 14, 18, 12, 8, 4, 2, 1, 0, 0, 0],
          activityTypes: {
            'PushEvent': 45,
            'PullRequestEvent': 12,
            'IssuesEvent': 8,
            'CreateEvent': 5
          },
          totalEvents: 70
        }
      };
    } else {
      // Fetch real GitHub data
      githubData = await fetchGitHubDataForAI(user.accessToken);
    }

    // Generate AI insights
    const insights = await generateAIInsights(githubData);

    res.json({
      success: true,
      data: {
        ...insights,
        githubData: {
          repos: githubData.repos.total,
          stars: githubData.repos.stars,
          languages: githubData.repos.languages
        }
      },
      mode: isMockMode ? 'mock' : 'ai'
    });

  } catch (error) {
    console.error('Error in getAIInsights:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate AI insights',
      error: error.message
    });
  }
};

/**
 * Chat endpoint for interactive AI queries
 */
exports.chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user.id;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    const user = await User.findById(userId).select('+accessToken');
    
    if (!user || !user.accessToken) {
      return res.status(400).json({
        success: false,
        message: 'GitHub account not connected'
      });
    }

    // Check if using mock token
    const isMockToken = user.accessToken.startsWith('mock_token_');
    
    let githubData;
    if (isMockToken) {
      githubData = { mock: true };
    } else {
      githubData = await fetchGitHubDataForAI(user.accessToken);
    }

    if (isMockMode) {
      // Mock response
      const mockResponses = [
        "Based on your GitHub activity, I notice you're making great progress! Consider adding more tests to improve code quality.",
        "Your productivity peaks around 2 PM. Try scheduling your most challenging tasks during this time.",
        "I see you're working across multiple languages. This versatility is a great strength!",
        "Your commit frequency is healthy. Remember to take breaks between coding sessions.",
        "You have several repositories with good star counts. Consider adding more documentation to help others."
      ];
      
      return res.json({
        success: true,
        data: {
          response: mockResponses[Math.floor(Math.random() * mockResponses.length)],
          suggestions: [
            'What are my peak productivity hours?',
            'How can I improve my code quality?',
            'Am I at risk of burnout?'
          ]
        },
        mode: 'mock'
      });
    }

    // Real AI response
    const completion = await openai.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `You are an expert developer productivity coach. You have access to the user's GitHub data: ${JSON.stringify(githubData)}. Provide helpful, specific, and encouraging advice.`
        },
        {
          role: 'user',
          content: message
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    const response = completion.choices[0].message.content;

    res.json({
      success: true,
      data: {
        response,
        suggestions: [
          'What are my peak productivity hours?',
          'How can I improve my code quality?',
          'Am I at risk of burnout?'
        ]
      },
      mode: 'ai'
    });

  } catch (error) {
    console.error('Error in chatWithAI:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process chat message',
      error: error.message
    });
  }
};
