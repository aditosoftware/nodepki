/*
 * API endpoint
 */

var util = require('util');
var fs = require('fs');
var exec = require('child_process').exec;

var certificate = {};

certificate.request = function(req, res){
    console.log("------\r\nZertifikatsanfrage von %s erhalten!", req.body.applicant);
    csr = req.body.csr;
    // console.log(csr);
    console.log("------\r\n\r\n");

    console.log("basepath: ", global.paths.basepath);
    console.log("pkipath: ", global.paths.pkipath);
    console.log("tempdir: ", global.paths.tempdir);

    var signcommand = util.format('openssl ca -batch -config %sopenssl.cnf -extensions server_cert -days 1 -notext -md sha256 -in request.csr -key "%s" -out cert.pem', global.paths.pkipath, "jjdfhhk_348dsjj4JJhsk4j7svenjemHfen");

    // Write .csr file to tempdir
    fs.writeFile(global.paths.tempdir + 'request.csr', csr, function(err) {
        if(err) {
            console.log("Could not write temp request.csr file! Error: " + err);
        } else {
            console.log("Successfully wrote .csr file to tempdir.");

            exec(signcommand, { cwd: global.paths.tempdir }, function(error, stdout, stderr) {
                if (error === null) {
                    console.log("openssl ca command successful.");

                    // Generiertes Zertifikat einlesen
                    fs.readFile(global.paths.tempdir + 'cert.pem', 'utf8', function(err, certdata){
                        if(err == null) {
                            // Generiertes Zertifikat jetzt zurückschicken.
                            var response = {
                                success: true,
                                cert: certdata
                            }

                            res.end(JSON.stringify(response));
                            console.log("Response sent.");

                            // Remove files in tmp dir.
                            fs.unlinkSync(global.paths.tempdir + 'cert.pem');
                            fs.unlinkSync(global.paths.tempdir + 'request.csr');
                        } else {
                            console.log("Could not read generated cert file: " + err);
                        }
                    });
                } else {
                    console.log("openssl ca command not successful: Error: ", error)
                }
            });
        }
    });


}


module.exports = {
    certificate: certificate
}
