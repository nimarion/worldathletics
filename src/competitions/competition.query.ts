import { gql } from 'graphql-request';

export const COMPETITION_ORGANISER = gql`
  query GetCompetitionOrganiserInfo($competitionId: Int!) {
    getCompetitionOrganiserInfo(competitionId: $competitionId) {
      liveStreamingUrl
      resultsPageUrl
      websiteUrl
      additionalInfo
      units {
        events
        gender
      }
      prizeMoney {
        gender
        prizes
      }
      contactPersons {
        email
        name
        phoneNumber
        title
      }
    }
  }
`;
