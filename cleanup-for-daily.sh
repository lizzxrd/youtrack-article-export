#!/bin/bash

DIR="/root/youtrack-article-export/daily-archives/"

find "$DIR" -type f -mtime +3 -exec rm -f {} \;
