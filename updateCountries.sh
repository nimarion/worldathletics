#!/bin/bash

curl -o src/countries.json --silent --show-error --fail https://worldathletics.pfingstsportfest.de/countries 
jq . src/countries.json > src/countries_pretty.json
rm src/countries.json
mv src/countries_pretty.json src/countries.json