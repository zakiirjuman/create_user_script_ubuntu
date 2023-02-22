#!/bin/bash

rm -r /archive_data
rm -r /archive_scripts
mkdir /archive_data
mkdir /archive_scripts
chmod o+rwx /archive_data
cp conf_list.yml /archive_data/conf_list.yml
chmod o+rwx /archive_data
chmod o+rwx /archive_data/conf_list.yml
#chmod +x src
#chmod +x src/init.js
#chmod +x src/addFileToArchiveConf.js
#chmod +x src/createNewArchiveConf.js
ln -s src/init.js /usr/local/bin/node_backup
ln -s src/addFileToArchiveConf.js /usr/local/bin/add_to_archive
ln -s src/createNewArchiveConf.js /usr/local/bin/create_archive
ln -s other/cproject.sh /usr/local/bin/create_project
ln -s other/newuser.sh /usr/local/bin/adduser
chmod o+x /usr/local/bin/node_backup
chmod o+x /usr/local/bin/add_to_archive
chmod o+x /usr/local/bin/create_archive
chmod o+x /usr/local/bin/create_project
chmod o+x /usr/local/bin/adduser
