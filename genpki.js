/**
 * Script generates OpenSSL PKI based on the configuration in config.yml
 */

var log         = require('fancy-log');
var fs          = require('fs-extra');
var yaml        = require('js-yaml');
var exec        = require('child_process').exec;

// Absolute pki base dir
const pkidir = __dirname + '/data/' + 'mypki/';



var PKIExists = function() {
        fs.ensureDir(pkidir);

        if(fs.existsSync(pkidir + 'created')) {
            return true;
        } else {
            return false;
        }
};


var createFileStructure = function() {
    log(">>> Creating CA file structure")

    return new Promise(function(resolve, reject) {
        fs.ensureDirSync(pkidir);

        /*
         * Prepare root/ dir
         */

        fs.ensureDirSync(pkidir + 'root');

        fs.ensureDirSync(pkidir + 'root/certs');
        fs.ensureDirSync(pkidir + 'root/crl');

        fs.writeFileSync(pkidir + 'root/index.txt', '', 'utf8');
        fs.writeFileSync(pkidir + 'root/serial', '1000', 'utf8');

        // Customize openssl.cnf and copy to root/

        openssl_root = fs.readFileSync(__dirname + '/pkitemplate/openssl_root.cnf.tpl', 'utf8');
        openssl_root = openssl_root.replace(/{basedir}/g, pkidir + 'root');
        openssl_root = openssl_root.replace(/{days}/g, global.config.ca.root.days);
        openssl_root = openssl_root.replace(/{country}/g, global.config.ca.root.country);
        openssl_root = openssl_root.replace(/{state}/g, global.config.ca.root.state);
        openssl_root = openssl_root.replace(/{locality}/g, global.config.ca.root.locality);
        openssl_root = openssl_root.replace(/{organization}/g, global.config.ca.root.organization);
        openssl_root = openssl_root.replace(/{commonname}/g, global.config.ca.root.commonname);

        fs.writeFileSync(pkidir + 'root/openssl.cnf', openssl_root);



        /*
         * Prepare intermediate/ dir
         */

        fs.ensureDirSync(pkidir + 'intermediate');

        fs.ensureDirSync(pkidir + 'intermediate/certs');
        fs.ensureDirSync(pkidir + 'intermediate/crl');

        fs.writeFileSync(pkidir + 'intermediate/index.txt', '', 'utf8');
        fs.writeFileSync(pkidir + 'intermediate/serial', '1000', 'utf8');
        fs.writeFileSync(pkidir + 'intermediate/crlnumber', '1000', 'utf8');

        // Customize openssl.cnf and copy to root/

        openssl_intermediate = fs.readFileSync(__dirname + '/pkitemplate/openssl_intermediate.cnf.tpl', 'utf8');
        openssl_intermediate = openssl_intermediate.replace(/{basedir}/g, pkidir + 'intermediate');
        openssl_intermediate = openssl_intermediate.replace(/{days}/g, global.config.ca.intermediate.days);
        openssl_intermediate = openssl_intermediate.replace(/{country}/g, global.config.ca.intermediate.country);
        openssl_intermediate = openssl_intermediate.replace(/{state}/g, global.config.ca.intermediate.state);
        openssl_intermediate = openssl_intermediate.replace(/{locality}/g, global.config.ca.intermediate.locality);
        openssl_intermediate = openssl_intermediate.replace(/{organization}/g, global.config.ca.intermediate.organization);
        openssl_intermediate = openssl_intermediate.replace(/{commonname}/g, global.config.ca.intermediate.commonname);
        openssl_intermediate = openssl_intermediate.replace(/{ocspurl}/g, global.config.ca.intermediate.ocsp.url);
        openssl_intermediate = openssl_intermediate.replace(/{crlurl}/g, global.config.ca.intermediate.crl.url);
        fs.writeFileSync(pkidir + 'intermediate/openssl.cnf', openssl_intermediate);


        /*
         * Prepare intermediate/ocsp dir
         */
        fs.ensureDirSync(pkidir + 'intermediate/ocsp');
        openssl_intermediate_ocsp = fs.readFileSync(__dirname + '/pkitemplate/openssl_ocsp.cnf.tpl', 'utf8');
        openssl_intermediate_ocsp = openssl_intermediate_ocsp.replace(/{state}/g, global.config.ca.intermediate.state);
        openssl_intermediate_ocsp = openssl_intermediate_ocsp.replace(/{country}/g, global.config.ca.intermediate.country);
        openssl_intermediate_ocsp = openssl_intermediate_ocsp.replace(/{locality}/g, global.config.ca.intermediate.locality);
        openssl_intermediate_ocsp = openssl_intermediate_ocsp.replace(/{organization}/g, global.config.ca.intermediate.organization);
        openssl_intermediate_ocsp = openssl_intermediate_ocsp.replace(/{commonname}/g, global.config.server.ocsp.domain);
        fs.writeFileSync(pkidir + 'intermediate/ocsp/openssl.cnf', openssl_intermediate_ocsp);


        /*
         * Prepare apicert configuration
         */
        fs.ensureDirSync(pkidir + 'apicert');
        openssl_apicert = fs.readFileSync(__dirname + '/pkitemplate/openssl_apicert.cnf.tpl', 'utf8');
        openssl_apicert = openssl_apicert.replace(/{state}/g, global.config.ca.root.state);
        openssl_apicert = openssl_apicert.replace(/{country}/g, global.config.ca.root.country);
        openssl_apicert = openssl_apicert.replace(/{locality}/g, global.config.ca.root.locality);
        openssl_apicert = openssl_apicert.replace(/{organization}/g, global.config.ca.root.organization);
        openssl_apicert = openssl_apicert.replace(/{commonname}/g, global.config.server.http.domain);
        fs.writeFileSync(pkidir + 'apicert/openssl.cnf', openssl_apicert);

        resolve();
    });
};



var createRootCA = function() {
    log(">>> Creating Root CA");

    return new Promise(function(resolve, reject) {
        // Create root key
        exec('openssl genrsa -aes256 -out root.key.pem -passout pass:' + global.config.ca.root.passphrase + ' 4096', {
            cwd: pkidir + 'root'
        }, function() {
            // Create Root certificate
            exec('openssl req -config openssl.cnf -key root.key.pem -new -x509 -days ' + global.config.ca.root.days + ' -sha256 -extensions v3_ca -out root.cert.pem -passin pass:' + global.config.ca.root.passphrase, {
                cwd: pkidir + 'root'
            }, function() {
                resolve();
            });
        });
    });
};



var createIntermediateCA = function() {
    log(">>> Creating Intermediate CA");

    return new Promise(function(resolve, reject) {
        // Create intermediate key
        exec('openssl genrsa -aes256 -out intermediate.key.pem -passout pass:' + global.config.ca.intermediate.passphrase + ' 4096', {
            cwd: pkidir + 'intermediate'
        }, function() {
            // Create intermediate certificate request
            exec('openssl req -config openssl.cnf -new -sha256 -key intermediate.key.pem -out intermediate.csr.pem -passin pass:' + global.config.ca.intermediate.passphrase, {
                cwd: pkidir + 'intermediate'
            }, function() {
                // Create intermediate certificate
                exec('openssl ca -config ../root/openssl.cnf -extensions v3_intermediate_ca -days ' + global.config.ca.intermediate.days + ' -notext -md sha256 -in intermediate.csr.pem -out intermediate.cert.pem -passin pass:' + global.config.ca.root.passphrase + ' -batch', {
                    cwd: pkidir + 'intermediate'
                }, function() {
                    // Remove intermediate.csr.pem file
                    fs.removeSync(pkidir + 'intermediate/intermediate.csr.pem');

                    // Create CA chain file
                    // Read intermediate
                    intermediate = fs.readFileSync(pkidir + 'intermediate/intermediate.cert.pem', 'utf8');
                    // Read root cert
                    root = fs.readFileSync(pkidir + 'root/root.cert.pem', 'utf8');
                    cachain = intermediate + '\n\n' + root;
                    fs.writeFileSync(pkidir + 'intermediate/ca-chain.cert.pem', cachain);
                    resolve();
                });
            });
        });
    });
};



var createOCSPKeys = function() {
    log(">>> Creating OCSP Keys")

    return new Promise(function(resolve, reject) {
        // Create key
        exec('openssl genrsa -aes256 -out ocsp.key.pem -passout pass:' + global.config.ca.intermediate.ocsp.passphrase + ' 4096', {
            cwd: pkidir + 'intermediate/ocsp'
        }, function() {
            // Create request
            exec('openssl req -config openssl.cnf -new -sha256 -key ocsp.key.pem -passin pass:' + global.config.ca.intermediate.ocsp.passphrase + ' -out ocsp.csr.pem', {
                cwd: pkidir + 'intermediate/ocsp'
            }, function() {
                // Create certificate
                exec('openssl ca -config ../openssl.cnf -extensions ocsp -days 3650 -notext -md sha256 -in ocsp.csr.pem -out ocsp.cert.pem -passin pass:' + global.config.ca.intermediate.passphrase + ' -batch', {
                    cwd: pkidir + 'intermediate/ocsp'
                }, function() {
                    fs.removeSync(pkidir + 'intermediate/ocsp/ocsp.csr.pem');
                    resolve();
                });
            });
        });
    });
};




/*
 * Creates server certificate pair for HTTP API
 * Directly form Root CA
 */
var createAPICert = function() {
    log(">>> Creating HTTPS API certificates");

    return new Promise(function(resolve, reject) {
        // Create key
        exec('openssl genrsa -out key.pem 4096', {
            cwd: pkidir + 'apicert'
        }, function() {
            // Create request
            exec('openssl req -config openssl.cnf -new -sha256 -key key.pem -out csr.pem', {
                cwd: pkidir + 'apicert'
            }, function() {
                // Create certificate
                exec('openssl ca -config ../root/openssl.cnf -extensions server_cert -days 3650 -notext -md sha256 -in csr.pem -out cert.pem -passin pass:' + global.config.ca.root.passphrase + ' -batch', {
                    cwd: pkidir + 'apicert'
                }, function() {
                    fs.removeSync(pkidir + 'apicert/csr.pem');
                    resolve();
                });
            });
        });
    });
};



/*
 * Sets correct file permissions for CA files
 */
var setFilePerms = function() {
    log(">>> Setting file permissions")

    return new Promise(function(resolve, reject) {
        // Root CA
        fs.chmodSync(pkidir + 'root/root.key.pem', 0400);
        fs.chmodSync(pkidir + 'root/root.cert.pem', 0444);
        fs.chmodSync(pkidir + 'root/openssl.cnf', 0400);

        // Intermediate CA
        fs.chmodSync(pkidir + 'intermediate/intermediate.key.pem', 0400);
        fs.chmodSync(pkidir + 'intermediate/intermediate.cert.pem', 0444);
        fs.chmodSync(pkidir + 'intermediate/openssl.cnf', 0400);

        resolve();
    });
};





module.exports.create = function() {
    return new Promise(function(resolve, reject) {
        createFileStructure().then(function() {
            createRootCA().then(function() {
                createIntermediateCA().then(function() {
                    createOCSPKeys().then(function() {
                        createAPICert().then(function() {
                            setFilePerms().then(function() {
                                log("### Finished!");

                                // Tag mypki as ready.
                                fs.writeFileSync(pkidir + 'created', '', 'utf8');
                                resolve()
                            })
                            .catch(function(err) {
                                reject("Error: " + err)
                            });
                        })
                        .catch(function(err) {
                            reject("Error: " + err)
                        });
                    })
                    .catch(function(err) {
                        reject("Error: " + err)
                    });
                })
                .catch(function(err) {
                    reject("Error: " + err)
                });
            })
            .catch(function(err) {
                reject("Error: " + err)
            })
        })
        .catch(function(err) {
            reject("Error: " + err)
        });
    })
}
