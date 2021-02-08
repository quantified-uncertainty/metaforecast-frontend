/* Imports */
import ReactMarkdown from "react-markdown";

/* Definitions */

/* Support functions */

let displayMarkdown = (description) => {
  if (description == null) {
    return;
  } else {
    description =
      description == null
        ? ""
        : description
            .replaceAll("] (", "](")
            .replaceAll(") )", "))")
            .replaceAll("( [", "([")
            .replaceAll(") ,", "),");
    if (description.length > 1000) {
      return (
        <div className="font-mono text-xs">
          <ReactMarkdown>{description.slice(0, 1000) + "..."}</ReactMarkdown>
        </div>
      );
    } else {
      return (
        <div className="font-mono text-xs">
          <ReactMarkdown>{description}</ReactMarkdown>
        </div>
      );
    }
  }
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
}) => {
  if (binaryQuestion) {
    return (
      <div key={title} className="pb-6 pt-3">
        <div className="text-blue-800">
          <a href={url} className="font-bold" target="_blank">
            {title}
          </a>
          <span className="text-black">{" " + percentage}</span>
        </div>
        <div>{formatForecastData(forecasts, stars, platform)}</div>
        {displayMarkdown(description)}
      </div>
    );
  } else {
    return (
      <div key={title} className="pb-6 pt-3">
        <div className="text-blue-800">
          <a href={url} className="font-bold">
            {title}
          </a>
        </div>
        <div className="text-black">
          {formatForecastData(forecasts, stars, platform)}
        </div>
        {displayMarkdown(description)}
      </div>
    );
  }
};

export default function displayForecasts(results, numDisplay) {
  return results
    .slice(0, numDisplay)
    .map((fuseSearchResult) => displayForecast({ ...fuseSearchResult.item }));
}
