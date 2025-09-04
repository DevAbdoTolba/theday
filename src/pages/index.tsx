import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { getItem, getJSON, isBrowser } from "../utils/storage";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    if (!isBrowser) return;
    const className = getItem("className");
    const classes = getJSON<any[]>("classes", []);
    const Class = classes?.find((c: any) => c?.class === className);
    const target = Class && className ? `/theday/q/${Class.id}` : "/theday/q/default";
    // Use router to keep SPA behavior
    router.replace(target);
  }, [router]);

  return null;
}
