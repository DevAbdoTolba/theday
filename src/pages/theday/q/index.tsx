"use client";

import React from "react";

export default function Index() {
  {
    /* navigate to the page that is the default for className from localStorage if there was nothing located then fetch for default */
  }
  React.useEffect(() => {
    const className = localStorage.getItem("className");
    const classes = JSON.parse(localStorage.getItem("classes") as string);
    const q = classes?.find((c: any) => c?.class === className);
    if (q && className && classes) {
      window.location.href = `/theday/q/${q.id}`;
    } else {
      window.location.href = "/theday/q/default";
    }
  });
  return <></>;
}
