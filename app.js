/*
 * nodepki is a certificate manager
 */

var exec = require('child_process').exec;
var util = require('util');
var fs = require('fs');

var express = require('express')
var app = express();

var api = require('./api.js');

// Base Base path of the application
global.paths = {
    basepath: __dirname + "/",
    pkipath: __dirname + "/mypki/",
    tempdir: __dirname + "/tmp/"
};


/* * * * * * * * *
 * Server start  *
 * * * * * * * * */


console.log("NodePKI is starting up ...");

var server = app.listen(8081, function() {
    var host = server.address().address;
    var port = server.address().port;

    console.log("Listening at http://%s:%s", host, port);
});

// Register API paths
api.initAPI(app);



// Export app var
module.exports = {
    app: app
};
