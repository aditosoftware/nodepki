/*
 * Requests a certificate
 * Usage: nodejs certrequest.js
 */

var http = require('http');
var fs = require('fs');
var log = require('fancy-log');

function requestCert(csrdata) {
    var req = http.request({
        host: 'localhost',
        port: 8081,
        path: '/certificate/request/',
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        }
    }, function (response){
        var body = '';

        response.on('data', function(chunk) {
            body += chunk;
        });

        response.on('end', function() {
            var response = JSON.parse(body);

            if(response.success){
                console.log(response.cert)
                process.exit(0);
            } else {
                log.error(">>> Failed to retrieve certificate. :( <<<");
                log.error("Maybe there was already another certificate issued from the submitted .csr?");
                log.error("For more information see NodePKI log.");
                process.exit(1);
            }
        });
    });


    var jsonobj = {
        csr: csrdata,
        applicant: "Thomas Leister"
    };

    var json = JSON.stringify(jsonobj);
    req.write(json);

    // Send request
    req.end();
};



// Get csr filename
if(process.argv[2] !== undefined) {
    //Read cert data from file
    fs.readFile('./' + process.argv[2], 'utf8', function(err, csrdata){
        if(err == null) {
            requestCert(csrdata);
        } else {
            log.error("Error reading file:" + err);
        }
    });
} else {
    log.error("Error:\r\nUsage: nodejs certrequest.js request.csr");
}
