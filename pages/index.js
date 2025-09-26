"use client";
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import { useRouter } from 'next/router';
import { useEffect } from 'react';


export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // This will be handled by your middleware/auth logic
  }, []);

  const signInOnlyAppearance = {
    elements: {
      footerAction: {
        display: "none", 
      },
      card: "rounded-lg shadow-xl",
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-blue-800">

      <header className="p-4 flex justify-end">
        <SignedIn>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
        <SignedOut>
          <SignInButton
            mode="modal"
            signUpUrl={null}
            appearance={signInOnlyAppearance}
            redirectUrl="/did-setup"
          >
            <button className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition duration-150 shadow-md">
              Sign In
            </button>
          </SignInButton>
        </SignedOut>
      </header>

      {/* Main Container */}
      <div className="w-full px-6 py-12">
        
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 tracking-tight">
            ProoFLY
          </h1>
          <p className="text-xl text-blue-100 font-medium max-w-2xl mx-auto leading-relaxed">
            Decentralized Real-World Asset Platform for University Students
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
          
          {/* Left Column - Content */}
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 leading-tight">
                Unlock Your Student Rights in the 
                <span className="text-blue-300 block mt-2">Decentralized Economy</span>
              </h2>
              
              <p className="text-lg text-blue-100 leading-relaxed mb-8">
                Proofly empowers University students with exclusive access to Real-World Asset (RWA) 
                fractionalization opportunities while providing verifiable educational benefits through 
                blockchain technology.
              </p>
            </div>

            {/* CTA Section */}
            <div className="bg-white rounded-lg p-8 shadow-xl">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Ready to Get Started?
              </h3>
              <p className="text-gray-700 mb-8 leading-relaxed">
                Sign in with your University email to access your personalized dashboard 
                and start exploring RWA opportunities.
              </p>
              
              <SignedOut>
                <SignInButton 
                  mode="modal" 
                  signUpUrl={null} 
                  appearance={signInOnlyAppearance}
                  redirectUrl="/did-setup"
                >
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    <span>Start ProoFLY / Login with College ID</span>
                  </button>
                </SignInButton>
              </SignedOut>

              <SignedIn>
                <div className="text-center">
                  <p className="text-green-700 font-medium mb-4 flex items-center justify-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>You're already signed in!</span>
                  </p>
                  <button 
                    onClick={() => router.push('/dashboard')}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                  >
                    <span>Go to Dashboard</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
                </div>
              </SignedIn>
            </div>
          </div>

          {/* Right Column - Image */}
          <div className="flex justify-center lg:justify-end">
            <img 
              src="https://lakeland.edu/perch/resources/sadgasg-w600.png" 
              alt="Student Graduate" 
              className="rounded-xl shadow-2xl border-4 border-[#FFF9AF] w-full max-w-[550px] h-auto object-cover"
            />
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-20">
          <div className="bg-white rounded-lg p-8 shadow-lg">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">RWA Fractionalization</h3>
            </div>
            <p className="text-gray-700 leading-relaxed">
              Participate in fractional ownership of real-world assets with exclusive student-focused investment opportunities.
            </p>
          </div>

          <div className="bg-white rounded-lg p-8 shadow-lg">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Proof Right Benefits</h3>
            </div>
            <p className="text-gray-700 leading-relaxed">
              Claim exclusive educational offers and benefits verified through your decentralized student identity.
            </p>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="text-center">
          <p className="text-blue-200 font-medium mb-6">Exclusively for University Students</p>
          <div className="flex flex-wrap justify-center gap-8 text-blue-100">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">Secure DID Authentication</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="font-medium">Blockchain Verified</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="font-medium">Student Community</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-blue-700 mt-20">
        <div className="container mx-auto px-6 py-8 text-center max-w-7xl">
          <p className="text-blue-200 leading-relaxed">
            © 2025 Proofly. Built for University Students.
            <span className="block mt-1">Powered by Decentralized Identity & Blockchain Technology.</span>
          </p>
        </div>
      </footer>
    </div>
  );
}