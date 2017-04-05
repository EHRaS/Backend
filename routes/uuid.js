/* globals db */
"use strict";
var express = require('express');
var router = express.Router();
var uuidV4 = require('uuid/v4');
var CryptoJS = require("crypto-js");
var config = require('../config.js');


router.get('/new', function(req, res, next) {
    var plaintextUUID = uuidV4();
    var cipherUUIDBytes = CryptoJS.AES.encrypt(plaintextUUID, config.cryptoKey);
    var cipherUUID = cipherUUIDBytes.toString();

    res.status(201).send(cipherUUID);
});

router.post('/decrypt', function(req, res, next) {
    // not enough fields were provided
    if (req.body === undefined) {
        res.setHeader('Content-Type', 'application/json');
        res.status(400).send(JSON.stringify({
            error: "No request"
        }));
        return;
    }

    var UUIDbytes = CryptoJS.AES.decrypt(req.body.uuid, config.cryptoKey);
    var UUIDplaintext = UUIDbytes.toString(CryptoJS.enc.Utf8);

    res.setHeader('Content-Type', 'application/json');
    res.status(201).send(UUIDplaintext);
});

module.exports = router;
