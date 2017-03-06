var fs      = require('fs-extra')

var publicpath = '/public'

/**
 * Initializes API paths.
 */
var initPublicDl = function(app) {
    app.get(publicpath + '/ca/root/cert', function(req, res) {
        var certificate = fs.readFileSync(global.paths.pkipath + 'root/root.cert.pem')
        var filename = global.config.ca.root.commonname.replace(/\ /g, '_').toLowerCase()

        res.setHeader('Content-disposition', 'attachment; filename=' + filename + '.cert.pem');
        res.setHeader('Content-type', 'application/x-pem-file')
        res.end(certificate)
    });

    app.get(publicpath + '/ca/intermediate/cert', function(req, res) {
        var certificate = fs.readFileSync(global.paths.pkipath + 'intermediate/intermediate.cert.pem')
        var filename = global.config.ca.intermediate.commonname.replace(/\ /g, '_').toLowerCase()

        res.setHeader('Content-disposition', 'attachment; filename=' + filename + '.cert.pem');
        res.setHeader('Content-type', 'application/x-pem-file')
        res.end(certificate)
    });

    app.get(publicpath + '/ca/intermediate/crl', function(req, res) {
        var certificate = fs.readFileSync(global.paths.pkipath + 'intermediate/crl/crl.pem')
        var filename = global.config.ca.intermediate.commonname.replace(/\ /g, '_').toLowerCase()

        console.log(filename)

        res.setHeader('Content-disposition', 'attachment; filename=' + filename + '.crl.pem');
        res.setHeader('Content-type', 'application/x-pem-file')
        res.end(certificate)
    });
};



// Export initAPI() function (called by server.js)
module.exports = {
    initPublicDl: initPublicDl
}
