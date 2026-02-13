import type { Metadata } from 'next';
import { Space_Grotesk, Archivo_Black, Roboto_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister';
import InstallPWAButton from '@/components/InstallPWAButton';
import ConsoleConfig from '@/components/ConsoleConfig';
import Navbar from '@/components/Navbar';

import MobileWrapper from '@/components/mobile/MobileWrapper';

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
  manifest: '/site.webmanifest',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '192x192',
        url: '/android-chrome-192x192.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '512x512',
        url: '/android-chrome-512x512.png',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${spaceGrotesk.variable} ${archivoBlack.variable} ${robotoMono.variable} font-sans antialiased min-h-screen flex flex-col bg-[#050505]`} suppressHydrationWarning>
        <ConsoleConfig />
        <ServiceWorkerRegister />
        <MobileWrapper>
          <Navbar />
          {children}
        </MobileWrapper>
        <InstallPWAButton />
        <Toaster />
      </body>
    </html>
  );
}
