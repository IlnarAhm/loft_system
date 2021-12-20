const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../database/models/userModel');

passport.use(new LocalStrategy(
    async function(username, password, done) {
        const user = await User.findOne({username});

        if (user && user.isValidPassword(password)) {
            return done(null, user);
        } else {
            return done(null, false);
        }
    }
));


passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(async function(id, done) {
    try {
        const user = await db.getUserById(id);
        done(null, user);
    } catch (err) {
        done(err, false);
    }
});