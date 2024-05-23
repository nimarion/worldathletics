import { gql } from 'graphql-request';

const ATHLETE_QUERY = gql`
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
        name
        email
        mobile
        telephone
        email
        countryCode
        countryName
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
