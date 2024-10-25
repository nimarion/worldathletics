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

export const COMPETITION_CALENDAR = gql`query getCalendarEvents($startDate: String, $endDate: String, $query: String, $regionType: String, $regionId: Int, $currentSeason: Boolean, $disciplineId: Int, $rankingCategoryId: Int, $permitLevelId: Int, $competitionGroupId: Int, $competitionSubgroupId: Int, $competitionGroupSlug: String, $limit: Int, $offset: Int, $showOptionsWithNoHits: Boolean, $hideCompetitionsWithNoResults: Boolean, $orderDirection: OrderDirectionEnum) {
  getCalendarEvents(
    startDate: $startDate
    endDate: $endDate
    query: $query
    regionType: $regionType
    regionId: $regionId
    currentSeason: $currentSeason
    disciplineId: $disciplineId
    rankingCategoryId: $rankingCategoryId
    permitLevelId: $permitLevelId
    competitionGroupId: $competitionGroupId
    competitionSubgroupId: $competitionSubgroupId
    competitionGroupSlug: $competitionGroupSlug
    limit: $limit
    offset: $offset
    showOptionsWithNoHits: $showOptionsWithNoHits
    hideCompetitionsWithNoResults: $hideCompetitionsWithNoResults
    orderDirection: $orderDirection
  ) {
    results {
      id
      hasResults
      hasApiResults
      hasStartlist
      name
      venue
      area
      rankingCategory
      disciplines
      startDate
      endDate
      competitionGroup
      competitionSubgroup
      dateRange
      hasCompetitionInformation
    }
  }
}`;

export const COMPETITION_CALENDAR_OPTIONS = gql`query getCalendarEvents($startDate: String, $endDate: String, $query: String, $regionType: String, $regionId: Int, $currentSeason: Boolean, $disciplineId: Int, $rankingCategoryId: Int, $permitLevelId: Int, $competitionGroupId: Int, $competitionSubgroupId: Int, $competitionGroupSlug: String, $limit: Int, $offset: Int, $showOptionsWithNoHits: Boolean, $hideCompetitionsWithNoResults: Boolean, $orderDirection: OrderDirectionEnum) {
  getCalendarEvents(
    startDate: $startDate
    endDate: $endDate
    query: $query
    regionType: $regionType
    regionId: $regionId
    currentSeason: $currentSeason
    disciplineId: $disciplineId
    rankingCategoryId: $rankingCategoryId
    permitLevelId: $permitLevelId
    competitionGroupId: $competitionGroupId
    competitionSubgroupId: $competitionSubgroupId
    competitionGroupSlug: $competitionGroupSlug
    limit: $limit
    offset: $offset
    showOptionsWithNoHits: $showOptionsWithNoHits
    hideCompetitionsWithNoResults: $hideCompetitionsWithNoResults
    orderDirection: $orderDirection
  ) {
    options {
      regions {
        world {
          id
          name
          count
        }
        area {
          id
          name
          count
        }
        country {
          id
          name
          count
        }
        __typename
      }
      disciplines {
        id
        name
        count
      }
      rankingCategories {
        id
        name
        count
      }
      disciplines {
        id
        name
        count
      }
      permitLevels {
        id
        name
        count
      }
      competitionGroups {
        id
        name
        count
      }
      competitionSubgroups {
        id
        name
        count
      }
    }
  }
}`;