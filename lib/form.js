import React, { useState, useEffect } from "react";

export default function Form({ value, onChange }) {
  const handleInputChange = (event) => {
    event.preventDefault();
    onChange(event.target.value); // In this case, the query, e.g. "COVID.19"
  };

  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <div className="flex items-center justify-center rounded-md">
        <input
          className="mt-1 block w-6/12 text-gray-700 rounded-sm border-gray-300"
          type="text"
          value={value}
          onChange={handleInputChange}
          name="query"
          id="Test"
          label="Query"
          placeholder="Search for forecasts and estimates about..."
          onSubmit={(e) => e.preventDefault()}
        />
      </div>
    </form>
  );
}
