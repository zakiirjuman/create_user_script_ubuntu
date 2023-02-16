// This function compares the conf_list array with the current_watchers array and returns two arrays. The first array
// contains the paths that are in the conf_list but not in the current_watchers. The second array contains
// the paths that are in the current_watchers but not in the conf_list.

function compareConfLists(conf_list, current_watchers) {
    let files_to_add = [];
    let files_to_remove = [];
    for (let i = 0; i < conf_list.length; i++) {
        if (!current_watchers.includes(conf_list[i])) {
            files_to_add.push(conf_list[i]);
        }
    }
    for (let i = 0; i < current_watchers.length; i++) {
        if (!conf_list.includes(current_watchers[i])) {
            files_to_remove.push(current_watchers[i]);
        }
    }
    return {files_to_add, files_to_remove};
}

module.exports = compareConfLists;

