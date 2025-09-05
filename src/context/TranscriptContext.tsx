"use client";
import React, { createContext, useEffect, useState } from "react";
import { useRouter } from "next/router";
import default2110 from "../Data/data.json";
import Loading from "../components/Loading";
import { getItem, getJSON, setItem, removeItem, setJSON } from "@/src/utils/storage";

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
  setLoadingTranscript: (loading: boolean) => void;
  error: string | null;
  setClassName: (className: string) => void;
}

const initialDataContextValue: DataContextValue = {
  transcript: null,
  loadingTranscript: false,
  className: "",
  setLoadingTranscript: () => {},
  setClassName: () => {},
  error: null,
};

export const DataContext = createContext<DataContextValue>(
  initialDataContextValue
);

export const TranscriptContextProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const router = useRouter();
  const q = router.query.q ?? "";
  const [transcript, setTranscript] = useState<Transcript | defaultData | null>(
    null
  );
  const [loadingTranscript, setLoadingTranscript] = useState(true);
  const [className, setClassName] = useState("-1");
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

    function handlingWeekCacheClearAndAdd() {
      // check if the transcript is stored for more than a week
      const storedAtRaw = getItem("transcriptStoredAt");
      if (!storedAtRaw) {
        setItem("transcriptStoredAt", new Date().getTime().toString());
      } else {
        const storedAt = parseInt(storedAtRaw);

        if (new Date().getTime() - storedAt > 604800000) {
          setItem("transcriptStoredAt", new Date().getTime().toString());
          removeItem("transcript");
          // remove each class which name is in classes
          const classes = getJSON<any[]>("classes", []) || [];
          classes.forEach((storedClass: any) => {
            try {
              removeItem(storedClass.class);
            } catch (e) {
              console.log(e);
            }
          });
          // localStorage.removeItem("classes");
        }
      }
    }
    function fetchData() {
      fetch(`/api/getTranscript?className=${q}`)
        .then((res) => {
          if (res?.ok) return res.json();
          else throw new Error("Error");
        })
        .then((res) => {
          // ========= VALID =========
          console.log(" Valid");

          // ================== Handling Caching time ==================
          /*
        classes
        class in classes
        transcript
        className
      */

          // capturing lets

          let transcript = res.transcript.data;
          let className = res.transcript.class;

          // setting data
          setTranscript({ semesters: transcript });
          setClassName(className);

          // caching data to localStorage store for 1 week
          // transcript
          setJSON("transcript", { semesters: res.transcript.data });

          // className
          setClassName(className);

          // class cache
          if (className) setJSON(className, { semesters: res.transcript.data });

          // classes
          const classes = getJSON<any[]>("classes", []) || [];

          const isDuplicate = classes.some(
            (storedClass: any) =>
              storedClass.class === className && storedClass.id === q
          );
          if (!isDuplicate) {
            setJSON("classes", [...classes, { class: className, id: q }]);
          }
        })
        .catch((error) => {
          setClassName("default");
          console.error("Error fetching data: ", error);

          setError("Error fetching data");
          // ========= !VALID =========
          console.log("Not Valid, setting transcript to default2110", default2110);

          setTranscript(default2110);
          setClassName("default");
          // navigate to http://localhost:3000/theday/q/default
          router.push("/theday/q/default");
        })
        .finally(() => {
          setLoadingTranscript(false);
        });
    }
    function handlingContext() {
      if (q === "default") {
        console.log("Default route detected, setting transcript to default2110", default2110);
        setTranscript(default2110);
        setClassName("default");
        setLoadingTranscript(false);
        return;
      }
      if (q) {
        // check if stored
  const storedClasses = getJSON<any[]>("classes", []) || [];

        if (storedClasses.some((storedClass: any) => storedClass.id === q)) {
          console.log("Stored");

          // ========= STORED =========
          const storedClasses = getJSON<any[]>("classes", []) || [];
          const storedClass = storedClasses.find(
            (storedClass: any) => storedClass.id === q
          );

          if (storedClass) {
            const stored = getJSON<any>(storedClass.class, null);
            if (stored) {
              setTranscript(stored);
              setClassName(storedClass.class);
              setLoadingTranscript(false);
            } else {
              fetchData();
            }
          }
        } else {
          console.log("Not Stored");
          // ========= !STORED =========
          fetchData();
        }
      } else {
        const storedClassName = getItem("className");
        if (storedClassName) {
          setClassName(storedClassName);
          // @ts-ignore
          setTranscript(getJSON<any>(storedClassName, null));
          setLoadingTranscript(false);
        } else {
          setTranscript(default2110);
          setClassName("default");
          setLoadingTranscript(false);
        }
      }
    }

    handlingWeekCacheClearAndAdd();

    handlingContext();
  }, [q, router.isReady]);

  useEffect(() => {
    if (className == "-1") return;
    if (className) {
      setItem("className", className);
      // @ts-ignore
      setJSON("transcript", getJSON<any>(className, null));
    }
  }, [className]);

  return (
    <DataContext.Provider
      // @ts-ignore
      value={{
        transcript,
        className,
        loadingTranscript,
        setLoadingTranscript,
        setClassName,
        error,
      }}
    >
      {/* {loadingTranscript ? <Loading /> : <Loading />} */}
      {loadingTranscript ? <Loading /> : children}
    </DataContext.Provider>
  );
};
