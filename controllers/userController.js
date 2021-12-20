const passport = require('passport');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const formidable = require("formidable");

const User = require('../database/models/userModel');

module.exports.registration = async function(req, res) {
    const { firstName, middleName, surName, username, password } = req.body;

    User.findOne({ username })
        .then((user) => {
            if(user) {
                return res.status(500).json({ error: {message: 'Пользователь с таким логином уже существует' }});
            } else {
                const newUser = new User({ firstName, middleName, surName, username });

                newUser.setPassword(password);
                newUser.save()
                    .then((newUser) => {
                        res.json(newUser)
                    });
            }
        });
};

module.exports.login = async function(req, res, next) {
    passport.authenticate("local", async function(err, user, info) {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.redirect("/");
        }
        req.logIn(user, async function(err) {
            if (err) {
                return next(err);
            }

            const token = uuidv4();
            user.setToken(token);

            await User.findOneAndUpdate({ id: user.id }, user, { new: true });

            res.cookie("accessToken", token, {
                maxAge: 7 * 60 * 60 * 1000,
                path: "/",
                httpOnly: false
            });

            res.json(user);
        });
    })(req, res, next);
};


module.exports.refreshToken = async function(req, res) {
    try {
        const accessToken = req.cookies;

        const user = await User.findOne(accessToken);

        res.set('authorization', user.refreshToken);
        res.send();
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: err.message });
    }
};

module.exports.profile = async function(req, res) {
    // if(req.isAuthenticated()) {
    try {
        const user = await User.findOne({ username: req.body.username });

        return res.json(user);
    } catch(err) {
        console.error(err);
        res.status(400).json({error: err.message});
    }
};

module.exports.updateProfile = async function(req, res) {
    try {
        const accessToken = req.cookies;
        const form = new formidable.IncomingForm();
        const upload = path.normalize('uploads');

        form.parse(req, async function(err, fields, files) {
            if (err) return res.status(400).json({ error: "Возникла ошибка" });
            const { firstName, middleName, surName, oldPassword, newPassword } = fields;
            const user = await User.findOne(accessToken);

            if(newPassword !== '' && user.isValidPassword(oldPassword)) {
                await user.setPassword(newPassword);
            }

            let fileName = '';

            if(Object.keys(files).length !== 0) {
                fileName = path.join(upload, files.avatar.originalFilename);

                fs.rename(files.avatar.filepath, fileName, async function (err) {
                    if (err) {
                        return res.status(400).json({ error: err.message });
                    }
                });
            }

            const updatedUser = await User.findOneAndUpdate({ id: user.id }, { firstName, middleName, surName, image: '/' + fileName }, { new: true });

            return res.json(updatedUser);
        });
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
};