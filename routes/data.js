/* globals db */
"use strict";
var express = require('express');
var router = express.Router();
var uuidV4 = require('uuid/v4');

router.get('/:id', function(req, res, next) {
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

router.patch('/:id', function(req, res, next) {
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

    // phew. we made it. stick it in.
    db.run("UPDATE data set patientData = $data" +
        " WHERE id = $uuid", {
            $uuid: req.params.id,
            $data: req.body.data
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

module.exports = router;
