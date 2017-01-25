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

// route loading
var exampleroute = require('./routes/exampleroute');

var app = express();
app.use(cors());

/**
 * Basic Auth/DB auth system
 */
function auth(req, res, next) {
    function unauthorized(res) {
        res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
        res.status(401).send();
        return;
    }

    // var user = basicAuth(req);
    //
    // if (!user || !user.name || !user.pass) {
    //     return unauthorized(res);
    // }

    // TODO set up actual authentication
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
app.use('/exampleroute', auth);

// route to controllers
app.use('/exampleroute', exampleroute);

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
