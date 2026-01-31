
import ClientComponent from './client';

export async function generateStaticParams() {
  return [{ quizId: 'demo' }];
}

// @ts-ignore
export default function Page({ params }: { params: any }) {
  return <ClientComponent />;
}
