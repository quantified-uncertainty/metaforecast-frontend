/* Imports */

// React
import React from "react";

// Utilities
import searchAccordingToQueryData from "../lib/worker/searchAccordingToQueryData.js";
import { displayForecastsWrapperForCapture } from "../lib/display/displayForecastsWrappers.js";
import CommonDisplay from "../lib/display/commonDisplay.js"
import Layout from "./layout.js";

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
    urlQuery: urlQuery,
  })

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
    <Layout
      key="index"
      page={"capture"}
    >
      <CommonDisplay
        initialResults={initialResults}
        defaultResults={defaultResults}
        initialQueryParameters={initialQueryParameters}
        pageName={"capture"}
        hasSearchbar={true}
        hasCapture={true}
        hasAdvancedOptions={false}
        placeholder={"Get best title match..."}
        setHasDisplayBeenCapturedOnChangeSearchInputs={() => false}
        displaySeeMoreHint={false}
        displayForecastsWrapper={displayForecastsWrapperForCapture}
      />
    </Layout>
  )
}
