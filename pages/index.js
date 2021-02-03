/* Imports */
import { getPapers } from "../lib/airtablegraph.js";
import Layout from "./layout.js";
import ReactMarkdown from "react-markdown";
import Fuse from "fuse.js";
import React, { useState } from "react";
import Form from "../lib/form.js";

/* Definitions */
const opts = {
  includeScore: true,
  keys: ["title", "author", "abstractNote", "publicationTitle", "manualTags"],
};
const initialValues = {
  query: "",
  typeBlogPost: true,
  typeManuscript: true,
  typeConferencePaper: true,
  typeJournalArticle: true,
  typeReport: true,
};
let linkStyle = "text-blue-500 hover:text-blue-700 visited:text-blue-700 hover:underline cursor-pointer";

/* Helper functions */
export async function getStaticProps() {
  const { papers } = await getPapers();
  return {
    props: {
      items: papers,
    },
  };
}

let displayForecast = ({
  id,
  title,
  author,
  shahBlurb,
  publicationYear,
  manualTags,
  publicationTitle,
  abstractNote,
  itemType,
  score,
  onChangeQuery,
  index,
  url,
}) => {
  return (
    <div key={id} className="pb-6 pt-3">
      <div>
        {author.split(";").map((item) => (
          <span
            className="mr-1 cursor-pointer"
            onClick={() => onChangeQuery(item)}
          >
            {item}
          </span>
        ))}
        <span className="ml-2 mr-2">
          <a href={url} className="font-bold">
            {title}
          </a>
          ,
        </span>
        <span className="text-gray-400">({publicationYear})</span>
      </div>
      <div className="text-sm text-gray-400">
        <span
          className="underline mr-2 cursor-pointer"
          onClick={() => onChangeQuery(publicationTitle)}
        >
          {publicationTitle}
        </span>
        {manualTags.split(";").map((item) => (
          <span
            className="underline mr-2 cursor-pointer"
            onClick={() => onChangeQuery(item)}
          >
            {item}
          </span>
        ))}{" "}
      </div>
      <blockquote className="relative p-2 border-l-4 bg-neutral-100 text-neutral-600 border-neutral-500 quote mt-4 mb-2">
        <div className="prose sm:prose-sm max-w-none">
          <ReactMarkdown>{shahBlurb.slice(0, 1000)}</ReactMarkdown>
        </div>
        <div className="text-sm text-blue-400"> - Rohin Shah</div>
      </blockquote>
    </div>
  );
};

// Using this for search:
// https://github.com/krisk/Fuse/search?q=%24and

/* Body */

export default function Home({ items }) {
  const [values, setValues] = useState(initialValues);
  const [results, setResults] = useState([]);

  let fuse = new Fuse(items, opts);
  let onChangeQuery = (query) => {
    console.log("Changing queyr", query);
    setValues({ ...values, query });
    const results = fuse.search(query);
    setResults(results);
  };
  return (
    <Layout key="index">
      <div className="mb-5">
        <h1 className="text-4xl text-gray-900 tracking-tight mb-2 text-center">
          Metaforecasts
        </h1>
      </div>
      <label className="block mb-4">
        <Form
          values={values}
          onChange={(result) => {
            setValues(result);
            const results = fuse.search(result.query);
            setResults(results);
          }}
        />
      </label>
      {results
        .slice(0, 10)
        .map((fuseSearchResult) =>
        displayForecast({ ...fuseSearchResult.item, onChangeQuery, score: fuseSearchResult.score, index: fuseSearchResult.refIndex })
        )}
    </Layout>
  );
}
