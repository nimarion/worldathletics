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
        }
        categoryName
      }
    }
  }
`;

export default ATHLETE_QUERY;
