/*
 * Creates CRL
 */


var spawn   = require('child_process').spawn;
var log     = require('fancy-log');
var fs      = require('fs-extra');

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
        } else {
            log.error("Error during CRL creation")
        }
    });
};


module.exports = {
    createCRL: createCRL
}
