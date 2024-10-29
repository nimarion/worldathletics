import { gql } from 'graphql-request';

export const COMPETITION_ORGANISER = gql`
  query getCompetitionOrganiserInfo($competitionId: Int!) {
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

export const COMPETITION_CALENDAR = gql`
  query getCalendarEvents(
    $startDate: String
    $endDate: String
    $query: String
    $regionType: String
    $regionId: Int
    $currentSeason: Boolean
    $disciplineId: Int
    $rankingCategoryId: Int
    $permitLevelId: Int
    $competitionGroupId: Int
    $competitionSubgroupId: Int
    $competitionGroupSlug: String
    $limit: Int
    $offset: Int
    $showOptionsWithNoHits: Boolean
    $hideCompetitionsWithNoResults: Boolean
    $orderDirection: OrderDirectionEnum
  ) {
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
  }
`;

export const COMPETITION_CALENDAR_OPTIONS = gql`
  query getCalendarEvents(
    $startDate: String
    $endDate: String
    $query: String
    $regionType: String
    $regionId: Int
    $currentSeason: Boolean
    $disciplineId: Int
    $rankingCategoryId: Int
    $permitLevelId: Int
    $competitionGroupId: Int
    $competitionSubgroupId: Int
    $competitionGroupSlug: String
    $limit: Int
    $offset: Int
    $showOptionsWithNoHits: Boolean
    $hideCompetitionsWithNoResults: Boolean
    $orderDirection: OrderDirectionEnum
  ) {
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
  }
`;

export const COMPETITON_RESULTS = gql`
  query getCalendarCompetitionResults(
    $competitionId: Int
    $day: Int
    $eventId: Int
  ) {
    getCalendarCompetitionResults(
      competitionId: $competitionId
      day: $day
      eventId: $eventId
    ) {
      eventTitles {
        rankingCategory
        eventTitle
        events {
          event
          eventId
          gender
          isRelay
          perResultWind
          withWind
          summary {
            competitor {
              teamMembers {
                id
                name
                iaafId
                urlSlug
              }
              id
              name
              iaafId
              urlSlug
              birthDate
              __typename
            }
            mark
            nationality
            placeInRace
            placeInRound
            points
            raceNumber
            records
            wind
          }
          races {
            date
            day
            race
            raceId
            raceNumber
            results {
              competitor {
                teamMembers {
                  id
                  name
                  iaafId
                  urlSlug
                }
                id
                name
                iaafId
                urlSlug
                birthDate
                hasProfile
              }
              mark
              nationality
              place
              points
              qualified
              records
              wind
              remark
              details {
                event
                eventId
                raceNumber
                mark
                wind
                placeInRound
                placeInRace
                points
                overallPoints
                placeInRoundByPoints
                overallPlaceByPoints
              }
            }
            startList {
              competitor {
                birthDate
                country
                id
                name
                urlSlug
              }
              order
              pb
              sb
              bib
            }
            wind
          }
        }
      }
      options {
        days {
          date
          day
        }
        events {
          gender
          id
          name
          combined
        }
      }
    }
  }
`;
