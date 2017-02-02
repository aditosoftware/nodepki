/*
 * Requests a certificate
 * Usage: nodejs certrequest.js
 */

var http = require('http');
var fs = require('fs');

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
                console.log("Failed to retrieve certificate. :(");
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
            console.log("Error reading file:" + err);
        }
    });
} else {
    console.log("Error:\r\nUsage: nodejs certrequest.js request.csr");
}
