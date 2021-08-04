// import fetch from "fetch"
import axios from "axios"

export function uploadToImgur(dataURL){
  let request = {
    method: 'post',
    url: "https://api.imgur.com/3/image",
    headers: {
      "Authorization": "Bearer 8e9666fb889318515a62208560d4e8393dac26d8"
    },
    data: {
      "image": "R0lGODlhAQABAIAAAAAABP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
    },
    redirect: 'follow'
  };
    
    axios(request)
    .then(response => response.data)
    .then(result => console.log(result))
    .catch(error => console.log('error', error));
  /*
    axios.post("https://api.imgur.com/3/image", requestOptions)
      .then(response => response.data.text())
      .then(result => console.log(result))
      .catch(error => console.log('error', error));
  */
}