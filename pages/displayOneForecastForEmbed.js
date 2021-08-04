import React, { useRef, useState, useEffect } from "react";
import domtoimage from 'dom-to-image'; // https://github.com/tsayen/dom-to-image
// import html2canvas from 'html2canvas'
import { displayForecast } from "./displayForecasts.js";
import { uploadToImgur } from "../lib/uploadToImgur.js"
// import { exportComponentAsPNG } from 'react-component-export-image';
// import * as htmlToImage from 'html-to-image';

function displayOneForecast(result, containerRef){
  return(
    <div ref={containerRef}>
      {result ? displayForecast({ ...result.item, score: result.score}) : null}
    </div>
  )
}

function constructImage(imgRef, imgSrc){
  if(imgSrc != null){
    return(
      <div ref={imgRef}>
        <img src={imgSrc} ></img>
      </div>
    )
  }else{
    return(
      <div ref={imgRef}>
      </div>
    )
  }
}

export default function DisplayOneForecast (result){
  const containerRef = useRef(null);
  const imgRef = useRef(null);
  const [imgSrc, setImgSrc] = useState("")

  let exportAsPicture = () => {
    console.log(containerRef.current)
    domtoimage.toSvg(containerRef.current)
    .then(async function (dataUrl) {
        //var img = new Image();
        //img.src = dataUrl;
        //document.body.appendChild(img);
        // imgRef
        if(dataUrl){
          uploadToImgur()
        }
        setImgSrc(dataUrl)
    })
    .catch(function (error) {
        console.error('oops, something went wrong!', error);
    });
  }//

  return (
    <React.Fragment>
      {displayOneForecast(result, containerRef)}
      <button onClick={() => exportAsPicture()}>Export as picture</button>
      <div ref={imgRef}>
        <img src={imgSrc} ></img>
      </div>
      <br></br>
    </React.Fragment>
  );
 }


// import { exportComponentAsJPEG, exportComponentAsPDF, exportComponentAsPNG } from 'react-component-export-image';
// import React from 'react';

/*
class ComponentToPrint extends React.Component {
 render() {
   return <div>Hello World</div>;
 }
}
export default class DisplayOneForecast extends React.Component {
 constructor(props) {
   super(props);
   this.componentRef = React.createRef();
 }

 render() {
   return (
     <React.Fragment>
       <displayOneForecast ref={this.componentRef} />
       <button onClick={() => exportComponentAsJPEG(this.componentRef)}>
         Export As JPEG
       </button>
       <button onClick={() => exportComponentAsPDF(this.componentRef)}>
         Export As PDF
       </button>
       <button onClick={() => exportComponentAsPNG(this.componentRef)}>
         Export As PNG
       </button>
     </React.Fragment>
   );
 }
}
*/

 // Maybe using some kind of hook so that this works on the clinet
 // https://reactjs.org/docs/hooks-state.html
 // https://stackoverflow.com/questions/55151041/window-is-not-defined-in-next-js-react-app
 // https://www.npmjs.com/package/react-component-export-image
 // https://stackoverflow.com/questions/38093760/how-to-access-a-dom-element-in-react-what-is-the-equilvalent-of-document-getele