/* globals db */
"use strict";
var express = require('express');
var router = express.Router();
var uuidV4 = require('uuid/v4');
var CryptoJS = require("crypto-js");
var config = require('../config.js');

router.get('/:id/:sk', function(req, res, next) {
    // not enough fields were provided
    if (req.params === {}) {
        res.setHeader('Content-Type', 'application/json');
        res.status(400).send(JSON.stringify({
            error: "id must be provided"
        }));
        return;
    }

    db.all("SELECT uuid" +
        " FROM sessions" +
        " WHERE sk = $sk AND expires > " + Math.floor(Date.now() / 1000), {
            $sk: req.params.sk,
        },
        function(err, results) {
            if (err) {
                res.setHeader('Content-Type', 'application/json');
                res.status(400).send(JSON.stringify({
                    dbError: err
                }));
                return;
            }

            // no valid session
            if (results.length === 0) {
                res.setHeader('Content-Type', 'application/json');
                res.status(401).send();
                return;
            }

            // return the data
            // get the entry
            db.all("SELECT patientData" +
                " FROM data" +
                " WHERE id = $id", {
                    $id: req.params.id,
                },
                function(err, results) {
                    if (err) {
                        res.setHeader('Content-Type', 'application/json');
                        res.status(400).send(JSON.stringify({
                            dbError: err
                        }));
                        return;
                    }

                    // nothing returned; nothing for that ID
                    if (results.length === 0) {
                        res.setHeader('Content-Type', 'application/json');
                        res.status(404).send();
                        return;
                    }

                    // decrypt data
                    var dataBytes = CryptoJS.AES.decrypt(results[0].patientData, config.cryptoKey);
                    var dataPlaintext = dataBytes.toString(CryptoJS.enc.Utf8);

                    if (dataPlaintext.length === 0) {
                        // catch empty cast
                        dataPlaintext = '{}';
                    }

                    // return the data
                    res.setHeader('Content-Type', 'application/json');
                    res.status(200).send(dataPlaintext);
                });
        });
});

router.post('/:id/:sk', function(req, res, next) {
    // not enough fields were provided
    if (req.body === undefined) {
        res.setHeader('Content-Type', 'application/json');
        res.status(400).send(JSON.stringify({
            error: "No payload delivered"
        }));
        return;
    }

    // not enough fields were provided
    if (req.params === {}) {
        res.setHeader('Content-Type', 'application/json');
        res.status(400).send(JSON.stringify({
            error: "id must be provided"
        }));
        return;
    }

    db.all("SELECT uuid" +
        " FROM sessions" +
        " WHERE sk = $sk AND expires > " + Math.floor(Date.now() / 1000), {
            $sk: req.params.sk,
        },
        function(err, results) {
            if (err) {
                res.setHeader('Content-Type', 'application/json');
                res.status(400).send(JSON.stringify({
                    dbError: err
                }));
                return;
            }

            // no valid session
            if (results.length === 0) {
                res.setHeader('Content-Type', 'application/json');
                res.status(401).send();
                return;
            }

            // good session key. Write the data.
            db.all("SELECT patientData" +
                " FROM data" +
                " WHERE id = $id", {
                    $id: req.params.id,
                },
                function(err, results) {
                    if (err) {
                        res.setHeader('Content-Type', 'application/json');
                        res.status(400).send(JSON.stringify({
                            dbError: err
                        }));
                        return;
                    }

                    // encrypt before rest
                    var cipherDataBytes = CryptoJS.AES.encrypt(req.body.data, config.cryptoKey);
                    var cipherDataString = cipherDataBytes.toString();

                    db.run("UPDATE data set patientData = $data" +
                        " WHERE id = $uuid", {
                            $uuid: req.params.id,
                            $data: cipherDataString
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
                            res.setHeader('Content-Type', 'application/json');
                            res.status(204).send();
                        });
                });



        });
});

module.exports = router;
