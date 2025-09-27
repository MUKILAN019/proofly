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
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#154D71] via-[#1C6EA4] to-[#33A1E0]">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
            </div>
        );
    }

    // If badge downloaded, don't show dashboard
    if (badgeDownloaded) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#154D71] via-[#1C6EA4] to-[#33A1E0]">
            <div className="container mx-auto px-6 py-8">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">Download Your Badge</h1>
                    <p className="text-blue-100">Welcome, <strong className='text-amber-200'>{user?.firstName}</strong>!</p>
                    <p className="text-blue-200 text-sm mt-2">Download your SVG badge to complete the process</p>
                </div>

                <div className="bg-white rounded-xl shadow-xl p-6 mb-6">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <div className="flex items-center mb-4 md:mb-0">
                            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                                {user?.firstName?.[0]}{user?.lastName?.[0]}
                            </div>
                            <div className="ml-4">
                                <h2 className="text-xl font-bold text-black">{user?.firstName} {user?.lastName}</h2>
                                <p className="text-gray-600">{user?.primaryEmailAddress?.emailAddress}</p>
                                {userDid && (
                                    <p className="text-sm text-gray-500 break-all">DID: {userDid.id}</p>
                                )}
                            </div>
                        </div>
                        
                        <button 
                            onClick={handleDownloadSVG}
                            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
                        >
                            📥 Download SVG Badge
                        </button>
                    </div>
                </div>

                {/* Badge Preview */}
                {badgeSVG?.data && (
                    <div className="bg-white rounded-xl shadow-xl p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Your Digital Badge Preview</h3>
                        <div className="flex justify-center">
                            <div 
                                className="w-64 h-64"
                                dangerouslySetInnerHTML={{ __html: badgeSVG.data }}
                            />
                        </div>
                        <div className="text-center mt-4">
                            <button 
                                onClick={handleDownloadSVG}
                                className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors text-lg font-semibold"
                            >
                                📥 Download SVG Badge & Return to Manager
                            </button>
                            <p className="text-gray-600 text-sm mt-3">
                                After download, you will return to manager and cannot access this dashboard again
                            </p>
                        </div>
                    </div>
                )}

                {/* Important Notice */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mt-6">
                    <div className="flex items-center">
                        <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center mr-4">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-semibold text-yellow-800">Important Notice</h3>
                            <p className="text-yellow-700 text-sm mt-1">
                                After downloading your badge, you will return to the manager page. 
                                You will not be able to access this dashboard again.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}