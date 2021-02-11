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
    .replaceAll(") ,", "),");
};

let truncateText = (length, text) =>
  text.length > length ? text.slice(0, length) + "..." : text;

let displayMarkdown = (description,platform) => {
  let formatted = truncateText(200, cleanText(description));
  // description = platform == "GiveWell"?"Internal forecasts by the GiveWell team":description
  return formatted === "" ? (
    ""
  ) : (
      <div className="text-sm">
        <ReactMarkdown>{formatted}</ReactMarkdown>
      </div>
    );
};

let numerateForecasts = (number) => {
  if (!number && number != 0) {
    return (<>
      <label className="text-gray-600">
        {"\u00a0¿? Forecasts"}
      </label>
    </>)
  } else { // Non breaking space: \u00a0
    return (<>
      <div>
        {number}
      </div>
      <label className="text-gray-600">
        {number == 1?"\u00a0Forecast":"\u00a0Forecasts"}
      </label>
    </>)
  }
}

let forecastHeader = (stars, platform, forecasts) => {
    return (<div className="flex-1 grid lg:grid-cols-3 w-full flex-col align-bottom items-end self-end mt-2">
    <div className="flex lg:col-span-1 lg:col-start-1 lg:col-end-1 justify-self-center lg:justify-self-start">
      {stars}
    </div>
    <div className={`flex lg:col-span-1 lg:mr-8 lg:col-start-2 lg:col-end-2 justify-self-center lg:justify-self-center${platform.length>10?" text-sm":""}`}>
      {platform.replaceAll(" ", "\u00a0")}
    </div>
    <div className="flex lg:col-span-1 lg:col-start-3 lg:col-end-3 justify-self-center lg:justify-self-end">
      {platform=="GiveWell"?"":numerateForecasts(forecasts)}
    </div>
</div>)

};

/* Body */

let displayForecast = ({
  title,
  url,
  platform,
  description,
  binaryQuestion,
  percentage,
  forecasts,
  stars,
  visualization
}) => (
  <div
    key={title}
    className="flex flex-col px-4 py-3 bg-white rounded-md shadow place-content-stretch"
  >
    <div className="flex-grow">
      <div className="text-gray-900 text-lg mb-2 font-medium">
        <a
          href={url}
          target="_blank"
          className="hover:underline cursor-pointbler"
        >
          {title}
          {"   "}
          <div className="text-blue-700 bg-blue-100 rounded-md px-2 text-lg font-bold inline-block mb-0.5">
          {binaryQuestion ? percentage : ""}
        </div>
        </a>
      </div>
      <div className={`text-gray-700 mb-2${platform=="Guesstimate"?" hidden":""}`}>{displayMarkdown(description, platform)}</div>
      <div className={platform=="Guesstimate"?"":"hidden"}>
        <img src={visualization} alt="Guesstimate Screenshot"/>
      </div>
    </div>
    {forecastHeader(stars, platform, forecasts)}
  </div>
);

export default function displayForecasts(results, numDisplay) {
  return (
    !!results.slice &&
    results
      .slice(0, numDisplay)
      .map((fuseSearchResult) => displayForecast({ ...fuseSearchResult.item }))
  );
}
