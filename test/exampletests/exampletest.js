/* globals it,describe,beforeEach,afterEach,before,after */
// -W020 because we have to override the node require to use really-need for cache busting
/*jshint -W020 */
"use strict";

process.env.NODE_ENV = 'test';

var request = require('supertest');
require = require('really-need');
var rimraf = require('rimraf');
var config = require('../../data/config');
var mkdirp = require('mkdirp');

describe('media delete', function() {
    var server;

    before(function(done) {
        mkdirp(config.media.test_location, done);
    });

    beforeEach(function() {
        server = require('../../bin/www', {
            bustCache: true
        });
    });

    afterEach(function(done) {
        server.close(done);
    });

    after(function(done) {
        rimraf(config.media.test_location, done);
    });



    it('deletes a media object', function testMediaDeletion(done) {
        request(server)
            .post('/register')
            .set('Content-Type', 'application/json')
            .send('{"username": "myusername", "password": "MyPassword"}')
            .end(function() {
                request(server)
                    .post('/thing')
                    .auth('myusername', 'MyPassword')
                    .set('Content-Type', 'application/json')
                    .send('{"name": "Phenylpiracetam",' +
                        '"unit": "mg",' +
                        '"notes": "Phenylpiracetam is a phenylated analog of the drug piracetam.",' +
                        '"classification": "AMPA modulator",' +
                        '"family": "*racetam",' +
                        '"rarity": "Common"' +
                        '}')
                    .end(function() {
                        request(server)
                            .post('/thing')
                            .auth('myusername', 'MyPassword')
                            .attach('image', 'test/test_img.jpg') // supertest is weird; it works from the relative dir of test launch
                            .field('title', 'My Pic')
                            .field('association_type', 'drug')
                            .field('association', '1')
                            .field('tags', 'test tag')
                            .field('date', 1445995224)
                            .expect(201, {
                                "id": 1
                            }, done);
                    });
            });
    });
});
