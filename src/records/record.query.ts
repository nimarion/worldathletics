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
          urlSlug
          iaafId
          hasProfile
          id
          teamMembers {
            name
            country
            birthDate
            urlSlug
            iaafId
            hasProfile
            id
          }
        }
        discipline
        date
        performance
        typeNameUrlSlug
        venue
        wind
        disciplineNameUrlSlug
        progressionListId
        pending
        equal
        womenOnly
        mixed
        yard
        setIndoor
      }
    }
  }
`;
