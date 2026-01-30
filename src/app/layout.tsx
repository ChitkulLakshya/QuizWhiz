import type { Metadata } from 'next';
import { Space_Grotesk, Archivo_Black, Roboto_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister';
import InstallPWAButton from '@/components/InstallPWAButton';
import ConsoleConfig from '@/components/ConsoleConfig';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

const archivoBlack = Archivo_Black({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-archivo-black',
  display: 'swap',
});

const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  variable: '--font-roboto-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'QuizWhiz - Real-time Quiz Platform',
  description: 'Create and join real-time quizzes.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${spaceGrotesk.variable} ${archivoBlack.variable} ${robotoMono.variable} font-sans antialiased min-h-screen flex flex-col bg-[#050505]`} suppressHydrationWarning>
        <ConsoleConfig />
        <ServiceWorkerRegister />
        {children}
        <InstallPWAButton />
        <Toaster />
      </body>
    </html>
  );
}
