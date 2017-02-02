/*
 * API endpoint
 *
 * To DO:
 * Extend error handling!
 */

var util = require('util');
var fs = require('fs');
var exec = require('child_process').exec;

var certificate = {};


/*
 * Response helper function for nicer code :)
 */
function respond(res, resobj) {
    resobj.end(JSON.stringify(res))
}


/**
 * Request method creates certificate from .csr file
 */
certificate.request = function(req, res){
    console.log("------\r\nCertificate request by %s ...", req.body.applicant);
    csr = req.body.csr;

    // Write .csr file to tempdir
    fs.writeFile(global.paths.tempdir + 'request.csr', csr, function(err) {
        if(err === null) {
            // OpenSSL command template
            var signcommand = util.format('openssl ca -batch -config %sopenssl.cnf -extensions server_cert -days 1 -notext -md sha256 -in request.csr -key "%s" -out cert.pem', global.paths.pkipath, global.config.ca.passphrase);

            // Execute Linux Shell command
            exec(signcommand, { cwd: global.paths.tempdir }, function(error, stdout, stderr) {
                if (error === null) {
                    // Read generated certificate file
                    fs.readFile(global.paths.tempdir + 'cert.pem', 'utf8', function(err, certdata){
                        if(err === null) {
                            // Send certificate to client
                            respond({
                                success: true,
                                cert: certdata
                            }, res);

                            console.log("Sent certificate to client.");

                            // Remove temporary files
                            fs.unlinkSync(global.paths.tempdir + 'cert.pem');
                            fs.unlinkSync(global.paths.tempdir + 'request.csr');
                        } else {
                            console.log("Could not read generated cert file:\r\n" + err);
                            respond({success: false}, res);
                        }
                    });
                } else {
                    console.log("OpenSSL Error:\r\n", error);
                    respond({success: false}, res);
                }
            });
        } else {
            console.log("Could not write temporary request.csr file.\r\n Error: " + err);
            respond({success: false}, res);
        }
    });
}


// Export all certificate methods
module.exports = {
    certificate: certificate
}
