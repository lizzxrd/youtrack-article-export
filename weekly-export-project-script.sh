#!/bin/bash

YOUTRACK_PROJECT_ID="RA_SEDMB"

TIMESTAMP=$(date +'%Y-%m-%d_%H:%M:%S')

#ARCHIVE_NAME="/root/youtrack-article-export/youtrack-export-output_${TIMESTAMP}.tar.gz"

OUTPUT_DIR="/root/youtrack-article-export/output/"

ARCHIVE_DIR="/root/youtrack-article-export/weekly-archives/"


node project.js --project $YOUTRACK_PROJECT_ID

if [ "$(ls -A $OUTPUT_DIR)" ]; then

  TIMESTAMP=$(date +'%Y%m%d_%H%M%S')

  ARCHIVE_NAME="${ARCHIVE_DIR}youtrack-export-output_${TIMESTAMP}.tar.gz"

  tar -czf $ARCHIVE_NAME -C $OUTPUT_DIR .
fi


