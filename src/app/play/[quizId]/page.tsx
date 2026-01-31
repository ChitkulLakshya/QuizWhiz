import ClientComponent from './client';

export async function generateStaticParams() {
  return [{ quizId: 'demo' }];
}

export default async function PlayPage({ params }: { params: Promise<{ quizId: string }> }) {
  const { quizId } = await params;
  return <ClientComponent quizId={quizId} />;
}
