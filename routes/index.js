const express = require('express');
const router = express.Router();
const passport = require('passport');

const { userController, newsController } = require('../controllers');

const authMiddleware = (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (err, user) => {
        if (!user || err) {
            return res.status(401).json({
                code: 401,
                message: 'Unauthorized',
            });
        }

        req.user = user;

        next();
    })(req, res, next)
};

router.post('/registration', userController.registration);
router.post('/login', userController.login);
router.post('/refresh-token', userController.refreshToken);
router.get('/profile', authMiddleware, userController.profile);
router.patch('/profile', userController.updateProfile);
router.get('/users', authMiddleware, userController.getAll);
router.delete('/users/:id', userController.deleteUser);
router.patch('/users/:id/permission', userController.permission);


router.get('/news', authMiddleware, newsController.getAllNews);
router.post('/news', authMiddleware, newsController.addNews);
router.patch('/news/:id', authMiddleware, newsController.updateNews);
router.delete('/news/:id', authMiddleware, newsController.deleteNews);

module.exports = router;
