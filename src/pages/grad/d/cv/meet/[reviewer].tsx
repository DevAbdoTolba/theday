import React from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import type { GetServerSideProps } from "next";
import { Box, CircularProgress, Typography, IconButton } from "@mui/material";
import ArrowBackRounded from "@mui/icons-material/ArrowBackRounded";
import Link from "next/link";
import { CV_REVIEWERS } from "../../../../../components/cv-review/reviewers";

interface Props {
  reviewerId: string;
  reviewerName: string;
  bookingUrl: string;
}

export default function MeetReviewerPage({ reviewerId, reviewerName, bookingUrl }: Props) {
  const router = useRouter();

  if (router.isFallback) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", bgcolor: "#000" }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return (
    <>
      <Head>
        <title>Meet {reviewerName} | TheDay</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <Box sx={{ display: "flex", flexDirection: "column", height: "100vh", bgcolor: "#000", color: "#fff" }}>
        <Box sx={{ display: "flex", alignItems: "center", p: 2, borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
          <IconButton 
            onClick={() => router.back()}
            sx={{ color: "#fff", mr: 2 }}
          >
            <ArrowBackRounded />
          </IconButton>
          <Typography variant="h6" component="h1" sx={{ fontWeight: "bold" }}>
            Book a meeting with {reviewerName}
          </Typography>
        </Box>
        <Box sx={{ flex: 1, position: "relative" }}>
          <iframe
            src={bookingUrl}
            width="100%"
            height="100%"
            frameBorder="0"
            style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
            title={`Book a meeting with ${reviewerName}`}
          />
        </Box>
      </Box>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const reviewerId = ctx.params?.reviewer;
  
  if (typeof reviewerId !== "string") {
    return { notFound: true };
  }

  const reviewer = CV_REVIEWERS.find((r) => r.id === reviewerId);

  if (!reviewer) {
    return { notFound: true };
  }

  return {
    props: {
      reviewerId: reviewer.id,
      reviewerName: reviewer.displayName,
      bookingUrl: reviewer.booking.url,
    },
  };
};
