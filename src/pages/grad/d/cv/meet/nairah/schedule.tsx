import Head from "next/head";
import type { GetServerSideProps } from "next";
import { Alert, Box, Button, Typography } from "@mui/material";
import OpenInNewRounded from "@mui/icons-material/OpenInNewRounded";
import { NAIRAH_DESTINATION } from "../../../../../../components/cv-review/reviewers";

interface Props {
  readonly fullName: string;
  readonly email: string;
}

export default function NairahSchedulePage({ fullName, email }: Props) {
  const calendlyUrl = new URL(NAIRAH_DESTINATION.url);
  calendlyUrl.searchParams.set("name", fullName);
  calendlyUrl.searchParams.set("email", email);

  return (
    <>
      <Head>
        <title>Schedule with Nairah A. | TheDay</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <Box component="main" sx={{ minHeight: "100dvh", bgcolor: "#000", color: "#fff", px: { xs: 1.25, sm: 3 }, py: { xs: 1.25, sm: 2.5 } }}>
        <Box sx={{ width: "100%", maxWidth: "72rem", mx: "auto" }}>
          <Typography component="h1" sx={{ fontSize: { xs: "1.65rem", sm: "2.5rem" }, fontWeight: 1000, letterSpacing: "-0.055em" }}>Choose your time with Nairah.</Typography>
          <Alert severity="warning" sx={{ mt: 1.5, mb: 2, bgcolor: "rgba(255,230,0,0.11)", color: "#fff", border: "1px solid rgba(255,230,0,0.65)", "& .MuiAlert-icon": { color: "#ffe600" } }}>
            On Calendly, enter the InstaPay account holder&apos;s name and the email used in InstaPay exactly, letter by letter.
          </Alert>
          <Box component="iframe" src={calendlyUrl.toString()} title="Choose a Calendly time with Nairah" sx={{ display: "block", width: "100%", minHeight: { xs: "760px", sm: "820px" }, border: 0, borderRadius: "18px", bgcolor: "#fff" }} />
          <Button component="a" href={calendlyUrl.toString()} target="_blank" rel="noopener noreferrer" endIcon={<OpenInNewRounded />} sx={{ mt: 1.5, color: "#fff", textTransform: "none", fontWeight: 850 }}>Open Calendly in a new tab</Button>
        </Box>
      </Box>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async (context) => {
  const requestId = context.query.request;
  if (typeof requestId !== "string" || !/^[a-f\d]{24}$/i.test(requestId)) return { notFound: true };

  const [{ connectMongo }, { default: CvPaymentSubmissionModel }] = await Promise.all([
    import("../../../../../../lib/mongo"),
    import("../../../../../../lib/models/cv-payment-submission"),
  ]);
  await connectMongo();
  const submission = await CvPaymentSubmissionModel.findOne({
    _id: requestId,
    status: "confirmed",
  }).select("fullName email");

  if (!submission?.fullName || !submission.email) return { notFound: true };
  return { props: { fullName: submission.fullName, email: submission.email } };
};
