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
        indoor
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
        }
      }
    }
  }
`;

export default RESULTS_QUERY;
