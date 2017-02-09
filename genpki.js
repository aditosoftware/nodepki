/**
 * Script generates OpenSSL PKI based on the configuration in config.yml
 */

var log         = require('fancy-log');
var fs          = require('fs-extra');
var yaml        = require('js-yaml');
var exec        = require('child_process').exec;

// Absolute pki base dir
const pkidir = __dirname + '/' + 'mypki/';



/*
 * Make sure there is a config file config.yml
 */
if(fs.existsSync('config.yml')) {
    log.info("Reading config file config.yml ...");
    global.config = yaml.safeLoad(fs.readFileSync('config.yml', 'utf8'));
} else {
    // There is no config file yet. Create one from config.yml.default and quit server.
    log("No custom config file 'config.yml' found.")
    fs.copySync('config.yml.default', 'config.yml');
    log("Default config file was copied to config.yml.");
    console.log("\
**********************************************************************\n\
***   Please customize config.yml according to your environment    ***\n\
***                     and restart script.                        ***\n\
**********************************************************************");

    log("Script will now quit.");
    process.exit();
}




var PKIExists = function() {
        fs.ensureDir('mypki');

        if(fs.existsSync('mypki/openssl.cnf')) {
            return true;
        } else {
            return false;
        }
};


var prepareDirs = function() {
    log(">>> Creating PKI directories");

    return new Promise(function(resolve, reject) {
        fs.ensureDir(pkidir + 'certs');
        fs.ensureDir(pkidir + 'crl');
        fs.ensureDir(pkidir + 'newcerts');
        fs.ensureDir(pkidir + 'private');

        fs.writeFileSync(pkidir + 'index.txt', '', 'utf8');
        fs.writeFileSync(pkidir + 'serial', '1000', 'utf8');
        fs.writeFileSync(pkidir + 'crlnumber', '1000', 'utf8');

        resolve();
    });
};


var createOpenSSLConf = function() {
    log(">>> Creating OpenSSL config");

    return new Promise(function(resolve, reject) {
        // Read openssl.cnf.tpl
        openssl_conf = fs.readFileSync('openssl.cnf.tpl', 'utf8');

        openssl_basedir = pkidir.substring(0, pkidir.length - 1);  // remove trailing slash

        // Replace placeholders
        openssl_conf = openssl_conf.replace(/{basedir}/g, openssl_basedir);

        openssl_conf = openssl_conf.replace(/{crl_url}/g, global.config.crl.url);
        openssl_conf = openssl_conf.replace(/{ocsp_url}/g, global.config.ocsp.url);

        // Write config to file
        fs.writeFileSync(pkidir + 'openssl.cnf', openssl_conf);

        resolve();
    });
};


var genRootCA = function() {
    log(">>> Generating Root CA");

    return new Promise(function(resolve, reject) {
        // Root CA key
        createrootkey = exec('openssl genrsa -aes256 -passout pass:' + global.config.ca.passphrase + ' -out private/ca.key.pem 4096', {
            cwd: pkidir
        }, function() {
            // Root certificate
            createrootca = exec('openssl req -config openssl.cnf -key private/ca.key.pem -new -x509 -days 7300 -sha256 -extensions v3_ca -out certs/ca.cert.pem -passin pass:' + global.config.ca.passphrase + ' -batch', {
                cwd: pkidir
            }, function() {
                resolve();
            });
        });
    });
};


var genOCSP = function() {
    log(">>> Generating OCSP certs");

    return new Promise(function(resolve, reject) {
        createocspkey = exec('openssl genrsa -aes256 -passout pass:' + global.config.ocsp.passphrase + ' -out private/ocsp.key.pem 4096', {
            cwd: pkidir
        }, function() {
            // Root certificate
            createocspcsr = exec('openssl req -config openssl.cnf -key private/ocsp.key.pem -new -sha256 -out ocsp.csr -passin pass:' + global.config.ca.passphrase + ' -subj "/CN=OCSP" -batch', {
                cwd: pkidir
            }, function() {
                createocspcert = exec('openssl ca -config openssl.cnf -extensions oscp -days 3650 -notext -md sha256 -in ocsp.csr -out certs/ocsp.cert.pem -passin pass:' + global.config.ca.passphrase + ' -batch', {
                    cwd: pkidir
                }, function() {
                    // Remove ocsp.csr
                    // fs.removeSync(pkidir + 'ocsp.csr');
                    resolve();
                });
            });
        });
    })
};



var createPKI = function() {
    if(PKIExists() === false) {
        // Create directories and files
        prepareDirs().then(function() {
            createOpenSSLConf().then(function() {
                genRootCA().then(function() {
                    genOCSP().then(function() {
                        log("====== PKI generation successful! Please make a backup of the 'mypki' directory. ======");
                    })
                    .catch(function(err) {
                        log("Error: " + err)
                    });
                })
                .catch(function(err) {
                    log("Error: " + err)
                })
            })
            .catch(function(err) {
                log("Error: " + err)
            });
        })
        .catch(function(err) {
            log("Error: " + err)
        });
    } else {
        log("There is an existing PKI in mypki/. Remove mypki/ directory to continue.");
    }
};


createPKI();


module.exports = {
    PKIExists: PKIExists
}
