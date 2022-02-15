import axios from "axios";

export async function getFrontpage() {
  let frontPageForecastsCompatibleWithFuse = []
  try{
    let response = await axios.get(
      `https://server.loki.red/metaforecast-frontpage`
    ); 
    let data = response.data
    frontPageForecastsCompatibleWithFuse = data.map((result) => ({
      item: result,
      score: 0,
    }));
    return frontPageForecastsCompatibleWithFuse;
  }catch(error){
    console.log(error)
  }finally{
    return frontPageForecastsCompatibleWithFuse;
  }
}