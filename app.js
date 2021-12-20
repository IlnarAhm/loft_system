const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const passport = require('passport');
const session = require('express-session');
const FileStore = require('session-file-store')(session);

require('./database');
require('./config/passport');
const app = express();

process.env.NODE_ENV === 'development'
    ? app.use(logger('dev'))
    : app.use(logger('short'));

app.use(passport.initialize());
app.use(
    session({
        store: new FileStore(),
        secret: 'secretKey',
        resave: false,
        saveUninitialized: true,
        cookie: { secure: true }
    })
);
// app.use(passport.session());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/', express.static(path.join(__dirname, 'client')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api', require('./routes'));

app.use('*', (_req, res) => {
    const file = path.resolve(__dirname, 'client', 'index.html');
    res.sendFile(file);
});

module.exports = app;
