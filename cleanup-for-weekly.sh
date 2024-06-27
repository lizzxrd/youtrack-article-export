#!/bin/bash

DIR="/root/youtrack-article-export/weekly-archives/"

find "$DIR" -type f -mtime +21 -exec rm -f {} \;
