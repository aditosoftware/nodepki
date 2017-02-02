/*
 * nodepki is a certificate manager
 */

var exec = require('child_process').exec;
var util = require('util');
var fs = require('fs');
var yaml = require('js-yaml');

var express = require('express');
var app = express();

var api = require('./api.js');




/* * * * * * * * *
 * Server start  *
 * * * * * * * * */


console.log("NodePKI is starting up ...");

console.log("Reading config file ...");
global.config = yaml.safeLoad(fs.readFileSync('config.yml', 'utf8'));

// Base Base path of the application
global.paths = {
    basepath: __dirname + "/",
    pkipath: __dirname + "/" + global.config.ca.basedir,
    tempdir: __dirname + "/tmp/"
};

console.log("CA password: " + global.config.ca.password);

var server = app.listen(global.config.server.port, function() {
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
