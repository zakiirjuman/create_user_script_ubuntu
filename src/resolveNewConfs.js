// This async function is a refactor of part of the init file.

// This function receives two arguments the first is the path to the list of config files, the other is 
// the path to the default shell folder that will hold the backup scripts.

const readConfig = require('./readConfig.js');
const createShellScript = require('./createShellScript.js');

async function resolveNewConfs (conf_list, sh_folder) {

    console.log('conf_list: ')
    console.log(conf_list);
    console.log('sh_folder: ')
    console.log(sh_folder);
    
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
    console.log('confs_resolved: ')
    console.log(confs_resolved);
    confs_resolved = confs_resolved.filter(Boolean);
    
    // Use the confs_resolved to createShellScripts
    let promiseArray = [];
    confs_resolved.forEach(config => {
        promiseArray.push(createShellScript(config, sh_folder));
    });

    // Wait for all promises to resolve and then filter out the null values
    // collect the filenames.
    confs_resolved = await Promise.allSettled(promiseArray);
    confs_resolved = confs_resolved.map(filename => {
        if (filename.status === 'rejected') {
            return null;
        }
        return filename.value;
    })
    console.log('confs_resolved: ')
    console.log(confs_resolved);
    return confs_resolved = confs_resolved.filter(Boolean);    
}

module.exports = resolveNewConfs;

