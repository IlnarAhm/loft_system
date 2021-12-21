const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const app = express();

process.env.NODE_ENV === 'development'
    ? app.use(logger('dev'))
    : app.use(logger('short'));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(function (_, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept',
    );
    next();
});

app.use(cookieParser());

app.use('/', express.static(path.join(__dirname, 'client')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

require('./database');
require('./config/passport');

app.use('/api', require('./routes'));

app.use('*', (_req, res) => {
    const file = path.resolve(__dirname, 'client', 'index.html');
    res.sendFile(file);
});

app.use((err, _, res, __) => {
    console.log(err.stack);
    res.status(500).json({
        code: 500,
        message: err.message,
    });
});

module.exports = app;
