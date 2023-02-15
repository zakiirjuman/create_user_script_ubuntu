// This program receives a single argument which is the path to the list.
// This program will read the list and create a watch on each file.
// If the list is modified, the program will read the new list and add or remove watchers as needed.

const chokidar = require('chokidar');
const readConfigList = require('readConfigList.js');
const createShellScript = require('createShellScript.js');

let default_sh_folder = './shell_scripts'
default_sh_folder = path.resolve(default_sh_folder);
console.log(default_sh_folder);



const conf_list_path = process.argv[2];
let current_watchers = [];

async function init (sh_folder = default_sh_folder) {

    // TODO: test if running as root


    // Read the conf list into an array
    let conf_list = readConfigList(conf_list_path);

    // For each element in the conf_list, use readConfig to read the file and create an array with all of the config objects
    let confs = [];
    for (let i = 0; i < conf_list.length; i++) {
        confs.push(readConfig(conf_list[i]));
        confs = confs.filter(Boolean);
    }

    // Use the confs to createShellScripts
    let promiseArray = [];
    confs.forEach(config => {
       promiseArray.push(createShellScript(config, sh_folder));
    });
    let results = await Promise.allSettled(promiseArray);
    console.log(results);

    // Use the conf_list to create watchers
    let confFileWatcher = chokidar.watch(conf_list, { persistent: true });

    confFileWatcher
        .on('change', async (path) => { 
            console.log(`File ${path} has been changed`);
            let config = await readConfig(path);

            // TODO: Add code to set cron job
        })

    // Initialize the watcher
    const confListWatcher = chokidar.watch(conf_list_path, { persistent: true });
}

module.exports = init;
