# worldathletics

The project provides a standardized method for fetching athlete and competition data from worldathletics. The server applies schema validation, value conversion and error handling for all fields retrieved from the worldathletics backend.

## Features

- Fetch athlete
  - Firstname
  - Lastname
  - Country
  - Birthdate
  - Seasonbest/Personalbest
    - date
    - discipline -> 100 Metres, 400 Metres Hurdles
    - disciplineCode -> 100,400H
    - mark
    - venue
    - indoor
    - legal
  - World Ranking
    - eventGroup -> Men's Pole Vault, Men's Overall Ranking
    - place
  - Honours per category
    - date
    - discipline
    - disciplineCode
    - mark
    - venue
    - indoor
    - competition
    - place

- Fetch disciplines
  - discipline
  - disciplineCode

- Fetch countries
  - areaCode -> ASI,AFR,OCE,EUR,...
  - areaName -> Asia,Europe,Oceania,...
  - id       -> GER,FRA
  - countryName -> Germany, France


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

