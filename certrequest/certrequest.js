/*
 * Requests a certificate
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
            console.log("Body:\r\n" + body);
        });
    });


    var jsonobj = {
        csr: csrdata,
        applicant: "Thomas Leister"
    };

    var json = JSON.stringify(jsonobj);
    req.write(json);

    req.end();
};



/*
 * Read cert data from file
 */
fs.readFile('./cert.csr', 'utf8', function(err, csrdata){
    if(err == null) {
        requestCert(csrdata);
    } else {
        console.log("Error reading file:" + err);
    }
});
