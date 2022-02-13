/* Imports */

// React
import React, { useState } from "react";
import { useRouter } from "next/router"; // https://nextjs.org/docs/api-reference/next/router

// Utilities
import searchAccordingToQueryData from "../lib/worker/searchAccordingToQueryData.js";
import { displayForecastsWrapperForSearch } from "../lib/display/displayForecastsWrappers.js";
import { displayForecastsWrapperForCapture } from "../lib/display/displayForecastsWrappers.js";

// Parts
import Layout from "./layout.js";
import Form from "../lib/display/form.js";
import { SliderElement } from "../lib/display/slider.js";
import MultiSelectPlatform from "../lib/display/multiSelectPlatforms.js";
import ButtonsForStars from "../lib/display/buttonsForStars.js";
import { platformsWithLabels, platformNames, distinctColors } from "../lib/platforms.js";

// Data
import { getFrontpage } from "../lib/worker/getFrontpage.js";

/* Definitions */

// Toggle options
// For search
const SEARCH_OR_CAPTURE = "search"
const search = {
  pageName: "search",
  setHasDisplayBeenCapturedOnChangeSearchInputs: () => null,
  placeholder: "Find forecasts about...",
  displaySeeMoreHint: true,
  displayForecastsWrapper: displayForecastsWrapperForSearch,
};

// For capture
const capture = {
  pageName: "capture",
  setHasDisplayBeenCapturedOnChangeSearchInputs: () => false,
  placeholder: "Get best title match",
  displaySeeMoreHint: false,
  displayForecastsWrapper: displayForecastsWrapperForCapture,
};

/* Helper functions */

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
  let today = new Date().toISOString();
  let yesterdayObj = new Date();
  yesterdayObj.setDate(yesterdayObj.getDate() - 1);
  let yesterday = yesterdayObj.toISOString();
  if (today.slice(11, 16) > "02:00") {
    return today.slice(0, 10);
  } else {
    return yesterday.slice(0, 10);
  }
};

/* get Props */
/*
export async function getStaticProps() {
  // get frontPageForecasts somehow.
  let lastUpdated = calculateLastUpdate(); // metaforecasts.find(forecast => forecast.platform == "Good Judgment Open").timestamp
  let initialQueryParameters = {
    query: "",
    processedUrlYet: false,
    starsThreshold: 2,
    numDisplay: 21, // 20
    forecastsThreshold: 0,
    forecastingPlatforms: platforms,
  };
  return {
    props: {
      frontPageForecasts,
      lastUpdated,
    },
  };
}
*/

export async function getServerSideProps(context) {
  let urlQuery = context.query; // this is an object, not a string which I have to parse!!
  let lastUpdated = calculateLastUpdate();
  // The correct way to do this woudl be something like: frontPageForecasts.find(forecast => forecast.platform == "Good Judgment Open").timestamp

  let initialQueryParameters = {
    query: "",
    starsThreshold: 2,
    numDisplay: 21, // 20
    forecastsThreshold: 0,
    forecastingPlatforms: platformsWithLabels, // weird key value format,
    ...urlQuery,
  };

  let frontPageForecasts = await getFrontpage();
  let initialResults
  switch (initialQueryParameters.query != "") {
    case true:
      initialResults = await searchAccordingToQueryData(initialQueryParameters);
      break;
    default:
      initialResults = frontPageForecasts;
      break;
  }

  let props = ({
    initialQueryParameters: initialQueryParameters,
    initialResults: initialResults,
    defaultResults: frontPageForecasts,
    lastUpdated: lastUpdated,
    urlQuery: urlQuery,
  })

  return {
    props: props,
  };
}

/* Body */
export default function Home({ initialResults, defaultResults, lastUpdated, initialQueryParameters }) {
  console.log("===============\nNew page render");

  /* States */
  const router = useRouter();

  const [queryParameters, setQueryParameters] = useState(
    initialQueryParameters
  );
  let initialSearchSpeedSettings = {
    timeoutId: null,
    awaitEndTyping: 500,
    time: Date.now(),
  };
  const [searchSpeedSettings, setSearchSpeedSettings] = useState(
    initialSearchSpeedSettings
  );
  const [results, setResults] = useState(initialResults);
  let [advancedOptions, showAdvancedOptions] = useState(false);
  let [captureToggle, switchCaptureToggle] = useState(SEARCH_OR_CAPTURE); // capture
  let [hasDisplayBeenCaptured, setHasDisplayBeenCaptured] = useState(false);
  let [whichTohasDisplayBeenCaptured, setWhichTohasDisplayBeenCaptured] = useState(0);

  /* Functions which I want to have access to the Home namespace */
  // I don't want to create an "defaultResults" object for each search.
  async function executeSearchOrAnswerWithDefaultResults(queryData){
    // the queryData object has the same contents as queryParameters.
    // but I wanted to spare myself having to think about namespace conflicts.
    let filterManually = (queryData, results) => {
      if (
        queryData.forecastingPlatforms &&
        queryData.forecastingPlatforms.length > 0
      ) {
        results = results.filter((result) =>
          forecastingPlatforms.includes(result.item.platform)
        );
      }
      if (queryData.starsThreshold == 4) {
        results = results.filter(
          (result) => result.item.qualityindicators.stars >= 4
        );
      }
      if (queryData.forecastsThreshold) {
        // results = results.filter(result => (result.qualityindicators && result.item.qualityindicators.numforecasts > forecastsThreshold))
      }
    };

    let results;
    switch (queryData.query != "") {
      case true:
        results = await searchAccordingToQueryData(queryData);;
        break;
      case false:
        results = filterManually(defaultResults);
        break;
      default:
        results = [];
        break;
    }
    console.log("executeSearchOrAnswerWithDefaultResults/queryData", queryData);
    setResults(results);
  };

  // I don't want the function which dispaly forecasts (displayForecasts) to change with a change in queryParameters. But I want it to have access to the queryParameters, and in particular access to queryParameters.numDisplay. Hence why this function lives inside Home.
  let getInfoToDisplayForecastsFunction = (
    displayForecastsFunction,
    { results, hasDisplayBeenCaptured, setHasDisplayBeenCaptured, whichTohasDisplayBeenCaptured }
  ) => {
    let numDisplayRounded =
      queryParameters.numDisplay % 3 != 0
        ? queryParameters.numDisplay +
        (3 - (Math.round(queryParameters.numDisplay) % 3))
        : queryParameters.numDisplay;
    console.log("numDisplay", queryParameters.numDisplay);
    console.log("numDisplayRounded", numDisplayRounded);
    return displayForecastsFunction({
      results,
      numDisplay: numDisplayRounded,
      hasDisplayBeenCaptured,
      setHasDisplayBeenCaptured,
      whichTohasDisplayBeenCaptured,
    });
  };

  /* State controllers */
  let onChangeSearchInputs = (newQueryParameters) => {
    setQueryParameters(newQueryParameters); // ({ ...newQueryParameters, processedUrlYet: true });
    console.log("onChangeSearchInputs/newQueryParameters", newQueryParameters);
    setResults([]);
    setHasDisplayBeenCaptured(
      captureToggle == "search"
        ? search.setHasDisplayBeenCapturedOnChangeSearchInputs()
        : capture.setHasDisplayBeenCapturedOnChangeSearchInputs()
    );
    clearTimeout(searchSpeedSettings.timeoutId);
    let newtimeoutId = setTimeout(async () => {
      console.log(
        "onChangeSearchInputs/timeout/newQueryParameters",
        newQueryParameters
      );
      let urlSlug = transformObjectIntoUrlSlug(newQueryParameters);
      let urlWithoutDefaultParameters = urlSlug
        .replace("&starsThreshold=2", "")
        .replace("&numDisplay=21", "")
        .replace("&forecastsThreshold=0", "")
        .replace(
          `&forecastingPlatforms=${platformNames.join("|")}`,
          ""
        );
      router.push(urlWithoutDefaultParameters);
      executeSearchOrAnswerWithDefaultResults(newQueryParameters);
      setSearchSpeedSettings({ ...searchSpeedSettings, timeoutId: null });
    }, searchSpeedSettings.awaitEndTyping);
    setSearchSpeedSettings({ ...searchSpeedSettings, timeoutId: newtimeoutId });
    // avoid sending results if user has not stopped typing.
  };

  /* Only necessary if I go back to static props
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
          let forecastingPlatformsAsArray =
            newQuery.forecastingPlatforms.split("|");
          let forecastingPlatformsAsObject = forecastingPlatformsAsArray.map(
            (platformName, i) => ({
              value: platformName,
              label: platformName,
              color: distinctColors[i],
            })
          );
          newQuery.forecastingPlatforms = forecastingPlatformsAsObject;
        }
        setQueryParameters(newQuery);
        executeSearchOrAnswerWithDefaultResults(newQuery);
      }
    } else {
      // Do nothing
    }
  };
  */

  /* Change the stars threshold */
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

  // Capture functionality
  let onClickBack = () => {
    let decreaseUntil0 = (num) => (num - 1 > 0 ? num - 1 : 0);
    setWhichTohasDisplayBeenCaptured(decreaseUntil0(whichTohasDisplayBeenCaptured));
    setHasDisplayBeenCaptured(false);
  };
  let onClickForward = (whichTohasDisplayBeenCaptured) => {
    setWhichTohasDisplayBeenCaptured(whichTohasDisplayBeenCaptured + 1);
    setHasDisplayBeenCaptured(false);
    // setTimeout(()=> {onClickForward(whichTohasDisplayBeenCaptured+1)}, 5000)
  };

  /* Final return */
  return (
    <Layout
      key="index"
      page={captureToggle == "search" ? search.pageName : capture.pageName}
      lastUpdated={lastUpdated}
      captureToggle={captureToggle}
      switchCaptureToggle={switchCaptureToggle}
    >
      {/* Not necessary once I'm using server side props:
			<div className="invisible">{processState(queryParameters)}</div> */}

      <label className="mb-4 mt-4 flex flex-row justify-center items-center">
        <div className="w-10/12 mb-2">
          <Form
            value={queryParameters.query}
            onChange={onChangeSearchBar}
            placeholder={
              captureToggle == "search"
                ? search.placeholder
                : capture.placeholder
            }
          />
        </div>
        <div
          className={`w-2/12 flex justify-center ml-4 md:ml-2 lg:ml-0 ${captureToggle == "search" ? "" : "hidden"
            }`}
        >
          <button
            className="text-gray-500 text-sm mb-2"
            onClick={() => showAdvancedOptions(!advancedOptions)}
          >
            Advanced options ▼
          </button>
        </div>
        <div
          className={`w-2/12 flex justify-center ml-4 md:ml-2 gap-1 lg:ml-0 ${captureToggle == "capture" ? "" : "hidden"
            }`}
        >
          <button
            className="text-blue-500 cursor-pointer text-xl mb-3 pr-3 hover:text-blue-600"
            onClick={() => onClickBack()}
          >
            ◀
          </button>
          <button
            className="text-blue-500 cursor-pointer text-xl mb-3 pl-3 hover:text-blue-600"
            onClick={() => onClickForward(whichTohasDisplayBeenCaptured)}
          >
            ▶
          </button>
        </div>
      </label>

      <div
        className={`flex-1 flex-col mx-auto justify-center items-center w-full ${advancedOptions && captureToggle == "search" ? "" : "hidden"
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

      <div className={captureToggle == "search" ? "" : "hidden"}>
        {getInfoToDisplayForecastsFunction(search.displayForecastsWrapper, {
          results,
          hasDisplayBeenCaptured,
          setHasDisplayBeenCaptured,
          whichTohasDisplayBeenCaptured,
        })}
      </div>
      <div className={captureToggle == "capture" ? "" : "hidden"}>
        {getInfoToDisplayForecastsFunction(capture.displayForecastsWrapper, {
          results,
          hasDisplayBeenCaptured,
          setHasDisplayBeenCaptured,
          whichTohasDisplayBeenCaptured,
        })}
      </div>

      <div
        className={`${(
          captureToggle == "search"
            ? search.displaySeeMoreHint
            : capture.displaySeeMoreHint
        )
          ? ""
          : "hidden" /*Fairly barroque, but keeps to the overall toggle-based scheme */
          }`}
      >
        <p
          className={`mt-4 mb-4 ${results.length != 0 && queryParameters.numDisplay < results.length
            ? ""
            : "hidden"
            }`}
        >
          {"Can't find what you were looking for? "}
          <span
            className="cursor-pointer text-blue-800"
            onClick={() => {
              setQueryParameters({
                ...queryParameters,
                numDisplay: queryParameters.numDisplay * 2,
              });
            }}
          >
            {"Show more,"}
          </span>
          {" or "}
          <a
            href="https://www.metaculus.com/questions/create/"
            className="cursor-pointer text-blue-800 no-underline"
            target="_blank"
          >
            suggest a question on Metaculus
          </a>
        </p>
      </div>
      <br></br>
    </Layout>
  );
}
