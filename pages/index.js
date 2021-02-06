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
export default function Home({ items}){ //, urlQuery }) {
  console.log("===============")
  console.log("New page render")
  const router = useRouter()
  let initialformInput = ({
    query: "",
    counter: 0
  })
  const [formInput, setformInput] = useState(initialformInput);
  let initialSettings = {
      query: "",
      numDisplay:  10, 
      timeoutId: null, 
      awaitEndTyping: 1000,
      shared: false, 
      time: Date.now()
  }
  const [settings, setSettings] = useState(initialSettings);
  let initialResults =  [] 
  const [results, setResults] = useState(initialResults);
  let initialDummyState =  {counter: 0}
  const [dummyState, setDummyState] = useState(initialDummyState);
  
  let executeSearch = (query) => {
    let results = []
      let fuse = new Fuse(items, opts);
      if(query != undefined){
        console.log("query", query)
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
        console.log("query", query)
        console.log(settings)
      }
    console.log(results)
    return results
  }  
  let onChangeForm = (formInput) => {
    setformInput({...formInput, counter:1});
    clearTimeout(settings.timeoutId)
    setResults([]);
    let newtimeoutId = setTimeout(async () => {
      let query = formInput.query
      let results = executeSearch(query) //  Why is this executing all the damned time!!
      setSettings({...settings, timeoutId: null}) //, numDisplay: numDisplayTemp})
      setResults(results);
      router.push(`?query=${query}&numDisplay=${settings.numDisplay}`, undefined, { shallow: true })
      // That slows things inmensely in the server case, unless we prevent defaults
    }, 500);
    setSettings({...settings, timeoutId: newtimeoutId})
  }
  
  let displayForecasts = (results) => {

    return results
      .slice(0, settings.numDisplay)
      .map((fuseSearchResult) =>
        displayForecast({ ...fuseSearchResult.item})
    )
  }
  
  let processDummyState = (formInput) => {
    if(formInput.counter == 0){
      console.log("processDummyStrate")
      console.log("With router ", router)
      let urlQuery = router.query
      console.log("With urlQuery ", router.query)
      let urlSearchQuery = urlQuery?urlQuery.query:""
      console.log("With urlSearchQuery ", urlSearchQuery)
      if(urlSearchQuery && ! formInput.query){
        console.log("processDummyStrate: conditional 1")    
        console.log("With formInput.query", formInput.query)
        setformInput({query: urlSearchQuery, counter: 1})
        let results = executeSearch(urlSearchQuery)
        setResults(results)
      }
      if(urlSearchQuery==""){
        setformInput({...formInput, counter: 1})
      }
      let numDisplayQuery = urlQuery?Number(urlQuery.numDisplay):false
      if(numDisplayQuery){
          setSettings({...settings, numDisplay:numDisplayQuery})
      }
    }else {
      // Do nothing
    }

  }

  return (
    <Layout key="index">
      <div className="mb-5">  
        <h1 className="text-4xl text-gray-900 tracking-tight mb-2 text-center">
          Metaforecasts
        </h1>
      </div>
      <div className="invisible">{processDummyState(formInput)}
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
