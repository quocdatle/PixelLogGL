const express = require('express');
const authController = require('./auth.controller');
const validateBody = require('../../middlewares/validate.middleware');

const router = express.Router();

// Local Auth
router.post('/register', validateBody(['username', 'email', 'password']), authController.register);
router.post('/login', validateBody(['email', 'password']), authController.login);

// Google OAuth 2.0
router.get('/google', authController.googleRedirect);
router.get('/google/callback', authController.googleCallback);
router.post('/google', validateBody(['code']), authController.googleLoginApi);

// Discord OAuth 2.0
router.get('/discord', authController.discordRedirect);
router.get('/discord/callback', authController.discordCallback);
router.post('/discord', validateBody(['code']), authController.discordLoginApi);

// Steam OpenID 2.0
router.get('/steam', authController.steamRedirect);
router.get('/steam/callback', authController.steamCallback);
router.post('/steam', authController.steamLoginApi);

module.exports = router;
