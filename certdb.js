/*
 * Poor man's in-memory DB for quick certificate queries
 */


var log     = require('fancy-log');
var crl     = require('./crl.js');

certificates = new Array();

// Sample: V	270129084423Z	270129084423Z	100E	unknown	/C=DE/ST=Germany/O=ADITO Software GmbH/OU=IT/CN=ADITO General Intermediate CA/emailAddress=it@adito.de
var regex = /([R,E,V])(\t)(.*)(\t)(.*)(\t)([\dA-F]*)(\t)(unknown)(\t)(.*)/;


/*
* Re-indexes OpenSSL index.txt file and stores datasets in array 'certificates'
*/
var reindex = function() {
    return new Promise(function(resolve, reject) {
        log.info("Reindexing CertDB ...");

        // Index-Datei öffnen
        var lineReader = require('readline').createInterface({
            input: require('fs').createReadStream(global.paths.pkipath + 'intermediate/index.txt')
        });

        certificates = [];

        lineReader.on('line', function (line) {
            // Regex auf diese Zeile anwenden, um einzelne Spalten zu gewinnen.
            var columns = regex.exec(line);

            if(columns !== null){
                var certificate = {
                    state:   columns[1],
                    expirationtime:    columns[3],
                    revocationtime:     columns[5],
                    serial:     columns[7],
                    subject:    columns[11]
                };

                certificates.push(certificate);
            } else {
                log.error("Error while parsing index.txt line :(");
            }
        });

        lineReader.on('close', function() {
            log.info("Reindexing finished");

            // Re-Create CRL
            crl.createCRL();

            resolve();
        });
    });
}


/*
* Return all certificates
*/
var getIndex = function() {
    return certificates;
}


module.exports = {
    reindex: reindex,
    getIndex: getIndex
}
