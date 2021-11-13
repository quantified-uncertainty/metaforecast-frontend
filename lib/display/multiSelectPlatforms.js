import React from 'react';
import Select from 'react-select';

export default function MultiSelectPlatform({ onChange, value }) {
    let options = [
        { value: "AstralCodexTen", label: "AstralCodexTen" },
        { value: 'Betfair', label: 'Betfair' },
        { value: "CoupCast", label: "CoupCast" },  
        { value: 'CSET-foretell', label: 'CSET-foretell' },
        { value: "Estimize", label: "Estimize" },
        { value: 'Elicit', label: 'Elicit' },
        { value: "FantasySCOTUS", label: "FantasySCOTUS" },
        { value: 'Foretold', label: 'Foretold' },
        { value: 'GiveWell/OpenPhilanthropy', label: 'GiveWell/OpenPhilanthropy' },
        { value: 'Good Judgment', label: 'Good Judgment' },
        { value: 'Good Judgment Open', label: 'Good Judgment Open' },
        { value: 'Guesstimate', label: 'Guesstimate' },
        { value: 'Hypermind', label: 'Hypermind' },
        { value: 'Kalshi', label: 'Kalshi' },
        { value: 'Metaculus', label: 'Metaculus' },
        { value: 'Omen', label: 'Omen' },
        { value: 'Peter Wildeford', label: 'Peter Wildeford' },
        { value: 'PolyMarket', label: 'PolyMarket' },
        { value: 'PredictIt', label: 'PredictIt' },
        { value: 'Smarkets', label: 'Smarkets' },
        { value: 'WilliamHill', label: 'WilliamHill' },
        { value: 'X-risk estimates', label: 'X-risk estimates' }
    ]

    return (
        <Select
            defaultValue={options.filter(option => (option.value != "Elicit" && option.value != "Omen"))}
            isMulti
            name="colors"
            options={options}
            className="basic-multi-select w-full text-gray-700"
            onChange={onChange}
            classNamePrefix="select"
            value={value}
            instanceId="multiselect-platforms"
        />
    )
}

