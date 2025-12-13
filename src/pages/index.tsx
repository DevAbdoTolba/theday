import React from "react";

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
