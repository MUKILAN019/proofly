"use client";
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function Home() {
  const router = useRouter();

  const signInOnlyAppearance = {
    elements: {
      footerAction: {
        display: "none", 
      },
      card: "rounded-lg shadow-xl",
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-600/20"></div>
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Header */}
      <header className="relative z-10 p-6 flex justify-end">
        <SignedIn>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-2 border border-white/20">
            <UserButton afterSignOutUrl="/" />
          </div>
        </SignedIn>
        <SignedOut>
          <SignInButton
            mode="modal"
            signUpUrl={null}
            appearance={signInOnlyAppearance}
            redirectUrl="/did-setup"
          >
            <button className="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl hover:from-blue-500 hover:to-blue-600 transition-all duration-300 shadow-xl hover:shadow-blue-500/25 transform hover:-translate-y-1">
              Sign In
            </button>
          </SignInButton>
        </SignedOut>
      </header>

      {/* Main Container */}
      <div className="relative z-10 w-full px-6 py-12">
        
        {/* Header Section */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl mb-8 shadow-2xl">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.5-2A11.95 11.95 0 0012 2.5a11.95 11.95 0 00-8.5 3.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent mb-6 tracking-tight">
            ProoFLY
          </h1>
          <p className="text-2xl text-slate-300 font-medium max-w-4xl mx-auto leading-relaxed">
            Decentralized Real-World Asset Platform for University Students
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20 max-w-7xl mx-auto">
          
          {/* Left Column - Content */}
          <div className="space-y-8">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 leading-tight">
                Unlock Your Student Rights in the 
                <span className="text-blue-400 block mt-2">Decentralized Economy</span>
              </h2>
              
              <p className="text-xl text-slate-300 leading-relaxed mb-8">
                Proofly empowers University students with exclusive access to Real-World Asset (RWA) 
                fractionalization opportunities while providing verifiable educational benefits through 
                blockchain technology.
              </p>
            </div>

            {/* CTA Section */}
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl">
              <h3 className="text-3xl font-bold text-white mb-6">
                Ready to Get Started?
              </h3>
              <p className="text-slate-300 mb-8 leading-relaxed text-lg">
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
                  <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/25 flex items-center justify-center space-x-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    <span className="text-lg">Start ProoFLY / Login with College ID</span>
                  </button>
                </SignInButton>
              </SignedOut>

              <SignedIn>
                <div className="text-center">
                  <div className="bg-emerald-50/10 border border-emerald-300/30 rounded-2xl p-6 mb-6 backdrop-blur-sm">
                    <div className="flex items-center justify-center space-x-3 mb-4">
                      <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p className="text-emerald-200 font-semibold text-lg">You're already signed in!</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => router.push('/dashboard')}
                    className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-500/25 flex items-center justify-center space-x-3"
                  >
                    <span className="text-lg">Go to Dashboard</span>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
                </div>
              </SignedIn>
            </div>
          </div>

          {/* Right Column - Image */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
              <img 
                src="/assets/student.png"
                alt="Student Graduate" 
                className="relative rounded-3xl shadow-2xl border-4 border-blue-400/50 w-full max-w-[550px] h-auto object-cover"
              />
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-20 max-w-6xl mx-auto">
          <div className="group relative bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 hover:-translate-y-2">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-600/10 rounded-3xl"></div>
            <div className="relative z-10">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mr-6 shadow-xl">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold text-white">RWA Fractionalization</h3>
              </div>
              <p className="text-slate-300 leading-relaxed">
                Participate in fractional ownership of real-world assets with exclusive student-focused investment opportunities.
              </p>
            </div>
          </div>

          <div className="group relative bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl hover:shadow-emerald-500/10 transition-all duration-500 hover:-translate-y-2">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-green-600/10 rounded-3xl"></div>
            <div className="relative z-10">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mr-6 shadow-xl">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold text-white">Proof Right Benefits</h3>
              </div>
              <p className="text-slate-300 leading-relaxed">
                Claim exclusive educational offers and benefits verified through your decentralized student identity.
              </p>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="text-center max-w-4xl mx-auto">
          <p className="text-slate-300 font-semibold mb-8 text-xl">Exclusively for University Students</p>
          <div className="flex flex-wrap justify-center gap-8 text-slate-300">
            <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-3 border border-white/20">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">Secure DID Authentication</span>
            </div>
            <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-3 border border-white/20">
              <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="font-medium">Blockchain Verified</span>
            </div>
            <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-3 border border-white/20">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="font-medium">Student Community</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/20 mt-20 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-8 text-center max-w-7xl">
          <p className="text-slate-300 leading-relaxed">
            © 2025 Proofly. Built for University Students.
            <span className="block mt-1 text-slate-400">Powered by Decentralized Identity & Blockchain Technology.</span>
          </p>
        </div>
      </footer>
    </div>
  );
}