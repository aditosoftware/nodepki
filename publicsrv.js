/*
 * Serve public files like CRL, Root Cert and Intermediate Cert.
 */


var spawn   = require('child_process').spawn;
var log     = require('fancy-log');
var express = require('express');
var fs = require('fs-extra');

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
      cwd: global.paths.pkipath + 'intermediate',
      shell: true,
      detached: true
    });

    // Enter ocsp private key password
    crl.stdin.write(global.config.ca.intermediate.passphrase + '\n');

    crl.on('error', function(error) {
        log("Error during crl generation: " + error);
    });

    crl.on('exit', function(code, signal){
        if(code === 0) {
            log("CRL successfully created");

            // Copy CRL to public directory
            fs.copySync(global.paths.pkipath + 'intermediate/crl/crl.pem', global.paths.pkipath + 'public/intermediate.crl.pem');
        } else {
            log.error("Error during CRL creation")
        }
    });
};





var startHTTPServer = function() {
    app.use(express.static(global.paths.pkipath + 'public'));

    var server = app.listen(global.config.server.public.port, global.config.server.ip, function() {
        var host = server.address().address;
        var port = server.address().port;

        log.info(">>>>>> Public HTTP server is listening on " + host + ":" + port + " <<<<<<");
    });
};




module.exports = {
    createCRL: createCRL,
    startHTTPServer: startHTTPServer
}
