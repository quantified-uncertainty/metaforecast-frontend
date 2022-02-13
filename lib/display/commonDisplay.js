/* Imports */

// React
import React, { Fragment, useState } from "react";
import { useRouter } from "next/router"; // https://nextjs.org/docs/api-reference/next/router

// Parts
import Form from "./form.js";
import { SliderElement } from "./slider.js";
import MultiSelectPlatform from "./multiSelectPlatforms.js";
import ButtonsForStars from "./buttonsForStars.js";

// Data
import searchAccordingToQueryData from "../worker/searchAccordingToQueryData.js";
import { platformNames } from "../platforms.js";

/* Definitions */

/* Helper functions */

// URL slugs
let transformObjectIntoUrlSlug = (obj) => {
    let results = [];
    for (let key in obj) {
        if (typeof obj[key] == "number" || typeof obj[key] == "string") {
            results.push(`${key}=${obj[key]}`);
        } else if (key == "forecastingPlatforms") {
            let arr = obj[key].map((x) => x.value);
            let arrstring = arr.join("|");
            results.push(`${key}=${arrstring}`);
        }
    }
    let string = "?" + results.join("&");
    return string;
};


/* Body */
export default function CommonDisplay({
    initialResults,
    defaultResults,
    initialQueryParameters,
    hasCapture,
    hasAdvancedOptions,
    placeholder,
    setHasDisplayBeenCapturedOnChangeSearchInputs,
    displaySeeMoreHint,
    displayForecastsWrapper
}) {
    /* States */
    const router = useRouter();

    const [queryParameters, setQueryParameters] = useState(
        initialQueryParameters
    );
    let initialSearchSpeedSettings = {
        timeoutId: null,
        awaitEndTyping: 500,
        time: Date.now(),
    };
    const [searchSpeedSettings, setSearchSpeedSettings] = useState(
        initialSearchSpeedSettings
    );
    const [results, setResults] = useState(initialResults);
    let [advancedOptions, showAdvancedOptions] = useState(false);
    let [hasDisplayBeenCaptured, setHasDisplayBeenCaptured] = useState(false);
    let [whichResultToDisplayAndCapture, setWhichResultToDisplayAndCapture] = useState(0);

    /* Functions which I want to have access to the Home namespace */
    // I don't want to create an "defaultResults" object for each search.
    async function executeSearchOrAnswerWithDefaultResults(queryData) {
        // the queryData object has the same contents as queryParameters.
        // but I wanted to spare myself having to think about namespace conflicts.
        let filterManually = (queryData, results) => {
            if (
                queryData.forecastingPlatforms &&
                queryData.forecastingPlatforms.length > 0
            ) {
                results = results.filter((result) =>
                    forecastingPlatforms.includes(result.item.platform)
                );
            }
            if (queryData.starsThreshold == 4) {
                results = results.filter(
                    (result) => result.item.qualityindicators.stars >= 4
                );
            }
            if (queryData.forecastsThreshold) {
                // results = results.filter(result => (result.qualityindicators && result.item.qualityindicators.numforecasts > forecastsThreshold))
            }
        };

        let results;
        switch (queryData.query != "") {
            case true:
                results = await searchAccordingToQueryData(queryData);;
                break;
            case false:
                results = filterManually(defaultResults || initialResults);
                break;
            default:
                results = [];
                break;
        }
        console.log("executeSearchOrAnswerWithDefaultResults/queryData", queryData);
        setResults(results);
    };

    // I don't want the function which dispaly forecasts (displayForecasts) to change with a change in queryParameters. But I want it to have access to the queryParameters, and in particular access to queryParameters.numDisplay. Hence why this function lives inside Home.
    let getInfoToDisplayForecastsFunction = (
        displayForecastsFunction,
        {
            results,
            hasDisplayBeenCaptured,
            setHasDisplayBeenCaptured,
            whichResultToDisplayAndCapture
        }
    ) => {
        let numDisplayRounded =
            queryParameters.numDisplay % 3 != 0
                ? queryParameters.numDisplay +
                (3 - (Math.round(queryParameters.numDisplay) % 3))
                : queryParameters.numDisplay;
        console.log("numDisplay", queryParameters.numDisplay);
        console.log("numDisplayRounded", numDisplayRounded);
        return displayForecastsFunction({
            results,
            numDisplay: numDisplayRounded,
            hasDisplayBeenCaptured,
            setHasDisplayBeenCaptured,
            whichResultToDisplayAndCapture,
        });
    };

    /* State controllers */
    let onChangeSearchInputs = (newQueryParameters) => {
        setQueryParameters(newQueryParameters); // ({ ...newQueryParameters, processedUrlYet: true });
        console.log("onChangeSearchInputs/newQueryParameters", newQueryParameters);
        setResults([]);
        setHasDisplayBeenCaptured(setHasDisplayBeenCapturedOnChangeSearchInputs());
        clearTimeout(searchSpeedSettings.timeoutId);
        let newtimeoutId = setTimeout(async () => {
            console.log(
                "onChangeSearchInputs/timeout/newQueryParameters",
                newQueryParameters
            );
            let urlSlug = transformObjectIntoUrlSlug(newQueryParameters);
            let urlWithoutDefaultParameters = urlSlug
                .replace("&starsThreshold=2", "")
                .replace("&numDisplay=21", "")
                .replace("&forecastsThreshold=0", "")
                .replace(
                    `&forecastingPlatforms=${platformNames.join("|")}`,
                    ""
                );
            router.push(urlWithoutDefaultParameters);
            executeSearchOrAnswerWithDefaultResults(newQueryParameters);
            setSearchSpeedSettings({ ...searchSpeedSettings, timeoutId: null });
        }, searchSpeedSettings.awaitEndTyping);
        setSearchSpeedSettings({ ...searchSpeedSettings, timeoutId: newtimeoutId });
        // avoid sending results if user has not stopped typing.
    };

    /* Change the stars threshold */
    let onChangeStars = (value) => {
        console.log("onChangeStars/buttons", value);
        let newQueryParameters = { ...queryParameters, starsThreshold: value };
        onChangeSearchInputs(newQueryParameters);
    };

    /* Change the number of elements to display  */
    let displayFunctionNumDisplaySlider = (value) => {
        return Math.round(value) != 1
            ? "Show " + Math.round(value) + " results"
            : "Show " + Math.round(value) + " result";
    };
    let onChangeSliderForNumDisplay = (event) => {
        console.log("onChangeSliderForNumDisplay", event[0]);
        let newQueryParameters = {
            ...queryParameters,
            numDisplay: Math.round(event[0]),
        };
        onChangeSearchInputs(newQueryParameters); // Slightly inefficient because it recomputes the search in time, but it makes my logic easier.
    };

    /* Change the forecast threshold */
    let displayFunctionNumForecasts = (value) => {
        return "# Forecasts > " + Math.round(value);
    };
    let onChangeSliderForNumForecasts = (event) => {
        console.log("onChangeSliderForNumForecasts", event[0]);
        let newQueryParameters = {
            ...queryParameters,
            forecastsThreshold: Math.round(event[0]),
        };
        onChangeSearchInputs(newQueryParameters);
    };

    /* Change on the search bar */
    let onChangeSearchBar = (value) => {
        console.log("onChangeSearchBar/New query:", value);
        let newQueryParameters = { ...queryParameters, query: value };
        onChangeSearchInputs(newQueryParameters);
    };

    /*Change selected platforms */
    let onChangeSelectedPlatforms = (value) => {
        console.log("onChangeSelectedPlatforms/Change in platforms:", value);
        let newQueryParameters = {
            ...queryParameters,
            forecastingPlatforms: value,
        };
        onChangeSearchInputs(newQueryParameters);
    };

    // Capture functionality
    let onClickBack = () => {
        let decreaseUntil0 = (num) => (num - 1 > 0 ? num - 1 : 0);
        setWhichResultToDisplayAndCapture(decreaseUntil0(whichResultToDisplayAndCapture));
        setHasDisplayBeenCaptured(false);
    };
    let onClickForward = (whichResultToDisplayAndCapture) => {
        setWhichResultToDisplayAndCapture(whichResultToDisplayAndCapture + 1);
        setHasDisplayBeenCaptured(false);
        // setTimeout(()=> {onClickForward(whichResultToDisplayAndCapture+1)}, 5000)
    };

    /* Final return */
    return (
        <Fragment
            key="index"
        >
            <label className="mb-4 mt-4 flex flex-row justify-center items-center" key={"common-1"}>
                <div className="w-10/12 mb-2" key={"common-1-1"}>
                    <Form
                        value={queryParameters.query}
                        onChange={onChangeSearchBar}
                        placeholder={placeholder}
                    />
                </div>
                <div
                    className={`w-2/12 flex justify-center ml-4 md:ml-2 lg:ml-0 ${hasAdvancedOptions ? "" : "hidden"
                        }`}
                    key={"common-1-2"}
                >
                    <button
                        className="text-gray-500 text-sm mb-2"
                        onClick={() => showAdvancedOptions(!advancedOptions)}
                    >
                        Advanced options ▼
                    </button>
                </div>
                <div
                    className={`w-2/12 flex justify-center ml-4 md:ml-2 gap-1 lg:ml-0 ${hasCapture ? "" : "hidden"
                        }`}
                    key={"common-1-3"}
                >
                    <button
                        className="text-blue-500 cursor-pointer text-xl mb-3 pr-3 hover:text-blue-600"
                        onClick={() => onClickBack()}
                        key={"common-1-3-1"}
                    >
                        ◀
                    </button>
                    <button
                        className="text-blue-500 cursor-pointer text-xl mb-3 pl-3 hover:text-blue-600"
                        onClick={() => onClickForward(whichResultToDisplayAndCapture)}
                        key={"common-1-3-2"}
                    >
                        ▶
                    </button>
                </div>
            </label>

            <div
                className={`flex-1 flex-col mx-auto justify-center items-center w-full ${hasAdvancedOptions && advancedOptions ? "" : "hidden"}`}
                key={"common-2"}
            >
                <div
                    className="grid sm:grid-rows-4 sm:grid-cols-1 md:grid-rows-2 lg:grid-rows-2 grid-cols-1 md:grid-cols-3 lg:grid-cols-3 items-center content-center bg-gray-50 rounded-md px-8 pt-4 pb-1 shadow mb-4"
                    key={"common-2-1"}
                >
                    <div
                        className="flex row-start-1 row-end-1  col-start-1 col-end-4 md:row-span-1 md:col-start-1 md:col-end-1 md:row-start-1 md:row-end-1 lg:row-span-1 lg:col-start-1 lg:col-end-1 lg:row-start-1 lg:row-end-1 items-center justify-center mb-4"
                        key={"common-2-1-1"}
                    >
                        <SliderElement
                            className="flex items-center justify-center"
                            onChange={onChangeSliderForNumForecasts}
                            value={queryParameters.forecastsThreshold}
                            displayFunction={displayFunctionNumForecasts}
                            key={"common-2-1-1-1"}
                        />
                    </div>
                    <div
                        className="flex row-start-2 row-end-2  col-start-1 col-end-4 md:row-start-1 md:row-end-1 md:col-start-2 md:col-end-2 lg:row-start-1 lg:row-end-1 lg:col-start-2 md:col-end-2 items-center justify-center mb-4"
                        key={"common-2-1-2"}
                    >
                        <ButtonsForStars
                            onChange={onChangeStars}
                            value={queryParameters.starsThreshold}
                            key={"common-2-1-2-1"}
                        />
                    </div>
                    <div
                        className="flex row-start-3 row-end-3  col-start-1 col-end-4 md:col-start-3 md:col-end-3 md:row-start-1 md:row-end-1 lg:col-start-3 lg:col-end-3 lg:row-start-1 lg:row-end-1 items-center justify-center mb-4"
                        key={"common-2-1-3"}
                    >
                        <SliderElement
                            value={queryParameters.numDisplay}
                            onChange={onChangeSliderForNumDisplay}
                            displayFunction={displayFunctionNumDisplaySlider}
                            key={"common-2-1-3-1"}
                        />
                    </div>
                    <div
                        className="flex col-span-3 items-center justify-center"
                        key={"common-2-1-4"}
                    >
                        <MultiSelectPlatform
                            value={queryParameters.forecastingPlatforms}
                            onChange={onChangeSelectedPlatforms}
                            key={"common-2-1-4-1"}
                        />
                    </div>
                </div>
            </div>

            <div key={"common-3"} >
                {getInfoToDisplayForecastsFunction(displayForecastsWrapper, {
                    results,
                    hasDisplayBeenCaptured,
                    setHasDisplayBeenCaptured,
                    whichResultToDisplayAndCapture,
                })}
            </div>
            <div
                className={`${displaySeeMoreHint ? "" : "hidden"}`}
                key={"common-4"}
            >
                <p
                    className={`mt-4 mb-4 ${results.length != 0 && queryParameters.numDisplay < results.length
                        ? ""
                        : "hidden"
                        }`}
                >
                    {"Can't find what you were looking for? "}
                    <span
                        className="cursor-pointer text-blue-800"
                        onClick={() => {
                            setQueryParameters({
                                ...queryParameters,
                                numDisplay: queryParameters.numDisplay * 2,
                            });
                        }}
                    >
                        {"Show more,"}
                    </span>
                    {" or "}
                    <a
                        href="https://www.metaculus.com/questions/create/"
                        className="cursor-pointer text-blue-800 no-underline"
                        target="_blank"
                    >
                        suggest a question on Metaculus
                    </a>
                </p>
            </div>
            <br></br>
        </Fragment>
    );
}
