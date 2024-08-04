# worldathletics

The project provides a standardized method for fetching athlete and competition data from worldathletics. The service applies schema validation, value conversion and error handling for all fields retrieved from the worldathletics backend.

[![Swagger](https://img.shields.io/badge/-Swagger-%23Clojure?style=for-the-badge&logo=swagger&logoColor=white)](https://worldathletics.nimarion.de/swagger)

## Data

- Athlete Profile including nation,dob,sb,pb, honours,records, world ranking
- All athletes results per year or all
- Athlete representatives (Name, Phone, Email)
- Discipline Codes (Discipline Name, Discipline Code)
- Country (Country Code, Country Name, Area Code, Area Name)
- Competition results
- Competition details
- All Worldrecords,Arearecords,Worldleads,Arealeads,Olympicrecords,Championshiprecords,...
  
For field events the service converts the results to centimeters and milliseconds for track events. Athletes seasonbests results older than 12 months are filtered out. The search endpoint /athletes/search?name adds a field with the calculated levenshtein distance between the search query and the results. Results are sorted by the levenshtein distance. 

## Built with 

- [NestJS](https://nestjs.com/)
- [Zod](https://zod.dev/)
- [Graphql Request](https://github.com/jasonkuhrt/graphql-request)
- [WorldAthletics Key Updater](https://github.com/nimarion/worldathletics_key_updater)


<a href="https://stellate.co/?ref=powered-by">
  <img
    src="https://stellate.co/badge.svg"
    alt="Powered by Stellate, the GraphQL API Management platform"
  />
</a>

