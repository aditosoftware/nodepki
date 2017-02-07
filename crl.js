/**
 * Starts CRL HTTP server and generates CRLs
 */

var spawn   = require('child_process').spawn;
var log     = require('fancy-log');
var express = require('express');

var app = express();



/*
 * Creates / updates CRL and overwrites old version.
 */
var createCRL = function() {
    crl = spawn('openssl', [
      'ca',
      '-config', 'openssl.cnf',
      '-gencrl',
      '-out', 'crl/crl.pem'
    ], {
      cwd: "mypki/",
      shell: true,
      detached: true
    });

    // Enter ocsp private key password
    crl.stdin.write(global.config.ca.passphrase + '\n');

    crl.on('error', function(error) {
        log("Error during crl generation: " + error);
    });

    crl.on('exit', function(code, signal){
        if(code === 0) {
            log("CRL successfully created");
        } else {
            log.error("Error during CRL creation")
        }
    });
};


var startHTTPServer = function() {
    app.use(express.static(global.paths.pkipath + 'crl'));

    var server = app.listen(global.config.crl.port, global.config.crl.ip, function() {
        var host = server.address().address;
        var port = server.address().port;

        log.info("CRL HTTP server is listening on " + host + ":" + port);
    });
}



module.exports = {
    createCRL: createCRL,
    startHTTPServer: startHTTPServer
}
