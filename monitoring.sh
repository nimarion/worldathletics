#!/bin/bash

set -e

ids=("14720623" "14597875" "14856078" "14377384" "14597052")

for id in "${ids[@]}"
do
    echo "Checking $id"
    curl -o /dev/null --silent --show-error --fail https://worldathletics.pfingstsportfest.de/athletes/$id
done