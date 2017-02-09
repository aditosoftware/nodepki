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



var createFileStructure = function() {
    log(">>> Creating CA file structure")

    return new Promise(function(resolve, reject) {
        fs.ensureDirSync('mypki');

        /*
         * Prepare root/ dir
         */

        fs.ensureDirSync(pkidir + 'root');

        fs.ensureDirSync(pkidir + 'root/certs');
        fs.ensureDirSync(pkidir + 'root/crl');

        fs.writeFileSync(pkidir + 'root/index.txt', '', 'utf8');
        fs.writeFileSync(pkidir + 'root/serial', '1000', 'utf8');

        // Customize openssl.cnf and copy to root/

        openssl_root = fs.readFileSync('pkitemplate/openssl_root.cnf.tpl', 'utf8');
        openssl_root = openssl_root.replace(/{basedir}/g, pkidir + 'root');
            // more replacements ...

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

        openssl_intermediate = fs.readFileSync('pkitemplate/openssl_intermediate.cnf.tpl', 'utf8');
        openssl_intermediate = openssl_intermediate.replace(/{basedir}/g, pkidir + 'intermediate');
            // more replacements ...

        fs.writeFileSync(pkidir + 'intermediate/openssl.cnf', openssl_intermediate);

        resolve();
    });
};



var createRootCA = function() {
    log(">>> Creating Root CA");

    return new Promise(function(resolve, reject) {
        // Create root key
        exec('openssl genrsa -aes256 -out root.key.pem -passout pass:yyyy 4096', {
            cwd: pkidir + 'root'
        }, function() {
            // Create Root certificate
            exec('openssl req -config openssl.cnf -key root.key.pem -new -x509 -days 3650 -sha256 -extensions v3_ca -out root.cert.pem -passin pass:yyyy', {
                cwd: pkidir + 'root'
            }, function() {
                // cont
                resolve();
            });
        });
    });
};



var createIntermediateCA = function() {
    log(">>> Creating Intermediate CA");

    return new Promise(function(resolve, reject) {
        // Create intermediate key
        exec('openssl genrsa -aes256 -out intermediate.key.pem -passout pass:yyyy 4096', {
            cwd: pkidir + 'intermediate'
        }, function() {
            // Create intermediate certificate request
            exec('openssl req -config openssl.cnf -new -sha256 -key intermediate.key.pem -out intermediate.csr.pem -passin pass:yyyy', {
                cwd: pkidir + 'intermediate'
            }, function() {
                // Create intermediate certificate
                exec('openssl ca -config ../root/openssl.cnf -extensions v3_intermediate_ca -days 3650 -notext -md sha256 -in intermediate.csr.pem -out intermediate.cert.pem -passin pass:yyyy -batch', {
                    cwd: pkidir + 'intermediate'
                }, function() {
                    // Create intermediate chain file
                    // TO BE DONE

                    // Remove intermediate.csr.pem file

                    resolve();
                });
            });
        });
    });
};


createFileStructure().then(function() {
    createRootCA().then(function() {
        createIntermediateCA().then(function() {
            log("### Finished! ###");
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
