import Link from "next/link";
import Head from "next/head";

const classNameSelected = (isSelected) =>
  `py-4 px-2 ml-4 text-md font-medium cursor-pointer border-b-2 border-transparent ${
    isSelected
      ? "text-blue-700 border-blue-700"
      : "text-gray-400 hover:text-blue-500 hover:border-blue-500"
  }`;

export default function Layout(props) {
  return (
    <div>
      <Head>
        <title>Metaforecast</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div>
        <nav className="bg-white shadow">
          <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="items-center justify-between flex">
              <div className="flex">
                <Link href={`/`} passHref className="font-bold">
                  <a className="no-underline text-blue-500 font-semibold text-xl">
                    Metaforecast
                  </a>
                </Link>
              </div>
              <div className="flex flex-row-reverse items-start space-x-4">
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
