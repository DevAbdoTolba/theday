export default function SubjectPage({
  subject,
  initialData,
  semesterIndex,
}: any) {
 

  return (
    <>
      hello
    </>
  );
}

export const getStaticPaths = async () => {
  
  return {
    paths: ['CSS'],
    fallback: false,  
  };
};
export const getStaticProps: any = async (context: any) => {
 
    return {
      props: { 
        subject: "", 
        initialData: {}, 
        semesterIndex: 1,
        buildTime: 0,
      },
    };

};