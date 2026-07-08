// src/pages/grad/d/[g].tsx
// The hidden door. The route pattern is dynamic on purpose: the real key
// never appears in any client bundle, build manifest, or page source —
// validation happens server-side only, and unknown keys 404 exactly like a
// route that was never built.

import React from "react";
import Head from "next/head";
import type { GetServerSideProps } from "next";
import GradWing from "../../../components/grad/GradWing";

interface Props {
  gradKey: string;
  title: string;
  tagline: string;
}

export default function GradSectionPage({ gradKey, title, tagline }: Props) {
  return (
    <>
      <Head>
        <title>{`${title} | TheDay`}</title>
        <meta name="robots" content="noindex, nofollow" />
        <link rel="icon" href="/main.png" />
      </Head>
      <GradWing gradKey={gradKey} title={title} tagline={tagline} />
    </>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const g = ctx.params?.g;
  if (typeof g !== "string") return { notFound: true };

  // Dynamic import keeps the registry (and googleapis) strictly server-side.
  const { getGradSection } = await import("../../../lib/grad-server");
  const section = getGradSection(g);
  if (!section) return { notFound: true };

  ctx.res.setHeader("Cache-Control", "no-store, max-age=0");
  ctx.res.setHeader("X-Robots-Tag", "noindex, nofollow");

  return {
    props: {
      gradKey: g.toLowerCase(),
      title: section.title,
      tagline: section.tagline,
    },
  };
};
