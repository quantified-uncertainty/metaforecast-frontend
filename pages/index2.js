/* Imports */

// React
import React from "react";

// Utilities
  import searchAccordingToQueryData from "../lib/worker/searchAccordingToQueryData.js";
import { displayForecastsWrapperForSearch } from "../lib/display/displayForecastsWrappers.js";
import CommonDisplay from "../lib/display/commonDisplay.js"
import Layout2 from "./layout2.js";

// Data
import { platformsWithLabels } from "../lib/platforms.js";
import { getFrontpage } from "../lib/worker/getFrontpage.js";

/* get Props */

export async function getServerSideProps(context) {
  let urlQuery = context.query; // this is an object, not a string which I have to parse!!

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
  let props
  switch (initialQueryParameters.query != "") {
    case true:
      initialResults = await searchAccordingToQueryData(initialQueryParameters);
      props = ({
        initialQueryParameters: initialQueryParameters,
        initialResults: initialResults,
        defaultResults: frontPageForecasts, // different from initialResults!
        urlQuery: urlQuery,
      })
      break;
    default:
      initialResults = frontPageForecasts;
      props = ({
        initialQueryParameters: initialQueryParameters,
        initialResults: initialResults,
        urlQuery: urlQuery,
      })
      break;
  }

  return {
    props: props,
  };
}

/* Alternative: getStaticProps
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


/* Body */
export default function Home({
  initialResults,
  defaultResults,
  initialQueryParameters 
}) {

  return (
    <Layout2
    key="index"
    page={"search"}
  >
    <CommonDisplay
      initialResults={initialResults}
      defaultResults={defaultResults}
      initialQueryParameters={initialQueryParameters}
      pageName={"search"}
      hasCapture={false}
      hasAdvancedOptions={true}
      placeholder={"Find forecasts about..."}
      setHasDisplayBeenCapturedOnChangeSearchInputs={() => null}
      displaySeeMoreHint={true}
      displayForecastsWrapper={displayForecastsWrapperForSearch} 
    />
    </Layout2>
  )
}
