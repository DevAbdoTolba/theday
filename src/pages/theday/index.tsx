"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { getItem, getJSON, isBrowser } from "../../utils/storage";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    if (!isBrowser) return;
    const className = getItem("className");
    const classes = getJSON<any[]>("classes", []);
    const Class = classes?.find((c: any) => c?.class === className);
    const target = Class && className ? `/theday/q/${Class.id}` : "/theday/q/default";
    router.replace(target);
  }, [router]);

  return null;
}
