"use client";
import React, { useState, useEffect } from 'react';
import { useUser, useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/router';

export default function Dashboard() {
    const { user, isLoaded } = useUser();
    const { getToken } = useAuth();
    const router = useRouter();
    const [userDid, setUserDid] = useState(null);
    const [badgeSVG, setBadgeSVG] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [badgeDownloaded, setBadgeDownloaded] = useState(false);

    useEffect(() => {
        if (isLoaded && user) {
            fetchUserDID();
        }
    }, [isLoaded, user]);

    const fetchUserDID = async () => {
        try {
            const token = await getToken();
            const response = await fetch('/api/did-service/profile', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setUserDid(data.did);
                setBadgeSVG(data.badgeSVG);
                setBadgeDownloaded(data.badgeDownloaded || false);
                
                // If badge already downloaded, redirect back to manager
                if (data.badgeDownloaded) {
                    router.push('/manager');
                }
            }
        } catch (error) {
            console.error('Error fetching DID:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownloadSVG = async () => {
        if (!badgeSVG?.data) return;
        
        try {
            // Mark badge as downloaded in backend
            const token = await getToken();
            const response = await fetch('/api/did-service/mark-downloaded', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                // Download the SVG
                const blob = new Blob([badgeSVG.data], { type: 'image/svg+xml' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `kalasalingam-proof-right-${userDid?.id?.substring(0, 12)}.svg`;
                link.click();
                URL.revokeObjectURL(url);
                
                // Show success message and redirect back to manager
                setTimeout(() => {
                    router.push('/manager');
                }, 1000);
            }
        } catch (error) {
            console.error('Error marking badge as downloaded:', error);
        }
    };

    // Redirect if badge is already downloaded
    useEffect(() => {
        if (badgeDownloaded) {
            router.push('/manager');
        }
    }, [badgeDownloaded, router]);

    if (!isLoaded || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-blue-400 rounded-full animate-spin animate-reverse"></div>
                </div>
            </div>
        );
    }

    // If badge downloaded, don't show dashboard
    if (badgeDownloaded) {
        return null;
    }

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

            <div className="relative z-10 container mx-auto px-6 py-12">
                {/* Header Section */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-2xl mb-6 shadow-2xl">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-emerald-100 to-white bg-clip-text text-transparent mb-4 tracking-tight">
                        Download Badge
                    </h1>
                    <div className="max-w-2xl mx-auto">
                        <p className="text-xl text-slate-300">
                            Welcome, <span className="text-emerald-400 font-semibold">{user?.firstName}</span>
                        </p>
                        <p className="text-slate-400 mt-2">
                            Download your digital badge to complete the verification process
                        </p>
                    </div>
                </div>

                {/* User Profile Card */}
                <div className="max-w-4xl mx-auto mb-8">
                    <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl">
                        <div className="flex flex-col md:flex-row items-center justify-between">
                            <div className="flex items-center mb-6 md:mb-0">
                                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-xl">
                                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                                </div>
                                <div className="ml-6">
                                    <h2 className="text-2xl font-bold text-white">{user?.firstName} {user?.lastName}</h2>
                                    <p className="text-slate-300 text-lg">{user?.primaryEmailAddress?.emailAddress}</p>
                                    {userDid && (
                                        <div className="mt-2 p-2 bg-slate-800/50 rounded-lg border border-slate-700">
                                            <p className="text-xs text-slate-400 font-mono break-all">
                                                DID: {userDid.id}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <button 
                                onClick={handleDownloadSVG}
                                className="group relative px-8 py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-2xl font-semibold shadow-2xl hover:shadow-emerald-500/25 transition-all duration-300 transform hover:-translate-y-1 flex items-center space-x-3"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <span>Download Badge</span>
                            </button>
                        </div>
                    </div>
                </div>


                {/* Important Notice */}
                <div className="max-w-4xl mx-auto">
                    <div className="bg-blue-50/10 border border-blue-300/30 rounded-2xl p-6 backdrop-blur-sm">
                        <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0">
                                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-blue-200 text-lg">Important Notice</h3>
                                <p className="text-blue-300 mt-2 leading-relaxed">
                                    After downloading your badge, you will automatically return to the manager page. 
                                    You will not be able to access this dashboard again. Please ensure you save your 
                                    badge file in a secure location for future use.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}