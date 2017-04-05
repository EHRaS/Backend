/* globals db */
"use strict";
var express = require('express');
var router = express.Router();
var uuidV4 = require('uuid/v4');
var CryptoJS = require("crypto-js");
var cryptoKey = require('../key.js');


// console.log();

router.get('/new', function(req, res, next) {
    var plaintextUUID = uuidV4();
    var cipherUUIDBytes = CryptoJS.AES.encrypt(plaintextUUID, cryptoKey.cryptoKey);
    var cipherUUID = cipherUUIDBytes.toString();

    db.run("INSERT INTO data (id, patientData)" +
        " VALUES ($uuid, $data)", {
            $uuid: plaintextUUID,
            $data: '{}'
        },

        function(err) {
            if (err) {
                res.setHeader('Content-Type', 'application/json');
                res.status(400).send(JSON.stringify({
                    dbError: err
                }));
                return;
            }

            // you dun gud
            res.setHeader('X-Created-ID', cipherUUID);
            res.status(201).send();
        });
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

    var UUIDbytes = CryptoJS.AES.decrypt(req.body.uuid, cryptoKey.cryptoKey);
    var UUIDplaintext = UUIDbytes.toString(CryptoJS.enc.Utf8);

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('X-UUID', UUIDplaintext);
    res.status(201).send();
});

module.exports = router;
