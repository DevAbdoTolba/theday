import { NextApiRequest, NextApiResponse } from "next";
import mongoose from "mongoose";

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
  const options: mongoose.ConnectOptions = {};
  const URI = process.env.MONGODB_URI as string;

  // get all data
  const connection = await mongoose.connect(URI, options);

  // get the model
  interface ITranscript {
    class?: string;
    [key: string]: any;
  }
  let TranscriptModel: mongoose.Model<ITranscript>;

  const transcriptSchema = new mongoose.Schema<ITranscript>({}, { strict: false });

  try {
    // Trying to get the existing model to prevent OverwriteModelError
    TranscriptModel = connection.model<ITranscript>("classes");
  } catch (error) {
    // If the model does not exist, then define it
    TranscriptModel = connection.model<ITranscript>("classes", transcriptSchema);
  }
  console.log("Connected to the database", mongoose.connection.readyState);

  // get the data
  const transcript = await TranscriptModel.findOne({ _id: className }).select(
    "class"
  );
//   console.log(transcript._doc.class);

  return transcript;
}
