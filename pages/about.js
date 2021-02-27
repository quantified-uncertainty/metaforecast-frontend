import React from "react";
import ReactMarkdown from "react-markdown";
import gfm from "remark-gfm";
import Layout from "./layout.js";
let readmeMarkdownText = `# About

This is a search engine for probabilities. Given a query, it searches for relevant questions in various prediction markets and forecasting platforms (namely CSET-foretell, Elicit, Good Judgment, Good Judgment Open, Guesstimate, Hypermind, Metaculus, Omen, Polymarket, PredictIt and Smarkets). For example, try searching for "China", "North Korea", "Semiconductors", "COVID", or "Trump".

You can read more about the back-end used to fetch probabilities [here](https://github.com/QURIresearch/metaforecasts/blob/multipleOptions/README.md), or view the source for the front-end [here](https://github.com/QURIresearch/metaforecast-website-nextjs). 

## Advanced search
If your initial search doesn't succeed, you might want to try tinkering with the advanced search. In particular, try increasing or decreasing the stars threshold, or changing the number of search results shown. 

## What are stars, and how are they computed?

Star ratings—e.g. ★★★☆☆—are an indicator of the quality of an aggregate forecast for a question. These ratings currently try to reflect my own best judgment based on my experience forecasting on these platforms. Thus, stars have a strong subjective component which could be formalized and refined in the future. 

Currently, stars are computed using a simple rule dependent on both the platform and the number of forecasts:
- CSET-foretell: ★★☆☆☆, but ★☆☆☆☆ if a question has less than 100 forecasts
- Elicit: ★☆☆☆☆
- Good Judgment (various superforecaster dashboards): ★★★★☆
- Good Judgment Open: ★★★☆☆, ★★☆☆☆ if a question has less than 100 forecasts
- Hypermind: ★★★☆☆
- Metaculus: ★★★★☆ if a question has more than 300 forecasts, ★★★☆☆ if it has more than 100, ★★☆☆☆ otherwise.
- Omen: ★☆☆☆☆
- Polymarket: ★★☆☆☆
- PredictIt: ★★☆☆☆
- Smarkets: ★★☆☆☆

Of these, I am most uncertain about Smarkets and Hypermind, as I haven't used them as much. Also note that, whatever other redeeming features they might have, prediction markets rarely go above 95% or below 5%.

## Who is behind this?
[Nuño Sempere](https://nunosempere.github.io), with help from Ozzie Gooen, from the [Quantified Uncertainty Research Institute](https://quantifieduncertainty.org/). We both have several other forecasting-related projects, but one which might be particularly worth highlighting is this [forecasting newsletter](http://forecasting.substack.com/).

`;

export default function About() {
  return (
    <Layout key="index" page="about">
      <div className="px-2 py-2 bg-white rounded-md shadow place-content-stretch flex-grow place-self-center">
        <ReactMarkdown
          plugins={[gfm]}
          children={readmeMarkdownText}
          allowDangerousHtml
          className="m-5"
        />
      </div>
    </Layout>
  );
}
