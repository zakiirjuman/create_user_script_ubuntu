#!/usr/bin/env node

// This program creates a new archive configuration file
// It takes the username, and full destination_path as arguments.
// The destination_path is broken down into the archive_destination, archive_name and archive_extension.
// A default backup_paths array is created with one entry: /home/${username}
// A default cron_schedule is created: 0 0 * * *
// It also writes the path of the configuration file to the conf_list.yml file
// This program is called by the createNewArchiveConf.sh script

// Import the required modules
const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');

// Get the username of the configuration file
const username = process.argv[2];
// Get the full destination_path of the archive
//console.log(process.argv[3])
let destination_path = path.resolve(process.argv[3] || `/home/${username}/default_archive.tar.gz`)
// The default location for the config file is /home/${username}/archive_confs/${archive_name}.yml
// This location is saved as config_path.
// The config_path can be specified as the fourth argument to this program.
const {archive_name, archive_extension} = pullExtension(destination_path);
// The archive_destination is the directory where the archive is stored
const archive_destination = path.dirname(destination_path);
// The archive_extension is the extension of the archive

const defaults = {
    conf_list_path: `/archive_data/conf_list.yml`,
    config_path: `/home/${username}/archive_confs/${archive_name}.yml`
}

// Create the archive_destination (folder) if it does not exist
if (!fs.existsSync(archive_destination)){
    fs.mkdirSync(archive_destination, { recursive: true });
}

// Create the (default) archive_confs folder if it does not exist
if(!fs.existsSync(`/home/${username}/archive_confs`)){
    fs.mkdirSync(`/home/${username}/archive_confs`, { recursive: true });
}

// Define the default backup_paths array
const backup_paths = [`/home/${username}`];
// Define the default cron_schedule
const cron_schedule = '0 0 * * *';

// Define the configuration object
const config = {
    archive_name,
    archive_extension,
    archive_destination,
    backup_paths,
    username,
    cron_schedule
};

// Read the conf_list.yml file
const conf_list_path = path.resolve(process.argv[5] || defaults.conf_list_path )
let conf_object = yaml.load(fs.readFileSync(conf_list_path, 'utf8'));

if (!conf_object || !conf_object.conf_path){
    conf_object = {conf_path: []}
}

let config_path = path.resolve(process.argv[4] || defaults.config_path )

// If the config_path already exists in the conf_list, exit with an error
if (conf_object.conf_path.includes(config_path)) {
    console.error(`Configuration file already exists at ${config_path}`);
    process.exit(1);
}

// Write the configuration object to the config_path   
try { 
    fs.writeFileSync(config_path, yaml.dump(config, {forceQuotes: true, quotingType: '"'}));
    //change file owner to the user
    fs.chownSync(config_path, config.username, config.username);
} catch (err) {
    console.log(err);
    console.error(`Cannot write to ${config_path}`);
    process.exit(1);
}

conf_object.conf_path.push(config_path);

// Write the path of the configuration file to the conf_list.yml file
try{
    fs.writeFileSync(conf_list_path, yaml.dump(conf_object, {forceQuotes: true, quotingType: '"'}));
}   catch (err) {
    console.error(`Cannot write to ${conf_list_path}`);
    console.error(err);
    process.exit(1);    
}
console.log(`Created configuration file for ${username}'s archive: ${archive_name} at ${config_path}\nThe default schedule is every dat at 12:00 AM.\nThe default backup paths are: ${backup_paths}`)
process.exit(0);

function pullExtension(destination_path){
    let archive_extension = '';
    let archive_name = destination_path;
    while (archive_name.includes('.')){
        archive_extension = path.extname(archive_name) + archive_extension;
        archive_name = path.basename(destination_path, archive_extension);
    }
    return {archive_name, archive_extension}
}