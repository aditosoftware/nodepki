var log         = require('fancy-log');
var validator   = require('../validator.js');
var authMod     = require('../auth.js');

var auth = {};


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

/*
 * Response helper function for nicer code :)
 */
function respond(res, resobj) {
    resobj.end(JSON.stringify(res))
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


auth.check = function(req, res) {
    // Validate user input
    var schema = {
        "properties": {
            "auth": {
                "type": "object",
                "properties": {
                    "username": { "type": "string"},
                    "password": { "type": "string"}
                },
                "required": [ "username", "password" ]
            }
        },
        "required": [ "auth" ]
    }

    // Check API conformity
    var check = validator.checkAPI(schema, req.body)
    if(check.success === false) {
        wrongAPISchema(check.errors, res);
        return;
    }

    var auth = req.body.auth;

    // Check access
    if (authMod.checkUser(auth.username, auth.password) === false) {
        wrongLoginCredentials(res);
        return;
    } else {
        respond({
            success: true,
            data: {}
        }, res);
    }
}


module.exports = {
    auth: auth
}
