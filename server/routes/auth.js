const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.get('/github', authController.githubAuth);
router.get('/github/callback', authController.githubCallback);
router.get('/me', authController.getMe);
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/dev-login', authController.devLogin);

module.exports = router;
