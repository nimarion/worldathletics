#!/bin/bash

curl -o src/disciplines.json --silent --show-error --fail https://worldathletics.pfingstsportfest.de/disciplines 
jq . src/disciplines.json > src/disciplines_pretty.json
rm src/disciplines.json
mv src/disciplines_pretty.json src/disciplines.json