/* Imports */

// React
import React from "react";
import searchAccordingToQueryData from "../lib/worker/searchAccordingToQueryData.js";
import { platformsWithLabels } from "../lib/platforms.js";
import { displayForecastsWrapperForSecretEmbed } from "../lib/display/displayForecastsWrappers.js";

/* Helper functions */

export async function getServerSideProps(context) {
  let urlQuery = context.query; // this is an object, not a string which I have to parse!!

  let initialQueryParameters = {
    query: "",
    starsThreshold: 2,
    forecastsThreshold: 0,
    forecastingPlatforms: platformsWithLabels, // weird key value format,
    ...urlQuery,
  };

  let results
  switch (initialQueryParameters.query != "") {
    case true:
      results = await searchAccordingToQueryData(initialQueryParameters);
      break;
    default:
      results = [];
      break;
  }

  return {
    props: {
      results: results,
    },
  };
}

/* Body */
export default function Home({ results }) {
  /* Final return */
  return (
    <>
      <div className="mb-4 mt-8 flex flex-row justify-center items-center ">
        <div className="w-6/12 place-self-center">
          {displayForecastsWrapperForSecretEmbed({ results })}
        </div>
      </div>
    </>
  );
}
