#!/bin/bash

rm -r /archive_data
rm -r /archive_scripts
mkdir /archive_data
mkdir /archive_scripts
chmod o+rwx /archive_data
cp conf_list.yml /archive_data/conf_list.yml
chmod o+rwx /archive_data
chmod o+rwx /archive_data/conf_list.yml

