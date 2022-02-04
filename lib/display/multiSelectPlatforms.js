import React from 'react';
import Select from 'react-select';
import { platforms } from '../platforms.js';

export default function MultiSelectPlatform({ onChange, value }) {
    let options = platforms
    return (
        <Select
            defaultValue={options.filter(option => (option.value != "Elicit" && option.value != "Omen"))}
            isMulti
            name="colors"
            options={platforms}
            className="basic-multi-select w-full text-gray-700"
            onChange={onChange}
            classNamePrefix="select"
            value={value}
            instanceId="multiselect-platforms"
        />
    )
}

