import React from "react";
import { GetStaticProps } from "next";
import { useRouter } from "next/router";
 
interface Props {
  subject: string;
  initialData: any;
  semesterIndex: number;
}

export default function SubjectPage({
  subject,
  initialData,
  semesterIndex,
}: Props) {
  const router = useRouter();
 
  // Fallback state
  if (router.isFallback) {
    return (
      <>Loading...</>
    );
  }

  return (
    <>
      hello
    </>
  );
}

export const getStaticPaths = async () => {
  
  return {
    paths: [],
    fallback: true,  
  };
};

export const getStaticProps: GetStaticProps = async (context) => {
 
    return {
      props: { 
        subject: "", 
        initialData: {}, 
        semesterIndex: 1,
        buildTime: 0,
      },
    };

};