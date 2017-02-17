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

    if(data.chain === 'chain') {
        log("Client is requesting chain version")
    }

    var cert = '';

    switch(data.ca) {
        case 'root':
            cert = fs.readFileSync(global.paths.pkipath + 'root/root.cert.pem', 'utf8');
            break;
        case 'intermediate':
            if(data.chain === 'chain') {
                cert = fs.readFileSync(global.paths.pkipath + 'intermediate/ca-chain.cert.pem', 'utf8');
            } else {
                cert = fs.readFileSync(global.paths.pkipath + 'intermediate/intermediate.cert.pem', 'utf8');
            }
            break;
        default:
            respond({
                success: false,
                errors: [
                    { code: 1000, message: "CA type not available." }
                ]
            }, res);
    }

    respond({
        success: true,
        cert: cert
    }, res);
};

module.exports = ca;
