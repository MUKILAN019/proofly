"use client";
import React from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/router';

export default function MainOffer() {
    const { user } = useUser();
    const router = useRouter();

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#154D71] via-[#1C6EA4] to-[#33A1E0]">
            <div className="container mx-auto px-6 py-12">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        🎉 Important Notice for Students
                    </h1>
                    <p className="text-xl text-blue-100">
                        Welcome to Your Exclusive Student Benefits Portal
                    </p>
                </div>

                {/* Main Content */}
                <div className="max-w-4xl mx-auto">
                    {/* Important Alert */}
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 mb-8 rounded-r-lg">
                        <div className="flex items-start">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-lg font-medium text-yellow-800">
                                    Important Information
                                </h3>
                                <div className="mt-2 text-yellow-700">
                                    <p>
                                        Your digital identity has been successfully verified. Please read the following important notices carefully.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Benefits Grid */}
                    <div className="grid md:grid-cols-2 gap-8 mb-12">
                        <div className="bg-white rounded-xl p-8 shadow-2xl hover:shadow-3xl transition-shadow">
                            <div className="flex items-center mb-6">
                                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mr-4">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">RWA Access Granted</h3>
                            </div>
                            <p className="text-gray-700 leading-relaxed">
                                You now have exclusive access to Real-World Asset fractionalization opportunities. 
                                This includes investment opportunities typically reserved for accredited investors.
                            </p>
                        </div>

                        <div className="bg-white rounded-xl p-8 shadow-2xl hover:shadow-3xl transition-shadow">
                            <div className="flex items-center mb-6">
                                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mr-4">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">Time-Sensitive Offers</h3>
                            </div>
                            <p className="text-gray-700 leading-relaxed">
                                Special student discounts and educational benefits are available for a limited time. 
                                Make sure to claim your offers within the specified period.
                            </p>
                        </div>
                    </div>

                    {/* Detailed Information */}
                    <div className="bg-white rounded-xl p-8 shadow-2xl mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Student Benefits Overview</h2>
                        
                        <div className="space-y-6">
                            <div className="border-l-4 border-green-500 pl-4">
                                <h3 className="text-lg font-semibold text-gray-900">Academic Discounts</h3>
                                <p className="text-gray-700 mt-2">
                                    Access to premium educational resources, software licenses, and research tools at special student rates.
                                </p>
                            </div>

                            <div className="border-l-4 border-blue-500 pl-4">
                                <h3 className="text-lg font-semibold text-gray-900">Investment Opportunities</h3>
                                <p className="text-gray-700 mt-2">
                                    Participate in fractional ownership of real-world assets with minimum investment thresholds reduced for students.
                                </p>
                            </div>

                            <div className="border-l-4 border-purple-500 pl-4">
                                <h3 className="text-lg font-semibold text-gray-900">Career Development</h3>
                                <p className="text-gray-700 mt-2">
                                    Exclusive access to internship opportunities, mentorship programs, and industry networking events.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Action Section */}
                    <div className="text-center">
                        <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-xl p-8 text-white">
                            <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
                            <p className="mb-6 opacity-90">
                                Explore your exclusive benefits and start your journey with decentralized identity verification.
                            </p>
                            <div className="space-x-4">
                                <button 
                                    onClick={() => router.push('/benefits')}
                                    className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                                >
                                    Explore Benefits
                                </button>
                                <button 
                                    onClick={() => router.push('/profile')}
                                    className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
                                >
                                    View Profile
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Student Info */}
                    <div className="mt-8 text-center">
                        <p className="text-blue-200">
                            Verified Student: <strong className="text-amber-300">{user?.firstName} {user?.lastName}</strong>
                        </p>
                        <p className="text-blue-200 text-sm mt-2">
                            {user?.primaryEmailAddress?.emailAddress}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}