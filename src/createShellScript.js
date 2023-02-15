// This function takes the config object and creates a shell script that will be executed by the cron job.

// Promisify writeFile
const fs = require('fs');
const util = require('util');
const writeFile = util.promisify(fs.writeFile);

async function createShellScript({archive_name, archive_extension, archive_destination, backup_paths, username} = {}, shell_script_folder) {

    if(!archive_name || !archive_extension || !archive_destination || !backup_paths || !username){
        return Promise.reject(new Error('Config is invalid'));
    }

    if (!shell_script_folder){
        return Promise.reject(new Error('Shell script folder is not specified'));
    }

    // Test that the shell script folder exists
    try {
        await fs.promises.access(shell_script_folder);
    } catch (err) {
        return Promise.reject(new Error(`Shell script folder ${shell_script_folder} does not exist`));
    }

    // Define the variables
    let destination_path = `${archive_destination}/${archive_name}${archive_extension}`;
    let backup_paths_string = backup_paths.join(' ');

    // Define the shell script
    let shell_script = `#!/bin/bash\ntar -czf ${destination_path} ${backup_paths_string}\nchown ${username}:${username} ${destination_path}`;

    // Write the shell script to a file
    return writeFile(`${shell_script_folder}/${archive_name}`, shell_script)
}

module.exports = createShellScript;