TODO:

create directories
/archive_data
/backups/ubuntu (for test)
/archive_scripts
/cron_folder /etc/cron.d?
sudo touch /archive_data/conf_list.yml
sudo chmod o+rw /archive_data/conf_list.yml
sudo chmod o+x(all directories that lead to the scripts)

Ensure tests passing

Ensure that the new tests create a folder ./archive_scripts/username to hold all scripts per user.
It is likely that resolveNewConfs will need to use the username along with the base sh_folder to create the directory.
Change default_shell_folder in init to be /archive_scripts with correct permissions.

move other scripts and test them:
cproject.sh
init_backup.sh
newuser.sh

create symlinks for:
cproject.sh
newuser.sh
createNewArchiveConf.js
addFileToArchiveConf.js
init.js

get node process running as root
test a little bit
