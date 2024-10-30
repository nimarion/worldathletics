import { gql } from 'graphql-request';

export const DISCIPLINES_QUERY = gql`
  query getDisciplines {
    getMetaData(types: disciplineCodes) {
      disciplineCodes {
        name
        code
      }
    }
  }
`;
