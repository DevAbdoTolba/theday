import { NextApiRequest, NextApiResponse } from "next";
import mongoose from "mongoose";

// Define your interface
interface ITranscript {
  class: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    const { className } = req.query as { className: string };
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
  const options: mongoose.ConnectOptions = {};
  const URI = process.env.MONGODB_URI as string;

  const connection = await mongoose.connect(URI, options);

  // Use SchemaDefinitionConfig to avoid the Union complexity error
  let TranscriptModel: mongoose.Model<ITranscript>;

  try {
    TranscriptModel = connection.model<ITranscript>("classes");
  } catch (error) {
    // The "dump" fix: Cast the Schema constructor or use a simpler definition
    // to stop TS from recursing into the Mongoose core types.
    const schema = new mongoose.Schema<ITranscript>({
        class: { type: String }
    } as any); 
    
    TranscriptModel = connection.model<ITranscript>("classes", schema);
  }

  console.log("Connected to the database", mongoose.connection.readyState);

  const transcript = await TranscriptModel.findOne({ _id: className }).select(
    "class"
  ).lean(); // .lean() makes the return a plain JS object, which matches your expected output

  return transcript;
}