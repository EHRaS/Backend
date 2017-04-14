/* globals db */
"use strict";
var express = require('express');
var router = express.Router();
var uuidV4 = require('uuid/v4');

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

                    // return the data
                    res.setHeader('Content-Type', 'application/json');
                    res.status(200).send(results[0]);
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

                    var originalNewData = req.body.data;

                    if(JSON.parse(results[0].patientData).hasOwnProperty('photoURI') && !JSON.parse(req.body.data).hasOwnProperty('photoURI')){
                        // the sent data doesn't have an image but the historical data does
                        var newData = JSON.parse(req.body.data);
                        var historicalData = JSON.parse(results[0].patientData);
                        newData.photoURI = historicalData.photoURI;
                        originalNewData = JSON.stringify(newData);
                    }

                    db.run("UPDATE data set patientData = $data" +
                        " WHERE id = $uuid", {
                            $uuid: req.params.id,
                            $data: originalNewData
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
