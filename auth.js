/*
 * Auth module
 */

var crypto  = require('crypto');
var fs      = require('fs-extra');


/*
 * Checks login credentials
 * Input: Username, password (plain)
 */
var checkUser = function(username, password) {
    var hash = crypto.createHash('sha256').update(password).digest('base64');

    // Check if there is an entry with username:hash
    // ...
    var expected = username + ':' + hash;

    // Read password file
    var passfile = fs.readFileSync('data/user.db', 'utf8');
    var lines = passfile.split('\n');

    var found = false;
    lines.forEach(function(line) {
        if (line === expected) found = true;
    });

    return found;
};



/*
 * Add a new user to DB
 */
var addUser = function(username, password) {
    // Make sure DB file exists ...
    fs.ensureFileSync('data/user.db');

    // Calc passhash
    var passhash = crypto.createHash('sha256').update(password).digest('base64');

    // Read existing file
    var passfile = fs.readFileSync('data/user.db', 'utf8');

    // Check if user alreadys exists
    var lines = passfile.split('\n');
    var found = false;
    lines.forEach(function(line) {
        var line_username = line.split(':')[0];
        if (line_username === username) found = true;
    });

    if(found === false) {
        // Update file
        passfile = passfile + username + ':' + passhash + '\n';
        fs.writeFileSync('data/user.db', passfile, 'utf8');

        return true;
    } else {
        return false;
    }
};



/*
 * Delete user from DB
 */
var delUser = function(username) {
    fs.ensureFileSync('data/user.db');

    var passfile = fs.readFileSync('data/user.db', 'utf8');
    var lines = passfile.split('\n');
    var changed = false;

    var passfile_out = '';

    // Re-write file without user

    lines.forEach(function(line) {
        if(line !== '') {
            var line_username = line.split(':')[0];

            if(line_username !== username) {
                passfile_out += line + '\n'
            } else {
                changed = true;
            }
        }
    });

    fs.writeFileSync('data/user.db', passfile_out);

    return changed;
};


module.exports = {
    addUser: addUser,
    checkUser: checkUser,
    delUser: delUser
}
