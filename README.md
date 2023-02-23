## Installation

```
sudo apt update
sudo apt install git
sudo apt install npm
git clone https://github.com/zakiirjuman/ubuntu_scripts.git
cd ~/ubuntu_scripts
npm install
sudo ./setup.sh
sudo systemctl daemon-reload
sudo systemctl start node_backup
sudo systemctl enable node_backup
```

## Testing

```
npm test
```

Use <kbd>Cmd</kbd> + <kbd>C</kbd> to end testing as init() does not quit automatically.

## Sudo (Only) Commands:

adduser

create_archive \<username\> [archive path] [configuration path] [configuration list path]

## User Commands:

create_project \<project name\> [project path]

add_to_archive \<file or folder path\> \<configuration path\>

## Default Backup Locations:

configuration list path: /archive_data/conf_list.yml

configuration path: /home/$username/archive_confs/default_archive.yml

archive path: /home/$username/default_archive.tar.gz

backup path: /home/$username

script: /archive_scripts/$username/default_archive

cron info: /var/log/syslog

node_backup service log: /var/log/node_backup.log
