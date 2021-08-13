
import algoliasearch from 'algoliasearch';

const client = algoliasearch('96UD3NTQ7L', '618dbd0092971388cfd43aac1ae5f1f5'); // Only search.
const index = client.initIndex('metaforecast');

let buildFilter = ({starsThreshold, filterByPlatforms, forecastsThreshold}) => {
  let starsFilter = starsThreshold ? `qualityindicators.stars >= ${starsThreshold}` : null
  let platformsFilter = filterByPlatforms ? filterByPlatforms.map(platform => `platform:"${platform}"`).join(" OR ") : null
  console.log(platformsFilter)
  // let numForecastsFilter = forecastsThreshold ? `has_numforecasts:true AND qualityindicators.numforecasts >= ${forecastsThreshold}` : null
  let numForecastsFilter = forecastsThreshold > 0 ? `qualityindicators.numforecasts >= ${forecastsThreshold}` : null
  let finalFilter = [starsFilter, platformsFilter, numForecastsFilter]
    .filter(f => f != null)
    .map(f => `( ${f} )`)
    .join(" AND ")
  console.log("searchWithAlgolia.js/searchWithAlgolia/buildFilter", finalFilter)
  return finalFilter
}

let buildFacetFilter = ({filterByPlatforms}) => {
  let platformsFilter = []
  if(filterByPlatforms.length > 0){
     platformsFilter = [ [filterByPlatforms.map(platform => `platform:${platform}`) ]]
  }
  console.log(platformsFilter)
  console.log("searchWithAlgolia.js/searchWithAlgolia/buildFacetFilter", platformsFilter)
  return platformsFilter
}


let normalizeArray = (array) => {
  if(array.length == 0){ return [] }
  let mean = array.reduce((a, b) => a + b) / array.length
  let sd = Math.sqrt(array.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b))
  let normalizedArray = array.map(result => (result - sd)/mean)
  return normalizedArray
}

let noExactMatch = (queryString, result) => {
  return !(result.title.includes(queryString) || result.description.includes(queryString) || result.optionsstringforsearch.includes(queryString))
}

// only query string
export default async function searchWithAlgolia({queryString, hitsPerPage, starsThreshold, filterByPlatforms, forecastsThreshold}){
  hitsPerPage = hitsPerPage || 5
  let response = await index.search(queryString, {
    hitsPerPage,
    filters: buildFilter({starsThreshold, forecastsThreshold, filterByPlatforms}),
    //facetFilters: buildFacetFilter({filterByPlatforms}),
    getRankingInfo: true
  })
  let results = response.hits  
  console.log("searchWithAlgolia.js/searchWithAlgolia/queryString", queryString)
  console.log("searchWithAlgolia.js/searchWithAlgolia/results", results)

  if(results.length == 0){
    results = [{
      "title": "No search results match your query",
      "url": "https://metaforecast.org",
      "platform": "Metaforecast",
      "description": "Maybe try a broader query?",
      "options": [
        {
          "name": "Yes",
          "probability": 0.995,
          "type": "PROBABILITY"
        },
        {
          "name": "No",
          "probability": 0.005,
          "type": "PROBABILITY"
        }
      ],
      "timestamp": `${new Date().toISOString().slice(0,10)}`,
      "qualityindicators": {
        "numforecasts": 1,
        "numforecasters": 1,
        "stars": 5
      },
      "optionsstringforsearch": "Yes, No",
      "has_numforecasts": true,
    }]
  }else if(queryString.split(" ").length == 1 && noExactMatch(queryString, results[0])){
    results.unshift(
      {
        "title": "No search results appear to match your query",
        "url": "https://metaforecast.org",
        "platform": "Metaforecast",
        "description": "Maybe try a broader query? That said, we could be wrong, so here are some results.",
        "options": [
          {
            "name": "Yes",
            "probability": 0.65,
            "type": "PROBABILITY"
          },
          {
            "name": "No",
            "probability": 0.35,
            "type": "PROBABILITY"
          }
        ],
        "timestamp": `${new Date().toISOString().slice(0,10)}`,
        "qualityindicators": {
          "numforecasts": 1,
          "numforecasters": 1,
          "stars": 1
        },
        "optionsstringforsearch": "Yes, No",
        "has_numforecasts": true,
      }
    )
  }

  return results

  /*
  let points = results.map(result => result._rankingInfo.userScore)
  let pointsNormalized = normalizeArray(points)
  let stars  = results.map(result => result.qualityindicators.stars)
  let starsNormalized = normalizeArray(stars)

  console.log(pointsNormalized)
  console.log(starsNormalized)

  let resultsWithPoints = results
    .map((result, index) => ({...result, points: pointsNormalized[index], ranking: index}))

  return resultsWithPoints

  //resultsWithPoints.sort((a, b) => (a.points > b.points ? -1 : 1) )//(a.stars == b.stars) ? (a.points > b.points ? -1 : 1) : (a.stars > b.stars) ? -1 : 1)
  let resultsRanked = resultsWithPoints.map((result, index) => ({...result, ranking: index}))

  return resulresultstsRanked // this returns a promise.
  //.then(({ hits }) => {
  //  console.log("searchWithAlgolia.js/searchWithAlgolia/callback", hits.slice(0,5))
  // callback(hits)
  //}).catch(error => console.log(error));
  */
}
// searchWithAlgolia({queryString: "Life"}, () => null)
// searchWithAlgolia({queryString: "Life", forecastsThreshold:100}, () => null)
// searchWithAlgolia({queryString: "Life", forecastsThreshold:100, starsThreshold: 4}, () => null)
// searchWithAlgolia({queryString: "Life", forecastsThreshold:100, starsThreshold: 3, filterByPlatforms: ["Metaculus", "PolyMarket"]}, () => null)