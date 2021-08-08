/* Imports */

// React
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router"; // https://nextjs.org/docs/api-reference/next/router

// Utilities
// import Fuse from "fuse.js";
// import { getForecasts } from "../lib/worker/getForecasts.js"; // This throws an error if it's loader but not used.
import searchGuesstimate from "../lib/worker/searchGuesstimate.js";
import searchWithAlgolia from "../lib/worker/searchWithAlgolia.js";
import { displayForecastsWrapperForSearch } from "../lib/display/displayForecastsWrappers.js";
import { displayForecastsWrapperForEmbed } from "../lib/display/displayForecastsWrappers.js";

// Parts
import Layout from "./layout.js";
import Form from "../lib/display/form.js";
import { SliderElement } from "../lib/display/slider.js";
import MultiSelectPlatform from "../lib/display/multiSelectPlatforms.js";
import ButtonsForStars from "../lib/display/buttonsForStars.js";

/* Toggle options */
// For search
const search = ({
  pageName: "search",
  processDisplayOnSearchBegin: () => null,
  placeholder: "Find forecasts about...",
  displaySeeMoreHint: true,
  displayForecastsWrapper: displayForecastsWrapperForSearch
})

// For embed
const embed = ({
  pageName: "embed",
  processDisplayOnSearchBegin: () => false,
  placeholder: "Get best title match",
  displaySeeMoreHint: false,
  displayForecastsWrapper: displayForecastsWrapperForEmbed
})

/*
const pageName = "embed"
const processDisplayOnSearchBegin = () => false
const placeholder = "Get best title match"
const displaySeeMoreHint = false
const displayForecastsWrapper = displayForecastsWrapperForEmbed
*/

/* Definitions */

// Everything below is the same as in embed.js, 
// but I haven't figured out how I want to abstract it away yet

// Search options for Fuse
// https://github.com/krisk/Fuse/
const opts = {
  includeScore: true,
  keys: ["title", "platform", "author", "optionsstringforsearch"],
  ignoreLocation: true,
  //threshold: 0.4
};

/* Helper functions */
// Shuffle
let shuffleArray = (array) => {
  let newArray = array
  for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray
}

// URL slugs
let transformObjectIntoUrlSlug = (obj) => {
  let results = [];
  for (let key in obj) {
    if (typeof obj[key] == "number" || typeof obj[key] == "string") {
      results.push(`${key}=${obj[key]}`);
    } else if (key == "forecastingPlatforms") {
      let arr = obj[key].map((x) => x.value);
      let arrstring = arr.join("|");
      results.push(`${key}=${arrstring}`);
    }
  }
  let string = "?" + results.join("&");
  return string;
};

// Calculate last updated
// rather than checking it from the data; the data is now first fetched on search
// The principled way to do this might be to create a document in mongo
// with just the date of last update
let calculateLastUpdate = () => {
  let today = new Date().toISOString()
  let yesterdayObj = new Date(); 
  yesterdayObj.setDate(yesterdayObj.getDate() -1)
  let yesterday = yesterdayObj.toISOString()
  if(today.slice(11,16) > "02:00"){
    return today.slice(0,10)
  }else{
    return yesterday.slice(0,10)
  }
}


/* get Props */
export async function getStaticProps() {
  //getServerSideProps
  let items = []//await getForecasts();
  let lastUpdated = calculateLastUpdate() // metaforecasts.find(forecast => forecast.platform == "Good Judgment Open").timestamp
  // console.log(lastUpdated)
  //console.log("metaforecasts", metaforecasts)
  return {
    props: {
      items,
      lastUpdated
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

/* Body */
export default function Home({ items, lastUpdated }) {
  //, urlQuery }) {
  console.log("===============\nNew page render");

  /* States */
  const router = useRouter();
  let initialQueryParameters = {
    query: "",
    processedUrlYet: false,
    starsThreshold: 2,
    numDisplay: 21, // 20
    forecastsThreshold: 0,
    forecastingPlatforms: [
      // Excluding Elicit and Omen
      { value: "AstralCodexTen", label: "AstralCodexTen" },
      { value: 'Betfair', label: 'Betfair' },
      { value: "CoupCast", label: "CoupCast" },
      { value: "CSET-foretell", label: "CSET-foretell" },
      { value: "Estimize", label: "Estimize" },
      // { value: 'GiveWell', label: 'GiveWell' },
      { value: "FantasySCOTUS", label: "FantasySCOTUS" },
      { value: "Foretold", label: "Foretold" },
      { value: "Good Judgment", label: "Good Judgment" },
      { value: "Good Judgment Open", label: "Good Judgment Open" },
      { value: "Guesstimate", label: "Guesstimate" },
      { value: "Hypermind", label: "Hypermind" },
      { value: "Kalshi", label: "Kalshi" },
      { value: "Ladbrokes", label: "Ladbrokes" },
      { value: "Metaculus", label: "Metaculus" },
      { value: "PolyMarket", label: "PolyMarket" },
      { value: "PredictIt", label: "PredictIt" },
      { value: 'Rootclaim', label: 'Rootclaim' },
      { value: "Smarkets", label: "Smarkets" },
      { value: 'WilliamHill', label: 'WilliamHill' },
      { value: 'X-risk estimates', label: 'X-risk estimates' }
    ],
  };
  const [queryParameters, setQueryParameters] = useState(
    initialQueryParameters
  );
  let initialSearchSpeedSettings = {
    timeoutId: null,
    awaitEndTyping: 500,
    time: Date.now(),
  };
  const [searchSpeedSettings, setSearchSpeedSettings] = useState(initialSearchSpeedSettings);
  //let initialResults = []; // shuffleArray(items.filter(item => item.qualityindicators.stars >= 3)).slice(0,100).map(item => ({score: 0, item: item}))
  const [results, setResults] = useState([])//useState(initialResults);
  let [advancedOptions, showAdvancedOptions] = useState(false);
  let [embeddToggle, switchEmbedToggle] = useState("search")  // embed
  let [displayEmbed, setDisplayEmbed] = useState(false);

  /* Functions which I want to have access to the Home namespace */
  // I don't want to create an "items" object for each search.
  let  executeSearch = async (queryData) => {
    let query = queryData.query;
    let forecastsThreshold = queryData.forecastsThreshold;
    let starsThreshold = queryData.starsThreshold;
    let forecastingPlatforms = queryData.forecastingPlatforms.map(
      (x) => x.value
    );
    let results = []
    if (query != undefined && query != "") {
      if(forecastingPlatforms.includes("Guesstimate") && starsThreshold <= 1){
        let responses = await Promise.all([
          searchWithAlgolia({queryString: query, hitsPerPage: queryParameters.numDisplay + 50, starsThreshold, filterByPlatforms: forecastingPlatforms, forecastsThreshold}), 
          searchGuesstimate(query)
        ])
        let responsesNotGuesstimate = responses[0]
        let responsesGuesstimate  = responses[1]
        let resultsUnprocessed = [...responsesNotGuesstimate, ...responsesGuesstimate]
        //results.sort((x,y)=> x.ranking < y.ranking ? -1: 1)
        let resultsCompatibilityWithFuse = resultsUnprocessed.map(result => ({item: result, score:0}))
        results = resultsCompatibilityWithFuse
      }else{
        let response = await searchWithAlgolia({queryString: query, hitsPerPage: queryParameters.numDisplay +50, starsThreshold, filterByPlatforms: forecastingPlatforms, forecastsThreshold})
        let resultsCompatibilityWithFuse = response.map((result, index) => ({item: result, score:(0.5-1/(index+1))}))
        results = resultsCompatibilityWithFuse
      }
      
    }else{
      results = [] // redundant
    }

    console.log("Executing search");
    console.log("executeSearch/query", query);
    // console.log("executeSearch/items  ", itemsTotal);
    console.log("executeSearch/starsThreshold", starsThreshold);
    console.log("executeSearch/forecastsThreshold", forecastsThreshold);
    console.log("executeSearch/forecastingPlatforms", forecastingPlatforms);
    console.log("executeSearch/searchSpeedSettings", searchSpeedSettings);
    console.log("executeSearch/results", results);
    setResults(results)
  }
      /*, (results) => {
        
      searchGuesstimate(query).then((itemsGuesstimate) => {
        // We enter the first level of asynchronous hell.
        
        let itemsTotal = items.concat(itemsGuesstimate);

        let itemsFiltered = itemsTotal.filter(
          (item) =>
            item.qualityindicators.stars >= starsThreshold &&
            (item.qualityindicators.numforecasts >= forecastsThreshold ||
              forecastsThreshold == 0) &&
            forecastingPlatforms.includes(item.platform)
        );

        let fuse = new Fuse(itemsFiltered, opts);

        results = fuse.search(query)
        
        // Adjust for search quality
        // Elicit results are so bad but so numerous that I need to make an adjustment here.
        // (Higher scores are worse)
        results = results.map((result) => {
          result.score = result.item.platform == "Elicit" ? result.score * 2 + 0.1 : result.score 
          result.score = result.item.platform == "Guesstimate" ? result.score + 0.1 : result.score
          return result;
        });
        results.sort((a, b) => {
          return Number(a.score) > Number(b.score) ? 1 : -1;
        });
        
        // Catch stray exact matches
        let querylowercase = query.toLowerCase();
        let queriesSplit = querylowercase.split(" ")
        let queriesSplitlength = queriesSplit.length
        let resultsExactMatch = []
        let resultsPseudoExactMatchAND = []
        let resultsPseudoExactMatchOR = []
        let resultsNotExactMatch = []

        let exactMatchDetector = obj => obj.item.title.toLowerCase().includes(querylowercase)
        let pseudoExactMatchDetectorAND = obj => {
          if(queriesSplitlength <= 3){
            let results = queriesSplit.map(querySplit => obj.item.title.toLowerCase().includes(querySplit))
            return results.reduce((a,b) => a && b)
          }else{
            return []
          }
        }
        let pseudoExactMatchDetectorOR = obj => {
          if(queriesSplitlength < 3){
            let results = queriesSplit.map(querySplit => obj.item.title.toLowerCase().includes(querySplit))
            return results.reduce((a,b) => a || b)
          }else{
            return []
          }
        }

        if(queriesSplit[0] != querylowercase){
          for(let result of results){
            if(exactMatchDetector(result)){
              resultsExactMatch.push(result)
            }else if(pseudoExactMatchDetectorAND(result)){
              resultsPseudoExactMatchAND.push(result)
            }else if(pseudoExactMatchDetectorOR(result)){
              resultsPseudoExactMatchOR.push(result)
            }else{
              resultsNotExactMatch.push(result)
            }
          }
        }
        
        if(queriesSplit[0] == querylowercase){
          for(let result of results){
            if(exactMatchDetector(result)){
              resultsExactMatch.push(result)
            }else{
              resultsNotExactMatch.push(result)
            }
          }
        }

        // Sort exact matches by forecast quality, rather than by string match.
        let sortByStarsThenNumForecastsThenScore = (a, b) => {
          if (a.item.qualityindicators.stars != b.item.qualityindicators.stars) {
            return Number(a.item.qualityindicators.stars) < Number(b.item.qualityindicators.stars) ? 1 : -1;
          } else if (a.item.qualityindicators.numforecasts != b.item.qualityindicators.numforecasts) {
            return (Number(a.item.qualityindicators.numforecasts) || 20) <
              (Number(b.item.qualityindicators.numforecasts) || 20)
              ? 1
              : -1;
              // undefined number of forecasts => equivalent to 20 forecasts (not that many) for the purposes of sorting
          } else {
            return Number(a.score) > Number(b.score) ? 1 : -1;
          }
        }
        resultsExactMatch.sort(sortByStarsThenNumForecastsThenScore);                
        resultsPseudoExactMatchAND = resultsPseudoExactMatchAND.map(result => ({...result, score: result.score < 0.4 ? result.score : 0.39})) // Results with a score lower than 0.4 get shown in grey, but shouldn't in this case.
        resultsPseudoExactMatchAND.sort(sortByStarsThenNumForecastsThenScore)

        // Conclude
        results = [...resultsExactMatch, ...resultsPseudoExactMatchAND, ...resultsPseudoExactMatchOR, ...resultsNotExactMatch];
        

        console.log("Executing search");
        console.log("executeSearch/query", query);
        // console.log("executeSearch/items  ", itemsTotal);
        console.log("executeSearch/starsThreshold", starsThreshold);
        console.log("executeSearch/forecastsThreshold", forecastsThreshold);
        console.log("executeSearch/forecastingPlatforms", forecastingPlatforms);
        console.log("executeSearch/searchSpeedSettings", searchSpeedSettings);
        console.log("executeSearch/results", results);
        let newResultsCompatibilityWithFuse = results.map(result => ({item: result, score:0}))
        setResults(newResultsCompatibilityWithFuse);
      });
      
    //}else if(query == ""){
      //let randomResults = shuffleArray(items.filter(item => item.qualityindicators.stars >= 3)).slice(0,100).map(item => ({score: 0, item: item}))
      //setResults(randomResults);
    }else{
      setResults(results)
    
    }
  };
  */
  // I don't want display forecasts to change with a change in queryParameters, but I want it to have access to the queryParameters, in particular the numDisplay. Hence why this function lives inside Home.
  let getInfoToDisplayForecastsFunction = (displayForecastsFunction, {results, displayEmbed, setDisplayEmbed}) => {
    let numDisplayRounded =
      queryParameters.numDisplay % 3 != 0
        ? queryParameters.numDisplay +
          (3 - (Math.round(queryParameters.numDisplay) % 3))
        : queryParameters.numDisplay;
    console.log("numDisplay", queryParameters.numDisplay);
    console.log("numDisplayRounded", numDisplayRounded);
    return displayForecastsFunction({results, numDisplay: numDisplayRounded, displayEmbed, setDisplayEmbed});
  };

  /* State controllers */
  let onChangeSearchInputs = (newQueryParameters) => {
    setQueryParameters({ ...newQueryParameters, processedUrlYet: true });
    console.log("onChangeSearchInputs/newQueryParameters", newQueryParameters);
    setResults([]);
    setDisplayEmbed(embeddToggle == "search" ? search.processDisplayOnSearchBegin() : embed.processDisplayOnSearchBegin())
    clearTimeout(searchSpeedSettings.timeoutId);
    let newtimeoutId = setTimeout(async () => {
      console.log(
        "onChangeSearchInputs/timeout/newQueryParameters",
        newQueryParameters
      );
      let urlSlug = transformObjectIntoUrlSlug(newQueryParameters);
      router.push(urlSlug);
      executeSearch(newQueryParameters);
      setSearchSpeedSettings({ ...searchSpeedSettings, timeoutId: null });
    }, searchSpeedSettings.awaitEndTyping);
    setSearchSpeedSettings({ ...searchSpeedSettings, timeoutId: newtimeoutId });
  };

  let processState = (queryParameters) => {
    // I am using the static version of netlify, because the server side one is too slow
    // (see getServerSideProps vs getStaticProps under helper functions)
    // This has the advantage that the data gets sent in the very first request, as the html
    // However, it has the disadvantage that it produces static webpages
    // In particular, parsing the url for parameters proves to be somewhat difficult
    // I do it by having a state variable
    // Maybe doable with useEffect?
    // Process the URL on initial page load
    if (queryParameters.processedUrlYet == false) {
      let urlQuery = router.query;
      console.log("processState/queryParameters", queryParameters);
      console.log("processState/query", urlQuery);

      if (!(urlQuery && Object.keys(urlQuery).length === 0)) {
        let initialQuery = queryParameters;
        let newQuery = { ...initialQuery, ...urlQuery, processedUrlYet: true };
        if (!Array.isArray(newQuery.forecastingPlatforms)) {
          let forecastingPlatformsAsArray = newQuery.forecastingPlatforms.split(
            "|"
          );
          let forecastingPlatformsAsObject = forecastingPlatformsAsArray.map(
            (x) => ({ value: x, label: x })
          );
          newQuery.forecastingPlatforms = forecastingPlatformsAsObject;
        }
        setQueryParameters(newQuery);
        executeSearch(newQuery);
      }
    } else {
      // Do nothing
    }
  };

  /* Change the stars threshold */
  // const starOptions = ["≥ ★☆☆☆☆", "≥ ★★☆☆☆", "≥ ★★★☆☆", "≥ ★★★★☆"];
  let onChangeStars = (value) => {
    console.log("onChangeStars/buttons", value);
    let newQueryParameters = { ...queryParameters, starsThreshold: value };
    onChangeSearchInputs(newQueryParameters);
  };

  /* Change the number of elements to display  */
  let displayFunctionNumDisplaySlider = (value) => {
    return Math.round(value) != 1
      ? "Show " + Math.round(value) + " results"
      : "Show " + Math.round(value) + " result";
  };
  let onChangeSliderForNumDisplay = (event) => {
    console.log("onChangeSliderForNumDisplay", event[0]);
    let newQueryParameters = {
      ...queryParameters,
      numDisplay: Math.round(event[0]),
    };
    onChangeSearchInputs(newQueryParameters); // Slightly inefficient because it recomputes the search in time, but it makes my logic easier.
  };

  /* Change the forecast threshold */
  let displayFunctionNumForecasts = (value) => {
    return "# Forecasts > " + Math.round(value);
  };
  let onChangeSliderForNumForecasts = (event) => {
    console.log("onChangeSliderForNumForecasts", event[0]);
    let newQueryParameters = {
      ...queryParameters,
      forecastsThreshold: Math.round(event[0]),
    };
    onChangeSearchInputs(newQueryParameters);
  };

  /* Change on the search bar */
  let onChangeSearchBar = (value) => {
    console.log("onChangeSearchBar/New query:", value);
    let newQueryParameters = { ...queryParameters, query: value };
    onChangeSearchInputs(newQueryParameters);
  };

  /*Change selected platforms */
  let onChangeSelectedPlatforms = (value) => {
    console.log("onChangeSelectedPlatforms/Change in platforms:", value);
    let newQueryParameters = {
      ...queryParameters,
      forecastingPlatforms: value,
    };
    onChangeSearchInputs(newQueryParameters);
  };

  /* Final return */
  return (
    <Layout key="index" page={embeddToggle == "search" ? search.pageName : embed.pageName} lastUpdated={lastUpdated} embeddToggle={embeddToggle} switchEmbedToggle={switchEmbedToggle}>
      <div className="invisible">{processState(queryParameters)}</div>

      <label className="mb-4 mt-4 flex flex-row justify-center items-center">
        <div className="w-10/12 mb-2">
          <Form value={queryParameters.query} onChange={onChangeSearchBar} placeholder={embeddToggle == "search" ? search.placeholder : embed.placeholder}/>
        </div>
        <div className="w-2/12 flex justify-center ml-4 md:ml-2 lg:ml-0">
          <button
            className="text-gray-500 text-sm mb-2"
            onClick={() => showAdvancedOptions(!advancedOptions)}
          >
            Advanced options ▼
          </button>
        </div>
      </label>

      {/*<div className="flex flex-col mx-auto justify-center items-center">*/}
        <div
          className={`flex-1 flex-col mx-auto justify-center items-center w-full ${
            advancedOptions ? "" : "hidden"
          }`}
        >
          <div className="grid sm:grid-rows-4 sm:grid-cols-1 md:grid-rows-2 lg:grid-rows-2 grid-cols-1 md:grid-cols-3 lg:grid-cols-3 items-center content-center bg-gray-50 rounded-md px-8 pt-4 pb-1 shadow mb-4">
            <div className="flex row-start-1 row-end-1  col-start-1 col-end-4 md:row-span-1 md:col-start-1 md:col-end-1 md:row-start-1 md:row-end-1 lg:row-span-1 lg:col-start-1 lg:col-end-1 lg:row-start-1 lg:row-end-1 items-center justify-center mb-4">
              <SliderElement
                className="flex items-center justify-center"
                onChange={onChangeSliderForNumForecasts}
                value={queryParameters.forecastsThreshold}
                displayFunction={displayFunctionNumForecasts}
              />
            </div>
            <div className="flex row-start-2 row-end-2  col-start-1 col-end-4 md:row-start-1 md:row-end-1 md:col-start-2 md:col-end-2 lg:row-start-1 lg:row-end-1 lg:col-start-2 md:col-end-2 items-center justify-center mb-4">
              <ButtonsForStars
                onChange={onChangeStars}
                value={queryParameters.starsThreshold}
              />
            </div>
            <div className="flex row-start-3 row-end-3  col-start-1 col-end-4 md:col-start-3 md:col-end-3 md:row-start-1 md:row-end-1 lg:col-start-3 lg:col-end-3 lg:row-start-1 lg:row-end-1 items-center justify-center mb-4">
              <SliderElement
                value={queryParameters.numDisplay}
                onChange={onChangeSliderForNumDisplay}
                displayFunction={displayFunctionNumDisplaySlider}
              />
            </div>
            <div className="flex col-span-3 items-center justify-center">
              <MultiSelectPlatform
                value={queryParameters.forecastingPlatforms}
                onChange={onChangeSelectedPlatforms}
              />
            </div>
          </div>
        </div>
      {/*</div>*/}
      
      <div className={embeddToggle == "search" ? "" : "hidden"}> 
        {getInfoToDisplayForecastsFunction((search.displayForecastsWrapper), {results, displayEmbed, setDisplayEmbed})}
      </div>
      <div className={embeddToggle == "embed" ? "" : "hidden"}> 
        {getInfoToDisplayForecastsFunction((embed.displayForecastsWrapper), {results, displayEmbed, setDisplayEmbed})}
      </div>

      <div className={`${(embeddToggle == "search" ? search.displaySeeMoreHint : embed.displaySeeMoreHint) ? "" : "hidden"/*Fairly barroque, but keeps to the overall toggle-based scheme */}`}>
        <p className ={`mt-4 mb-4 ${results.length != 0 && queryParameters.numDisplay < results.length? "": "hidden"}`}>
          {"Can't find what you were looking for? "}
          <span
            className="cursor-pointer text-blue-800"
            onClick={() => {
            setQueryParameters({ ...queryParameters, numDisplay: queryParameters.numDisplay * 2 });
            }}
          >
            {"Show more,"}
          </span>
          {" or "}
          <a href="https://www.metaculus.com/questions/create/" className="cursor-pointer text-blue-800 no-underline" target="_blank" >suggest a question on Metaculus</a> 
        </p>
      </div>
      <br></br>
    </Layout>
  );
}