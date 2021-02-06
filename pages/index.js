/* Imports */
import { getForecasts} from "../lib/get-forecasts.js";
import Layout from "./layout.js";
import ReactMarkdown from "react-markdown";
import Fuse from "fuse.js";
import React, { useState, useEffect } from "react";
import Form from "../lib/form.js";
import { useRouter } from 'next/router'; // https://nextjs.org/docs/api-reference/next/router
import Dropdown from "../lib/dropdown.js";

/* Definitions */

// Search options for:
// https://github.com/krisk/Fuse/
const opts = {
  includeScore: true,
  keys: ["title", "platform", "stars"],
  ignoreLocation: true
};

// Helper functions 

export async function getStaticProps() { //getServerSideProps
  const { metaforecasts } = await getForecasts();
  return {
    props: {
      items: metaforecasts,
    },
  };
}

/*
export async function getServerSideProps(context) { //getServerSideProps
  const { metaforecasts } = await getForecasts();
  return {
    props: {
      items: metaforecasts,
      urlQuery: context.query
    },
  };
}
*/

let displayMarkdown = (description) => {
  if(description == null){
    return
  }else{
    description = description==null?"":description
      .replaceAll("] (", "](")
      .replaceAll(") )", "))")
      .replaceAll("( [", "([")
      .replaceAll(") ,", "),")
    if(description.length > 1000){
      return(
      <div className="font-mono text-xs">
        <ReactMarkdown>
            {description.slice(0,1000)+"..."}
        </ReactMarkdown>
      </div>)
    }else{
      return(
        <div className="font-mono text-xs">
          <ReactMarkdown>
              {description}
          </ReactMarkdown>
        </div>)
    }
  }
}

let displayNumForecasts = (forecasts) => {
  let forecastText = forecasts || "unknown"
  return ("Number of forecasts: " +forecastText)

}

let displayForecast = ({
  title,
  url,
  platform,
  description,
  binaryQuestion,
  percentage,
  forecasts,
  stars
}) => {
  if(binaryQuestion){
    return (
      <div key={title} className="pb-6 pt-3">
        <div className="text-blue-800">
          <a href={url} className="font-bold" target="_blank">
              {title}
          </a>
          {": "+percentage}
        </div>
        <div>
            {stars +" = "+ "(Platform: " + platform+") + ("+displayNumForecasts(forecasts)+")"}
        </div>
        {displayMarkdown(description)}
  
      </div>
    );
  }else{
    return (
      <div key={title} className="pb-6 pt-3">
        <div className="text-blue-800">
          <a href={url} className="font-bold">
              {title}
            </a>
          </div>
        <div>
        {stars +" = "+ "(Platform: " + platform+") + ("+displayNumForecasts(forecasts)+")"}
        </div>
        {displayMarkdown(description)}
  
      </div>
    );
  }
};

let displayForecasts = (results, settings) => {
  return results
    .slice(0, settings.numDisplay)
    .map((fuseSearchResult) =>
      displayForecast({ ...fuseSearchResult.item})
  )
}

let howmanystars = (string) => {
  let matches = string.match(/★/g);
  return matches?matches.length:0
}

export function getstars(numstars){
  let stars = "★★☆☆☆"
  switch(numstars) {
    case 0:
      stars ="☆☆☆☆☆"
      break;
    case 1:
      stars ="★☆☆☆☆"
      break;
    case 2:
      stars = "★★☆☆☆"
      break;
    case 3:
      stars = "★★★☆☆"
      break;
    case 4:
      stars = "★★★★☆"
      break;
    case 5:
      stars = "★★★★★"
      break;
    default:
      stars = "★★☆☆☆"
  }
  return(stars) 
}

/* Body */
export default function Home({ items}){ //, urlQuery }) {
  console.log("===============")
  console.log("New page render")
  
  /* States */
  const router = useRouter()
  let initialQueryParameters = ({
    query: "",
    processedUrlYet: false,
  })
  const [queryParameters, setQueryParameters] = useState(initialQueryParameters);
  let initialSettings = {
      query: "",
      numDisplay:  10, 
      timeoutId: null, 
      awaitEndTyping: 1000,
      shared: false, 
      time: Date.now(),

  }
  const [settings, setSettings] = useState(initialSettings);
  let initialResults =  [] 
  const [results, setResults] = useState(initialResults);
  
  let initialStars = {
    starsThreshold: 3,
    processedStarChangeYet: true
  }
  const [stars, setStars] = useState(initialStars)
  
  /* Functions which I want to have access to the Home namespace */
  // I don't want to create an "items" object for each search.
  let executeSearch = (query, starsThreshold) => {
    let results = []
    let itemsFilteredStars = items.filter(item => howmanystars(item.stars)>=starsThreshold)
    let fuse = new Fuse(itemsFilteredStars, opts);
    if(query != undefined){
      console.log("query", query)
      results = fuse.search(query)
        .map(
        result => {
          if(result.item.platform == "Elicit"){
            result.score = (result.score*2 + 0.1) // Higher scores are worse
          }
          return result
        }
      )
      results.sort((a,b) => {
        return (Number(a.score)>Number(b.score))?1:-1
      })
      console.log("Executing search")
      console.log("query", query)
      console.log("starsThreshold", starsThreshold)
      console.log(settings)
    }
    console.log(results)
    return results
  }
  
  /* State controllers */
  let onChangeForm = (queryParameters) => {
    setQueryParameters({...queryParameters, processedUrlYet:true});
    clearTimeout(settings.timeoutId)
    setResults([]);
    let newtimeoutId = setTimeout(async () => {
      let query = queryParameters.query
      let results = executeSearch(query, stars.starsThreshold) 
      setSettings({...settings, timeoutId: null}) 
      setResults(results);
      router.push(`?query=${query}&numDisplay=${settings.numDisplay}&starsThreshold=${stars.starsThreshold}`, undefined, { shallow: true })
    }, 500);
    setSettings({...settings, timeoutId: newtimeoutId})
  }
  
  let processState = (queryParameters, stars) => {
    // I am using the static version of netlify, because the server side one is too slow
    // This has the advantage that the data gets sent in the very first request, as the html
    // However, it has the disadvantage that it produces static webpages
    // In particular, parsing the url for parameters proves to be somewhat difficult
    // I do it by having a dummy state variable
    if(queryParameters.processedUrlYet == false){
      console.log("processState")
      let urlQuery = router.query
      console.log("query", urlQuery)  

      let queryParametersQuery = queryParameters.query      
      let starThresholdQuery = urlQuery?Number(urlQuery.starsThreshold):false
      if(starThresholdQuery){
          let starsThresholdQueryProcessed =  Number(starThresholdQuery)
          let starsThresholdQueryProcessed2 =  starsThresholdQueryProcessed>4?4:(starsThresholdQueryProcessed<1?1:starsThresholdQueryProcessed)
          console.log(starsThresholdQueryProcessed2)
          setStars({starsThreshold: starsThresholdQueryProcessed2, processedStarChangeYet: true})
      }
      
      let urlSearchQuery = urlQuery?urlQuery.query:""
      if(urlSearchQuery && !queryParametersQuery){
        setQueryParameters({...queryParameters, query: urlSearchQuery, processedUrlYet: true})
        let results = executeSearch(urlSearchQuery, starThresholdQuery || stars.starsThreshold)
        setResults(results)
      } 
      if(urlSearchQuery==""){
        if(router.asPath.includes('query')){
            setQueryParameters({...queryParameters,   processedUrlYet: true}) 
        }
      }
      let numDisplayQuery = urlQuery?Number(urlQuery.numDisplay):false
      if(numDisplayQuery){
          setSettings({...settings, numDisplay:numDisplayQuery})
      }
      console.log(queryParameters)
    }else if(!stars.processedStarChangeYet){  
      setStars({...stars,  
        processedStarChangeYet: true})
      let results = executeSearch(queryParameters.query, stars.starsThreshold)
      router.push(`?query=${queryParameters.query}&numDisplay=${settings.numDisplay}&starsThreshold=${stars.starsThreshold}`, undefined, { shallow: true })
      setResults(results)
    } else {
      // Do nothing
    }

  }
  
  /* Change the stars threshold */
  const starOptions = ["≥ ★☆☆☆☆", "≥ ★★☆☆☆", "≥ ★★★☆☆", "≥ ★★★★☆"]
  let onChangeStars = (selection) => {
    console.log("selection", selection)
    console.log("greater than or equal", howmanystars(selection))
    setStars({starsThreshold: howmanystars(selection), 
    processedStarChangeYet: false})
  }
  
  /* Final return */
  return (
    <Layout key="index">
      <div className="mb-5">  
        <h1 className="text-4xl text-gray-900 tracking-tight mb-2 text-center">
          Metaforecasts
        </h1>
      </div>
      <div className="invisible">{processState(queryParameters, stars)}
      </div>
      <label className="block mb-1">
        <Form
          values={queryParameters}
          onChange={onChangeForm}
        />
      </label>
      <div className="block mb-4 flex items-center justify-center border-none">
          <Dropdown
            options={starOptions}
            onChange={onChangeStars}
            name="dropdown"
            value={stars.starsThreshold}
            howmanystars={howmanystars}
        />
      </div>
      {displayForecasts(results, settings)}
      <span
          className="mr-1 cursor-pointer"
          onClick={() => {
            setSettings({...settings, numDisplay: settings.numDisplay*2})
          }}
          >
          {(results.length != 0 && settings.numDisplay < results.length) ? "Show more": ""}
      </span>

    </Layout>
  );
}
