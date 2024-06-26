#!/bin/bash

DIR="/root/youtrack-article-export/daily-archive/"

find "$DIR" -type f -mtime +3 -exec rm -f {} \;
