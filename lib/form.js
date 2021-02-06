import React, { useState, useEffect } from "react";

export default function Form({ values, onChange }) {
  const handleInputChange = (event) => {
    event.preventDefault();
    const { name, value, type, checked } = event.target;
    const newValues = { ...values, [name]: value }; // e.g., query: "COVID"
    console.log(newValues)
    onChange(newValues);
  };
  
  return (
    <form onSubmit={e => e.preventDefault()}>
      <div className="block flex items-center justify-center">
        <input
          className="mt-1 block w-6/12"
          type="text"
          value={values.query}
          onChange={handleInputChange}
          name="query"
          label="Query"
          placeholder="Search for forecasts about..."
          onSubmit={e => e.preventDefault()}
        />
      </div>
    </form>  
  );
}
