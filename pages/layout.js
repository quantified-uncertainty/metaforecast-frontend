import Link from "next/link";
import Head from "next/head";
import { AiOutlineCompass } from "react-icons/ai";
// import { GiDiceEightFacesEight } from "react-icons/gi";
import { Logo2 } from "../lib/icons/index.js";

/* Utilities */
const IconElement = AiOutlineCompass;
const classNameSelected = (isSelected) =>
  `py-4 px-2 ml-4 text-md font-medium cursor-pointer border-b-2 border-transparent ${
    isSelected
      ? "text-blue-700 border-blue-700"
      : "text-gray-400 hover:text-blue-500 hover:border-blue-500"
  }`;
const isCaptureSelected = (captureToggle) =>
  `py-4 px-2 ml-4 text-md font-medium cursor-pointer border-2 border-transparent ${
    captureToggle == "capture"
      ? "text-blue-700 border-blue-700"
      : "text-gray-400 hover:text-blue-500 hover:border-blue-500"
  }`;
const changeCaptureToggle = (captureToggle) =>
  captureToggle == "capture" ? "search" : "capture";

/* Main */
export default function Layout({
  page,
  lastUpdated,
  children,
  captureToggle,
  switchCaptureToggle,
}) {
  const refreshPage = () => {
    // window.location.reload(true);
    window.location.replace(window.location.pathname);
  };
  return (
    <div>
      <Head>
        <title>Metaforecast</title>
        <link rel="icon" href="/icons/logo.svg" />
      </Head>
      <div>
        <nav className="bg-white shadow">
          <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="items-center justify-between flex">
              <div className="flex sm:flex-row">
                <button onClick={refreshPage}>
                  <a className="no-underline font-md justify-center items-center flex">
                    <span className="mr-2 sm:text-lg text-blue-800">
                      <Logo2 className="mt-1 mr-1 h-8 w-8" />
                    </span>
                    <span className="text-sm sm:text-2xl text-gray-700">
                      Metaforecast
                    </span>
                  </a>
                </button>
                <div
                  className={`flex py-4 px-2 sm:ml-4 text-base text-gray-400 ${
                    lastUpdated || "hidden"
                  }`}
                >
                  <div className="hidden sm:inline-flex items-center text-gray-700">
                    <svg className="ml-4 mr-1 mt-1" height="10" width="16">
                      <circle cx="4" cy="4" r="4" fill="rgb(29, 78, 216)" />
                    </svg>

                    <span>{`Last updated: ${
                      lastUpdated ? lastUpdated.slice(0, 10) : "unknown"
                    }`}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-row-reverse items-start space-x-4 text-sm sm:text-lg md:text-lg lg:text-lg">
                <button
                  className="mt-4"
                  onClick={() =>
                    switchCaptureToggle(changeCaptureToggle(captureToggle))
                  }
                >
                  <span
                    className={`${
                      page === "search" || page == "capture" ? "" : "hidden"
                    } ${isCaptureSelected(captureToggle)}`}
                  >
                    Capture
                  </span>
                </button>
                <Link href={`/about`} passHref>
                  <span className={classNameSelected(page === "about")}>
                    About
                  </span>
                </Link>
                <button
                  onClick={() => switchCaptureToggle("search")}
                  className="mt-4"
                >
                  <Link href={`/`} passHref>
                    <span className={classNameSelected(page === "search")}>
                      Search
                    </span>
                  </Link>
                </button>
              </div>
            </div>
          </div>
        </nav>
        <main>
          <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left pt-5">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
