const express = require('express');
const router = express.Router();
const githubController = require('../controllers/githubController');
const jwt = require('jsonwebtoken');

// Simple Middleware to verify JWT
const verifyToken = (req, res, next) => {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid Token' });
    }
};

router.get('/dashboard', verifyToken, githubController.getDashboardData);
router.get('/connection-status', verifyToken, githubController.getConnectionStatus);
router.get('/activity', verifyToken, githubController.getActivityData);
router.get('/repos', verifyToken, githubController.getRepositories);
router.post('/unlink', verifyToken, githubController.unlinkGithubAccount);

module.exports = router;
