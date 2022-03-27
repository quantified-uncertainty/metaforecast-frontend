### This repository is now deprecated. See [metaforecast](https://github.com/QURIresearch/metaforecast)'s monorepo instead.

This is the source code for the [metaforecast.org](https://metaforecast.org/) webpage. This is a [Next.js](https://nextjs.org/) project initially created with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app). It searches a database produced using [metaforecasts](https://github.com/QURIresearch/metaforecasts) using [Algolia](https://www.algolia.com/) (previously [Fuse](https://fusejs.io/)). 

## Getting Started

Run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project structure

- The main file is `pages/index.js`. 
- `lib/display/` contains files which produce display elements. Of these, `displayForecasts.js` is the most important one.
- `lib/workers/` contains files which interact with outside servers, or which are particularly computation intensive

In general, there is a tradeoff between:
- Using getStaticProps. Pros: Static site generation, getting everything on initial page load
- Using: getServerSideProps. Pros: Being able to make queries right after the initial page load, to e.g. parse the url 
- Using neither. Pros: Page is much lighter. Cons: Searches take slightly slower.

The way I deal with this right now is with the somewhat clunky processState function in index.js, which keeps track of whether initial page load has been dealt with and of whether the search parameters have been changed.
