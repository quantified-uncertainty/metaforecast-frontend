import React from 'react';
import Select from 'react-select';

export default function MultiSelectPlatform({ onChange, value }) {
    let options = [
        { value: 'CSET-foretell', label: 'CSET-foretell' },
        { value: 'Elicit', label: 'Elicit' },
        { value: 'GiveWell/OpenPhilanthropy', label: 'GiveWell/OpenPhilanthropy' },
        { value: 'Good Judgment', label: 'Good Judgment' },
        { value: 'Good Judgment Open', label: 'Good Judgment Open' },
        { value: 'Guesstimate', label: 'Guesstimate' },
        { value: 'Hypermind', label: 'Hypermind' },
        { value: 'Metaculus', label: 'Metaculus' },
        { value: 'Omen', label: 'Omen' },
        { value: 'PolyMarket', label: 'PolyMarket' },
        { value: 'PredictIt', label: 'PredictIt' },
        { value: 'Smarkets', label: 'Smarkets' },
    ]

    return (
        <Select
            defaultValue={options.filter(option => (option.value != "Elicit" && option.value != "Omen"))}
            isMulti
            name="colors"
            options={options}
            className="basic-multi-select w-full"
            onChange={onChange}
            classNamePrefix="select"
            value={value}
            instanceId="multiselect-platforms"
        />
    )
}

