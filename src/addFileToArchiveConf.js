// This script takes two arguments, the first is the path of the folder or file that is to be added to the backup_paths
// array, and the second is the path of the configuration file.

// Import the required modules
const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');

// Get the path of the folder or file to be added to the backup_paths array
const backup_path = path.resolve(process.argv[2]);
// Get the path of the configuration file
const config_path = path.resolve(process.argv[3]);

// Read the configuration file
const config = yaml.load(fs.readFileSync(config_path, 'utf8'));

if (!config.backup_paths){
    config.backup_paths = [];
} 

// Add the backup_path to the backup_paths array
config.backup_paths.push(backup_path);

// Remove duplicate entries from the backup_paths array
config.backup_paths = [...new Set(config.backup_paths)];

// Write the configuration file
fs.writeFileSync(config_path, yaml.dump(config));

// Print the path of the configuration file
console.log("Configuration written to " + config_path);

// Print the backup_paths array
console.log("backup_paths: " + config.backup_paths);
