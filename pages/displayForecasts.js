/* Imports */
import ReactMarkdown from "react-markdown";

/* Definitions */

/* Support functions */

let cleanText = (text) => { // Note: should no longer be necessary
  const textString = !!text ? text : "";
  return textString
    .replaceAll("] (", "](")
    .replaceAll(") )", "))")
    .replaceAll("( [", "([")
    .replaceAll(") ,", "),")
    .replaceAll("==", "")
    .replaceAll("Background\n", "")
    .replaceAll("Context\n", "")
    .replaceAll("---", "- ")

};

let truncateText = (length, text) =>
  text.length > length ? text.slice(0, length) + "..." : text;

let displayMarkdown = (description, platform) => {
  let formatted = truncateText(250, cleanText(description));
  // description = platform == "GiveWell"?"Internal forecasts by the GiveWell team":description
  // overflow-hidden overflow-ellipsis h-24
  // console.log(formatted)
  return formatted === "" ? (
    ""
  ) : (
      <div className="text-sm overflow-clip">
        <ReactMarkdown linkTarget="_blank" className="font-normal">{formatted}</ReactMarkdown>
      </div>
    );
};

let formatProbability = probability => (probability * 100).toFixed(0) + "%"

let generateRow = (option, numOptions) => {
  return (
    <tr className="">
      <td className="pb-4">
        <div className="text-blue-700 bg-blue-100 rounded-md justify-self-center inline p-2 mr-1">
          {formatProbability(option.probability)}
        </div>
        {" "}
        {option.name}


      </td>
    </tr>
  )
}
let forecastOptions = (options) => {
  return (
    <div className="flex-1 w-full self-end mb-2 mt-2">
      <table className="flex-1 justify-self-center self-center w-full ">
        <tbody className="flex-1 justify-self-center">{options.map(option => generateRow(option, options.length))}
        </tbody>
      </table>
    </div>
  )
}

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

let metaculusEmbed = (item) => {
  //console.log(item.url)
  let embedurl = item.url
    .replace("questions", "questions/embed")
    .split("/")
  embedurl.pop()
  embedurl.pop()
  embedurl = embedurl.join("/")

  return <div
    key={item.title}
    className="flex flex-col px-4 py-3 bg-white rounded-md shadow place-content-stretch flex-grow place-self-center"
  >
    <div className="justify-self-center place-self-center">
      <iframe className={`h-${item.title.length > 80 ? 72 : 60} justify-self-center self-center`}
        src={embedurl} />
    </div>

    {forecastFooter(item.stars, item.platform, item.numforecasts)}
  </div>;
}

let numerateForecasts = (number) => {
  if (!number && number != 0) {
    return (<>
      <label className="text-gray-600">
        {"\u00a0¿? Forecasts"}
      </label>
    </>)
  } else { // Non breaking space: \u00a0
    return (<>
      <div className="inline-block">
        {number}
      </div>
      <label className="text-gray-600">
        {number == 1 ? "\u00a0Forecast" : "\u00a0Forecasts"}
      </label>
    </>)
  }
}

let forecastFooter = (stars, platform, numforecasts) => {
  return (<div className="flex-1 grid lg:grid-cols-3 w-full flex-col align-bottom items-end self-end text-center mt-2">
    <div className="flex lg:col-span-1 lg:col-start-1 lg:col-end-1 justify-self-center lg:justify-self-start">
      {getstars(stars)}
    </div>
    <div className={`flex-1 lg:col-span-1 lg:mr-8 lg:col-start-2 lg:col-end-2 justify-self-center lg:justify-self-center w-full ${platform.length > 10 ? " text-sm" : ""}`}>
      {platform.replaceAll(" ", "\u00a0")}
    </div>
    <div className="flex-1lg:col-span-1 lg:col-start-3 lg:col-end-3 justify-self-center lg:justify-self-end">
      {numerateForecasts(numforecasts)}
    </div>
  </div>)

};

/* Body */

let displayForecast = ({
  title,
  url,
  platform,
  description,
  options,
  numforecasts,
  stars,
  visualization
}) => (
  <a
    key={title}
    href={url}
    target="_blank"
    className="hover:no-underline cursor-pointbler flex flex-col px-4 py-3 bg-white rounded-md shadow place-content-stretch flex-grow text-black no-underline"
  >

    <div className="text-gray-900 text-lg mb-2 font-medium justify-self-start">

      {title.replace("</a>", "")}
      {"   "}
      <div className="text-blue-700 bg-blue-100 rounded-md px-2 text-lg font-bold inline-block mb-0.5">
        {options.length == 2 ? formatProbability(options[0].probability) : ""}
      </div>
    </div>

    <div className={`text-gray-700 ${platform == "Guesstimate" || options.length > 2 ? " hidden" : ""}`}>
      {displayMarkdown(description, platform)}
    </div>

    <div className={platform == "Guesstimate" ? "" : "hidden"}>
      <img src={visualization} alt="Guesstimate Screenshot" />
    </div>
    {options.length != 2 ? forecastOptions(options) : ""}
    {forecastFooter(stars, platform, numforecasts)}
  </a>

);

export default function displayForecasts(results, numDisplay) {
  return (
    !!results.slice &&
    results
      .slice(0, numDisplay)
      .map((fuseSearchResult) => {

        let display = fuseSearchResult.item.platform == "Metaculus" ?
          metaculusEmbed(fuseSearchResult.item) :
          displayForecast({ ...fuseSearchResult.item })
        let displayOld = displayForecast({ ...fuseSearchResult.item })
        return displayOld
      })
  )
}
