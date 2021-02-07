/* Imports */
import { Slider, Rail, Handles, Tracks, Ticks } from "react-compound-slider";
import React, { useState } from 'react';
// https://sghall.github.io/react-compound-slider/#/getting-started/tutorial

/* Definitions */

const sliderStyle = {  // Give the slider some width
  position: 'relative',
  width: '11em',
  height: 40,
  border: '10em',
}

const railStyle = {
  position: 'absolute',
  width: '100%',
  height: 5,
  marginTop: 35,
  borderRadius: 5,
  backgroundColor: 'lightgrey',
}
  
/* Support functions */
function Handle({
  handle: { id, value, percent },
  getHandleProps,
  displayFunction,
  handleWidth
}) {
  return (
    <div
      style={{
        left: `${percent}%`,
        position: 'absolute',
        marginLeft: -10,
        marginTop: 30,
        zIndex: 2,
        width: 15,
        height: 15,
        border: 0,
        textAlign: 'center',
        cursor: 'pointer',
        borderRadius: '50%',
        backgroundColor: '#333333',
        color: '#333333',
      }}
      {...getHandleProps(id)}
    >
      <div style={{ fontFamily: 'Roboto', fontSize: 11, marginTop: -20, width: handleWidth, marginLeft: 0 }}>
        {displayFunction(value)}
      </div>
    </div>
  )
}

function Track({ source, target, getTrackProps }) {
  return (
    <div
      style={{
        position: 'absolute',
        height: 5,
        zIndex: 1,
        marginTop: 35,
        backgroundColor: '#546C91',
        borderRadius: 5,
        cursor: 'pointer',
        left: `${source.percent}%`,
        width: `${target.percent - source.percent}%`,
      }}
      {...getTrackProps() /* this will set up events if you want it to be clickeable (optional) */}
    />
  )
}

/* Body */
export function SliderForNumDisplay({onChange, value}){
  let displayFunction=(value)=> {
    return Math.round(value)!=1?"Display "+Math.round(value)+" results":"Display "+Math.round(value)+" result"
  }
  return(
    <Slider
      rootStyle={sliderStyle /* inline styles for the outer div. Can also use className prop. */}
      domain={[0, 200]}
      values={[value]}
      onChange={onChange}
   >
    <Rail>
      {({ getRailProps }) => (
        <div style={railStyle} {...getRailProps()} />
      )}
    </Rail>
     <Handles>
        {({ handles, getHandleProps }) => (
          <div className="slider-handles">
            {handles.map(handle => (
              <Handle
                key={handle.id}
                handle={handle}
                getHandleProps={getHandleProps}
                displayFunction={displayFunction}
                handleWidth={"11em"}
              />
            ))}
          </div>
        )}
    </Handles>
    <Tracks right={false}>
      {({ tracks, getTrackProps }) => (
        <div className="slider-tracks">
          {tracks.map(({ id, source, target }) => (
            <Track
              key={id}
              source={source}
              target={target}
              getTrackProps={getTrackProps}
            />
          ))}
        </div>
      )}
    </Tracks>
  </Slider>
  )
}

export function SliderForNumForecasts({onChange, value}){
  let displayFunction=(value)=> "Minimum # forecasts: "+value.toFixed(0)

  return(
    <Slider
      rootStyle={sliderStyle /* inline styles for the outer div. Can also use className prop. */}
      domain={[0, 1000]}
      values={[value]}
      onChange={onChange}
   >
    <Rail>
      {({ getRailProps }) => (
        <div style={railStyle} {...getRailProps()} />
      )}
    </Rail>
     <Handles>
        {({ handles, getHandleProps }) => (
          <div className="slider-handles">
            {handles.map(handle => (
              <Handle
                key={handle.id}
                handle={handle}
                getHandleProps={getHandleProps}
                displayFunction={displayFunction}
                handleWidth={"15em"}
              />
            ))}
          </div>
        )}
    </Handles>
    <Tracks right={false}>
      {({ tracks, getTrackProps }) => (
        <div className="slider-tracks">
          {tracks.map(({ id, source, target }) => (
            <Track
              key={id}
              source={source}
              target={target}
              getTrackProps={getTrackProps}
            />
          ))}
        </div>
      )}
    </Tracks>
  </Slider>
  )
}

