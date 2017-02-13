/*
 * API registry for all HTTP API actions such as
 * GET, PUT, DELETE
 */

// 3rd party modules
var fs          = require('fs');
var express     = require('express');
var bodyparser  = require('body-parser');

// Custom modules
var certapi     = require('./api/certificate.js');
var caapi        = require('./api/ca.js');


var apipath = '/api/v1';

/**
 * Initializes API paths.
 */
var initAPI = function(app) {
    // Always use JSON Body parsing for API endpoints.
    app.use(bodyparser.json());


    app.post(apipath + '/certificate/request/', function(req, res) {
        certapi.certificate.request(req, res);
    });

    app.post(apipath + '/certificate/revoke/', function(req, res) {
        certapi.certificate.revoke(req, res);
    });

    app.post(apipath + '/ca/cert/get/', function(req, res) {
        caapi.cert.get(req, res);
    });

    app.post(apipath + '/certificates/list/', function(req, res) {
        certapi.certificates.list(req, res);
    });

    app.post(apipath + '/certificate/get/', function(req, res) {
        certapi.certificate.get(req, res);
    });






    /*
     * GET requests
     */

    app.get('/certificates/:serial/', function(req, res) {
        certapi.certificate.get(req, res);
    });


    app.get('/certificates/list/:state/', function(req, res) {
        certapi.certificates.list(req, res);
    });


};



// Export initAPI() function (called by server.js)
module.exports = {
    initAPI: initAPI
}
