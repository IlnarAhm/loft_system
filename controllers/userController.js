const passport = require('passport');
const { uuid } = require('uuidv4');
const path = require('path');
const fs = require('fs');
const tokens = require('../config/tokens');
const formidable = require("formidable");

const User = require('../database/models/userModel');

module.exports.registration = async function(req, res) {
    const { firstName, middleName, surName, username, password } = req.body;

    User.findOne({ username })
        .then((user) => {
            if(user) {
                return res.status(49).json({ message: 'Пользователь с таким логином уже существует' });
            } else {
                const newUser = new User({ id: uuid(), firstName, middleName, surName, username });

                newUser.setPassword(password);
                newUser.save()
                    .then((newUser) => {
                        res.json(newUser)
                    });
            }
        });
};

module.exports.login = async function(req, res, next) {
    passport.authenticate(
        'local',
        { session: false },
        async (err, user, info) => {
            if (err) {
                return next(err);
            }
            if (!user) {
                return res.status(409).json({ message: 'Не правильно введен логин или пароль' });
            }
            if (user) {
                const token = await tokens.createTokens(user);

                res.json({
                    ...user.serialize(),
                    ...token,
                });
            }
    })(req, res, next);
};


module.exports.refreshToken = async function(req, res) {
    const refreshToken = req.headers['authorization'];

    const data = await tokens.refreshTokens(refreshToken);
    res.json({ ...data });
};

module.exports.profile = async function(req, res) {
    try {
        const user = req.user;

        res.json(user);
    } catch(err) {
        console.error(err);
        res.status(400).json({error: err.message});
    }
};

module.exports.updateProfile = async function(req, res) {
    try {
        const refreshToken = req.headers['authorization'];
        const form = new formidable.IncomingForm();
        const upload = path.normalize('uploads');

        form.parse(req, async function(err, fields, files) {
            if (err) return res.status(409).json({ message: "Возникла ошибка" });

            const { firstName, middleName, surName, oldPassword, newPassword } = fields;

            // const user = await User.findOne(accessToken);
            const user = await tokens.getUserByToken(refreshToken);

            if(newPassword !== '' && user.isValidPassword(oldPassword)) {
                await user.setPassword(newPassword);
            }

            let fileName = user.image;

            if(Object.keys(files).length !== 0) {
                uploadFilePath = path.join(upload, files.avatar.originalFilename);
                fileName = path.join('/', upload, files.avatar.originalFilename);

                await fs.renameSync(files.avatar.filepath, uploadFilePath);
            }

            const updatedUser = await User.findOneAndUpdate({ _id: user.id }, { firstName, middleName, surName, image: fileName }, {new: true});

            console.log(updatedUser);
            res.json(updatedUser);
        });
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
};

module.exports.deleteUser = async function(req, res) {
    const deletedUser = await User.findOneAndDelete({ _id: req.params.id });

    res.json(deletedUser);
};

module.exports.getAll = async function(req, res) {
    const users = await User.find({});

    res.json(users);
};

module.exports.permission = async function(req, res) {
    const users = await User.findOneAndUpdate({id: req.params.id}, req.body);

    // res.json(users);
};