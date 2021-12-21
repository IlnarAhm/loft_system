const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const passportJWT = require('passport-jwt');

const User = require('../database/models/userModel');

passport.use(new LocalStrategy(
    async function(username, password, done) {
        try {
            const user = await User.findOne({username});

            if (!user) {
                return done(null, false)
            }

            if (!user.isValidPassword(password)) {
                return done(null, false)
            }

            return done(null, user)
        } catch (err) {
            done(err);
        }
    }
));


// JWT Strategy
const params = {
    secretOrKey: "secretKey",
    jwtFromRequest: function (req) {
        let token = null;

        if (req && req.headers) {
            token = req.headers['authorization'];
        }

        return token;
    },
};

passport.use(
    new passportJWT.Strategy(params, async function (payload, done) {
        try {
            const user = await User.findById({_id: payload.user.id});

            if (!user) {
                return done(new Error('User not found'));
            }

            return done(null, user);

        } catch (err) {
            done(err);
        }
    })
);