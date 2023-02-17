const fs = require('fs');
const path = require('path');
const os = require('os');

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

module.exports = updateCronEntries;