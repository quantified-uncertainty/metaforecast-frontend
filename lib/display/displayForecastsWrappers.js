import displayForecasts from "./displayForecasts.js";
import displayOneForecast from "./displayOneForecastForCapture.js";

export function displayForecastsWrapperForSearch({results, numDisplay, displayCapture, setDisplayCapture}){
    return(
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayForecasts({results, numDisplay})}
        </div>
    )
}

export function displayForecastsWrapperForCapture({results, numDisplay, displayCapture, setDisplayCapture, whichToDisplayCapture}){
    return(
        <div className="flex justify-center">
            {displayOneForecast({result: results[whichToDisplayCapture], displayCapture, setDisplayCapture})}
        </div>
    )
}