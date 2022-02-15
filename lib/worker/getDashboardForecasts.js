import axios from "axios";

export async function getDashboardForecasts({ ids }) {
  let dashboardForecastCompatibleWithFuse = []
  try {
    let { data } = await axios({
      url: "https://server.loki.red/forecasts-by-id",
      method: "post",
      data: {
        ids: ids,
      },
    });
    console.log(data);
    dashboardForecastCompatibleWithFuse = data.map((result) => ({
      item: result,
      score: 0,
    }));

  } catch (error) {
    console.log(error)
  } finally {
    return dashboardForecastCompatibleWithFuse;
  }
}
// getDashboardForecasts({ ids: ["metaculus-6526", "smarkets-20206424"] })

export async function getDashboardForecastsByDashboardId({ dashboardId }) {
  console.log("getDashboardForecastsByDashboardId: ")
  let dashboardForecastCompatibleWithFuse = [];
  let dashboardItem = null
  try {
    let { data } = await axios({
      url: "https://server.loki.red/dashboard-by-id",
      method: "post",
      data: {
        id: dashboardId,
      },
    });
    console.log(data)
    let dashboardContents = data.dashboardContents;
    dashboardItem = data.dashboardItem
    // let { dashboardContents, dashboardItem } = data
    if (!!dashboardContents && !!dashboardContents.map) {
      dashboardForecastCompatibleWithFuse = dashboardContents.map((result) => ({
        item: result,
        score: 0,
      }));
    } else {
      console.log("Error in getDashboardForecastsByDashboardId");
    }

  } catch (error) {
    console.log(error)
  } finally {
    return {
      dashboardForecasts: dashboardForecastCompatibleWithFuse,
      dashboardItem
    };
  }
}

export async function createDashboard(payload) {
  let data = { dashboardId: null }
  try {
    let { title, description, ids, creator, extra } = payload;
    console.log(payload)
    let response = await axios({
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
    data = response.data
    console.log(data);

  } catch (error) {
    console.log(error)
  } finally {
    return data
  }

}