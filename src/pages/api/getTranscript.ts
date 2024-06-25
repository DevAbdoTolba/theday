import { NextApiRequest, NextApiResponse } from "next";
import mongoose from "mongoose";

const dotenv = require("dotenv");
dotenv.config();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    // Get the transcript
    // get the param class from the request

    const { className } = req.query as { className: string };
    // if className is not provided, return 400
    if (!className) {
      res.status(400).json({ message: "Missing parameters 'className' " });
      return;
    }

    const transcript = await getTranscript(className);
    res.status(200).json({ transcript });
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}

async function getTranscript(className: string) {
  // Connect to the database
  const options: mongoose.ConnectOptions = {};
  const URI = process.env.MONGODB_URI as string;

  // get all data
  const connection = await mongoose.connect(URI, options);

  // get the model
  let TranscriptModel: mongoose.Model<any>;

  try {
    // Trying to get the existing model to prevent OverwriteModelError
    TranscriptModel = connection.model("classes");
  } catch (error) {
    // If the model does not exist, then define it
    TranscriptModel = connection.model("classes", new mongoose.Schema({}));
  }
  console.log("Connected to the database", mongoose.connection.readyState);

  // get the data
  const transcript = await TranscriptModel.findOne(
    // search of id
    { _id: className }

    // search for className object classes
    // { class: className }
  );

  return transcript;
}
