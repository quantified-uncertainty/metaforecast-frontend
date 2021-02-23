import { GraphQLClient } from "graphql-request";
import axios from "axios"
// import { request } from 'graphql-request'

const graphcms = new GraphQLClient(
  "https://api.baseql.com/airtable/graphql/apptDvDsHzSDEDARC"
);

export async function getForecasts0() {
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
              stars
            }
          }`
  );
}

export async function getForecasts() {
  const { data } = await axios.get("https://raw.githubusercontent.com/QURIresearch/metaforecasts/master/data/metaforecasts.json") // this is, for now, a hack
  //console.log(data)
  return data
}
