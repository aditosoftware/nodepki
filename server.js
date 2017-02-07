/*
 * NodePKI
 * ... a NodeJS-based OpenSSL PKI management server.
 * Originally developed by Thomas Leister for ADITO GmbH.
 * NodePKI is published under MIT License.
 *
 * NodePKI startup file
 * Loads config, prepares CertDB database, starts OCSP server, initializes and starts HTTP server and API.
 */

var exec        = require('child_process').exec;
var util        = require('util');
var fs          = require('fs');
var yaml        = require('js-yaml');
var log         = require('fancy-log');

var express     = require('express');
var app         = express();

var api         = require('./api.js');
var certdb      = require('./certdb.js');
var ocsp        = require('./ocsp-server.js');



/***************
* Start server *
***************/

log.info("NodePKI is starting up ...");

log.info("Reading config file config.yml ...");
global.config = yaml.safeLoad(fs.readFileSync('config.yml', 'utf8'));

// Base Base path of the application
global.paths = {
    basepath: __dirname + "/",
    pkipath: __dirname + "/mypki/",
    tempdir: __dirname + "/tmp/"
};


// Re-index cert database
certdb.reindex().then(function(){
    // Start HTTP server
    log.info("Starting HTTP server");
    var server = app.listen(global.config.server.port, global.config.server.ip, function() {
        var host = server.address().address;
        var port = server.address().port;

        log.info("HTTP API-server is listening on " + host + ":" + port);
    });

    // Register API paths
    log.info("Registering API endpoints");
    api.initAPI(app);
}).catch(function(error){
    log.error("Could not initialize CertDB index: " + error);
});


// Start OCSP server
ocsp.startServer()
.then(function(){
    log.info("OCSP-Server started.");
})
.catch(function(error){
    log.error("Could not start OCSP server: " + error);
});



/*********************************
* Server stop routine and events *
*********************************/

var stopServer = function() {
    log("Received termination signal.");
    log("Stopping OCSP server ...");
    ocsp.stopServer();

    log("Bye!");
    process.exit();
};

process.on('SIGINT', stopServer);
process.on('SIGHUP', stopServer);
process.on('SIGQUIT', stopServer);



// Export app variable
module.exports = {
    app: app
};
