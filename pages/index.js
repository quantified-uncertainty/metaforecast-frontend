/* Imports */
import { getForecasts} from "../lib/get-forecasts.js";
import Layout from "./layout.js";
import ReactMarkdown from "react-markdown";
import Fuse from "fuse.js";
import React, { useState } from "react";
import Form from "../lib/form.js";

/* Definitions */
// We are using this for search:
// https://github.com/krisk/Fuse/
const opts = {
  includeScore: true,
  keys: ["title", "platform"],
  ignoreLocation: true
};

const initialValues = {
  query: "",
  additionalmetadatawemightwanttouse: ""
};
let linkStyle = "text-blue-500 hover:text-blue-700 visited:text-blue-700 hover:underline cursor-pointer";

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
      <div class="font-mono text-xs">
        <ReactMarkdown>
            {description.slice(0,1000)+"..."}
        </ReactMarkdown>
      </div>)
    }else{
      return(
        <div class="font-mono text-xs">
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

let executeSearch = (result, items) => {

  /* Search by platform */
  let query = result.query
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
        result.score = result.score*2 // Higher scores are worse
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
  const [values, setValues] = useState(initialValues);
  const [results, setResults] = useState([]);
  const [numdisplay, setNumDisplay] = useState(10);

  let onChangeQuery = (query) => {
    console.log("Changing query", query);
    setValues({ ...values, query });
    const results = fuse.search(query);
    setResults(results);
  };
  return (
    <Layout key="index">
      <div className="mb-5">
        <h1 className="text-4xl text-gray-900 tracking-tight mb-2 text-center">
          Metaforecasts
        </h1>
      </div>
      <label className="block mb-4">
        <Form
          values={values}
          onChange={(value) => {
            setValues(value);
            let results = executeSearch(value, items)
            setNumDisplay(10)
            setResults(results.slice(0,100));
          }}
        />
      </label>
      {results
        .slice(0, numdisplay)
        .map((fuseSearchResult) =>
        displayForecast({ ...fuseSearchResult.item})
        )}
      <span
          className="mr-1 cursor-pointer"
          onClick={() => {
            setNumDisplay(numdisplay+10)
          }}
          >
          {(results.length != 0 && numdisplay < 100) ?"Show more": ""}
      </span>
    </Layout>
  );
}
