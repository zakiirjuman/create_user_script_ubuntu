#!/bin/bash

username=$(whoami)
folder="/home/${username}/instructions"
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
archive_instruction_path="/home/${username}/instructions/${archive_name}.sh"
new_file_path=$(realpath $1)
echo $new_file_path
echo $archive_instruction_path
if [ -f "$archive_instruction_path" ]; then
    echo "the archive instruction file is valid"

    # Read the backup_files variable into an array
    array=( $(sed -n 's/backup_files=\(.*\)/\1/p' $archive_instruction_path | tr -d '"' | tr ' ' '\n') )
    
    # Add the new file path to the end of the array
    array+=( "$new_file_path" )

    #for a in "${array[@]}"
    #do
    #    echo $a
    #done

    #remove duplicates
    backup_files=(`echo ${array[@]} | tr ' ' '\n' | sort | uniq `)

    echo "duplicates removed"
    # Convert the array back into a string, separated by spaces
    backup_files="$(echo "${backup_files[@]}" | tr '\n' ' ')"
    #backup_files="$(`echo "${array[@]}" | uniq -u ` | tr '\n' ' ')"

    echo $backup_files

    # Replace the backup_files line in the instructions.sh file
    #sed -i "s/^backup_files=.*/backup_files=\\\"$backup_files\\\"/" $archive_instruction_path
    sed -i 's|^backup_files=.*|backup_files="'"$backup_files"'"|' $archive_instruction_path


else
    echo "invalid archive name"
    exit 1
fi