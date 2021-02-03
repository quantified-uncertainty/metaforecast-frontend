import { GraphQLClient } from "graphql-request";
// import { request } from 'graphql-request'

const graphcms = new GraphQLClient(
  "https://api.baseql.com/airtable/graphql/apptDvDsHzSDEDARC"
);

export async function getForecasts() {
  return await graphcms.request(
    `
        query {
            metaforecasts{
              id
              title
              url
              platform
              binaryQuestion
              percentage
              forecasts
              description
            }
          }`
  );
}

