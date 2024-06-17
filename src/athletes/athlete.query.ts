import { gql } from 'graphql-request';

export const ATHLETE_SEARCH_QUERY = gql`
  query SearchCompetitors($name: String) {
    searchCompetitors(query: $name) {
      aaAthleteId
      familyName
      givenName
      birthDate
      disciplines
      gender
      country
    }
  }
`;

export const ATHLETE_QUERY = gql`
  query Query($id: Int) {
    getSingleCompetitor(id: $id) {
      basicData {
        familyName
        givenName
        birthDate
        countryCode
        sexNameUrlSlug
      }
      athleteRepresentative {
        _id
      }
      seasonsBests {
        results {
          discipline
          disciplineCode
          date
          mark
          venue
          notLegal
          resultScore
          wind
          records
          eventId
          competitionId
        }
        activeSeasons
      }
      personalBests {
        results {
          discipline
          disciplineCode
          date
          mark
          venue
          notLegal
          resultScore
          wind
          records
          eventId
          competitionId
        }
      }
      worldRankings {
        current {
          eventGroup
          place
        }
        best {
          place
          eventGroup
        }
      }
      honours {
        results {
          place
          disciplineCode
          discipline
          competition
          venue
          mark
          date
          eventId
          competitionId
        }
        categoryName
      }
    }
  }
`;

export default ATHLETE_QUERY;
