/* Imports */

// React
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router"; // https://nextjs.org/docs/api-reference/next/router

// Utilities
import Fuse from "fuse.js";
import { getForecasts } from "../lib/get-forecasts.js";
import displayForecasts from "./displayForecasts.js";
import searchGuesstimate from "../lib/searchGuesstimate.js";
// Parts
import Layout from "./layout.js";
import Form from "../lib/form.js";
import DropdownForStars from "../lib/dropdown.js";
import { SliderElement, SliderForNumForecasts } from "../lib/slider.js";
import MultiSelectPlatform from "../lib/multiSelectPlatforms.js";
import ButtonsForStars from "../lib/buttonsForStars.js";

/* Definitions */

// Search options for:
// https://github.com/krisk/Fuse/
const opts = {
  includeScore: true,
  keys: ["title", "platform", " "],
  ignoreLocation: true,
};

// Helper functions

export async function getStaticProps() {
  //getServerSideProps
  // const { metaforecasts } = await getForecasts();
  let metaforecasts = await getForecasts();
  //console.log("metaforecasts", metaforecasts)
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

// Stars
let howmanystars = (string) => {
  let matches = string.match(/★/g);
  return matches ? matches.length : 0;
};

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

/* Body */
export default function Home({ items }) {
  //, urlQuery }) {
  console.log("===============");
  console.log("New page render");

  /* States */
  const router = useRouter();
  let initialQueryParameters = {
    query: "",
    processedUrlYet: false,
    starsThreshold: 2,
    numDisplay: 20, // 20
    forecastsThreshold: 0,
    forecastingPlatforms: [
      // Excluding Elicit and Omen
      { value: "CSET-foretell", label: "CSET-foretell" },
      // { value: 'GiveWell', label: 'GiveWell' },
      { value: "Good Judgment", label: "Good Judgment" },
      { value: "Good Judgment Open", label: "Good Judgment Open" },
      { value: 'Guesstimate', label: 'Guesstimate' },
      { value: "Hypermind", label: "Hypermind" },
      { value: "Metaculus", label: "Metaculus" },
      { value: "PolyMarket", label: "PolyMarket" },
      { value: "PredictIt", label: "PredictIt" },
      { value: 'Smarkets', label: 'Smarkets' },
    ],
  };
  const [queryParameters, setQueryParameters] = useState(
    initialQueryParameters
  );
  let initialSettings = {
    timeoutId: null,
    awaitEndTyping: 500,
    time: Date.now(),
  };
  const [settings, setSettings] = useState(initialSettings);
  let initialResults = [];
  const [results, setResults] = useState(initialResults);
  /* Functions which I want to have access to the Home namespace */
  // I don't want to create an "items" object for each search.
  let executeSearch = (queryData) => {
    let results = [];
    let query = queryData.query;
    let forecastsThreshold = queryData.forecastsThreshold;
    let starsThreshold = queryData.starsThreshold;
    let forecastingPlatforms = queryData.forecastingPlatforms.map(
      (x) => x.value
    );

    searchGuesstimate(query).then(itemsGuesstimate => {
      // We enter the first level of asynchronous hell.
      let itemsTotal = items.concat(itemsGuesstimate)

      let itemsFiltered = itemsTotal.filter(
        (item) =>
          item.stars >= starsThreshold &&
          (item.numforecasts >= forecastsThreshold || forecastsThreshold == 0) &&
          forecastingPlatforms.includes(item.platform) &&
          true
      );

      let fuse = new Fuse(itemsFiltered, opts);
      if (query != undefined) {
        results = fuse.search(query).map((result) => {
          if (result.item.platform == "Elicit") {
            result.score = result.score * 2 + 0.1; // Higher scores are worse
          } else if (result.item.platform == "Guesstimate") {
            result.score = (result.score + 0.1) // Higher scores are worse
          }
          return result;
        });
        results.sort((a, b) => {
          return Number(a.score) > Number(b.score) ? 1 : -1; // Higher scores are worse
        });
        // Sort exact matches by forecast quality, rather than by string match.
        let querylowercase = query.toLowerCase()
        let resultsExactMatch = results.filter(r => r.item.title.toLowerCase().includes(querylowercase))
        resultsExactMatch.sort((a, b) => {
          if (a.item.stars != b.item.stars) {
            return Number(a.item.stars) < Number(b.item.stars) ? 1 : -1
          } else if (a.item.numforecasts != b.item.numforecasts) {
            return (Number(a.item.numforecasts) || 20) < (Number(b.item.numforecasts) || 20) ? 1 : -1
            // undefined => equivalent to 20 forecasts (not that many) for the purposes of sorting
          } else {
            return Number(a.score) > Number(b.score) ? 1 : -1
          }

        })
        let resultsNotExactMatch = results.filter(r => !r.item.title.toLowerCase().includes(querylowercase))
        results = resultsExactMatch.concat(resultsNotExactMatch)
        console.log("Executing search");
        console.log("executeSearch/query", query);
        console.log("executeSearch/items  ", itemsTotal);
        console.log("executeSearch/starsThreshold", starsThreshold);
        console.log("executeSearch/forecastsThreshold", forecastsThreshold);
        console.log("executeSearch/forecastingPlatforms", forecastingPlatforms);

        console.log(settings);
      }
      console.log(results);
      setResults(results)
    })
  };
  // I don't want display forecasts to change with a change in queryParameters, but I want it to have access to the queryParameters, in particular the numDisplay. Hence why this function lives inside Home.
  let displayForecastsWrapper = (results) => {
    let numDisplayRounded = queryParameters.numDisplay % 3 != 0 ? queryParameters.numDisplay + (3 - Math.round(queryParameters.numDisplay) % 3) : queryParameters.numDisplay
    console.log("numDisplay", queryParameters.numDisplay)
    console.log("numDisplayRounded", numDisplayRounded)
    return displayForecasts(results, numDisplayRounded);
  };

  /* State controllers */
  let onChangeSearchInputs = (newQueryParameters) => {
    setQueryParameters({ ...newQueryParameters, processedUrlYet: true });
    console.log("onChangeSearchInputs/newQueryParameters", newQueryParameters);

    setResults([]);
    clearTimeout(settings.timeoutId);
    let newtimeoutId = setTimeout(async () => {
      console.log(
        "onChangeSearchInputs/timeout/newQueryParameters",
        newQueryParameters
      );
      let urlSlug = transformObjectIntoUrlSlug(newQueryParameters);
      router.push(urlSlug);
      executeSearch(newQueryParameters);
      setSettings({ ...settings, timeoutId: null });
    }, settings.awaitEndTyping);
    setSettings({ ...settings, timeoutId: newtimeoutId });
  };

  let processState = (queryParameters) => {
    // I am using the static version of netlify, because the server side one is too slow
    // (see getServerSideProps vs getStaticProps under helper functions)
    // This has the advantage that the data gets sent in the very first request, as the html
    // However, it has the disadvantage that it produces static webpages
    // In particular, parsing the url for parameters proves to be somewhat difficult
    // I do it by having a state variable

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
  const starOptions = ["≥ ★☆☆☆☆", "≥ ★★☆☆☆", "≥ ★★★☆☆", "≥ ★★★★☆"];
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

  /* Show advanced */
  let [advancedOptions, showAdvancedOptions] = useState(false);

  /* Final return */
  return (
    <Layout key="index" page="search">
      <div className="m-5">
        <h1 className="text-4xl text-gray-900 tracking-tight mb-2 text-center font-normal">
          Metaforecast
        </h1>
        <div className="invisible">{processState(queryParameters)}</div>

        <label className="block mb-1">
          <Form value={queryParameters.query} onChange={onChangeSearchBar} />
        </label>

        <div className="flex flex-col mx-auto justify-center items-center">
          <button
            className="text-center text-gray-600 text-sm mb-2"
            onClick={() => showAdvancedOptions(!advancedOptions)}
          >
            Advanced options ▼
        </button>

          <div
            className={`flex-1 flex-col mx-auto justify-center items-center w-full ${advancedOptions ? "" : "hidden"
              }`}
          >
            <div className="grid grid-cols-3 grid-rows-2 items-center content-center">
              <div className="flex row-span-1 col-start-1 col-end-1 row-start-1 row-end-1 items-center justify-center mb-4">
                <SliderElement
                  onChange={onChangeSliderForNumForecasts}
                  value={queryParameters.forecastsThreshold}
                  displayFunction={displayFunctionNumForecasts}
                />
              </div>
              <div className="flex col-start-2 col-end-2 row-start-1 row-end-1 items-center justify-center mb-4">
                <ButtonsForStars
                  onChange={onChangeStars}
                  value={queryParameters.starsThreshold}
                />
              </div>
              <div className="flex col-start-3 col-end-3 row-start-1 row-end-1 items-center justify-center mb-4">
                <SliderElement
                  value={queryParameters.numDisplay}
                  onChange={onChangeSliderForNumDisplay}
                  displayFunction={displayFunctionNumDisplaySlider}
                />
              </div>
              <div className="flex col-span-3 items-center justify-center mb-4">
                <MultiSelectPlatform
                  value={queryParameters.forecastingPlatforms}
                  onChange={onChangeSelectedPlatforms}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayForecastsWrapper(results)}
        </div>
        <span
          className="mr-1 cursor-pointer"
          onClick={() => {
            setSettings({ ...settings, numDisplay: settings.numDisplay * 2 });
          }}
        >
          {results.length != 0 && settings.numDisplay < results.length
            ? "Show more"
            : ""}
        </span>
      </div>

    </Layout>
  );
}
