const express = require('express');
const authController = require('./auth.controller');
const validateBody = require('../../middlewares/validate.middleware');

const router = express.Router();

router.post('/register', validateBody(['username', 'email', 'password']), authController.register);
router.post('/login', validateBody(['email', 'password']), authController.login);

module.exports = router;
