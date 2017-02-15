var log = require('fancy-log');
var exec = require('child_process').exec;
var fs = require('fs-extra');

var getFingerprint = function(certfile) {
    return new Promise(function(resolve, reject) {
        exec('openssl x509 -noout -in ' + certfile + ' -fingerprint -sha256', {
            cwd: global.paths.basepath
        }, function(error, stdout, stderr) {
            var filter = /=([A-F0-9\:]*)/;
            var matches = filter.exec(stdout)
            var fingerprint = matches[1];
            resolve(fingerprint);
        });
    });
};

module.exports = {
    getFingerprint: getFingerprint
}
