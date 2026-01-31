
import ClientComponent from './client';

export async function generateStaticParams() {
  return [{ quizId: 'demo' }];
}

// @ts-ignore
export default function Page({ params }: { params: any }) {
  // In Next.js 15, params is a Promise. But for static export with generateStaticParams, 
  // we can usually just rely on Client Component using useParams() for the ID.
  // However, passing params directly might be tricky if it's a promise.
  // Simplest is to NOT pass it, and let ClientComponent use `useParams()`.
  return <ClientComponent />;
}
