"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { getItem, getJSON, isBrowser } from "../../../utils/storage";

export default function Index() {
  const router = useRouter();
  // Navigate to class-specific page or default
  useEffect(() => {
    if (!isBrowser) return;
    const className = getItem("className");
    const classes = getJSON<any[]>("classes", []);
    const q = classes?.find((c: any) => c?.class === className);
    const target = q && className ? `/theday/q/${q.id}` : "/theday/q/default";
    router.replace(target);
  }, [router]);
  return null;
}
