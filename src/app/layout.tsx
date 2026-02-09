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

// ... (other font definitions remain same, skipping to keep context concise if possible, but replace tool needs context) 
// Actually I need to be careful with replace tool. I'll include the import at the top and the wrapper in the body.

// Let's do imports first


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
