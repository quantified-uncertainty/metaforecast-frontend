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
  console.log("getDashboardForecastsByDashboardId: ")
  let { data } = await axios({
    url: "https://server.loki.red/dashboard-by-id",
    method: "post",
    data: {
      id: dashboardId,
    },
  });
  console.log(data)
  let { dashboardContents, dashboardItem } = data
  let dashboardForecastCompatibleWithFuse = [];
  if (!!dashboardContents && !!dashboardContents.map) {
    dashboardForecastCompatibleWithFuse = dashboardContents.map((result) => ({
      item: result,
      score: 0,
    }));
  } else {
    console.log("Error in getDashboardForecastsByDashboardId");
  }
  return {
    dashboardForecasts: dashboardForecastCompatibleWithFuse,
    dashboardItem
  };
}

export async function createDashboard(payload) {
  let { title, description, ids, creator, extra } = payload;
  console.log(payload)
  let { data } = await axios({
    url: "https://server.loki.red/create-dashboard-from-ids",
    method: "post",
    data: {
      title: title || "",
      description: description || "",
      ids: ids,
      creator: creator || "",
      extra: []
    },
  });
  console.log(data);

  return data
}