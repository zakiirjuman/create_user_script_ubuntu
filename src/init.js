// This program receives two arguments the first is the path to the list of config files, the other is the path to the default folder
// that will hold the backup scripts.
// This program will read the list and create a watch on each file.
// If the list is modified, the program will read the new list and add or remove watchers as needed.

const path = require('path');
const readConfigList = require('./readConfigList.js');
const readConfig = require('./readConfig.js');
const createShellScript = require('./createShellScript.js');
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

    // For each element in the conf_list, use readConfig to read the file and create an array with all of the config objects
    let confs = [];
    conf_list.forEach(conf => {
        confs.push(readConfig(conf))
    });
    let confs_resolved = await Promise.allSettled(confs);
    confs_resolved = confs_resolved.map(conf => {
        if (conf.status === 'rejected') {
            return null;
        }
        return conf.value;
    })

    confs_resolved = confs_resolved.filter(Boolean);
    // Use the confs_resolved to createShellScripts
    let promiseArray = [];
    confs_resolved.forEach(config => {
        promiseArray.push(createShellScript(config, sh_folder));
    });

    // Wait for all promises to resolve and then filter out the null values
    // collect the filenames.
    let cron_jobs = await Promise.allSettled(promiseArray);
    cron_jobs = cron_jobs.map(filename => {
        if (filename.status === 'rejected') {
            return null;
        }
        return filename.value;
    })

    cron_jobs = cron_jobs.filter(Boolean);
    cron_jobs = cron_jobs.map(job => {
        return job.cron_schedule + ' root ' + job.script_path;
    })


    // use cron_jobs to create a single cron file called cron_backup in cron_folder
    // the cron file needs to have one cron entry for every object in cron_jobs.
    try{
        fs.writeFileSync(path.join(cron_folder, 'cron_backup'), cron_jobs.join(os.EOL));
    }
    catch (err) {
        return Promise.reject(new Error(`Error writing cron file: ${err}`));
    }


    // Use the conf_list to create watchers
    /*let confFileWatcher = chokidar.watch(conf_list, { persistent: true });

    confFileWatcher
        .on('change', async (path) => { 
            console.log(`File ${path} has been changed`);
            let config = await readConfig(path);

            // TODO: Add code to set cron job
        })

    // Initialize the watcher
    const confListWatcher = chokidar.watch(conf_list_path, { persistent: true });*/
}

//init();

module.exports = init;
