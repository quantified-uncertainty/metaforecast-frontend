/* Imports */
import ReactMarkdown from "react-markdown";

/* Definitions */

/* Support functions */

// Short utils

let truncateTextSimple = (length, text) =>
  text.length > length ? text.slice(0, length) + "..." : text;

let truncateText = (length, text) => {
  if(text.length <= length){ return text }
  let arrayFromText = Array.from(text.slice(0, length))
  let isBreakChar = arrayFromText.map(l => l == " " || l=="," || l==".")
  let lastBreakChar = isBreakChar.lastIndexOf(true)
  let truncatedText = text.slice(0, lastBreakChar)+ (arrayFromText[lastBreakChar] != "." ? "..." : "..")
  return truncatedText
}
truncateText=truncateTextSimple

let formatProbability = (probability) => {
  let percentage = (probability * 100)
  let percentageCapped = percentage < 1 ? "< 1%" : (percentage > 99 ? "> 99%" : percentage.toFixed(0) + "%")
  return percentageCapped
}

let formatNumber = (num) => {
  if(Number(num) < 1000){
    return Number(num).toFixed(0)
  }else if(num < 10000){
    return (Number(num)/1000).toFixed(1) + "k"
  }
  else{
    return (Number(num)/1000).toFixed(0) + "k"
  }
}

let formatQualityIndicators = (qualityIndicators)  => {
  let newQualityIndicators = ({})
  for(let key in qualityIndicators){
    let newKey = formatQualityIndicator(key)
    if(newKey){
      newQualityIndicators[newKey] = qualityIndicators[key]
    }
  }
  return(newQualityIndicators)
}

let cleanText = (text) => {
  // Note: should no longer be necessary
  let textString = !!text ? text : "";
  textString = textString
    .replaceAll("] (", "](")
    .replaceAll(") )", "))")
    .replaceAll("( [", "([")
    .replaceAll(") ,", "),")
    .replaceAll("==", "") // Denotes a title in markdown
    .replaceAll("Background\n", "")
    .replaceAll("Context\n", "")
    .replaceAll("--- \n", "- ")
    .replaceAll(/\[(.*?)\]\(.*?\)/g, "$1");
  textString = textString.slice(0, 1) == "=" ? textString.slice(1) : textString;
  //console.log(textString)
  return textString;
};

// Database-like functions
export function getstars(numstars) {
  let stars = "★★☆☆☆";
  switch (numstars) {
    case 0:
      stars = "☆☆☆☆☆";
      break;
    case 1:
      stars = "★☆☆☆☆";
      break;
    case 2:
      stars = "★★☆☆☆";
      break;
    case 3:
      stars = "★★★☆☆";
      break;
    case 4:
      stars = "★★★★☆";
      break;
    case 5:
      stars = "★★★★★";
      break;
    default:
      stars = "★★☆☆☆";
  }
  return stars;
}

function getStarsColor(numstars) {
  let color = "text-yellow-400";
  switch (numstars) {
    case 0:
      color = "text-red-400";
      break;
    case 1:
      color = "text-red-400";
      break;
    case 2:
      color = "text-orange-400";
      break;
    case 3:
      color = "text-yellow-400";
      break;
    case 4:
      color = "text-green-400";
      break;
    case 5:
      color = "text-blue-400";
      break;
    default:
      color = "text-yellow-400";
  }
  return color;
}


let primaryForecastColor = (probability) => {
  if (probability < 0.03) {
    return "bg-red-600";
  } else if (probability < 0.1) {
    return "bg-red-600 opacity-80";
  } else if (probability < 0.2) {
    return "bg-red-600 opacity-70";
  } else if (probability < 0.3) {
    return "bg-red-600 opacity-60";
  } else if (probability < 0.4) {
    return "bg-red-600 opacity-50";
  } else if (probability < 0.5) {
    return "bg-gray-500";
  } else if (probability < 0.6) {
    return "bg-gray-500";
  } else if (probability < 0.7) {
    return "bg-green-600 opacity-50";
  } else if (probability < 0.8) {
    return "bg-green-600 opacity-60";
  } else if (probability < 0.9) {
    return "bg-green-600 opacity-70";
  } else if (probability < 0.97) {
    return "bg-green-600 opacity-80";
  } else {
    return "bg-green-600";
  }
};

let textColor = (probability) => {
  if (probability < 0.03) {
    return "text-red-600";
  } else if (probability < 0.1) {
    return "text-red-600 opacity-80";
  } else if (probability < 0.2) {
    return "text-red-600 opacity-80";
  } else if (probability < 0.3) {
    return "text-red-600 opacity-70";
  } else if (probability < 0.4) {
    return "text-red-600 opacity-70";
  } else if (probability < 0.5) {
    return "text-gray-500";
  } else if (probability < 0.6) {
    return "text-gray-500";
  } else if (probability < 0.7) {
    return "text-green-600 opacity-70";
  } else if (probability < 0.8) {
    return "text-green-600 opacity-70";
  } else if (probability < 0.9) {
    return "text-green-600 opacity-80";
  } else if (probability < 0.97) {
    return "text-green-600 opacity-80";
  } else {
    return "text-green-600";
  }
};

let primaryEstimateAsText = (probability) => {
  if (probability < 0.03) {
    return "Exceptionally unlikely";
  } else if (probability < 0.1) {
    return "Very unlikely";
  } else if (probability < 0.4) {
    return "Unlikely";
  } else if (probability < 0.6) {
    return "About Even";
  } else if (probability < 0.9) {
    return "Likely";
  } else if (probability < 0.97) {
    return "Very likely";
  } else {
    return "Virtually certain";
  }
};

let textColorFromScore = (score) => {
  if (score < 0.4) {
    return ["text-gray-900", "text-gray-900"];
  } else {
    return ["text-gray-400", "text-gray-400"];
  }
}

let opacityFromScore = (score) => {
  if (score < 0.4) {
    return "opacity-100";
  } else {
    return "opacity-50";
  }
}

let formatQualityIndicator = (indicator) => {
  let result
  switch(indicator){
    case "numforecasts":
      result = null
      break;

    case "stars":
      result = null
      break;

    case "volume":
      result = "Vol."
      break;

    case "numforecasters":
      result = "'casters"
      break;

    case "yes_bid":
      result = null // "Yes bid"
      break;

    case "yes_ask":
      result = null // "Yes ask"
      break;

    case "spread":
      result = "Spread"
      break;

    case "open_interest":
      result = "Interest"
      break;

    case "resolution_data":
      result = null
      break;

    case "liquidity":
      result = "Liq."
      break;

    case "tradevolume":
      result = "Vol."
      break;
  }
  return result
}

// Logical checks

let checkIfDisplayTimeStampAtBottom = (qualityIndicators) => {
  let indicators = Object.keys(qualityIndicators)
  if(indicators.length == 1 && indicators[0] == "stars"){
    return true
  }else{
    return false
  }
}

let getCurrencySymbolIfNeeded = ({indicator, platform}) => {
  let indicatorsWhichNeedCurrencySymbol =   ['Vol.', 'Interest', 'Liquidity']
  let dollarPlatforms = ["PredictIt", "Kalshi", "PolyMarket"]
  if(indicatorsWhichNeedCurrencySymbol.includes(indicator)){
    if(dollarPlatforms.includes(platform)){
      return "$"
    }else{
      return  "£"
    }
  }else{
    return ""
  }
}

let getPercentageSymbolIfNeeded = ({indicator, platform}) => {
  let indicatorsWhichNeedPercentageSymbol =   ['Spread']
  if(indicatorsWhichNeedPercentageSymbol.includes(indicator)){
    return "%"
  }else{
    return ""
  }
}

/* Display functions*/

// Auxiliary

let displayMarkdown = (description) => {
  let formatted = truncateText(250, cleanText(description));
  // overflow-hidden overflow-ellipsis h-24
  return formatted === "" ? (
    ""
  ) : (
      <div className="overflow-clip">
        <ReactMarkdown linkTarget="_blank" className="font-normal">
          {formatted}
        </ReactMarkdown>
      </div>
    );
};

let generateOptionRow = (option) => {
  let chooseColor = (probability) => {
    if (probability < 0.1) {
      return "bg-blue-50 text-blue-500";
    } else if (probability < 0.3) {
      return "bg-blue-100 text-blue-600";
    } else if (probability < 0.7) {
      return "bg-blue-200 text-blue-700";
    } else {
      return "bg-blue-300 text-blue-800";
    }
  };
  return (
    <div className="items-center flex">
      <div
        className={`${chooseColor(
          option.probability
        )} w-14 flex-none rounded-md py-0.5 my-1 text-sm text-center`}
      >
        {formatProbability(option.probability)}
      </div>
      <div className="flex-auto text-gray-700 pl-3 leading-snug text-sm">
        {option.name}
      </div>
    </div>
  );
};

let formatForecastOptions = (options) => {
  let optionsSorted = options.sort((a,b) => b.probability - a.probability)
  let optionsMax5 = optionsSorted.slice(0,5) // display max 5 options.
  let result = optionsMax5.map((option) => generateOptionRow(option))
  return result;
};

let showFirstQualityIndicator = ({numforecasts, timestamp, showTimeStamp, qualityindicators})  => {
  if (!!numforecasts) {
    return (
      <div className="flex col-span-1 row-span-1">
        {/*<span>{` ${numforecasts == 1 ? "Forecast" : "Forecasts:"}`}</span>&nbsp;*/}
        <span>{"Forecasts:"}</span>&nbsp;
        <span className="font-bold">{Number(numforecasts).toFixed(0)}</span>
      </div>
    );
  }else if(showTimeStamp  && checkIfDisplayTimeStampAtBottom(qualityindicators)){
    return(
      <span className={`hidden sm:flex items-center justify-center text-gray-600 mt-2`}>
        <svg className="ml-4 mr-1 mt-1" height="10" width="16">
          <circle cx="4" cy="4" r="4" fill="rgb(29, 78, 216)" />
        </svg>
        {`Last updated: ${timestamp ? timestamp.slice(0,10) : "unknown" }`}
      </span>
    )
  }else{
    return null
  }
}


let displayQualityIndicators = ({numforecasts, timestamp, showTimeStamp, qualityindicators, platform}) => {
  return(<div className="grid grid-cols-1 text-sm">
      {showFirstQualityIndicator({numforecasts, timestamp, showTimeStamp, qualityindicators})}
      {Object.entries(formatQualityIndicators(qualityindicators))
        .map(entry => {
          return(
          <div className="flex-1 col-span-1 row-span-1 mt-1" key={entry[0]}>
            <span>{`${entry[0]}: `}</span>&nbsp;
            <span className="font-bold">
              {`${getCurrencySymbolIfNeeded({indicator: entry[0], platform})}${formatNumber(entry[1])}${getPercentageSymbolIfNeeded({indicator: entry[0], platform})}`}
            </span>
          </div>
          )
        })
      }
  </div>)
};

/*
let displayQualityIndicatorsOld = (number, platform) => {
  if (!!number) {
    return (
      <>
        {`${number} ${number == 1 ? "Forecast" : "Forecasts"}`}
      </>
    );
  }
};

let displayQualityIndicatorsOld2 = (number, platform) => {
  if (!!number && platform !== "Guesstimate") {
    return (
      <>
        <span className="inline-block font-bold">{number}</span>
        <span className="text-gray-400">
          {number == 1 ? "\u00a0Forecast" : "\u00a0Forecasts"}
        </span>
      </>
    );
  } else if (platform === "Guesstimate") {
    return <span className="text-gray-400">1 Model</span>;
  }
};
*/

// Main display functions

let forecastFooter = ({stars, platform, numforecasts, qualityindicators, timestamp, showTimeStamp}) => {
  // flex grid w-full align-bottom items-end self-end text-center mt-2 align-self-end bg-black self-end
  // grid text-center flex-col align-bottom
  let debuggingWithBackground = false
  return (
    <div className="grid grid-cols-3 gap-4 items-center text-gray-500 w-full">
      <div className={`flex col-span-1 items-center justify-center ${getStarsColor(stars)} ${debuggingWithBackground? "bg-red-100" : ""}`}>
        {getstars(stars)}
      </div>
      <div className={`flex col-span-1 items-center justify-center font-bold ${debuggingWithBackground? "bg-red-100" : ""}`}>
          {platform
            .replace("Good Judgment Open", "GJOpen")
            .replace("OpenPhilanthropy", "OpenPhil")
            .replace("AstralCodexTen", "ACX")
            .replace(/ /g, "\u00a0")  // replaceAll(" ", "\u00a0")
          }
      </div>
      <div className={`flex col-span-1 items-center justify-center ${debuggingWithBackground? "bg-red-100" : ""}`}>
        {displayQualityIndicators({numforecasts, timestamp, showTimeStamp, qualityindicators, platform})}
      </div>
    </div>
  );
};

/*
let forecastFooterOld = ({stars, platform, numforecasts, qualityindicators, timestamp, showTimeStamp}) => {
  // flex grid w-full align-bottom items-end self-end text-center mt-2 align-self-end bg-black self-end
  // grid text-center flex-col align-bottom
  return (
    <div className="grid grid-cols-3 grid-rows-1 items-center text-gray-500">
      <div className="flex col-start-1 col-end-1">
        {displayQualityIndicators({numforecasts, timestamp, showTimeStamp, qualityindicators, platform})}
      </div>
      <div className="flex col-start-2 col-end-2 font-bold text-sm  ml-4 b-r-2">
        {platform
          .replace("Good Judgment Open", "GJOpen")
          .replace("OpenPhilanthropy", "OpenPhil")
          .replace(/ /g, "\u00a0")  // replaceAll(" ", "\u00a0")
        }
      </div>
      <div className="flex col-start-3 col-end-3 text-yellow-400 opacity-80">
        {getstars(stars)}
      </div>
    </div>
  );
};
*/

/*
let forecastFooterOld2 = (stars, platform, numforecasts) => {
  // flex grid w-full align-bottom items-end self-end text-center mt-2 align-self-end bg-black self-end
  // grid text-center flex-col align-bottom
  return (
    <div className="flex-1 text-gray-500">
      <div className="inline-block mr-5 text-yellow-400 opacity-80">
        {getstars(stars)}
      </div>
      <div className="inline-block font-bold mr-4 text-sm">
        {platform.replace(/ /g, "\u00a0")  // replaceAll(" ", "\u00a0")
        }
      </div>
      {platform !== ""}
      <div className="inline-block text-sm">
        {displayQualityIndicators(numforecasts, platform)}
      </div>
    </div>
  );
};
*/

/* Body */

export function displayForecast({
  title,
  url,
  platform,
  author,
  description,
  options,
  qualityindicators,
  timestamp,
  visualization,
  score,
  showTimeStamp
}){
  return(
    <a
      key={title}
      href={url}
      className="hover:bg-gray-100 hover:no-underline cursor-pointer flex flex-col px-4 py-3 bg-white rounded-md shadow place-content-stretch flex-grow no-underline"
      target="_blank"
    >
      <div className="flex-grow">
        <div className={`text-gray-900 ${opacityFromScore(score)} text-lg mb-2 font-medium justify-self-start`}>
          {title.replace("</a>", "")}
        </div>
        {(options.length == 2 && (options[0].name == "Yes" || options[0].name == "No")) && (
          <div>
            {/*<div className="mb-5 mt-2 block">
              <span
                className={`${primaryForecastColor(
                  options[0].probability
                )} text-white w-16 rounded-md px-1.5 py-0.5 font-bold text-center `}
              >
                {formatProbability(options[0].probability)}
              </span>
              <span
                className={`${textColor(
                  options[0].probability
                )} ml-2 text-gray-500 inline-block`}
              >
                {primaryEstimateAsText(options[0].probability)}
              </span>
            </div>*/}
            <div className="grid mb-5 mt-4 mb-5 grid-cols-1 sm:grid-rows-1">
              <div
                className="block col-span-1 w-full items-center justify-center"
              >
                <span
                  className={`${primaryForecastColor(
                    options[0].probability
                  )} text-white w-16 rounded-md px-1.5 py-0.5 font-bold `}
                >
                  {formatProbability(options[0].probability)}
                </span>
                <span
                  className={`${textColor(
                    options[0].probability
                  )} ml-2 text-gray-500 inline-block`}
                >
                  {primaryEstimateAsText(options[0].probability).slice(0,25)}
                </span>
              </div>
              <div className={`hidden sm:${showTimeStamp  && !checkIfDisplayTimeStampAtBottom(qualityindicators) ? "flex" : "hidden"} ${opacityFromScore(score)} row-end-2 col-start-2 col-end-2 row-start-1 row-end-1 col-span-1 items-center justify-center text-gray-600 ml-3 mr-2 `}>
                <svg className="mt-1" height="10" width="16">
                  <circle cx="4" cy="4" r="4" fill="rgb(29, 78, 216)" />
                </svg>
                {`Last updated: ${timestamp ? timestamp.slice(0,10) : "unknown" }`}
              </div>
            </div>
          </div>
        )}
        {( options.length != 2 || (options[0].name != "Yes" && options[0].name != "No")) && (
          <>
            
            <div className={`mb-2 mt-2 ${opacityFromScore(score)}`}>
              {formatForecastOptions(options)}
            </div>
            <div className={`hidden sm:${showTimeStamp  && !checkIfDisplayTimeStampAtBottom(qualityindicators)? "flex" : "hidden"} ${opacityFromScore(score)} col-start-2 col-end-2 row-start-1 row-end-1 text-gray-600 mt-3 mb-3`}>
              <svg className="ml-6 mr-1 mt-2" height="10" width="16">
                <circle cx="4" cy="4" r="4" fill="rgb(29, 78, 216)" />
              </svg>
              {`Last updated: ${timestamp ? timestamp.slice(0,10) : "unknown" }`}
            </div>
            
          </>
        )}

        {platform !== "Guesstimate" && options.length < 3 && (
          <div className={`text-gray-500 ${opacityFromScore(score)} mt-4`}>
            {displayMarkdown(description)}
          </div>
        )}

        {platform === "Guesstimate" && (
          <img
            className="rounded-sm mb-1"
            src={visualization}
            alt="Guesstimate Screenshot"
          />
        )}
      </div>
      <div className={`flex sm:hidden ${!showTimeStamp ? "hidden" : ""} items-center justify-center mt-2 mb-4 text-gray-600`}>
        {/* This one is exclusively for mobile*/}
        <svg className="" height="10" width="16">
          <circle cx="4" cy="4" r="4" fill="rgb(29, 78, 216)" />
        </svg>
        {`Last updated: ${timestamp ? timestamp.slice(0,10) : "unknown" }`}
      </div>
      <div className={`${opacityFromScore(score)} w-full`}>{forecastFooter({stars: qualityindicators.stars, platform: author || platform, numforecasts: qualityindicators.numforecasts,  qualityindicators, timestamp, showTimeStamp})}</div>
    </a>
  );
}

export default function displayForecasts(results, numDisplay) {
  return (
    !!results.slice &&
    results.slice(0, numDisplay).map((fuseSearchResult) => {
      /*let displayWithMetaculusEmbed =
        fuseSearchResult.item.platform == "Metaculus"
          ? metaculusEmbed(fuseSearchResult.item)
          : displayForecast({ ...fuseSearchResult.item });
      */
      let display = displayForecast({ ...fuseSearchResult.item, score: fuseSearchResult.score, showTimeStamp:false})
      return display;
    })
  );
}
