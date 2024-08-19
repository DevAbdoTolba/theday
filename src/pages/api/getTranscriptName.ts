import { NextApiRequest, NextApiResponse } from "next";
// import mongoose from "mongoose";
import axios from 'axios';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    // Get the transcript name
    // get the param class from the request

    const { className } = req.query as { className: string };
    // if className is not provided, return 400
    if (!className) {
      res.status(400).json({ message: "Missing parameters 'className' " });
      return;
    }
    let transcriptName;
    try {
      transcriptName = await getTranscriptName(className);
    } catch (error) {
      res.status(400).json({ message: "wrong ID" });
    }
    res.status(200).json({ transcriptName });
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}

async function getTranscriptName(className: string) {
  // Connect to the database
  // const options: mongoose.ConnectOptions = {};
  // const URI = process.env.MONGODB_URI as string;

  // // get all data
  // const connection = await mongoose.connect(URI, options);

  // // get the model
  // let TranscriptModel: mongoose.Model<any>;

  // try {
  //   // Trying to get the existing model to prevent OverwriteModelError
  //   TranscriptModel = connection.model("classes");
  // } catch (error) {
  //   // If the model does not exist, then define it
  //   TranscriptModel = connection.model("classes", new mongoose.Schema({}));
  // }
  // console.log("Connected to the database", mongoose.connection.readyState);




//   var axios = require('axios');
// var data = JSON.stringify({
//     "collection": "classes",
//     "database": "theday",
//     "dataSource": "Cluster0",
//     "filter": { "_id": { "$oid": className } },
//     "projection": {
//       "class": 1
//   }
    
// });
// var config = {
//     method: 'post',
//     url: 'https://eu-central-1.aws.data.mongodb-api.com/app/data-nezlskl/endpoint/data/v1/action/findOne',
//     headers: {
//       'Content-Type': 'application/json',
//       'Access-Control-Request-Headers': '*',
//       'api-key': process.env.MONGO_API_KEY ,
//     },
//     data: data
// };


let url = 'https://eu-central-1.aws.data.mongodb-api.com/app/data-nezlskl/endpoint/data/v1/action/findOne'


const response = await axios.post(url, {
  "collection": "classes",
  "database": "theday",
  "dataSource": "Cluster0",
  "filter": { "_id": { "$oid": className } },
  "projection": {
    "class": 1
}
}, {
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Request-Headers': '*',
    'api-key': process.env.MONGO_API_KEY ,
  }
})


  
  // get the data
  // const transcript = await TranscriptModel.findOne({ _id: className }).select(
  //   "class"
  // );
//   console.log(transcript._doc.class);

  return response.data.document;
}
