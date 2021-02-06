import React, { useState, Component } from 'react';

export default function Dropdown({ value, onChange, options, howmanystars }) {

  const [selectedOption, setSelectedOption] = useState(options)
  const handleSelectOption = (event) => {
    let newOption = selectedOption[event.target.value]
    //console.log("Selected Option", newOption)
    onChange(event.target.value)
  }

  return (
    <select
      onChange={e => handleSelectOption(e)}
      className="border-none"
    >
      {
        options.map((address, key) => {
          console.log("value", value)       
          console.log("address", address)       
          console.log("key", key)
          if(howmanystars(address)==value){
            console.log("Jackpot")
            return( 
            <option key={key} value={address} selected>
              {address}
              </option>
          )
          }else{
            return( <option key={key} value={address}>
            {address}
           </option>)
          }
         
        })
      }
    </select>
 )


}

