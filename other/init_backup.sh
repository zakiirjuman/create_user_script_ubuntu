#!/bin/bash

# Intended to be run by administrator
# Creates folder `/home/$username/backup_conf.d` that stores configurations per archive file.
# Creates folder `/backups/$username/archives` that stores the archive files.


# Check if backup folder exists:
# whoami
# create if necesssary

if [ $(id -u) -eq 0 ]; then
    read -p "Enter the user which this backup will belong to, a folder will be created under their name in /backups: " username
    if id "$username" &>/dev/null; then
        #echo "$username exists!"
        
        backup_path_instructions="/home/$username/instructions"
        backup_path_archives="/backups/$username/archives"
        #check if backup path exists
        if [ -d "$backup_path_instructions" ]; then
            echo "the instructions path is valid"
        else 
            mkdir -p "$backup_path_instructions"
            [ $? -eq 0 ] && echo "backup instruction path added!" || echo "Failed to add instruction path!"
        fi
        if [ -d "$backup_path_archives" ]; then
            echo "the backup path is valid"
        else 
            mkdir -p "$backup_path_archives"
            [ $? -eq 0 ] && echo "backup archive path added!" || echo "Failed to add archive path!"
        fi
        read -p "Enter the default filename of the archive: " archive_instruction_filename
        path_to_instruction_file="${backup_path_instructions}/${archive_instruction_filename}.sh"
        PS3="What extension to use?: "
        select extension in ".tar.gz" ".gzip"
        do
            if [ -z "$extension" ]
            then
                echo "Invalid selection. Try again."
                continue
            fi
            case "$extension" in
                ".tar.gz")
                    echo "tar chosen"
                    cp /backups/backup_template.sh "$path_to_instruction_file"
                    sed -i 's/extension=.*/extension='"$extension"'/' "$path_to_instruction_file"
                    sed -i 's/filename=.*/filename='"$archive_instruction_filename"'/' "$path_to_instruction_file"
                    ;;
                ".bzip")
                    echo "gzip chosen"
                    ;;
            esac       
        break  
        done
        PS3="How often to backup?"
        select freq in "First Day of Every Month" "Every Sunday"
        do
            if [ -z "$freq" ]
            then
                echo "Invalid selection. Try again."
                continue
            fi
            case "$freq" in
                "First Day of Every Month")  
                    #echo "0 0 1 * * $path_to_instruction_file" | crontab -
                    echo $path_to_instruction_file
                    cron_schedule="0 0 1 * * "
                    sed_string="$cron_schedule"$path_to_instruction_file
                    echo "$sed_string"
                    (crontab -l 2>/dev/null; echo "$sed_string") | crontab -
                    ;;
                "Every Sunday")
                    #echo "0 0 * * 7 $path_to_instruction_file" | crontab -
                    echo $path_to_instruction_file
                    cron_schedule="0 0 * * 7 "
                    sed_string="$cron_schedule"$path_to_instruction_file
                    echo "$sed_string"
                    (crontab -l 2>/dev/null; echo "$sed_string") | crontab -
                    ;;
            esac
        break
        done                 
        #exit 1
        exit 0
    else
        echo "$username does not exist"
    fi
else
    echo "Only root may use this script."
    exit 2
fi