/**
 * Validator for API inputs
 * Utilizes AJV
 */

var log = require('fancy-log');

var Ajv = require('ajv');
var ajv = Ajv({allErrors: true});


var validator = {};

validator.checkAPI = function(schema, data) {
    var valid = ajv.validate(schema, data);

    if(valid) {
        return { success: true };
    } else {
        var errors = [];

        ajv.errors.forEach(function(error) {
            var message = '';

            switch(error.keyword) {
                case 'required':
                    // requirement not fulfilled.
                    message = 'Property \'' + error.params.missingProperty + '\' is missing.';
                    break;
                case 'type':
                    message = 'Wrong type: ' + error.dataPath + ' ' + error.message;
                    break;
                default:
                    message = 'Unknown input error. :(';
            }

            var pusherror = {
                message: message
            }

            errors.push(pusherror);
        });

        return { success: false, errors: errors };
    }
};


module.exports = validator;
