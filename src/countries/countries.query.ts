import { gql } from 'graphql-request';

export const COUNTRIES_QUERY = gql`
  query getCountries {
    getCountries {
      areaCode
      areaName
      id
      isValid
      countryName
    }
  }
`;
