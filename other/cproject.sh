#!/bin/bash
# first argument is name of project folder
# second argument is path

if [ $# -lt 1 ]; then
  echo "Error: At least one argument is required."
  echo "Usage: $0 PROJECT_NAME [PROJECT_PATH]"
  exit 1
fi

#echo "First argument: $1"
project_name=$1
project_path=$(pwd)
echo 

if [ $# -eq 2 ]; then
  #echo "Second argument: $2"
  project_path=$(realpath $1)
fi

mkdir -p "${project_path}/${project_name}/src"
mkdir -p "${project_path}/${project_name}/config"
touch "${project_path}/${project_nameqq}/README.md"


echo "Script executed successfully."