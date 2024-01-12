import Head from "next/head";
import Image from "next/image";
import { Inter } from "@next/font/google";
import { useEffect } from "react";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  
  // redirect to theday
  useEffect(() => {
    window.location.href = "/theday";
  }, []);
  return <></>;
}
