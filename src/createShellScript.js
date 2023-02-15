// This function takes the config object and creates a shell script that will be executed by the cron job.

// Promisify writeFile
const fs = require('fs');
const util = require('util');
const writeFile = util.promisify(fs.writeFile);

async function createShellScript({archive_name, archive_extension, archive_destination, backup_paths, username}, shell_script_folder) {
    // Define the variables
    let destination_path = `${archive_destination}/${archive_name}${archive_extension}`;
    let backup_paths_string = backup_paths.join(' ');

    // Define the shell script
    let shell_script = 
    `#!/bin/bash
    tar -czf ${destination_path} ${backup_paths_string}
    chown ${username}:${username} ${destination_path}
    `;

    // Write the shell script to a file
    return writeFile(`${shell_script_folder}/${archive_name}`, shell_script)
}

module.exports = createShellScript;