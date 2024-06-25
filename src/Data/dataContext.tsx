"use client";
import React, { createContext, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import default2110 from "./data.json";

interface Transcript {
  transcript: {
    _id: string;
    class: string;
    data: {
      index: number;
      subject: {
        name: string;
        abbreviation: string;
      }[];
    }[];
  };
}

interface defaultData {
  semesters: {
    index: number;
    subjects: { name: string; abbreviation: string }[];
  }[];
}

interface DataContextValue {
  transcript: Transcript | defaultData | null;
  loadingTranscript: boolean;
  className: string;
  error: string | null;
}

const initialDataContextValue: DataContextValue = {
  transcript: null,
  loadingTranscript: false,
  className: "",
  error: null,
};

export const DataContext = createContext<DataContextValue>(
  initialDataContextValue
);

export const DataContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // print colored and change size in console log says context here
  // console.log(
  //   "%ccontext",
  //   "color: #fff; background-color: #f44336; font-size: 16px; padding: 4px 8px; border-radius: 4px"
  // );

  const [transcriptData, setTranscript] = useState<defaultData | Transcript[]>(
    default2110
  );
  const [loadingTranscript, setLoadingTranscript] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const q = useSearchParams().get("q");
  useEffect(() => {
    const fetchTranscript = async () => {
      // get q from url name

      try {
        setLoadingTranscript(true);
        const response = await fetch("/api/getTranscript?className=" + q);
        const data = await response.json();
        // check if transcript is null
        if (data.transcript == null) {
          // throw an error
          throw new Error("Transcript not found");
        }
        setError(null);
        setTranscript(data);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        }
        setTranscript(default2110);
      } finally {
        setLoadingTranscript(false);
      }
    };

    fetchTranscript();
  }, [q]);

  // check which type is transcriptData
  let transcript: Transcript[] | defaultData = transcriptData;
  let className: string;

  transcript = transcriptData;

  // @ts-ignore
  className = transcriptData?.transcript
    ? transcriptData.transcript.class
    : "default";

  // @ts-ignore
  transcript = transcript?.transcript
    ? // @ts-ignore
      { semesters: transcript?.transcript?.data }
    : transcript;
  useEffect(() => {
    if (q == null) return;
    localStorage.setItem("transcript", JSON.stringify(transcript));
    localStorage.setItem("className", className);
  }, [transcript, className]);
  return (
    <DataContext.Provider
      // @ts-ignore
      value={{ transcript, className, loadingTranscript, error }}
    >
      {children}
    </DataContext.Provider>
  );
};
