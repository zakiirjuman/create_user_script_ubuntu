// This function takes the path to the config file as an argument
// and returns the config object after passing validation checks.

const util = require('util');
const fs = require('fs');
const yaml = require('js-yaml');
const exec = util.promisify(require('child_process').exec);
const path = require('path');

async function read_config(config_file_path) {

    var config = yaml.load(fs.readFileSync(config_file_path, 'utf8'));
    if (check_backup_paths(config.backup_paths)
        && check_archive_extension(config.archive_extension)
        && check_archive_destination(config.archive_destination)
        && check_cron_schedule(config.cron_schedule)
        && await check_username(config.username)
        ) {
        return {config_file_path, ...config};
    } else {
        console.log('config file is invalid');
        return false;
    }
}

// This function checks if the backup paths exist
function check_backup_paths(backup_paths) {
    if(!backup_paths){
        return false;
    }
    // if backup paths is an array and empty return false
    if (Array.isArray(backup_paths) && backup_paths.length === 0) {
        return false;
    }
    for (var i = 0; i < backup_paths.length; i++) {
        if (!fs.existsSync(backup_paths[i])) {
            console.log('backup path does not exist');
            return false;
        }
    }
    return true;
}

// This function checks if the archive_extension 
// is valid
function check_archive_extension(archive_extension) {
    var valid_archive_extensions = ['.tar.gz'];
    if (valid_archive_extensions.indexOf(archive_extension) > -1) {
        return true;
    } else {
        console.log('archive extension is invalid');
        return false;
    }
}

// This function checks if the username is valid
async function check_username(username) {
    try {
        const { stdout, stderr } = await exec('id -u ' + username);
        return true;
    } catch (err) {
        console.log('username is invalid');
        return false;
    }
}

// This function checks if the archive destination is valid
function check_archive_destination(archive_destination) {
    if (fs.existsSync(path.resolve(archive_destination))) {
        return true;
    } else {
        console.log('archive destination does not exist');
        console.log(`path: ${path.resolve(archive_destination)}`)
        return false;
    }
}

function check_cron_schedule(cron_schedule) {
    if (!cron_schedule) {
        return false;
    } else {
        const regex = /(@(annually|yearly|monthly|weekly|daily|hourly|reboot))|(@every (\d+(ns|us|µs|ms|s|m|h))+)|((((\d+,)+\d+|(\d+(\/|-)\d+)|\d+|\*) ?){5,7})/;
        return regex.test(cron_schedule);
    }
}

module.exports = read_config;
