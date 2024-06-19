#!/bin/bash

# Specify the directory where you want to delete files.
DIRECTORY="./public/downloads"

# List files older than 7 days in the specified directory.
echo "The following files will be deleted:"
find "$DIRECTORY" -type f -mtime +7

# Ask for confirmation
read -p "Are you sure you want to delete these files? (y/n) " -n 1 -r
echo    # Move to a new line

if [[ $REPLY =~ ^[Yy]$ ]]
then
    # Proceed with deletion
    find "$DIRECTORY" -type f -mtime +7 -exec rm {} \;
    echo "Files older than 7 days have been deleted from $DIRECTORY."
else
    echo "File deletion cancelled."
fi