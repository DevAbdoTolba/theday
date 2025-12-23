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
    paths: [{params:{subject: 'CSS'}}],
    fallback: true,  
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