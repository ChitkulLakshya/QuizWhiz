import { redirect } from 'next/navigation';

export async function generateStaticParams() {
  return [{ quizId: 'demo' }];
}

export default function Page({ params }: { params: any }) {
  const quizId = params?.quizId;
  redirect(`/play/game?quizId=${quizId}`);
}
