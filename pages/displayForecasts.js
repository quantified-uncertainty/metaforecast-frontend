/* Imports */
import ReactMarkdown from "react-markdown";

/* Definitions */

/* Support functions */

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
    <div className="overflow-clip">
      <ReactMarkdown linkTarget="_blank" className="font-normal">
        {formatted}
      </ReactMarkdown>
    </div>
  );
};

let formatProbability = (probability) => (probability * 100).toFixed(0) + "%";

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

let generateRow = (option, numOptions) => {
  const color = () => {
    if (option.probability < 0.3) {
      ("sdf");
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

let forecastOptions = (options) => {
  return (
    <div className="flex-1 w-full self-end mb-2 mt-2">
      <table className="flex-1 justify-self-center self-center w-full ">
        <tbody className="flex-1 justify-self-center">
          {options.map((option) => generateRow(option, options.length))}
        </tbody>
      </table>
    </div>
  );
};

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
  let embedurl = item.url.replace("questions", "questions/embed").split("/");
  embedurl.pop();
  embedurl.pop();
  embedurl = embedurl.join("/");

  return (
    <div
      key={item.title}
      className="flex flex-col px-4 py-3 bg-white rounded-md shadow place-content-stretch flex-grow place-self-center"
    >
      <div className="justify-self-center place-self-center">
        <iframe
          className={`h-${
            item.title.length > 80 ? 72 : 60
          } justify-self-center self-center`}
          src={embedurl}
        />
      </div>

      {forecastFooter(item.stars, item.platform, item.numforecasts)}
    </div>
  );
};

let numerateForecasts = (number, platform) => {
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

let forecastFooter = (stars, platform, numforecasts) => {
  // flex grid w-full align-bottom items-end self-end text-center mt-2 align-self-end bg-black self-end
  // grid text-center flex-col align-bottom
  return (
    <div className="flex-1 text-gray-600">
      <div className="inline-block mr-5 text-yellow-400 opacity-80">
        {getstars(stars)}
      </div>
      <div className="inline-block font-bold mr-4 text-sm">
        {platform.replaceAll(" ", "\u00a0")}
      </div>
      {platform !== ""}
      <div className="inline-block text-sm">
        {numerateForecasts(numforecasts, platform)}
      </div>
    </div>
  );
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
  visualization,
}) => (
  <a
    key={title}
    href={url}
    className="hover:bg-gray-100 hover:no-underline cursor-pointbler flex flex-col px-4 py-3 bg-white rounded-md shadow place-content-stretch flex-grow no-underline"
  >
    <div className="flex-grow">
      <div className="text-gray-900 text-lg mb-2 font-medium justify-self-start">
        {title.replace("</a>", "")}
      </div>
      {options.length == 2 && (
        <div className="w-16 text-blue-600 bg-blue-100 rounded-md px-1 text-lg font-bold text-center mb-5">
          {formatProbability(options[0].probability)}
        </div>
      )}
      {options.length != 2 && (
        <div className="mb-2 mt-2">
          {options.map((option) => generateRow(option, options.length))}
        </div>
      )}

      {platform !== "Guesstimate" && options.length < 3 && (
        <div className={"text-gray-500 opacity-60"}>
          {displayMarkdown(description, platform)}
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
    <div className="flex">{forecastFooter(stars, platform, numforecasts)}</div>
  </a>
);

export default function displayForecasts(results, numDisplay) {
  return (
    !!results.slice &&
    results.slice(0, numDisplay).map((fuseSearchResult) => {
      let display =
        fuseSearchResult.item.platform == "Metaculus"
          ? metaculusEmbed(fuseSearchResult.item)
          : displayForecast({ ...fuseSearchResult.item });
      let displayOld = displayForecast({ ...fuseSearchResult.item });
      return displayOld;
    })
  );
}
