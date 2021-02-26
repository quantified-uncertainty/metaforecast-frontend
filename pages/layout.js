import Link from "next/link";
import Head from "next/head";

export default function Layout(props) {
  return (
    <div>
      <Head>
        <title>Metaforecast</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div>
        <nav className="bg-gray-10">
          <div className="ml-10 mr-10 flex flex-row-reverse items-start space-x-4">
            <Link href={`/about`} passHref >
              <div className="m-5 text-gray-800 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium cursor-pointer text-right">
                About
                </div>
            </Link>
            <Link href={`/`} passHref>
              <div className="m-5 text-gray-800 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium cursor-pointer text-right">
                Search
                </div>
            </Link>
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
