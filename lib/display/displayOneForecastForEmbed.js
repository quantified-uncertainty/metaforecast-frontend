import { useRef, useState, useEffect } from "react";
import domtoimage from 'dom-to-image'; // https://github.com/tsayen/dom-to-image
import { CopyToClipboard } from "react-copy-to-clipboard";
import { displayForecast } from "./displayForecasts.js";
import { uploadToImgur } from "../worker/uploadToImgur.js"
import { info } from "autoprefixer";
// import { exportComponentAsPNG } from 'react-component-export-image';
// import * as htmlToImage from 'html-to-image';

function displayOneForecastInner(result, containerRef){
  return(
    <div ref={containerRef}>
      {result ? displayForecast({ ...result.item, score: result.score, showTimeStamp: true}) : null}
    </div>
  )
}

let domToImageWrapper = (reactRef) => {
  let node = reactRef.current
  console.log(node)
  const scale = 3 // Increase for better quality
  const style = {
      transform: 'scale('+scale+')',
      transformOrigin: 'top left',
      width: node.offsetWidth + "px",
      height: node.offsetHeight + "px"
  }
  const param = {
      height: node.offsetHeight * scale,
      width: node.offsetWidth * scale,
      quality: 1,
      style
  }
  return domtoimage.toJpeg(node, param)
}

let generateHtml = (result, imgSrc) => {
  let html = `<a href="${result.item.url} target="_blank""><img src="${imgSrc}" alt="Metaforecast.org snapshot of ''${result.item.title}'', from ${result.item.platform}"></a>`
  return(html)
}

let generateMarkdown = (result, imgSrc) => {
  let markdown = `[![](${imgSrc})](${result.item.url})`
  return(markdown)
}

let generateSource = (result, imgSrc, displayEmbed) => {
  const [htmlButtonStatus, setHtmlButtonStatus] = useState("Copy HTML");
  const [markdownButtonStatus, setMarkdownButtonStatus] = useState("Copy markdown");
  let handleHtmlButton = () => {
    setHtmlButtonStatus("Copied")
    let newtimeoutId = setTimeout(async () => {
      setHtmlButtonStatus("Copy HTML")
    }, 2000);
  }
  let handleMarkdownButton = () => {
    setMarkdownButtonStatus("Copied")
    let newtimeoutId = setTimeout(async () => {
      setMarkdownButtonStatus("Copy markdown")
    }, 2000);
  }

  if(result && imgSrc && displayEmbed){
    return(
      <div className="grid">
        <p className="bg-gray-100 cursor-pointer px-3 py-2 rounded-md shadow text-grey-7000 font-mono text-sm">{generateHtml(result, imgSrc)}</p>
        <CopyToClipboard text={generateHtml(result, imgSrc)}
          onCopy={() => handleHtmlButton()}>
          <button 
          className="bg-blue-500 cursor-pointer px-3 py-2 rounded-md shadow text-white mb-4 hover:bg-blue-600"
          >
          {htmlButtonStatus}
          </button>
        </CopyToClipboard>

        <p className="bg-gray-100 cursor-pointer px-3 py-2 rounded-md shadow text-grey-7000 font-mono text-sm">{generateMarkdown(result, imgSrc)}</p>
        <CopyToClipboard text={generateMarkdown(result, imgSrc)}
          onCopy={() => handleMarkdownButton()}
          >
          <button 
            className="bg-blue-500 cursor-pointer px-3 py-2 rounded-md shadow text-white hover:bg-blue-600 active:scale-120"
            >
            {markdownButtonStatus}
          </button>
        </CopyToClipboard>
      </div>
    )
  }else{
    return null
  }
}

let generateIframeURL = (result) => {
  let iframeURL = ""
  if(result){ // if check not strictly necessary today
    iframeURL = result.item.url.replace("questions", "questions/embed").split("/")
    iframeURL.pop();
    iframeURL.pop();
    iframeURL = iframeURL.join("/");
  }
  return(iframeURL)
}

let metaculusEmbed = (result) => {
  //console.log(item.url)
  let platform = ""
  let iframeURL = ""
  if(result){
    iframeURL = generateIframeURL(result)
    platform = result.item.platform
  }

  return (
    /* <div> <div className="grid justify-self-center place-self-center"> */
        <iframe
          className={`${platform =="Metaculus" ? "" : "hidden"} flex h-80 w-full justify-self-center self-center`}
          src={iframeURL}/>
    /* </div></div> */
  );
};

let generateMetaculusIframeHTML = (result) => {
  if(result){
    let iframeURL = generateIframeURL(result)
    return(`<iframe src="${iframeURL}" height="400" width="600"/>`)
  }else{
    return null
  }
}


let generateMetaculusSource = (result, displayEmbed) => {
  const [htmlButtonStatus, setHtmlButtonStatus] = useState("Copy HTML");
  let handleHtmlButton = () => {
    setHtmlButtonStatus("Copied")
    let newtimeoutId = setTimeout(async () => {
      setHtmlButtonStatus("Copy HTML")
    }, 2000);
  }

  if(result && displayEmbed && result.item.platform == "Metaculus"){
    return(
      <div className="grid">
        <p className="bg-gray-100 cursor-pointer px-3 py-2 rounded-md shadow text-grey-7000 font-mono text-sm">{generateMetaculusIframeHTML(result)}</p>
        <CopyToClipboard text={generateMetaculusIframeHTML(result)}
          onCopy={() => handleHtmlButton()}>
          <button 
          className="bg-blue-500 cursor-pointer px-3 py-2 rounded-md shadow text-white mb-4 hover:bg-blue-600"
          >
          {htmlButtonStatus}
          </button>
        </CopyToClipboard>
      </div>
    )
  }else{
    return null
  }
}


export default function displayOneForecast (result, displayEmbed, setDisplayEmbed){
  const containerRef = useRef(null);
  //const imgRef = useRef(null);
  const [imgSrc, setImgSrc] = useState("");
  const [mainButtonStatus, setMainButtonStatus] = useState("Generate embed code and image");
  
  let exportAsPictureAndCode = () => {
    console.log(containerRef.current)
    let handleGettingImgurlImage = (imgurUrl) => {
      setImgSrc(imgurUrl)
      setMainButtonStatus("Done!")
      let newtimeoutId = setTimeout(async () => {
        setMainButtonStatus("Generate embed code and image")
      }, 2000);
    }
    //domtoimage.toPng(containerRef.current)
    domToImageWrapper(containerRef)
    .then(async function (dataUrl) {
        //var img = new Image();
        //img.src = dataUrl;
        //document.body.appendChild(img);
        if(dataUrl){
          uploadToImgur(dataUrl, handleGettingImgurlImage)
          //setImgSrc(dataUrl)
        }
    })
    .catch(function (error) {
        console.error('oops, something went wrong!', error);
    });
  }//

  function generateEmbedButton(result, exportAsPictureAndCode){
    let handleClick = () => {
      exportAsPictureAndCode()
      setMainButtonStatus("Processing...")
      setDisplayEmbed(true)
      setImgSrc("")
    }
    if(result){
      return(
        <button onClick={() => handleClick()} className="bg-blue-500 cursor-pointer px-5 py-4 bg-white rounded-md shadow text-white hover:bg-blue-600 active:bg-gray-700">
            {mainButtonStatus}
        </button>
      )
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full justify-center">
      <div className="flex col-span-1 items-center justify-center">
        {displayOneForecastInner(result, containerRef)}
      </div>
      <div className="flex col-span-1 items-center justify-center">
        {generateEmbedButton(result, exportAsPictureAndCode)}
      </div>
      <div className="flex col-span-1 items-center justify-center">
        <img src={imgSrc} className={displayEmbed ? "" : "hidden"}></img>
      </div>
      <div className="flex col-span-1 items-center justify-center">
        <div>
        {generateSource(result, imgSrc, displayEmbed)}
        </div>
      </div>
      <div className="flex col-span-1 items-center justify-center mb-8">
        {metaculusEmbed(result)}
      </div>
      <div className="flex col-span-1 items-center justify-center">
        <div>
        {generateMetaculusSource(result, displayEmbed)}
        </div>
      </div>
      <br></br>
    </div>
  );
 }

 // https://stackoverflow.com/questions/39501289/in-reactjs-how-to-copy-text-to-clipboard
// Note: https://stackoverflow.com/questions/66016033/can-no-longer-upload-images-to-imgur-from-localhost
// Use: http://imgurtester:3000/embed for testing.

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