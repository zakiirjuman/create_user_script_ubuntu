#!/bin/bash

# Purpose - Script to add a user to Linux system including passsword
# Initial Author - Vivek Gite <www.cyberciti.biz> under GPL v2.0+
# ------------------------------------------------------------------
# Fail if user is not root
if [ $(id -u) -eq 0 ]; then

    # CREATE USER AND PASSWORD
    read -p "Enter username : " username
    if id "$username" &>/dev/null; then
        echo "$username exists!"
        exit 1
    else
        read -s -p "Enter password : " password
        pass=$(perl -e 'print crypt($ARGV[0], "pinch")' $password)
        useradd -m -p "$pass" "$username"
        [ $? -eq 0 ] && echo "User has been added to system!" || echo "Failed to add a user!"
    fi

    # SET DEFAULT SHELL
    shells=($(cat /etc/shells))

    # Remove the first 5 elements from the array as they are
    # not valid selections
    shells=("${shells[@]:5}")

    PS3="Enter the number corresponding to ${username}'s preferred shell: "
    select shell_path in "${shells[@]}"
    do
    if [ -z "$shell_path" ]
    then
        echo "Invalid selection. Try again."
        continue
    fi

    echo "Setting $shell_path as the default shell for $username"
    chsh -s "$shell_path" "$username" 
    [ $? -eq 0 ] && echo "Default shell is now set to $shell_path" || echo "Failed to set shell!"
    break
    done

    # SET SECONDARY GROUP
    all_group=($(compgen -g))
    all_group_length=${#all_group[@]}
    # There are many groups that come default with ubuntu.
    # We (arbitrarily) set a cutoff point at lxd
    search_string="lxd"
    index=-1
    recent=0

    #in "${!all_group[@]}" the exclamation refers to the index 
    for i in "${!all_group[@]}"; do
    if [[ "${all_group[$i]}" == "$search_string" ]]; then
        index=$i
        break
    fi
    done

    if [[ $index -eq -1 ]]; then
        echo "can't determine recent groups..."
        # enter groupname manually
    else
        # echo "Index of $search_string in array is $index."
        index=$(($index + 1))
        last_elements=$(($all_group_length - $index))
        echo "Number of groups: $last_elements"  
        last_elements=$(($last_elements * -1))
        all_group=("${all_group[@]: $last_elements}")
        PS3="Select a group to add, exit with (1), or enter other group with (2) : "
        end=$((0))
        while [ $end -eq 0 ]
        do
        user_group=($(groups $username))
        user_group=("${user_group[@]:2}")
        avail_group=(`echo ${user_group[@]} ${all_group[@]} | tr ' ' '\n' | sort | uniq -u `)
        avail_group_opt=( ".. finish" ".. enter other group" "${avail_group[@]}")
            select group in "${avail_group_opt[@]}"
            do
                if [ -z "$group" ]
                then
                    echo "Invalid selection. Try again."
                    continue
                fi
                case "$group" in
                    ".. finish")
                        echo "finishing"
                        end=$((1))
                        ;;
                    ".. enter other group")
                        read -p "enter group: " othergroup
                        echo "Setting $othergroup as a secondary group for $username"
                        ;;
                    *)
                        echo "Setting $group as a secondary group for $username"
                        usermod -a -G "$group" "$username"
                        [ $? -eq 0 ] && echo "..success!" || echo "..failed!"
                        ;;
                esac
                break
            done
        done
        echo "done!"
    fi

else
    echo "Only root may use this script."
    exit 2
fi