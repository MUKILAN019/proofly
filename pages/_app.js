"use client";
import "@/styles/globals.css";
import { ClerkProvider, SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import { useRouter } from 'next/router';
import AuthRedirectWrapper from './AuthRedirectWrapper';

export default function App({ Component, pageProps }) {
  const router = useRouter();

  const signInOnlyAppearance = {
    elements: {
      footerAction: { display: "none" },
      card: "rounded-xl shadow-2xl",
    },
  };

  const hideHeaderPages = ['/', '/sign-in'];
  const showHeader = !hideHeaderPages.includes(router.pathname);
  const headerHeight = 64;

  return (
    <ClerkProvider>
      <AuthRedirectWrapper>
        {showHeader && (
          <header className="fixed top-0 left-0 w-full h-16 flex justify-end items-center p-4 gap-6 shadow-md bg-gradient-to-r from-[#154D71] via-[#1C6EA4] to-[#147dba] z-50">
            <SignedOut>
              <SignInButton
                mode="modal"
                signUpUrl={null}
                appearance={signInOnlyAppearance}
              >
                <button className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition duration-150 shadow-md">
                  Sign In Now
                </button>
              </SignInButton>
            </SignedOut>

           <SignedIn>
            <div className="flex flex-col items-center mr-4">
              <UserButton
                afterSignOutUrl="/"
              />
              <span className="text-xs mt-1 font-medium text-gray-700">Profile</span>
            </div>
          </SignedIn>

          </header>
        )}

        <main
          className="m-0 p-0 w-full"
          style={{
            paddingTop: showHeader ? `${headerHeight}px` : '0px',
            minHeight: '100vh', 
          }}
        >
          <Component {...pageProps} />
        </main>
      </AuthRedirectWrapper>
    </ClerkProvider>
  );
}