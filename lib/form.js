import React, { useState, useEffect } from "react";

export default function Form({ value, onChange }) {
  const handleInputChange = (event) => {
    event.preventDefault();
    onChange(event.target.value); // In this case, the query, e.g. "COVID.19"
  };
  
  return (
    <form onSubmit={e => e.preventDefault()}>
      <div className="block flex items-center justify-center">
        <input
          className="mt-1 block w-6/12"
          type="text"
          value={value}
          onChange={handleInputChange}
          name="query"
          id="Test"
          label="Query"
          placeholder="Search for forecasts about..."
          onSubmit={e => e.preventDefault()}
        />
      </div>
    </form>  
  );
}
