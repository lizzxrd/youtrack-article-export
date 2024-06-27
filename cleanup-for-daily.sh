#!/bin/bash

DIR="/root/youtrack-article-export/daily-archives/"

find "$DIR" -type f -mtime +7 -exec rm -f {} \;
