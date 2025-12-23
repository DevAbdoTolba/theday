import React from "react";
import { GetStaticProps } from "next"; 
 
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