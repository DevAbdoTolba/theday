export default function SubjectPage() {
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
 
    return;
};