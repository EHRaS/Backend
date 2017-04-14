/* globals db */
"use strict";
var express = require('express');
var router = express.Router();
var config = require('../config.js');

function randomString(len) {
    var charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var randomString = '';
    for (var i = 0; i < len; i += 1) {
        var randomPoz = Math.floor(Math.random() * charSet.length);
        randomString += charSet.substring(randomPoz, randomPoz + 1);
    }
    return randomString;
}

router.get('/:uuid', function(req, res, next) {
    // not enough fields were provided
    if (req.params === {}) {
        res.setHeader('Content-Type', 'application/json');
        res.status(400).send(JSON.stringify({
            error: "id must be provided"
        }));
        return;
    }

    // get the entry
    db.all("SELECT patientData" +
        " FROM data" +
        " WHERE id = $uuid", {
            $uuid: req.params.uuid,
        },
        function(err, results) {
            if (err) {
                res.setHeader('Content-Type', 'application/json');
                res.status(400).send(JSON.stringify({
                    dbError: err
                }));
                return;
            }

            // nothing for that ID; create it
            if (results.length === 0) {
                db.run("INSERT INTO data (id, patientData)" +
                    " VALUES ($uuid, $data)", {
                        $uuid: req.params.uuid,
                        $data: '{"dummydata": 1}'
                    },

                    function(err) {
                        if (err) {
                            res.setHeader('Content-Type', 'application/json');
                            res.status(400).send(JSON.stringify({
                                dbError: err
                            }));
                            return;
                        }
                    });
            }

            // generate session key, insert, and return
            var sk = randomString(64);

            // load the session into the database
            db.run("INSERT INTO sessions (uuid, sk, expires)" +
                " VALUES ($uuid, $sk, $expires)", {
                    $uuid: req.params.uuid,
                    $sk: sk,
                    $expires: Math.floor(Date.now() / 1000) + (config.sessionHours * 60 * 60)
                },

                function(err) {
                    if (err) {
                        res.setHeader('Content-Type', 'application/json');
                        res.status(400).send(JSON.stringify({
                            dbError: err
                        }));
                        return;
                    }

                    // return the sk
                    res.setHeader('Content-Type', 'application/json');
                    res.status(200).send(sk);
                });
        });
});

module.exports = router;
