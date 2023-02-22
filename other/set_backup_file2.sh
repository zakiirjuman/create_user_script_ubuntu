#!/bin/bash

username=$(whoami)
folder="/home/${username}/archive_confs"
array=()

for file in $folder/*.sh; do
filename=$(basename "$file" ".sh")
array+=("$filename")
done

PS3="Select archive:"
select archive in "${array[@]}"
do
if [ -z "$archive" ]
then
    echo "Invalid selection. Try again."
    continue
else 
    archive_name="$archive"
fi
break
done

echo "${array[@]}"
archive_conf_path="/home/${username}/archive_confs/${archive_name}.yml"
new_file_path=$(realpath $1)
echo $new_file_path
echo $archive_conf_path
if [ -f "$archive_conf_path" ]; then
    echo "the archive instruction file is valid"
    # call node js process to add the new file to the archive
    node /home/${username}/archive_confs/add_file_to_archive.js $new_file_path $archive_conf_path
else
    echo "invalid archive name"
    exit 1
fi