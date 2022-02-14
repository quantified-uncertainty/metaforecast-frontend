
import displayForecasts, { displayForecast } from "./displayForecasts.js";
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

export function displayForecastsWrapperForSecretEmbed({results}){
    let result = results ? results[0] : null
    return (
        <div>
            <div id="secretEmbed">
                {result ? displayForecast({ ...result.item, score: result.score, showTimeStamp: true, expandFooterToFullWidth: true }) : null}
            </div>
            <br></br>   
            <div id="secretObject">
                {result? JSON.stringify(result.item, null, 4) : null}
            </div>
        </div>
    )
}