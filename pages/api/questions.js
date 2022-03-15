// see: https://nextjs.org/docs/api-routes/introduction

import axios from "axios";

async function middleware() {
  try {
    let response = await axios.get(
      `https://api.metaforecast.org/metaforecast-all-questions`
    );
    let data = response.data;
    return data;
  } catch (error) {
    console.log(error);
    return {
      message:
        "Server error. You should ping @NunoSempere on Twitter, or send him an email to nuno.semperelh@protonmail.com",
      error: error,
    };
  }
}

export default async function handler(req, res) {
  let response = await middleware();
  res.status(200).send(response);
}
