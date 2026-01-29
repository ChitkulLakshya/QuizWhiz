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

      // Verify admin status
      if (user.email) {
        try {
          // Check admin status
          let isAdmin = await isAdminEmail(user.email);

          if (!isAdmin) {
            // Retry once after a brief delay to handle eventual consistency if user was just created
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
          // If error (e.g. network), we might not want to kick them out immediately, 
          // but for security we usually should. Let's redirect to login with error.
          await auth.signOut();
          router.push('/login');
          return;
        }
      } else {
        // No email, can't verify
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
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">Verifying session…</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
