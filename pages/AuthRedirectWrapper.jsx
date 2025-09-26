"use client";
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

function AuthRedirectWrapper({ children }) {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Only redirect if auth is loaded, we're client-side, signed in, and on home page
    if (isLoaded && isClient && isSignedIn && router.pathname === '/') {
      router.push("/manager");
    }
  }, [isLoaded, isClient, isSignedIn, router, router.pathname]);

  // Show loading state while auth is loading
  if (!isLoaded || !isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return <>{children}</>;
}

export default AuthRedirectWrapper;