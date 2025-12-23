import { useRouter } from 'next/router';

export default function SubjectPage() {
  const router = useRouter();
  const { subject } = router.query;

  return (
    <>
      <h1>Subject: {subject}</h1>
      <p>This is a client-side only page - no getStaticProps, no getStaticPaths</p>
    </>
  );
}