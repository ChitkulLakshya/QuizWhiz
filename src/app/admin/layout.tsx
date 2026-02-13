'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/firebase';
import { isAdminEmail } from '@/lib/auth';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        console.warn('⛔ No user found. Redirecting to login...');
        router.push('/login');
        return;
      }
      if (user.email) {
        try {
          let isAdmin = await isAdminEmail(user.email);

          if (!isAdmin) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            isAdmin = await isAdminEmail(user.email);
          }

          if (!isAdmin) {
            console.warn(`⛔ User ${user.email} is not admin after retry. Redirecting to login...`);
            await auth.signOut();
            router.push('/login');
            return;
          }
        } catch (error) {
          console.error('Error verifying admin status:', error);
          await auth.signOut();
          router.push('/login');
          return;
        }
      } else {
        await auth.signOut();
        router.push('/login');
        return;
      }

      console.log('✅ User session verified:', user.email);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-[#050505] text-[#ccff00] font-mono">
        <div className="flex flex-col items-center gap-6 animate-pulse">
          <div className="w-16 h-16 border-2 border-[#ccff00] rounded-full flex items-center justify-center relative">
            <div className="absolute inset-0 bg-[#ccff00] opacity-20 animate-ping rounded-full"></div>
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shield-check"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" /><path d="m9 12 2 2 4-4" /></svg>
          </div>
          <div className="flex flex-col items-center gap-2">
            <h2 className="text-xl font-black uppercase tracking-widest">Security Check</h2>
            <p className="text-xs text-gray-500 uppercase tracking-widest">Verifying Admin Clearance...</p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
