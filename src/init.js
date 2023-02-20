#!/usr/bin/env node

// This program receives two arguments the first is the path to the list of config files, the other is the path to the default folder
// that will hold the backup scripts.
// This program will read the list and create a watch on each file.
// If the list is modified, the program will read the new list and add or remove watchers as needed.

const path = require('path');
const readConfigList = require('./readConfigList.js');
const compareConfLists = require('./compareConfLists.js');
const resolveNewConfs = require('./resolveNewConfs.js');
const updateCronEntries = require('./updateCronEntries.js');
const removeDuplicateDestinationPaths = require('./removeDuplicateDestinationPaths.js');

const chokidar = require('chokidar');
const fs = require('fs');
const os = require('os');

let default_sh_folder = '/archive_scripts'
let default_cron_folder = '/etc/cron.d'
let default_conf_list_path = '/archive_data/conf_list.yml'
default_sh_folder = path.resolve(default_sh_folder);
console.log(default_sh_folder);

default_conf_list_path = path.resolve(process.argv[2] || default_conf_list_path);
console.log('default_conf_list_path: ');
console.log(default_conf_list_path);

async function init (conf_list_path = default_conf_list_path, sh_folder = default_sh_folder, cron_folder = default_cron_folder) {

    // Create cron_folder if it does not exist
    if (!fs.existsSync(cron_folder)) {
        fs.mkdirSync(cron_folder, { recursive: true });
        // create the cron file
        fs.writeFileSync(path.join(cron_folder, 'cron_backup'), '');
    }


    // Read the conf_list_path
    let conf_list;
    try{
        conf_list = readConfigList(conf_list_path);
    } catch (err) {
        console.log(`Invalid conf list path: ${conf_list_path}`)
        return Promise.reject(new Error(`Invalid conf list path: ${conf_list_path}`));
    }

    //Reject with error if sh_folder or cron_folder are not valid paths
    if (!fs.existsSync(sh_folder)) {
        console.log(`Invalid shell script folder path: ${sh_folder}`)
        return Promise.reject(new Error(`Invalid shell script folder path: ${sh_folder}`));
    }
    if (!fs.existsSync(cron_folder)) {
        console.log(`Invalid shell script folder path: ${cron_folder}`)
        return Promise.reject(new Error(`Invalid cron folder path: ${cron_folder}`));
    }

    let confs_resolved = await resolveNewConfs(conf_list, sh_folder);
    confs_resolved = removeDuplicateDestinationPaths(confs_resolved);
    console.log('confs_resolved: ')
    console.log(confs_resolved);
    updateCronEntries(confs_resolved, cron_folder);

    // Use the conf_list to create watchers
    console.log('Conf_list:')
    conf_list = confs_resolved.map(conf => conf.config_file_path)
    console.log(conf_list)
    let confFileWatcher = chokidar
        .watch(conf_list, { persistent: true })
        .on('change', async (changed_path) => {
            console.log(`File ${changed_path} has been changed`);
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
            let new_confs_resolved = await resolveNewConfs(watched_files, sh_folder);
            confs_resolved = removeDuplicateDestinationPaths(new_confs_resolved);
            console.log('confs_resolved: ');
            console.log(confs_resolved);
            //create cron_entries from confs_resolved
            updateCronEntries(confs_resolved, cron_folder);
            console.log('Cron Entries Updated');
        })
        .on('error', (err) => {
            console.log(`Error: ${err}`);
        })
        .on('add', (changed_path) => {
            console.log(`Config File ${changed_path} is now being watched`);
        })
    

    // Initialize the confListWatcher
    const confListWatcher = chokidar
        .watch(conf_list_path, { persistent: true })
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
            // call compareConfLists to get the files that need to be added and removed
            let {files_to_add, files_to_remove} = compareConfLists(new_conf_list, watched_files);

            let new_confs_resolved = await resolveNewConfs(files_to_add, sh_folder);

            //use files_to_remove to remove elements from confs_resolved
            confs_resolved = confs_resolved.filter(conf => !files_to_remove.includes(conf.config_file_path));
            //add new_confs_resolved to confs_resolved
            confs_resolved = confs_resolved.concat(new_confs_resolved);
            //remove elements from confs_resolved that have duplicate destination_paths do not keep any of the duplicates
            confs_resolved = removeDuplicateDestinationPaths(confs_resolved);
            console.log('confs_resolved: ');
            console.log(confs_resolved);

            //update cron_entries
            updateCronEntries(confs_resolved, cron_folder);
            console.log('updated cron entries');

            try {
                await confFileWatcher.unwatch(files_to_remove);
                confFileWatcher.add(files_to_add);
            } catch (err) {
                console.log(`Error updating confFileWatcher: ${err}`);
            }
            console.log('updated watchers: ');
    })
}

init();

module.exports = init;
