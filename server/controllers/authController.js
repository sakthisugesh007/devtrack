const axios = require('axios');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Redirect to GitHub
exports.githubAuth = (req, res) => {
    const redirectUri = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&scope=user:email`;
    res.redirect(redirectUri);
};

// Handle Callback
exports.githubCallback = async (req, res) => {
    const { code } = req.query;

    if (!code) {
        return res.status(400).json({ message: 'No code provided' });
    }

    try {
        // 1. Exchange code for access token
        const tokenResponse = await axios.post('https://github.com/login/oauth/access_token', {
            client_id: process.env.GITHUB_CLIENT_ID,
            client_secret: process.env.GITHUB_CLIENT_SECRET,
            code
        }, {
            headers: { Accept: 'application/json' }
        });

        const accessToken = tokenResponse.data.access_token;
        if (!accessToken) {
            return res.status(400).json({ message: 'Failed to get access token' });
        }

        // 2. Get User Profile
        const userResponse = await axios.get('https://api.github.com/user', {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        const githubUser = userResponse.data;

        // 2.1. If email is null (private), fetch from emails endpoint
        if (!githubUser.email) {
            try {
                const emailsResponse = await axios.get('https://api.github.com/user/emails', {
                    headers: { Authorization: `Bearer ${accessToken}` }
                });
                const emails = emailsResponse.data;
                // Find primary email or first verified email
                const primaryEmail = emails.find(e => e.primary && e.verified) || emails.find(e => e.verified) || emails[0];
                if (primaryEmail) {
                    githubUser.email = primaryEmail.email;
                }
            } catch (emailError) {
                console.error('Failed to fetch GitHub emails:', emailError);
                // Continue without email - will be handled below
            }
        }

        // 2.2. If still no email, generate a fallback email
        if (!githubUser.email) {
            githubUser.email = `${githubUser.login}@github.user`;
            console.warn(`No email found for GitHub user ${githubUser.login}, using fallback: ${githubUser.email}`);
        }

        // Check if user is already logged in (Link Account)
        const existingToken = req.cookies.token;
        let user;

        if (existingToken) {
            try {
                const decoded = jwt.verify(existingToken, process.env.JWT_SECRET);
                user = await User.findById(decoded.id);
                if (user) {
                    // Update existing user with GitHub info
                    user.githubId = githubUser.id;
                    user.accessToken = accessToken;
                    user.username = githubUser.login; // Update to latest GitHub username
                    user.avatarUrl = githubUser.avatar_url;
                    user.lastSynced = new Date();
                    await user.save();

                    // Redirect to Connect Account page or Dashboard
                    return res.redirect(`${process.env.CLIENT_URL}/dashboard?github_connected=true`);
                }
            } catch (err) {
                // Token invalid, proceed to normal login/signup
            }
        }

        // 3. Find or Create User (Normal GitHub Login)
        user = await User.findOne({ githubId: githubUser.id });

        if (!user) {
            // Check if email already exists
            const existingEmailUser = await User.findOne({ email: githubUser.email });
            if (existingEmailUser) {
                // Link to existing email user
                user = existingEmailUser;
                user.githubId = githubUser.id;
                user.accessToken = accessToken;
                // Don't overwrite name/avatar if they exist, or maybe do? Let's keep existing.
                if (!user.avatarUrl) user.avatarUrl = githubUser.avatar_url;
                await user.save();
            } else {
                user = new User({
                    githubId: githubUser.id,
                    username: githubUser.login,
                    email: githubUser.email,
                    avatarUrl: githubUser.avatar_url,
                    accessToken // Store securely!
                });
                await user.save();
            }
        } else {
            // Existing GitHub user logging in again - update token and info
            user.accessToken = accessToken;
            user.username = githubUser.login;
            user.avatarUrl = githubUser.avatar_url;
            user.lastSynced = new Date();
            await user.save();
        }

        // 4. Issue JWT
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: '7d'
        });

        // 5. Send Token via Cookie or Query Param (Redirecting back to client)
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        // Determine redirect path (e.g. if they came from specific page, but for now Dashboard)
        res.redirect(`${process.env.CLIENT_URL}/dashboard`);

    } catch (error) {
        console.error('GitHub Auth Error:', error);
        res.redirect(`${process.env.CLIENT_URL}/login?error=auth_failed`);
    }
};

// Signup
exports.signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!email || !password || !name) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = new User({
            name,
            email,
            password: hashedPassword,
            username: name.split(' ')[0] + Math.floor(Math.random() * 1000) // Generate temporary username
        });

        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: '7d'
        });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.status(201).json({ message: 'User created successfully', user });
    } catch (error) {
        console.error('Signup Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        if (!user.password) {
            return res.status(400).json({ message: 'Please login with GitHub' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: '7d'
        });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.json({ message: 'Login successful', user });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get Current User
exports.getMe = async (req, res) => {
    try {
        const token = req.cookies.token;
        if (!token) return res.status(401).json({ message: 'Not authenticated' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) return res.status(404).json({ message: 'User not found' });

        res.json(user);
    } catch (error) {
        console.error('Get Me Error:', error);
        res.status(401).json({ message: 'Invalid token' });
    }
};

// Logout
exports.logout = (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out successfully' });
};

// Dev Login (Bypass GitHub)
exports.devLogin = async (req, res) => {
    if (process.env.NODE_ENV !== 'development') {
        return res.status(403).json({ message: 'Dev login only available in development mode' });
    }

    try {
        // Create or get a mock user
        let user = await User.findOne({ githubId: 'mock-dev-user' });

        if (!user) {
            user = new User({
                githubId: 'mock-dev-user',
                username: 'DevUser_Rough',
                email: 'dev@rough.env',
                avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DevTrackAi',
                accessToken: 'mock_access_token'
            });
            await user.save();
        }

        // Issue JWT
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: '1d'
        });

        res.cookie('token', token, {
            httpOnly: true,
            secure: false, // Dev is http
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000
        });

        res.json({ message: 'Dev login successful', user });

    } catch (error) {
        console.error('Dev Login Error:', error);
        res.status(500).json({ message: 'Dev login failed' });
    }
};
