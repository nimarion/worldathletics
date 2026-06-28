import { gql } from 'graphql-request';

export const ATHLETE_REPRESENTATIVE_QUERY = gql`
  query getAthleteRepresentativeProfile($id: Int) {
    getAthleteRepresentativeProfile(athleteRepresentativeId: $id) {
      athleteRepresentativeId
      countryCode
      instagram
      telephone
      facebook
      website
      youtube
      firstName
      mobile
      lastName
      email
    }
  }
`;

export const ATHLETE_REPRESENTATIVES_QUERY = gql`
  query getAthleteRepresentativeDirectory {
    getAthleteRepresentativeDirectory {
      athleteRepresentativeId
      countryCode
      firstName
      lastName
    }
  }
`;

export const REPRESENTED_ATHLETES_QUERY = gql`
  query getAthleteRepresentativeAthletes($id: Int) {
    getAthleteRepresentativeProfile(athleteRepresentativeId: $id) {
      toplist {
        athletes {
          athleteId
          firstName
          lastName
          countryCode
          birthdate
          gender
        }
      }
    }
  }
`;

