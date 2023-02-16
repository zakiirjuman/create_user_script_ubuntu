// This program receives two arguments the first is the path to the list of config files, the other is the path to the default folder
// that will hold the backup scripts.
// This program will read the list and create a watch on each file.
// If the list is modified, the program will read the new list and add or remove watchers as needed.

const path = require('path');
const readConfigList = require('./readConfigList.js');
const readConfig = require('./readConfig.js');
const createShellScript = require('./createShellScript.js');
const compareConfLists = require('./compareConfLists.js');
const resolveNewConfs = require('./resolveNewConfs.js');

const chokidar = require('chokidar');
const fs = require('fs');
const os = require('os');

let default_sh_folder = './shell_scripts'
default_sh_folder = path.resolve(default_sh_folder);
console.log(default_sh_folder);



const default_conf_list_path = process.argv[2];
let current_watchers = [];

async function init (conf_list_path = default_conf_list_path, sh_folder = default_sh_folder, cron_folder) {
    // Read the conf_list_path
    let conf_list;
    try{
        conf_list = readConfigList(conf_list_path);
    } catch (err) {
        return Promise.reject(new Error(`Invalid conf list path: ${conf_list_path}`));
    }

    //Reject with error if sh_folder or cron_folder are not valid paths
    if (!fs.existsSync(sh_folder)) {
        return Promise.reject(new Error(`Invalid shell script folder path: ${sh_folder}`));
    }
    if (!fs.existsSync(cron_folder)) {
        return Promise.reject(new Error(`Invalid cron folder path: ${cron_folder}`));
    }

    let confs_resolved = await resolveNewConfs(conf_list, sh_folder);
    console.log(confs_resolved);

    updateCronEntries(confs_resolved, cron_folder);

    // Use the conf_list to create watchers
    console.log('Conf_list:')
    conf_list = confs_resolved.map(conf => conf.config_file_path)
    console.log(conf_list)
    let confFileWatcher = chokidar
        .watch(conf_list, { persistent: true })
        .on('ready', () => {
            console.log('Watching Configuration Files at:');
            console.log(confFileWatcher.getWatched());    
        })
        .on('change', async (changed_path) => { 
            console.log(`File ${changed_path} has been changed`);
            let new_confs_resolved = await resolveNewConfs([changed_path], sh_folder);
            console.log('new_confs_resolved: ');
            console.log(new_confs_resolved);
            //remove elements from confs_resolved that also have the same archive name as the new_confs_resolved
            confs_resolved = confs_resolved.filter(conf => !new_confs_resolved.some(new_conf => new_conf.archive_name === conf.archive_name));
            //add new_confs_resolved to confs_resolved
            confs_resolved = confs_resolved.concat(new_confs_resolved);
            console.log('confs_resolved: ');
            console.log(confs_resolved);
            //create cron_entries from confs_resolved
            updateCronEntries(confs_resolved, cron_folder);
        
        })
        .on('error', (err) => {
            console.log(`Error: ${err}`);
        })
        .on('add', (changed_path) => {
            console.log(`Config File ${changed_path} is now being watched`);
        })
        .on('unlink', (changed_path) => {
            console.log(`Config File ${changed_path} is no longer being watched`);
        })
    

    // Initialize the confListWatcher
    const confListWatcher = chokidar
    .watch(conf_list_path, { persistent: true })
    .on('ready', () => {
        console.log('Configuration List being watched at:');
        console.log(confListWatcher.getWatched());    
    })
    .on('change', async (conf_list_path) => {
        // Read the new conf_list
        console.log('change detected')
        // wrap readConfigList in a try catch block
        let new_conf_list;
        try {
            new_conf_list = readConfigList(conf_list_path);
        } catch (err) {
            return Promise.reject(new Error(`Invalid conf list path: ${conf_list_path}`));
        }
        // Get the folders and files returned by confFileWatcher.getWatched()
        let watched_paths = confFileWatcher.getWatched();
        let watched_files = [];
        //console.log(watched_paths);
        // Each key of watched_paths represents a folder, and the value is an array of files in that folder
        // Get the full location of each file in the watched_paths object
        for (const [folder, files] of Object.entries(watched_paths)) {
            files.forEach(file => {
                watched_files.push(`${folder}/${file}`);
            })
        }
        console.log('watched files: ')
        console.log(watched_files);
        // call compareConfLists to get the files that need to be added and removed
        let {files_to_add, files_to_remove} = compareConfLists(new_conf_list, watched_files);
        console.log('files to add: ')
        console.log(files_to_add);
        console.log('files to remove:')
        console.log(files_to_remove);

        let new_confs_resolved = await resolveNewConfs(files_to_add, sh_folder);
        console.log('files to add: ')
        console.log(new_confs_resolved);

        //use files_to_remove to remove elements from confs_resolved
        confs_resolved = confs_resolved.filter(conf => !files_to_remove.includes(conf.config_file_path));
        //remove elements from confs_resolved that also have the same archive name as the new_confs_resolved
        confs_resolved = confs_resolved.filter(conf => !new_confs_resolved.some(new_conf => new_conf.archive_name === conf.archive_name));
        //add new_confs_resolved to confs_resolved
        confs_resolved = confs_resolved.concat(new_confs_resolved);

        //update cron_entries
        updateCronEntries(confs_resolved, cron_folder);

        files_to_add = confs_resolved.map(conf => conf.config_file_path);
        try {
            await confFileWatcher.unwatch(files_to_remove);
            confFileWatcher.add(files_to_add);
        } catch (err) {
            console.log(`Error updating confFileWatcher: ${err}`);
        }
    })
}

function updateCronEntries(confs_resolved, cron_folder) {
    let cron_entries = confs_resolved.map(conf => conf.cron_entry);
    // use cron_entries to create a single cron file called cron_backup in cron_folder
    // the cron file needs to have one cron entry for every object in cron_jobs.
    try {
        fs.writeFileSync(path.join(cron_folder, 'cron_backup'), cron_entries.join(os.EOL));
    }
    catch (err) {
        return new Error(`Error writing cron file: ${err}`);
    }       
}

//init();

module.exports = init;
