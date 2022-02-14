import axios from "axios";

export async function getDashboardForecasts({ ids }) {
  let { data } = await axios({
    url: "https://server.loki.red/forecasts-by-id",
    method: "post",
    data: {
      ids: ids,
    },
  });
  console.log(data);
  let dashboardForecastCompatibleWithFuse = data.map((result) => ({
    item: result,
    score: 0,
  }));
  return dashboardForecastCompatibleWithFuse;
}
// getDashboardForecasts({ ids: ["metaculus-6526", "smarkets-20206424"] })

export async function getDashboardForecastsByDashboardId({ dashboardId }) {
  let { data } = await axios({
    url: "https://server.loki.red/dashboard-by-id",
    method: "post",
    data: {
      id: dashboardId,
    },
  });
  console.log(data);
  let dashboardForecastCompatibleWithFuse = [];
  if (!!data && !!data.map) {
    dashboardForecastCompatibleWithFuse = data.map((result) => ({
      item: result,
      score: 0,
    }));
  } else {
    console.log(data);
  }
  return dashboardForecastCompatibleWithFuse;
}
