const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Schema = mongoose.Schema;

const userSchema = new Schema({
    firstName: String,
    image: { type: String, default: '' },
    middleName: String,
    password: String,
    permission: {
        chat: {
            C: { type: Boolean, default: true },
            R: { type: Boolean, default: true },
            U: { type: Boolean, default: true },
            D: { type: Boolean, default: true }
        },
        news: {
            C: { type: Boolean, default: true },
            R: { type: Boolean, default: true },
            U: { type: Boolean, default: true },
            D: { type: Boolean, default: true }
        },
        settings: {
            C: { type: Boolean, default: true },
            R: { type: Boolean, default: true },
            U: { type: Boolean, default: true },
            D: { type: Boolean, default: true }
        }
    },
    surName: String,
    username: {
        type: String,
        required: true,
        unique: true
    },
    accessToken: String,
    refreshToken: String,
    accessTokenExpiredAt: {
        type: Date,
        default: new Date().getMilliseconds()
    },
    refreshTokenExpiredAt: {
        type: Date,
        default: new Date().getMilliseconds()
    }
});

userSchema.methods.setPassword = function(pass) {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(pass, salt);

    this.password = hash;
};

userSchema.methods.isValidPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};

const User = mongoose.model("User", userSchema);

module.exports = User;