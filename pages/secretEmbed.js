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
import { displayForecastsWrapperForCapture } from "../lib/display/displayForecastsWrappers.js";
import { displayForecastsWrapperForSecretEmbed } from "../lib/display/displayForecastsWrappers.js";

// Parts
import Layout from "./layout.js";
import Form from "../lib/display/form.js";
import { SliderElement } from "../lib/display/slider.js";
import MultiSelectPlatform from "../lib/display/multiSelectPlatforms.js";
import ButtonsForStars from "../lib/display/buttonsForStars.js";

/* Definitions */

// Toggle options
// For search
const search = ({
  pageName: "search",
  processDisplayOnSearchBegin: () => null,
  placeholder: "Find forecasts about...",
  displaySeeMoreHint: true,
  displayForecastsWrapper: displayForecastsWrapperForSearch
})

// For capture
const capture = ({
  pageName: "capture",
  processDisplayOnSearchBegin: () => false,
  placeholder: "Get best title match",
  displaySeeMoreHint: false,
  displayForecastsWrapper: displayForecastsWrapperForCapture
})
// For secret embed
const secretEmbed = ({
  displayForecastsWrapper: displayForecastsWrapperForSecretEmbed
})

/*
const pageName = "capture"
const processDisplayOnSearchBegin = () => false
const placeholder = "Get best title match"
const displaySeeMoreHint = false
const displayForecastsWrapper = displayForecastsWrapperForCapture
*/

// Search options for Fuse (no longer needed)
// https://github.com/krisk/Fuse/
const opts = {
  includeScore: true,
  keys: ["title", "platform", "author", "optionsstringforsearch"],
  ignoreLocation: true,
  //threshold: 0.4
};

// Default parameters to not push to url (because they are default)
const defaultTrailingUrl="&starsThreshold=2&numDisplay=21&forecastsThreshold=0&forecastingPlatforms=AstralCodexTen|Betfair|CoupCast|CSET-foretell|Estimize|FantasySCOTUS|Foretold|Good Judgment|Good Judgment Open|Guesstimate|Hypermind|Kalshi|Ladbrokes|Metaculus|PolyMarket|PredictIt|Rootclaim|Smarkets|WilliamHill|X-risk estimates"

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

let decreaseUntil0 = (num) => ((num-1) > 0) ? (num -1) : 0

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
      { value: "Manifold Markets", label: "Manifold Markets" },
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
  let [captureToggle, switchCaptureToggle] = useState("capture")  // capture
  let [displayCapture, setDisplayCapture] = useState(false);
  let [whichToDisplayCapture, setWhichToDisplayCapture] = useState(0);

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
        let resultsCompatibilityWithFuse = response.map((result, index) => ({item: result, score:0.4-(0.4/(index+1))}))
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
  
  // I don't want display forecasts to change with a change in queryParameters, but I want it to have access to the queryParameters, in particular the numDisplay. Hence why this function lives inside Home.
  let getInfoToDisplayForecastsFunction = (displayForecastsFunction, {results, displayCapture, setDisplayCapture, whichToDisplayCapture}) => {
    let numDisplayRounded =
      queryParameters.numDisplay % 3 != 0
        ? queryParameters.numDisplay +
          (3 - (Math.round(queryParameters.numDisplay) % 3))
        : queryParameters.numDisplay;
    console.log("numDisplay", queryParameters.numDisplay);
    console.log("numDisplayRounded", numDisplayRounded);
    let result=results[0]
    return displayForecastsFunction({results, numDisplay: numDisplayRounded, displayCapture, setDisplayCapture, whichToDisplayCapture});
  };

  /* State controllers */
  let onChangeSearchInputs = (newQueryParameters) => {
    setQueryParameters({ ...newQueryParameters, processedUrlYet: true });
    console.log("onChangeSearchInputs/newQueryParameters", newQueryParameters);
    setResults([]);
    setDisplayCapture(captureToggle == "search" ? search.processDisplayOnSearchBegin() : capture.processDisplayOnSearchBegin())
    clearTimeout(searchSpeedSettings.timeoutId);
    let newtimeoutId = setTimeout(async () => {
      console.log(
        "onChangeSearchInputs/timeout/newQueryParameters",
        newQueryParameters
      );
      let urlSlug = transformObjectIntoUrlSlug(newQueryParameters);
      let urlWithoutDefaultParameters=urlSlug.replace(defaultTrailingUrl, "")
      router.push(urlWithoutDefaultParameters);
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


  /* Change on the search bar */
  let onChangeSearchBar = (value) => {
    console.log("onChangeSearchBar/New query:", value);
    let newQueryParameters = { ...queryParameters, query: value };
    onChangeSearchInputs(newQueryParameters);
  };

  /* Final return */
  return (   <>
  <div className="invisible">{processState(queryParameters)}</div>

  <div className="mb-4 mt-8 flex flex-row justify-center items-center ">
    <div className="w-6/12 place-self-center"> 
      {getInfoToDisplayForecastsFunction((secretEmbed.displayForecastsWrapper), {results, displayCapture, setDisplayCapture, whichToDisplayCapture})}
    </div>
  </div>
  </>
);
}