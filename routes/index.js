const express = require('express');
const router = express.Router();

const { userController, newsController } = require('../controllers');

router.post('/registration', userController.registration);
router.post('/login', userController.login);
router.post('/refresh-token', userController.refreshToken);
router.get('/profile', userController.profile);
router.patch('/profile', userController.updateProfile);

module.exports = router;
