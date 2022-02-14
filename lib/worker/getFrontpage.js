import axios from "axios";

export async function getFrontpage() {
  const { data } = await axios.get(
    `https://server.loki.red/metaforecast-frontpage`
  ); 
  let frontPageForecastsCompatibleWithFuse = data.map((result) => ({
    item: result,
    score: 0,
  }));
  return frontPageForecastsCompatibleWithFuse;
}