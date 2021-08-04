import Link from "next/link";
import Head from "next/head";
import { AiOutlineCompass } from "react-icons/ai";
// import { GiDiceEightFacesEight } from "react-icons/gi";
const IconElement = AiOutlineCompass
const classNameSelected = (isSelected) =>
  `py-4 px-2 ml-4 text-md font-medium cursor-pointer border-b-2 border-transparent ${isSelected
    ? "text-blue-700 border-blue-700"
    : "text-gray-400 hover:text-blue-500 hover:border-blue-500"
  }`;

export default function Layout(props) {
  return (
    <div>
      <Head>
        <title>Metaforecast</title>
        <link rel="icon" href="/favicon.svg" />
      </Head>
      <div>
        <nav className="bg-white shadow">
          <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="items-center justify-between flex">
              <div className="flex sm:flex-row">
                <Link href={`/`} passHref className="font-bold">
                  <a className="no-underline font-md justify-center items-center flex">
                    <span className="mr-2 sm:text-lg text-blue-800">
                      <IconElement />
                    </span>
                    <span className="text-sm sm:text-2xl text-gray-700">Metaforecast</span>
                  </a>
                </Link>
                <div className={`flex py-4 px-2 sm:ml-4 text-base text-gray-400 ${props.lastUpdated || "hidden"}`}>
                  <div className="hidden sm:inline-flex items-center text-gray-700">
                    
                    <svg className="ml-4 mr-1 mt-1" height="10" width="16">
                      <circle cx="4" cy="4" r="4" fill="rgb(29, 78, 216)" />
                    </svg>
                    
                    <span>{`Last updated: ${props.lastUpdated ? props.lastUpdated.slice(0,10) : "unknown" }`}</span>
                  </div>
              </div>
              </div>
              
              <div className="flex flex-row-reverse items-start space-x-4 text-sm sm:text-lg md:text-lg lg:text-lg">
                <Link href={`/embed`} passHref>
                  <span className={classNameSelected(props.page === "embed")}>
                    Embed
                  </span>
                </Link>
                <Link href={`/about`} passHref>
                  <span className={classNameSelected(props.page === "about")}>
                    About
                  </span>
                </Link>
                <Link href={`/`} passHref>
                  <span className={classNameSelected(props.page === "search")}>
                    Search
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </nav>
        <main>
          <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left pt-5">
            {props.children}
          </div>
        </main>
      </div>
    </div>
  );
}