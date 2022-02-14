/* Imports */

// React
import React from "react";

// Utilities
import { displayForecastsWrapperForSearch } from "../lib/display/displayForecastsWrappers.js";
import displayForecasts from "../lib/display/displayForecasts.js"
import Layout from "./layout.js";

// Data
import { getDashboardForecasts } from "../lib/worker/getDashboardForecasts.js";

/* get Props */

export async function getServerSideProps(context) {
  let urlQuery = context.query; // this is an object, not a string which I have to parse!!
  // so for instance if the url is metaforecasts.org/dashboards?a=b&c=d
  // this returns ({a: "b", c: "d"}})
  let dashboardId = urlQuery.dashboardId;

  let dashBoardForecasts = await getDashboardForecasts({
    ids: ["metaculus-6526", "smarkets-20206424"]
  });
  let props = ({
    dashBoardForecasts: dashBoardForecasts
  })

  return {
    props: props,
  };
}

/* Body */
export default function Home({
  dashBoardForecasts
}) {

  return (
    <Layout
      key="index"
      page={"dasbhboard"}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayForecasts({ results: dashBoardForecasts, numDisplay: dashBoardForecasts.length })}
      </div>
    </Layout>
  )
}
