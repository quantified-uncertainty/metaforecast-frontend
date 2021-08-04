// import fetch from "fetch"
import axios from "axios"

export async function uploadToImgur(dataURL,handleGettingImgurlImage){
  let request = {
    method: 'post',
    url: "https://api.imgur.com/3/image",
    headers: {
      "Authorization": "Bearer 8e9666fb889318515a62208560d4e8393dac26d8"
    },
    data: {
      type: 'base64',
      image: dataURL.split(',')[1],
    },
    redirect: 'follow'
  };
    
  let response = await axios(request)
  .then(response => response.data)
  //.then(result => console.log(result))
  //.catch(error => console.log('error', error));
  console.log(response)
  console.log(dataURL)
  let url = `https://i.imgur.com/${response.data.id}.jpg`
  handleGettingImgurlImage(url)
  /*
    axios.post("https://api.imgur.com/3/image", requestOptions)
      .then(response => response.data.text())
      .then(result => console.log(result))
      .catch(error => console.log('error', error));
  */
}