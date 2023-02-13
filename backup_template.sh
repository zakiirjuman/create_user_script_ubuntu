#!/bin/bash
####################################
#
# Backup to NFS mount script.
#
####################################

# Set by admin
#filename should match this filename without the .sh extension
filename="default2"
extension=".tar.gz"
dest="/backups/ubuntu/archives"
cron_schedule="0 0 1 * * "

# Set by user
backup_files=

# Create archive filename.
archive_file="${filename}${extension}"

# Print start status message.
echo "Backing up $backup_files to $dest/$archive_file"

# Backup the files using tar.
tar czf $dest/$archive_file $backup_files

# Print end status message.
echo
echo "Backup finished"