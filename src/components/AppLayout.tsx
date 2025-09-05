import React from "react";
import Head from "next/head";
import Box from "@mui/material/Box";
import Header from "./Header";

type HeaderProps = React.ComponentProps<typeof Header>;

interface AppLayoutProps {
  title: string;
  header?: Partial<HeaderProps>;
  children: React.ReactNode;
}

export default function AppLayout({ title, header, children }: AppLayoutProps) {
  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <Header title={title} isSearch={false} {...header} />
      <Box sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 3 } }}>{children}</Box>
    </>
  );
}
