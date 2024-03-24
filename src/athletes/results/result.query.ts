import { gql } from 'graphql-request';

const RESULTS_QUERY = gql`
  query Query($id: Int, $year: Int) {
    getSingleCompetitorResultsDiscipline(
      id: $id
      resultsByYearOrderBy: "discipline"
      resultsByYear: $year
    ) {
      resultsByEvent {
        disciplineCode
        discipline
        results {
          mark
          competition
          date
          country
          notLegal
          venue
          wind
          resultScore
          race
          place
          category
          eventId
          competitionId
        }
      }
    }
  }
`;

export default RESULTS_QUERY;
