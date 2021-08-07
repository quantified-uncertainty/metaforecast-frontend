
import algoliasearch from 'algoliasearch';

const client = algoliasearch('96UD3NTQ7L', '618dbd0092971388cfd43aac1ae5f1f5'); // Only search.
const index = client.initIndex('metaforecast');

let buildFilter = ({starsThreshold, filterByPlatforms, forecastsThreshold}) => {
  let starsFilter = starsThreshold ? `qualityindicators.stars >= ${starsThreshold}` : null
  let platformsFilter = filterByPlatforms ? filterByPlatforms.map(platform => `platform:"${platform}"`).join(" OR ") : null
  console.log(platformsFilter)
  // let numForecastsFilter = forecastsThreshold ? `has_numforecasts:true AND qualityindicators.numforecasts >= ${forecastsThreshold}` : null
  let numForecastsFilter = forecastsThreshold ? `qualityindicators.numforecasts >= ${forecastsThreshold}` : null
  let finalFilter = [starsFilter, platformsFilter, numForecastsFilter]
    .filter(f => f != null)
    .map(f => `( ${f} )`)
    .join(" AND ")
  console.log("searchWithAlgolia.js/searchWithAlgolia/buildFilter", finalFilter)
  return finalFilter
}

// only query string
export default function searchWithAlgolia({queryString, hitsPerPage, starsThreshold, filterByPlatforms, forecastsThreshold}){
  hitsPerPage = hitsPerPage || 5
  let results = index.search(queryString, {
    hitsPerPage,
    filters: buildFilter({starsThreshold, filterByPlatforms, forecastsThreshold}),
    getRankingInfo: true
  })
  console.log("searchWithAlgolia.js/searchWithAlgolia/callback", results)
  return results // this returns a promise.
  //.then(({ hits }) => {
  //  console.log("searchWithAlgolia.js/searchWithAlgolia/callback", hits.slice(0,5))
  // callback(hits)
  //}).catch(error => console.log(error));
}
// searchWithAlgolia({queryString: "Life"}, () => null)
// searchWithAlgolia({queryString: "Life", forecastsThreshold:100}, () => null)
// searchWithAlgolia({queryString: "Life", forecastsThreshold:100, starsThreshold: 4}, () => null)
// searchWithAlgolia({queryString: "Life", forecastsThreshold:100, starsThreshold: 3, filterByPlatforms: ["Metaculus", "PolyMarket"]}, () => null)