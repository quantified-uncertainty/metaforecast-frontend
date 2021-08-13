import displayForecasts from "./displayForecasts.js";
import displayOneForecast from "./displayOneForecastForEmbed.js";

export function displayForecastsWrapperForSearch({results, numDisplay, displayEmbed, setDisplayEmbed}){
    return(
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayForecasts({results, numDisplay})}
        </div>
    )
}

export function displayForecastsWrapperForEmbed({results, numDisplay, displayEmbed, setDisplayEmbed, whichToDisplayEmbed}){
    return(
        <div className="flex justify-center">
            {displayOneForecast({result: results[whichToDisplayEmbed], displayEmbed, setDisplayEmbed})}
        </div>
    )
}