import React from "react";
import Head from "next/head";
import Image from "next/image";
import { Inter } from "@next/font/google";
import { useEffect } from "react";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  // redirect to theday
  React.useEffect(() => {
    const className = localStorage.getItem("className");
    const classes = JSON.parse(localStorage.getItem("classes") as string);
    const Class = classes?.find((c: any) => c?.class === className);
    if (Class && className && classes) {
      window.location.href = `/theday/q/${Class.id}`;
    } else {
      window.location.href = "/theday/q/default";
    }
  });
  return <></>;
}
