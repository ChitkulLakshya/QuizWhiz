
import ClientComponent from './client';

export async function generateStaticParams() {
  return [{ quizId: 'demo' }];
}

export default function Page(props: any) {
  return <ClientComponent {...props} />;
}
