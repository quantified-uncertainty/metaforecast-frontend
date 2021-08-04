import React, { useState } from 'react';

export default function DropdownForStars({ value, onChange, options, howmanystars }) {

  // const [selectedOption, setSelectedOption] = useState(options)
  const handleSelectOption = (event) => {
    //let newOption = selectedOption[event.target.value]
    onChange(event.target.value)
  }

  return (
    <select
      onChange={e => handleSelectOption(e)}
      className="border-none"
      value={options.filter(option => howmanystars(option) ==value)[0]}
    >
      {
        options.map((address, key) => {
            return( 
            <option key={key} value={address}>
              {address}
              </option>
          )
        })
      }
    </select>
 )
}
