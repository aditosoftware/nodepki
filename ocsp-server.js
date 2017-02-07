/*
 * OCSP-Server via OpenSSL
 */

var spawn = require('child_process').spawn;
var util = require('util');
var log = require('fancy-log');

var ocsp;

/**
 * Function starts OpenSSL server
 */
var startServer = function() {
    return new Promise(function(resolve, reject) {
        log("Starting OCSP server ...")

        ocsp = spawn('openssl', [
            'ocsp',
            '-port', global.config.ocsp.ip+':'+global.config.ocsp.port,
            '-text',
            '-sha256',
            '-index', 'index.txt',
            '-CA', 'certs/ca.cert.pem',
            '-rkey', 'private/ocsp.key.pem',
            '-rsigner', 'certs/ocsp.cert.pem'
         ], {
            cwd: "mypki/",
            detached: true,
            shell: true
        });

        // Enter ocsp private key password
        ocsp.stdin.write(global.config.ocsp.passphrase + '\n');

        log("OCSP server is listening on " + global.config.ocsp.ip + ':' + global.config.ocsp.port);

        ocsp.on('data', function(data) {
            log.info(data);
        });

        ocsp.on('error', function(error) {
            log("OCSP server startup error: " + error);
        });

        ocsp.on('close', function(code){
            if(code === null) {
                log("OCSP server exited successfully.");
            } else {
                log.error("OCSP exited with code " + code);
            }
        });
    });
};


var stopServer = function() {
    ocsp.kill('SIGHUP');
    log("OCSP server stopped.");
};


module.exports = {
    startServer: startServer,
    stopServer: stopServer
}
