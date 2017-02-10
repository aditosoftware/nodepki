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



var pkidir = 'mypki/';

/**
 * Get Root Cert
 */
ca.cert.get = function(req, res) {
    log("Client is requesting certificate of CA " + req.params.ca);

    if(req.params.chain === 'chain') {
        log("Client is requesting chain version")
    }

    var cert = '';

    switch(req.params.ca) {
        case 'root':
            cert = fs.readFileSync(pkidir + 'root/root.cert.pem', 'utf8');
            break;
        case 'intermediate':
            if(req.params.chain === 'chain') {
                cert = fs.readFileSync(pkidir + 'intermediate/ca-chain.cert.pem', 'utf8');
            } else {
                cert = fs.readFileSync(pkidir + 'intermediate/intermediate.cert.pem', 'utf8');
            }

            break;
    }

    respond({
        success: true,
        cert: cert
    }, res);
};

module.exports = ca;
