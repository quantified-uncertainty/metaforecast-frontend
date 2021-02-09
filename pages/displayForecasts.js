/* Imports */
import ReactMarkdown from "react-markdown";

/* Definitions */

/* Support functions */

let cleanText = (text) => {
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

let formatForecastData = (forecasts, stars, platform) => {
  let text;
  if (!forecasts && forecasts != 0) {
    text = `${stars} / ${platform} / Forecast number unknown`;
  } else {
    text = `${stars} / ${platform} / ${forecasts} forecasts`;
  }
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
    <div className="flex-grow">
      <div>
        <div className="text-blue-700 bg-blue-100 rounded-md px-2 text-lg font-bold inline-block mb-2">
          {binaryQuestion ? percentage : ""}
        </div>
      </div>
      <div className="text-gray-900 text-lg mb-2 font-medium">
        <a
          href={url}
          target="_blank"
          className="hover:underline cursor-pointer"
        >
          {title}
        </a>
      </div>
      <div className="text-gray-700 mb-2">{displayMarkdown(description)}</div>
    </div>
    <div className="flex-grow-0">
      {formatForecastData(forecasts, stars, platform)}
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
