/**
 * CA API
 */

var log         = require('fancy-log');
var fs          = require('fs-extra');

var ca = {};
ca.cert = {};



/*
 * Response helper function for nicer code :)
 */
function respond(res, resobj) {
    resobj.end(JSON.stringify(res))
}



/**
 * Get CA Cert
 */
ca.cert.get = function(req, res) {
    var data = req.body.data;

    log("Client is requesting certificate of CA " + data.ca);

    new Promise(function(resolve, reject) {
        if(data.chain) {
            log("Client is requesting chain version")
        }

        switch(data.ca) {
            case 'root':
                var cert = fs.readFileSync(global.paths.pkipath + 'root/root.cert.pem', 'utf8');
                resolve(cert);
                break;
            case 'intermediate':
                if(data.chain) {
                    var cert = fs.readFileSync(global.paths.pkipath + 'intermediate/ca-chain.cert.pem', 'utf8');
                } else {
                    var cert = fs.readFileSync(global.paths.pkipath + 'intermediate/intermediate.cert.pem', 'utf8');
                }
                resolve(cert);
                break;
            default:
                reject("Invalid CA")
        }
    })
    .then(function(cert) {
        respond({
            success: true,
            cert: cert
        }, res);
    })
    .catch(function(error) {
        respond({
            success: false,
            errors: [
                { code: 101, message: error }
            ]
        }, res);
    });
};

module.exports = ca;
