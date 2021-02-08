import Link from "next/link";
import Head from "next/head";

export default function Layout(props) {
  return (
    <div>
      <Head>
        <title>Metaforecasts</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div>
        <nav className="bg-gray-10">
          <div className="ml-10 mr-10 flex flex-row-reverse items-start space-x-4">
            <div className="m-5 text-black hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium cursor-pointer text-right">
              <a
                href="https://github.com/QURIresearch/metaforecasts"
                target="_blank"
              >
                How this works
              </a>
            </div>
            <div className="m-5 text-black hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium cursor-pointer text-right">
              <a href="https://airtable.com/shrUotmcMmmTdIjmX" target="_blank">
                Database
              </a>
            </div>
          </div>
        </nav>
        <main>
          <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
            <div className="py-8">{props.children}</div>
          </div>
        </main>
      </div>
    </div>
  );
}
