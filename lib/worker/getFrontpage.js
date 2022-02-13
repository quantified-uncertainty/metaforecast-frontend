import axios from "axios";

export async function getFrontpage() {
  const { data } = await axios.get(
    `https://server.loki.red/metaforecast-frontpage`
  ); 
  return data;
}