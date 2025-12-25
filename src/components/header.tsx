'use client';

import Link from 'next/link';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { auth } from '@/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Header() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between space-x-4 sm:space-x-0">
        <Link href="/" className="flex items-center space-x-2">
          <Icons.logo className="h-8 w-8" />
          <span className="inline-block font-headline text-2xl font-bold">QuizWhiz</span>
        </Link>
        <div className="flex items-center gap-4">
            {user ? (
                <>
                    <Button variant="ghost" asChild>
                        <Link href="/admin">Dashboard</Link>
                    </Button>
                    <Button variant="outline" onClick={handleLogout}>Logout</Button>
                </>
            ) : (
                <Button variant="ghost" asChild>
                    <Link href="/login">Admin Login</Link>
                </Button>
            )}
        </div>
      </div>
    </header>
  );
}
