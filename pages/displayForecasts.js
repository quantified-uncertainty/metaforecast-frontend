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

let displayMarkdown = (description) => {
  let formatted = truncateText(200, cleanText(description));
  return formatted === "" ? (
    ""
  ) : (
      <div className="text-sm">
        <ReactMarkdown>{formatted}</ReactMarkdown>
      </div>
    );
};

let numerateForecasts = (number) => {
  if(!number && number !=0){
    return (<>
      <label className="text-gray-600">
        {"\u00a0¿? fs."}
      </label>
    </>)
  }else if(number ==1){
    return (<>
      <div>
        {number}
      </div>
      <label className="text-gray-600">
        {"\u00a0f."}
      </label>
    </>)
  }
  else if(number==0 || number != 1){
    return (<>
      <div>
        {number}
      </div>
      <label className="text-gray-600">
        {"\u00a0fs."}
      </label>
    </>)
  }
}

let forecastHeader = (stars, platform, forecasts, binaryQuestion, percentage) => {
  return (
    <div className={`grid md:grid-cols-4 w-full items-center`}>
      <div className="flex md:col-span-1 md:col-start-1 md:col-end-1 md:justify-self-start sm:justify-self-center">
        {stars}
      </div>
      <div className="flex md:col-span-1 px-1 md:col-start-2 md:col-end-2 md:justify-self-center sm:justify-self-center">
        {platform}
      </div>
      <div className="flex md:col-span-1 px-1 md:col-start-3 md:col-end-3 md:justify-self-end sm:justify-self-center">
        {numerateForecasts(forecasts)}
      </div>
      <div className="flex md:col-span-1 md:col-start-4 md:col-end-4 text-blue-700 bg-blue-100 rounded-md px-2 text-lg font-bold inline-block mb-2 md:justify-self-end sm:justify-self-center">
        {binaryQuestion ? percentage : ""}
      </div>
    </div>)

  let text;
  if (!forecasts && forecasts != 0) {
    text = `${stars} / ${platform} / Forecast number unknown`;
  } else {
    text = `${stars} / ${platform} / ${forecasts} ${forecasts == 1 ? "forecast" : "forecasts"}`
  }

  text = binaryQuestion ? " " + text : text

  return text;
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
}) => (
  <div
    key={title}
    className="flex flex-col px-4 py-3 bg-white rounded-md shadow"
  >
    <div className="flex-1 flex-col">
      {forecastHeader(stars, platform, forecasts, binaryQuestion, percentage)}
    </div>
    <div className="flex-grow">
      <div className="text-gray-900 text-lg mb-2 font-medium">
        <a
          href={url}
          target="_blank"
          className="hover:underline cursor-pointbler"
        >
          {title}
        </a>
      </div>
      <div className="text-gray-700 mb-2">{displayMarkdown(description)}</div>
    </div>

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
