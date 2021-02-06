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

// Helper functions 

export async function getStaticProps() { //getServerSideProps
  const { metaforecasts } = await getForecasts();
  return {
    props: {
      items: metaforecasts,
    },
  };
}

/*
export async function getServerSideProps(context) { //getServerSideProps
  const { metaforecasts } = await getForecasts();
  return {
    props: {
      items: metaforecasts,
      urlQuery: context.query
    },
  };
}
*/

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
          <a href={url} className="font-bold" target="_blank">
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

/* Body */
export default function Home({ items, urlQuery }) {
 
  const initialformInput = ({
    query: ""//urlQuery.query || "" // 
  })
  //console.log("initialformInput", initialformInput)
  const [formInput, setformInput] = useState(initialformInput);
  console.log("Merry go round")
  const initialSettings = {
      numDisplay: 10, //Number(urlQuery.numDisplay) || 10,//100,
      timeoutId: null, 
      awaitEndTyping: 1000,//Number(urlQuery.awaitEndTyping) || 1000,
      shared: false, //urlQuery.query ? true : false,
      time: Date.now()
  }
  //console.log("initialSettings", initialSettings)
  const [settings, setSettings] = useState(initialSettings);
  const router = useRouter()
  
  let initialResults = [] // executeSearch(urlQuery.query) // 
  const [results, setResults] = useState(initialResults);

  // Support functions which use the same context.

  let executeSearch = (query) => {
    let results = []
      let fuse = new Fuse(items, opts);
      if(query != undefined){
        //console.log("query", query)
        results = fuse.search(query)
          .map(
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
        console.log("Executing search")
        //console.log(settings)
      }
    console.log(results)
    return results

  }  

  let onChangeForm = (formInput) => {
    
    //console.log(settings)
    setformInput(formInput);
    //console.log("formInput", formInput);
 
    clearTimeout(settings.timeoutId)
    setResults([]);
        
    let urlParameters = router.query
    let numDisplayURLParameters = urlParameters.numDisplay
    let numDisplayTemp = numDisplayURLParameters || settings.numDisplay
    
    //if(settings.shared == true){
    //  console.log(settings.time)
    //  console.log("We are here")
    //  router.push(``, undefined, { shallow: true })
    //  setSettings({...settings, shared: false})
    //} else {
      let newtimeoutId = setTimeout(async () => {
        let query = formInput.query
        let results = executeSearch(query) // Why is this executing all the damned time!!
        setSettings({...settings, timeoutId: null, numDisplay: numDisplayTemp})
        setResults(results);
      //router.push(`?query=${query.replaceAll(" ", "%20")}&numDisplay=${settings.numDisplay}`, undefined, { shallow: true })
      // That slows things inmensely.
    

      }, 500);
      setSettings({...settings, timeoutId: newtimeoutId})
    //}
    
  }
  
  let displayForecasts = (results) => {
    return results
      .slice(0, settings.numDisplay)
      .map((fuseSearchResult) =>
        displayForecast({ ...fuseSearchResult.item})
      )
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
      {displayForecasts(results)}
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
