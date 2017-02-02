/*
 * API registry for
 * GET POST PUT DELETE
 */

// 3rd party modules
var fs = require('fs');
var express = require('express');
var bodyparser = require('body-parser');

// Custom modules
var certapi = require('./api/certificate.js');


/**
 * Initializes API paths.
 */
var initAPI = function(app) {

    // Always use JSON Body parsing for API endpoints.
    app.use(bodyparser.json());


    /*
     * PUT requests
     */

    app.put('/certificate/request/', function(req, res) {
        certapi.certificate.request(req, res);
    });


    /*
     * GET requests
     */

    app.get('/certificate/:id/get/', function(req, res) {
        console.log("Client is requesting certificate %s", req.params.id);
        res.end("blablabla");
    });

};



// Export initAPI() function
module.exports = {
    initAPI: initAPI
}
