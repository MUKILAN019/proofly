"use client";
import React, { useState, useEffect } from 'react';
import { useUser, useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/router';

export default function Dashboard() {
    const { user, isLoaded } = useUser();
    const { getToken } = useAuth();
    const router = useRouter();
    const [userDid, setUserDid] = useState(null);
    const [badgeImage, setBadgeImage] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [imageLoading, setImageLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

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
                setBadgeImage(data.badgeImage);
            }
        } catch (error) {
            console.error('Error fetching DID:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownloadBadge = () => {
        if (!badgeImage?.url) return;
        
        const link = document.createElement('a');
        link.href = badgeImage.url;
        link.download = `kalasalingam-proof-right-${userDid?.id?.substring(0, 12)}.png`;
        link.target = '_blank';
        link.click();
    };

    const handleShareBadge = async () => {
        if (!badgeImage?.url) return;

        try {
            if (navigator.share) {
                await navigator.share({
                    title: 'My Kalasalingam University Proof of Right',
                    text: 'Check out my digital identity badge from Kalasalingam University',
                    url: badgeImage.url,
                });
            } else {
                // Fallback: copy to clipboard
                await navigator.clipboard.writeText(badgeImage.url);
                alert('Badge URL copied to clipboard!');
            }
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    const extractPublicIdFromUrl = (url) => {
        try {
            const match = url.match(/upload\/(?:v\d+\/)?(.+?)\.(?:png|jpg|jpeg)/);
            return match ? match[1] : 'badge';
        } catch {
            return 'badge';
        }
    };

    const handleLogout = () => {
        router.push('/');
    };

    if (!isLoaded || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#154D71] via-[#1C6EA4] to-[#33A1E0]">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#154D71] via-[#1C6EA4] to-[#33A1E0]">
            <div className="container mx-auto px-4 sm:px-6 py-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
                        Student Dashboard
                    </h1>
                    <p className="text-lg text-blue-100">
                        Welcome back, <span className="text-[#d9a34c] font-semibold">{user?.firstName}</span>!
                    </p>
                </div>

                {/* Main Content */}
                <div className="max-w-6xl mx-auto">
                    {/* Tabs Navigation */}
                    <div className="flex space-x-1 bg-white/10 backdrop-blur-sm rounded-lg p-1 mb-6">
                        {['overview', 'badge', 'security'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                                    activeTab === tab
                                        ? 'bg-white text-[#154D71] shadow-lg'
                                        : 'text-white hover:bg-white/20'
                                }`}
                            >
                                {tab === 'overview' && 'Overview'}
                                {tab === 'badge' && 'Digital Badge'}
                                {tab === 'security' && 'Security'}
                            </button>
                        ))}
                    </div>

                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            {/* DID Info Card */}
                            <div className="bg-white rounded-2xl p-6 shadow-2xl">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                                    <span className="w-3 h-3 bg-green-500 rounded-full mr-3"></span>
                                    Your Digital Identity
                                </h2>
                                
                                {userDid ? (
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Decentralized Identifier (DID)
                                                </label>
                                                <div className="bg-gray-50 p-4 rounded-lg border">
                                                    <code className="text-sm break-all text-gray-800">
                                                        {userDid.id}
                                                    </code>
                                                </div>
                                            </div>
                                            
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">Status</label>
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 mt-1">
                                                        ✅ Active
                                                    </span>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">Created</label>
                                                    <p className="text-gray-600 text-sm mt-1">
                                                        {new Date(userDid.timestamp).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex flex-col justify-center items-center space-y-4">
                                            {badgeImage?.url && (
                                                <div className="text-center">
                                                    <div className="relative inline-block">
                                                        <img 
                                                            src={badgeImage.url} 
                                                            alt="Proof-of-Right Badge" 
                                                            className="w-32 h-32 rounded-xl border-4 border-yellow-400 shadow-lg transition-transform hover:scale-105"
                                                            onLoad={() => setImageLoading(false)}
                                                        />
                                                        {imageLoading && (
                                                            <div className="absolute inset-0 flex items-center justify-center bg-gray-200 rounded-xl">
                                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#154D71]"></div>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-gray-600 mt-2">Your Digital Badge</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                                            <span className="text-4xl">🎓</span>
                                        </div>
                                        <p className="text-gray-600 mb-4">No digital identity found.</p>
                                        <button 
                                            onClick={() => router.push('/manager')}
                                            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            Create Digital Identity
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Features Grid */}
                            <div className="grid md:grid-cols-3 gap-6">
                                <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                                    <div className="flex items-center mb-4">
                                        <h3 className="text-lg font-semibold text-gray-900">University Identity</h3>
                                    </div>
                                    <p className="text-gray-700 text-sm">Verified student identity with cryptographic proof.</p>
                                </div>

                                <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                                    <div className="flex items-center mb-4">
                                        <h3 className="text-lg font-semibold text-gray-900">RWA Access</h3>
                                    </div>
                                    <p className="text-gray-700 text-sm">Exclusive real-world asset investment opportunities.</p>
                                </div>

                                <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                                    <div className="flex items-center mb-4">
                                        <h3 className="text-lg font-semibold text-gray-900">Benefits</h3>
                                    </div>
                                    <p className="text-gray-700 text-sm">Special student discounts and educational offers.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Badge Tab */}
                    {activeTab === 'badge' && badgeImage?.url && (
                        <div className="space-y-6">
                            <div className="bg-white rounded-2xl p-6 shadow-2xl">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                                    Your Digital Badge
                                </h2>
                                
                                <div className="grid lg:grid-cols-2 gap-8">
                                    {/* Badge Display */}
                                    <div className="text-center">
                                        <div className="relative inline-block mb-4">
                                            <img 
                                                src={badgeImage.url} 
                                                alt="Kalasalingam University Proof of Right Badge"
                                                className="w-64 h-64 rounded-2xl border-4 border-yellow-400 shadow-2xl transition-all duration-300 hover:scale-105"
                                            />
                                            <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm">
                                                ✓
                                            </div>
                                        </div>
                                        <p className="text-gray-600 mb-2">Cloudinary Public ID: <code className="bg-gray-100 px-2 py-1 rounded text-xs">{extractPublicIdFromUrl(badgeImage.url)}</code></p>
                                        <div className="flex justify-center space-x-3 mt-4">
                                            <button 
                                                onClick={handleDownloadBadge}
                                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                                            >
                                                 Download
                                            </button>
                                            <button 
                                                onClick={handleShareBadge}
                                                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                                            >
                                                Share
                                            </button>
                                        </div>
                                    </div>

                                    {/* Badge Information */}
                                    <div className="space-y-4">
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <h4 className="font-semibold text-gray-900 mb-2">Badge Details</h4>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-800">Storage:</span>
                                                    <span className="font-medium text-gray-600">Cloudinary CDN</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-800">Format:</span>
                                                    <span className="font-medium text-gray-600">PNG Image</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-800">Steganography:</span>
                                                    <span className="font-medium text-green-600">Active</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-800">Issued:</span>
                                                    <span className="font-medium text-gray-600">{new Date(userDid.timestamp).toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                            <h4 className="font-semibold text-yellow-800 mb-2">How to Use</h4>
                                            <ul className="text-sm text-yellow-700 space-y-1">
                                                <li>• Download for offline verification</li>
                                                <li>• Share with verified partners</li>
                                                <li>• Use for identity verification</li>
                                                <li>• Present for student benefits</li>
                                            </ul>
                                        </div>

                                        {badgeImage.metadata && (
                                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                                <h4 className="font-semibold text-blue-800 mb-2">Technical Info</h4>
                                                <div className="text-xs text-blue-700 space-y-1">
                                                    <div>Public ID: {extractPublicIdFromUrl(badgeImage.url)}</div>
                                                    <div>URL: <span className="break-all">{badgeImage.url}</span></div>
                                                    {badgeImage.metadata.steganography && (
                                                        <div>Data Embedded: ✓</div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Security Tab */}
                    {activeTab === 'security' && userDid && (
                        <div className="bg-white rounded-2xl p-6 shadow-2xl">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                                Security Information
                            </h2>
                            
                            <div className="space-y-4">
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <h4 className="font-semibold text-green-800 mb-2">Identity Status</h4>
                                    <p className="text-green-700 text-sm">Your digital identity is securely stored and verified.</p>
                                </div>

                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <h4 className="font-semibold text-blue-800 mb-2">Cryptographic Security</h4>
                                    <ul className="text-blue-700 text-sm space-y-1">
                                        <li>• RSA-2048 Public Key Encryption</li>
                                        <li>• SHA-256 Hashing</li>
                                        <li>• Steganographic Data Protection</li>
                                        <li>• Cloudinary Secure Storage</li>
                                    </ul>
                                </div>

                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                    <h4 className="font-semibold text-yellow-800 mb-2">Important Notes</h4>
                                    <ul className="text-yellow-700 text-sm space-y-1">
                                        <li>• Your private key should be stored securely</li>
                                        <li>• Do not share your badge with untrusted parties</li>
                                        <li>• Report any suspicious activity immediately</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}