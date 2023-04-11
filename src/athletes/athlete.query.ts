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
          indoor
          notLegal
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
          indoor
          notLegal
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
          indoor
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
