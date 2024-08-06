import { gql } from 'graphql-request';

export const RECORD_QUERY = gql`
  query getRecordsDetailByCategory($categoryId: Int!) {
    getRecordsDetailByCategory(categoryId: $categoryId) {
      gender
      results {
        country
        competitor {
          name
          country
          birthDate
          id
          teamMembers {
            name
            country
            birthDate
            id
          }
        }
        discipline
        date
        performance
        venue
        wind
        pending
        equal
        mixed
      }
    }
  }
`;
