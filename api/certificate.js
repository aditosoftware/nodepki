/*
 * API endpoint
 *
 * To DO:
 * Extend error handling!
 */

var util = require('util');
var fs = require('fs');
var exec = require('child_process').exec;

const uuidV4 = require('uuid/v4');
var rmdir = require('rmdir');

var certdb = require('../certdb.js');

var certificate = {};
var certificates = {};


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

    // Create temporary directory ...
    var tempdir = global.paths.tempdir + uuidV4() + "/";
    fs.mkdirSync(tempdir);

    new Promise(function(resolve, reject){
        // Write .csr file to tempdir
        fs.writeFile(tempdir + 'request.csr', csr, function(err) {
            if(err === null) {
                // OpenSSL command template
                var signcommand = util.format('openssl ca -batch -config %sopenssl.cnf -extensions server_cert -days 1 -notext -md sha256 -in request.csr -key "%s" -out cert.pem', global.paths.pkipath, global.config.ca.passphrase);

                // Execute Linux Shell command
                exec(signcommand, { cwd: tempdir }, function(error, stdout, stderr) {
                    if (error === null) {
                        // Re-index DB
                        certdb.reindex().then(function(){
                            // Read generated certificate file
                            fs.readFile(tempdir + 'cert.pem', 'utf8', function(err, certdata){
                                if(err === null) {
                                    // Send certificate to client
                                    respond({
                                        success: true,
                                        cert: certdata
                                    }, res);

                                    console.log("Sent certificate to client.");
                                    resolve();
                                } else {
                                    console.log("Could not read generated cert file:\r\n" + err);
                                    respond({success: false}, res);
                                    resolve();
                                }
                            });
                        });
                    } else {
                        console.log("OpenSSL Error:\r\n", error);
                        respond({success: false}, res);
                        resolve();
                    }
                });
            } else {
                console.log("Could not write temporary request.csr file.\r\n Error: " + err);
                respond({success: false}, res);
                resolve();
            }
        });
    }).then(function(){
        // Clean up... Remove temporary files
        if(fs.existsSync(tempdir)){
            rmdir(tempdir);
        }
    });
};



certificate.revoke = function(req, res){
    console.log("Revocation request for certificate");

    // Create temporary directory ...
    var tempdir = global.paths.tempdir + uuidV4() + "/";
    fs.mkdirSync(tempdir);

    new Promise(function(resolve, reject){
        // Write certificate to temporary file

        fs.writeFile(tempdir + 'cert.pem', body.cert, function(err) {
            if(err === null) {
                // Execute OpenSSL command
                var revokecommand = util.format('openssl ca -config %sopenssl.cnf -revoke cert.pem', global.paths.pkipath);

                exec(revokecommand, { cwd: tempdir }, function(error, stdout, stderr) {
                    if (error === null) {
                        certdb.reindex().then(function(){
                            console.log("Successfully revoked certificate.");

                            respond({
                                success: true
                            }, res);

                            resolve();
                        });
                    } else {
                        console.log("OpenSSL Error:\r\n", error);
                        respond({success: false}, res);
                        resolve();
                    }
                });
            } else {
                console.log("Failed to write certificate to temporary file.");
                respond({success: false}, res);
                resolve();
            }
        });
    }).then(function(){
        // Clean up... Remove temporary files
        if(fs.existsSync(tempdir)){
            rmdir(tempdir);
        }
    });
};



/**
 * Lists all certificates
 */
certificates.list = function(req, res){
    console.log("Request: List all active certificates. Filter: " + req.params.filter);

    var filter = '';

    switch(req.params.filter) {
        case 'all':
            filter = '';
            break;
        case 'revoked':
            filter = 'R';
            break;
        case 'valid':
            filter = 'V';
            break;
        case 'expired':
            filter = 'E';
            break;
        default:
            // Filter is invalid
            respond({ success: false }, res);
    }

    // Get certificate DB index
    var certindex = certdb.getIndex();

    var result = new Array();

    certindex.forEach(function(certificate) {
        if(filter == '') {
            result.push(certificate);
        } else {
            if(certificate.validity === filter) {
                result.push(certificate);
            }
        }
    });

    respond({
        certs: result,
        success: true
    }, res);
};


certificate.get = function(req, res) {
    console.log("Client is requesting certificate " + req.params.serial);

    var certfile = global.paths.pkipath + "newcerts/" + req.params.serial + ".pem";

    if(fs.existsSync(certfile)){
        fs.readFile(certfile, 'utf8', function(err, certdata){
            if(err) {
                console.log("Could not read certificate file.");
                respond({ success: false }, res);
            } else {
                respond({
                    success: false,
                    cert: certdata
                }, res);
            }
        });
    } else {
        // Certificate file not found.
        respond({ success: false }, res);
    }




    // Check if certificate file exists in
};



// Export all certificate methods
module.exports = {
    certificate: certificate,
    certificates: certificates
}
