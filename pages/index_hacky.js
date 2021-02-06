/* Imports */
import { getForecasts} from "../lib/get-forecasts.js";
import Layout from "./layout.js";
import ReactMarkdown from "react-markdown";
import Fuse from "fuse.js";
import React, { useState, useEffect } from "react";
import Form from "../lib/form.js";
import { useRouter } from 'next/router' // https://nextjs.org/docs/api-reference/next/router

/* Definitions */
// We are using this for search:
// https://github.com/krisk/Fuse/
const opts = {
  includeScore: true,
  keys: ["title", "platform", "stars"],
  ignoreLocation: true
};

const initialformInput = {
  query: "",
};
const initialSettings = {
    numDisplay: 10,//100,
    timeoutId: null, 
    awaitEndTyping: 500,
    searchInstantly: true // Deprecated; now implicit if numDisplay>10
}

/* Helper functions */
export async function getStaticProps() { //getServerSideProps
  const { metaforecasts } = await getForecasts();
  return {
    props: {
      items: metaforecasts,
    },
  };
}

let displayMarkdown = (description) => {
  if(description == null){
    return
  }else{
    description = description==null?"":description
      .replaceAll("] (", "](")
      .replaceAll(") )", "))")
      .replaceAll("( [", "([")
      .replaceAll(") ,", "),")
    if(description.length > 1000){
      return(
      <div className="font-mono text-xs">
        <ReactMarkdown>
            {description.slice(0,1000)+"..."}
        </ReactMarkdown>
      </div>)
    }else{
      return(
        <div className="font-mono text-xs">
          <ReactMarkdown>
              {description}
          </ReactMarkdown>
        </div>)
    }
  }
}

let displayNumForecasts = (forecasts) => {
  let forecastText = forecasts || "unknown"
  return ("Number of forecasts: " +forecastText)

}

let displayForecast = ({
  title,
  url,
  platform,
  description,
  binaryQuestion,
  percentage,
  forecasts,
  stars
}) => {
  if(binaryQuestion){
    return (
      <div key={title} className="pb-6 pt-3">
        <div className="text-blue-800">
          <a href={url} className="font-bold">
              {title}
          </a>
          {": "+percentage}
        </div>
        <div>
            {stars +" = "+ "(Platform: " + platform+") + ("+displayNumForecasts(forecasts)+")"}
        </div>
        {displayMarkdown(description)}
  
      </div>
    );
  }else{
    return (
      <div key={title} className="pb-6 pt-3">
        <div className="text-blue-800">
          <a href={url} className="font-bold">
              {title}
            </a>
          </div>
        <div>
        {stars +" = "+ "(Platform: " + platform+") + ("+displayNumForecasts(forecasts)+")"}
        </div>
        {displayMarkdown(description)}
  
      </div>
    );
  }
};

let executeSearch = (query, items) => {

  /*
  let platforms =  ["PredictIt", "PolyMarket", "Omen", "Metaculus", "Good Judgment", "Good Judgment Open", "CSET-foretell", "Elicit", "PredictionBook", "Hypermind"]
  for(let platform of platforms){
    if(query.includes(platform)){
      let newItems = items.filter(item => item.platform == platform)
      let newquery = query.replace(platform, " ")
      let fusebyPlatform = new Fuse(newItems, opts);
      let resultsbyPlatform = fusebyPlatform.search(newquery)
      console.log(resultsbyPlatform)
      return(resultsbyPlatform)
    }
  }
  */
  
  /* Search normally */

  let fuse = new Fuse(items, opts);
  let results = fuse.search(query).map(
    result => {
      if(result.item.platform == "Elicit"){
        result.score = (result.score*2 + 0.1) // Higher scores are worse
      }
      return result
    }
  )
  results.sort((a,b) => {
    return (Number(a.score)>Number(b.score))?1:-1
  })
  console.log(results)
  return results
}
/* Body */

export default function Home({ items }) {
  const [formInput, setformInput] = useState(initialformInput);
  const [results, setResults] = useState([]);
  const [settings, setSettings] = useState(initialSettings);
  const [urlWitchery, setURLWitchery] = useState({counter: 0})
  /*
  {
    numDisplay
    awaitEndTyping
    timeoutId
  }
  */
  const router = useRouter() // gets url.
  
  /*
  useEffect(() => {
    // Get url
    let router = useRouter()
    console.log("Router:", router)
    let urlParameters = router.query
    console.log("Url parameters: ", urlParameters)
    
    // Type conversion
    if(urlParameters.numDisplay){
      urlParameters.numDisplay = Number(urlParameters.numDisplay)
    }
    if(urlParameters.searchInstantly){
      urlParameters.searchInstantly= urlParameters.searchInstantly == "true" ? true:false
    }
    setSettings({...settings, urlParameters})
  }, [])
  */
 

  let onChangeForm = (formInput) => {
    console.log(settings)
    setformInput(formInput);
    console.log("formInput", formInput);
    let query = formInput.query
    // Check url for parameters
    let urlParameters = router.query
    let numDisplayURLParameters = urlParameters.numDisplay
    let numDisplayTemp = numDisplayURLParameters || settings.numDisplay
    
    if(numDisplayTemp<=10){
      console.log("numDisplayTemp<=10")
      console.log(settings.numDisplay)
      let results = executeSearch(query, items)
      setResults(results);
    }else{
      console.log("numDisplayTemp>=10")
      clearTimeout(settings.timeoutId)
      let newtimeoutId = setTimeout(() => {
        let results = executeSearch(query, items)
        setSettings({...settings, numDisplay: numDisplayTemp})
        setResults(results);
      }, settings.awaitEndTyping);
      setSettings({...settings, timeoutId: newtimeoutId})
    }
    // Update new parameters
    router.push(`?query=${query.replaceAll(" ", "%20")}`, undefined, { shallow: true })

  }
  
  let displayForecasts = (results, router, urlWitchery, setURLWitchery) => {
  /*
    let urlParameters = router.query
    let query = urlParameters.query
    if(urlWitchery.counter < 3){
      console.log("First pass")
      setURLWitchery({counter: (urlWitchery.counter+1)})
    }else{
  */
      //console.log(Date.now())
      //console.log(urlParameters)
      return results
        .slice(0, settings.numDisplay)
        .map((fuseSearchResult) =>
          displayForecast({ ...fuseSearchResult.item})
        )
    //}
    

  }

  return (
    <Layout key="index">
      <div className="mb-5">
        <h1 className="text-4xl text-gray-900 tracking-tight mb-2 text-center">
          Metaforecasts
        </h1>
      </div>
      <label className="block mb-4">
        <Form
          values={formInput}
          onChange={onChangeForm}
        />
      </label>
      {displayForecasts(results, router, urlWitchery, setURLWitchery)}
      <span
          className="mr-1 cursor-pointer"
          onClick={() => {
            setSettings({...settings, numDisplay: settings.numDisplay*2})
          }}
          >
          {(results.length != 0 && settings.numDisplay < results.length) ? "Show more": ""}
      </span>
    </Layout>
  );
}
