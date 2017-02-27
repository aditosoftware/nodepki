/*
 * API endpoint
 *
 * To DO:
 * Extend error handling!
 */

var util = require('util');
var fs = require('fs-extra');
var exec = require('child_process').exec;

const uuidV4 = require('uuid/v4');
var log = require('fancy-log');

var certdb = require('../certdb.js');
var validator = require('../validator.js');
var authMod = require('../auth.js');

var certificate = {};
var certificates = {};


/*
 * Response helper function for nicer code :)
 */
function respond(res, resobj) {
    resobj.end(JSON.stringify(res))
}


function errorresponse(error, res) {
    var response = {
        success: false,
        errors: [
            error
        ]
    };

    res.end(JSON.stringify(response));
}


function wrongAPISchema(apierrors, res) {
    var errors = []

    apierrors.forEach(function(apierror) {
        errors.push({ code: 100, message: apierror.message });
    });

    var resobj = {
        success: false,
        errors: errors
    }

    res.end(JSON.stringify(resobj))
};


function wrongLoginCredentials(res) {
    errors = [
        { code: 200, message: 'Invalid login credentials.' }
    ];

    var resobj = {
        success: false,
        errors: errors
    }

    res.end(JSON.stringify(resobj))
};


/**
 * Request method creates certificate from .csr file
 */
certificate.request = function(req, res){
    // Validate user input
    var schema = {
        "properties": {
            "data": {
                "type": "object",
                "properties": {
                    "csr": { "type": "string" },
                    "lifetime": { "type": "number" },
                    "type": { "type": "string" },
                },
                "required": [ "csr" ]
            },

            "auth": {
                "type": "object",
                "properties": {
                    "username": { "type": "string"},
                    "password": { "type": "string"}
                },
                "required": [ "username", "password" ]
            }
        },
        "required": [ "data", "auth" ]
    }

    // Check API conformity
    var check = validator.checkAPI(schema, req.body)
    if(check.success === false) {
        wrongAPISchema(check.errors, res);
        return;
    }

    var data = req.body.data;
    var auth = req.body.auth;

    // Check access
    if (authMod.checkUser(auth.username, auth.password) === false) {
        wrongLoginCredentials(res);
        return;
    }


    log.info("Certificate request by %s ...", auth.username);

    var csr = data.csr;

    var lifetime = data.lifetime ? data.lifetime : global.config.cert.lifetime_default;
    lifetime = global.config.cert.lifetime_max >= lifetime ? lifetime : global.config.cert.lifetime_max;

    var type = (data.type && data.type === 'client') ? 'usr_cert' : 'server_cert';
    log("Certificate type: " + type);

    // Create temporary directory ...
    var tempdir = global.paths.tempdir + uuidV4() + "/";
    fs.mkdirSync(tempdir);

    new Promise(function(resolve, reject){
        // Write .csr file to tempdir
        fs.writeFile(tempdir + 'request.csr', csr, function(err) {
            if(err === null) {
                // OpenSSL command template
                var signcommand = util.format('openssl ca -batch -config %sintermediate/openssl.cnf -extensions ' + type + ' -days ' + lifetime + ' -notext -md sha256 -in request.csr -key "%s" -out cert.pem', global.paths.pkipath, global.config.ca.intermediate.passphrase);

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

                                    log.info("Sent certificate to client.");
                                    resolve();
                                } else {
                                    log.error("Could not read generated cert file:\r\n" + err);
                                    errorresponse({ code:101, message:"Internal server error."}, res);
                                    resolve();
                                }
                            });
                        });
                    } else {
                        log.error("OpenSSL Error:\r\n", error);
                        log.error("Could not issue certificate.");

                        errorresponse({ code:101, message:"Internal server error."}, res);
                        resolve();
                    }
                });
            } else {
                log.error("Could not write temporary request.csr file.\r\n Error: " + err);
                errorresponse({ code:101, message:"Internal server error."}, res);
                resolve();
            }
        });
    }).then(function(){
        // Clean up... Remove temporary files
        if(fs.existsSync(tempdir)){
            fs.remove(tempdir, function(){});
        }
    });
};



certificate.revoke = function(req, res){
    // Validate user input
    var schema = {
        "properties": {
            "data": {
                "type": "object",
                "properties": {
                    "cert": { "type": "string" }
                },
                "required": [ "cert" ]
            },

            "auth": {
                "type": "object",
                "properties": {
                    "username": { "type": "string"},
                    "password": { "type": "string"}
                },
                "required": [ "username", "password" ]
            }
        },
        "required": [ "data", "auth" ]
    }

    // Check API conformity
    var check = validator.checkAPI(schema, req.body)
    if(check.success === false) {
        wrongAPISchema(check.errors, res);
        return;
    }

    var data = req.body.data;
    var auth = req.body.auth;

    // Check access
    if (authMod.checkUser(auth.username, auth.password) === false) {
        wrongLoginCredentials(res);
        return;
    }


    log.info("Request: Revocation request for certificate. By: " + auth.username);


    // Create temporary directory ...
    var tempdir = global.paths.tempdir + uuidV4() + "/";
    fs.mkdirSync(tempdir);

    new Promise(function(resolve, reject){
        // Write certificate to temporary file

        fs.writeFile(tempdir + 'cert.pem', data.cert, function(err) {
            if(err === null) {
                // Execute OpenSSL command
                log.info("Executing OpenSSL command.")
                var revokecommand = util.format('openssl ca -config %sintermediate/openssl.cnf -revoke cert.pem -key "%s"', global.paths.pkipath, global.config.ca.intermediate.passphrase);

                exec(revokecommand, { cwd: tempdir }, function(error, stdout, stderr) {
                    if (error === null) {
                        certdb.reindex().then(function(){
                            log.info("Successfully revoked certificate.");

                            certdb.reindex().then(function(){
                                log.info("Successfully re-indexed CertDB.");

                                respond({
                                    success: true
                                }, res);

                                resolve();
                            })
                            .catch(function(err){
                                log.error("Could not re-index CertDB.");
                            });
                        });
                    } else {
                        log.error("OpenSSL Error:\r\n", error);
                        errorresponse({ code:101, message:"Internal server error."}, res);
                        resolve();
                    }
                });
            } else {
                log.error("Failed to write certificate to temporary file.");
                errorresponse({ code:101, message:"Internal server error."}, res);
                resolve();
            }
        });
    }).then(function(){
        // Clean up... Remove temporary files
        if(fs.existsSync(tempdir)){
            fs.remove(tempdir, function(){});
        }
    });
};



/**
 * Lists all certificates
 */
certificates.list = function(req, res){
    // Validate user input
    var schema = {
        "properties": {
            "data": {
                "type": "object",
                "properties": {
                    "state": { "type": "string" },
                },
                "required": [ "state" ]
            },

            "auth": {
                "type": "object",
                "properties": {
                    "username": { "type": "string"},
                    "password": { "type": "string"}
                },
                "required": [ "username", "password" ]
            }
        },
        "required": [ "data", "auth" ]
    }

    // Check API conformity
    var check = validator.checkAPI(schema, req.body)
    if(check.success === false) {
        wrongAPISchema(check.errors, res);
        return;
    }

    var data = req.body.data;
    var auth = req.body.auth;

    // Check access
    if (authMod.checkUser(auth.username, auth.password) === false) {
        wrongLoginCredentials(res);
        return;
    }


    log.info("Request: List all active certificates. Filter: " + data.state + ". By: " + auth.username);

    var filter = '';

    switch(data.state) {
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
            if(certificate.state === filter) {
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
    // Validate user input
    var schema = {
        "properties": {
            "data": {
                "type": "object",
                "properties": {
                    "serialnumber": { "type": "string" },
                },
                "required": [ "serialnumber" ]
            },

            "auth": {
                "type": "object",
                "properties": {
                    "username": { "type": "string"},
                    "password": { "type": "string"}
                },
                "required": [ "username", "password" ]
            }
        },
        "required": [ "data", "auth" ]
    }

    // Check API conformity
    var check = validator.checkAPI(schema, req.body)
    if(check.success === false) {
        wrongAPISchema(check.errors, res);
        return;
    }

    var data = req.body.data;
    var auth = req.body.auth;

    // Check access
    if (authMod.checkUser(auth.username, auth.password) === false) {
        wrongLoginCredentials(res);
        return;
    }


    log.info("Request: Get certificate. By: " + auth.username);

    var certfile = global.paths.pkipath + "intermediate/certs/" + data.serialnumber + ".pem";

    if(fs.existsSync(certfile)){
        fs.readFile(certfile, 'utf8', function(err, certdata){
            if(err) {
                log.error("Could not read certificate file.");
                errorresponse({ code:101, message:"Internal server error."}, res);
            } else {
                respond({
                    success: true,
                    cert: certdata
                }, res);
            }
        });
    } else {
        // Certificate file not found.
        log.error("Certificate file not found.")
        errorresponse({ code:101, message:"Internal server error."}, res);
    }
};





// Export all certificate methods
module.exports = {
    certificate: certificate,
    certificates: certificates
}
