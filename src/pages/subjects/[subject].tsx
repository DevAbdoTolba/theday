export default function SubjectPage(props: {}) {
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
 
    return {props:{}}
};