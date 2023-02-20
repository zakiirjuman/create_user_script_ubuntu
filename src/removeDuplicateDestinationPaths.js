function removeDuplicateDestinationPaths(confs_resolved) {
    let destination_paths = confs_resolved.map(conf => conf.destination_path);
    let unique_destination_paths = destination_paths.filter((dest_path, index, self) => {
        return ((self.indexOf(dest_path) === index) && (self.lastIndexOf(dest_path) === index));
    });
    let confs_resolved_no_duplicates = unique_destination_paths.map(dest_path => {
        return confs_resolved.find(conf => conf.destination_path === dest_path);    
    });
    return confs_resolved_no_duplicates;
}

module.exports = removeDuplicateDestinationPaths;