/* globals db */
"use strict";
var express = require('express');
var path = require('path');
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var basicAuth = require('basic-auth');
var cors = require('cors');
var config = require('./data/config');
var cookieParser = require('cookie-parser');

// route loading
var dataroute = require('./routes/data');
var uuidroute = require('./routes/uuid');
var sessionroute = require('./routes/session');

var app = express();
app.use(cors());
app.use(cookieParser());

/**
 * Basic Auth/DB auth system
 */
function auth(req, res, next) {
    function unauthorized(res) {
        res.status(401).send();
        return;
    }

    // actual authentication goes here
    var authorized = true;


    if (!authorized) {
        // I never knew you
        return unauthorized(res);
    } else {
        next();
    }
}

// logging
if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('short'));
}

// body parsing goodness
app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({
    extended: true
}));

// protect routes
app.use('/data', auth);
app.use('/uuid', auth);
app.use('/session', auth);

// route to controllers
app.use('/data', dataroute);
app.use('/uuid', uuidroute);
app.use('/session', sessionroute);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function(err, req, res, next) {
    if (res.headersSent) {
        return next(err);
    }

    if (err.status) {
        if (process.env.NODE_ENV !== 'test') {
            console.log(err);
            console.log(err.stack);
        }
        res.status(err.status).send(err);
    } else {
        if (process.env.NODE_ENV !== 'test') {
            console.log(err);
            console.log(err.stack);
        }
        res.status(500).send(err);
    }
});


module.exports = app;
