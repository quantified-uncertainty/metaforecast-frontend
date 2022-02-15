import displayForecasts from "./displayForecasts.js";
import displayOneForecast from "./displayOneForecastForCapture.js";

export function displayForecastsWrapperForSearch({
  results,
  numDisplay,
  showId
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {displayForecasts({ results: results || [], numDisplay, showId })}
    </div>
  );
}

export function displayForecastsWrapperForCapture({
  results,
  hasDisplayBeenCaptured,
  setHasDisplayBeenCaptured,
  whichResultToDisplayAndCapture,
}) {
  console.log({
    results,
    hasDisplayBeenCaptured,
    setHasDisplayBeenCaptured,
    whichResultToDisplayAndCapture,
  })
  return (
    <div className="grid grid-cols-1  w-full justify-center">
      {displayOneForecast({
        result: results[whichResultToDisplayAndCapture],
        hasDisplayBeenCaptured,
        setHasDisplayBeenCaptured,
      })}
    </div>
  );
}