"use client";
import React, { createContext, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/router";
import default2110 from "./data.json";
import Loading from "../components/Loading";

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
  const q = useSearchParams().get("q") ?? "";
  const router = useRouter();
  const [transcript, setTranscript] = useState<Transcript | defaultData | null>(
    null
  );
  const [loadingTranscript, setLoadingTranscript] = useState(true);
  const [className, setClassName] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!router.isReady) return;
    console.log("here " + q + " <== Q");

    function thereQ() {}
    function noQ() {}

    function stored() {}
    function notStored() {}

    function valid() {}
    function notValid() {}

    if (q) {
      // check if stored
      if (
        JSON.parse(localStorage.getItem("classes") as string) &&
        JSON.parse(localStorage.getItem("classes") as string).some(
          (storedClass: any) => storedClass.class === q
        )
      ) {
        // ========= STORED =========
        const storedClasses =
          JSON.parse(localStorage.getItem("classes") as string) || [];

        const storedClass = storedClasses.find(
          (storedClass: any) => storedClass.id === q
        );

        if (storedClass) {
          setTranscript(
            JSON.parse(localStorage.getItem(storedClass.class) as string)
          );
          setClassName(storedClass.class);
        }
      } else {
        // ========= !STORED =========

        fetch(`/api/getTranscript?className=${q}`)
          .then((res) => res.json())
          .then((res) => {
            // ========= VALID =========

            // capturing lets
            let transcript = res.transcript.data;
            let className = res.transcript.class;

            // setting data
            setTranscript({ semesters: transcript });
            setClassName(className);
            setLoadingTranscript(false);

            // caching data to localStorage store for 1 week
            // transcript
            localStorage.setItem(
              "transcript",
              JSON.stringify({ semesters: res.transcript.data })
            );

            // className

            localStorage.setItem("className", className);

            // class cache
            if (className)
              localStorage.setItem(
                className,
                JSON.stringify({ semesters: res.transcript.data })
              );

            // classes
            const classes =
              JSON.parse(localStorage.getItem("classes") as string) || [];

            const isDuplicate = classes.some(
              (storedClass: any) =>
                storedClass.class === className && storedClass.id === q
            );
            if (!isDuplicate) {
              localStorage.setItem(
                "classes",
                JSON.stringify([...classes, { class: className, id: q }])
              );
            }
          })
          .catch((error) => {
            console.error("Error fetching data: ", error);
            setError("Error fetching data");
            // ========= !VALID =========

            setTranscript(default2110);
            setClassName("default");

            setLoadingTranscript(false);
          });
      }
    } else {
      setTranscript(default2110);
      setClassName("default");
      setLoadingTranscript(false);
    }
  }, [q, router.isReady]);

  return (
    <DataContext.Provider
      // @ts-ignore
      value={{ transcript, className, loadingTranscript, error }}
    >
      {/* {loadingTranscript ? <Loading /> : <Loading />} */}
      {loadingTranscript ? <Loading /> : children}
    </DataContext.Provider>
  );
};
