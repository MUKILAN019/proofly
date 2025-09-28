"use client";
import React, { useEffect, useState } from "react";
import { useUser, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/router";

export default function MainOffer() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();
  const [isAllowed, setIsAllowed] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      if (!isLoaded) return;

      // Must be signed in
      if (!user) {
        router.replace("/sign-in");
        return;
      }

      // Must have valid badge access (from session or API)
      const badgeAccess =
        sessionStorage.getItem("hasValidBadgeAccess") === "true";

      if (!badgeAccess) {
        router.replace("/"); // back to manager/login page
        return;
      }

      setIsAllowed(true);
      setChecking(false);
    };

    checkAccess();
  }, [isLoaded, user, router, getToken]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <p>Checking access...</p>
      </div>
    );
  }

  if (!isAllowed) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Student Info */}
      <div className="absolute mt-8 text-center left-2">
        <div className="inline-block bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/20">
          <p className="text-slate-300 text-lg">
            Verified Student:{" "}
            <span className="text-emerald-400 font-semibold">
              {user?.firstName || "John"} {user?.lastName || "Doe"}
            </span>
          </p>
          <p className="text-slate-400 text-sm mt-1">
            {user?.primaryEmailAddress?.emailAddress ||
              "student@university.edu"}
          </p>
        </div>
      </div>

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-emerald-600/20"></div>
        <svg
          className="absolute inset-0 w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="grid"
              width="60"
              height="60"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 60 0 L 0 0 0 60"
                fill="none"
                stroke="white"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* === Main Content === */}
      <div className="relative z-10 container mx-auto px-6 py-12 max-w-7xl">
        {/* Header Section */}
        <div className="text-center mb-16 pt-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-emerald-600 to-blue-600 rounded-2xl mb-6 shadow-2xl">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-emerald-100 to-white bg-clip-text text-transparent mb-6 tracking-tight">
            Student Benefits Portal
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Your exclusive access to premium educational resources, investment
            opportunities, and career development programs
          </p>
        </div>

        {/* Important Alert */}
        <div className="bg-blue-50/10 border border-blue-300/30 rounded-2xl p-8 mb-12 backdrop-blur-sm max-w-5xl mx-auto">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-semibold text-blue-200 mb-3">
                Verification Complete
              </h3>
              <p className="text-blue-300 text-lg leading-relaxed">
                Your digital identity has been successfully verified. All
                benefits listed below are now active and available for immediate
                use.
              </p>
            </div>
          </div>
        </div>

        {/* Premium Benefits Cards */}
        <div className="grid lg:grid-cols-2 gap-8 mb-16 max-w-6xl mx-auto">
          {/* RWA Access Card */}
          <div className="group relative bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl hover:shadow-emerald-500/10 transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-green-600/10 rounded-3xl"></div>
            <div className="relative z-10">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mr-6 shadow-xl">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white">
                  RWA Investment Access
                </h3>
              </div>
              <p className="text-slate-300 leading-relaxed mb-4">
                Exclusive access to Real-World Asset fractionalization
                opportunities with reduced minimum investment thresholds for
                verified students.
              </p>
              <div className="space-y-3">
                <div className="flex items-center text-emerald-300">
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>$50 minimum investment (vs $1,000 standard)</span>
                </div>
                <div className="flex items-center text-emerald-300">
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Priority access to new asset offerings</span>
                </div>
                <div className="flex items-center text-emerald-300">
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Educational resources & investment guides</span>
                </div>
              </div>
            </div>
          </div>

          {/* Educational Benefits Card */}
          <div className="group relative bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl hover:shadow-blue-500/10 transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-600/10 rounded-3xl"></div>
            <div className="relative z-10">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mr-6 shadow-xl">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white">
                  Premium Education Suite
                </h3>
              </div>
              <p className="text-slate-300 leading-relaxed mb-4">
                Access to premium software, research databases, and educational
                tools at special student rates.
              </p>
              <div className="space-y-3">
                <div className="flex items-center text-blue-300">
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>80% discount on professional software licenses</span>
                </div>
                <div className="flex items-center text-blue-300">
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Free access to research databases</span>
                </div>
                <div className="flex items-center text-blue-300">
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>24/7 academic support & tutoring</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Benefits Section */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-10 border border-white/20 shadow-2xl mb-12 max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-white mb-10 text-center">
            Complete Benefits Overview
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-3 h-20 bg-gradient-to-b from-emerald-500 to-emerald-600 rounded-full flex-shrink-0"></div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">
                    Financial Benefits
                  </h3>
                  <ul className="text-slate-300 space-y-2 text-sm leading-relaxed">
                    <li>• Micro-investment opportunities starting at $50</li>
                    <li>• 0% platform fees for first 12 months</li>
                    <li>• Exclusive student-only investment pools</li>
                    <li>• Financial literacy courses included</li>
                    <li>• Personal finance tracking tools</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-3 h-20 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full flex-shrink-0"></div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">
                    Academic Resources
                  </h3>
                  <ul className="text-slate-300 space-y-2 text-sm leading-relaxed">
                    <li>• Premium software suite (Adobe, Microsoft, etc.)</li>
                    <li>• Research database access (JSTOR, IEEE, etc.)</li>
                    <li>• Online course library (10,000+ courses)</li>
                    <li>• AI-powered study assistance</li>
                    <li>• Peer collaboration platform</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-3 h-20 bg-gradient-to-b from-purple-500 to-purple-600 rounded-full flex-shrink-0"></div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">
                    Career Development
                  </h3>
                  <ul className="text-slate-300 space-y-2 text-sm leading-relaxed">
                    <li>• Exclusive internship opportunities</li>
                    <li>• 1-on-1 career mentorship program</li>
                    <li>• Industry networking events</li>
                    <li>• Professional portfolio builder</li>
                    <li>• Job placement assistance</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Active Offers Section */}
        <div className="grid md:grid-cols-2 gap-8 mb-12 max-w-6xl mx-auto">
          <div className="bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 backdrop-blur-sm rounded-3xl p-8 border border-emerald-500/30">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center mr-4">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-emerald-200">
                Limited Time: Zero Fees
              </h3>
            </div>
            <p className="text-emerald-100 text-lg leading-relaxed mb-4">
              All platform fees waived for the first 12 months of your verified
              student status.
            </p>
            <div className="bg-emerald-500/20 rounded-xl p-4">
              <p className="text-emerald-200 font-medium">
                Savings: Up to $500 in platform fees
              </p>
              <p className="text-emerald-300 text-sm">
                Offer expires: December 31, 2025
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-500/20 to-purple-600/20 backdrop-blur-sm rounded-3xl p-8 border border-blue-500/30">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mr-4">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-blue-200">
                Early Access Program
              </h3>
            </div>
            <p className="text-blue-100 text-lg leading-relaxed mb-4">
              Be among the first to access new investment opportunities and beta
              features.
            </p>
            <div className="bg-blue-500/20 rounded-xl p-4">
              <p className="text-blue-200 font-medium">
                Priority notification system active
              </p>
              <p className="text-blue-300 text-sm">
                Next opportunity: Real Estate REIT launch
              </p>
            </div>
          </div>
        </div>

        {/* Status Footer */}
        <div className="text-center bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 max-w-4xl mx-auto">
          <div className="flex items-center justify-center mb-4">
            <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse mr-3"></div>
            <span className="text-emerald-400 font-semibold">
              All Systems Active
            </span>
          </div>
          <p className="text-slate-300 text-lg leading-relaxed">
            Your student verification is complete and all benefits are now
            active. Welcome to the next generation of student financial
            empowerment.
          </p>
          <p className="text-slate-400 text-sm mt-4">
            Last updated: September 28, 2025 • Benefits expire: Upon graduation
            or status change
          </p>
        </div>
      </div>
    </div>
  );
}
