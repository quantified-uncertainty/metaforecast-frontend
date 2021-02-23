This is the source code for the [metaforecast.org](https://metaforecast.org/) webpage. This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app). It searches a database produced using [metaforecasts](https://github.com/QURIresearch/metaforecasts) using [Fuse](https://fusejs.io/). 

## Getting Started

Run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project structure

- Main file: `pages/index.js`
- `pages/displayForecasts.js` displays the individual forecasts
- Various files in `/lib/` provide components
- `lib/get-forecasts.js` gets forecasts when the static site is generated.

In general we want things from both getStaticProps/static site generation (speed; getting everything on initial page load) and getServerSideProps (being able to make queries right after the initial page load, to e.g. parse the url). The way I deal with this right now is with the somewhat clunky processState function in index.js, which keeps track of whether initial page load has been dealt with and of whether the number of stars is being changed. However, this feels clunky.
