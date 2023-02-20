// This function takes one argument which is the path to the conf list yml file.
// The function reads the conf list and returns an array of conf paths.

const fs = require('fs');
const yaml = require('js-yaml');
const resolve = require('path').resolve;

function readConfigList(conf_list_path) {

    var valid_conf_list = [];
    var conf_path = [];
    console.log('reading: ' + conf_list_path + '...');
    // Check if conf_list_path exists
    if (!fs.existsSync(conf_list_path)) {
        console.log('conf_list_path does not exist');
        throw new Error('conf_list_path does not exist');
    }

    // Read the conf_paths into an array
    var object = yaml.load(fs.readFileSync(conf_list_path, 'utf8'));
    if (!object || !object.conf_path) {
        console.log('conf_list_path does not contain conf_paths');
        return valid_conf_list;
    } else {
        conf_path = object.conf_path;
    }

    // Test if each element is a valid path, return only valid paths.
    
    for (i in conf_path) {
        if (fs.existsSync(resolve(conf_path[i]))) {
            valid_conf_list.push(resolve(conf_path[i]));
        } else {
            console.log(`${conf_path[i]} does not exist`);
        }
    } 
    return valid_conf_list;
}

module.exports = readConfigList;
