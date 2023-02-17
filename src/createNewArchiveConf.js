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
let destination_path = process.argv[3];
destination_path = path.resolve(destination_path);
console.log('destination_path: ');
console.log(destination_path);
// The default location for the config file is /home/${username}/archive_confs/${archive_name}.yml
// This location is saved as config_path.
// The config_path can be specified as the fourth argument to this program.
const archive_name = path.basename(destination_path, path.extname(destination_path));
// The archive_destination is the directory where the archive is stored
const archive_destination = path.dirname(destination_path);
// The archive_extension is the extension of the archive
const archive_extension = path.extname(destination_path);

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

// Check that we can write to the config_path   
let config_path =  path.resolve(process.argv[4]) || `/home/${username}/archive_confs/${archive_name}.yml`;
console.log('config_path: ');
console.log(config_path);

// Write the configuration object to the config_path   

try { 
    fs.writeFileSync(config_path, yaml.dump(config));
} catch (err) {
    console.error(`Cannot write to ${config_path}`);
    process.exit(1);
}

// Write the path of the configuration file to the conf_list.yml file
const conf_list_path = path.resolve(process.argv[5]) || `/home/${username}/archive_confs/conf_list.yml`;
console.log('conf_list_path: ');
console.log(conf_list_path);
const conf_object = yaml.load(fs.readFileSync(conf_list_path, 'utf8'));
console.log('conf_object: ');
console.log(conf_object);   
conf_object.conf_list.push(config_path);
try{
    fs.writeFileSync(conf_list_path, yaml.dump(conf_object));
}   catch (err) {
    console.error(`Cannot write to ${conf_list_path}`);
    console.error(err);
    process.exit(1);    
}
console.log('Configuration file created successfully')
process.exit(0);