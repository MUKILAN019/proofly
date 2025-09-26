"use client";
import React, { useState, useEffect } from 'react';
import { SignedIn, SignedOut, useUser, RedirectToSignIn, useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/router';

const DID_SERVICE_URL = '/api/did-service/create';
const CLOUDINARY_UPLOAD_PRESET = 'rlz83089'; // Set in Cloudinary dashboard
const CLOUDINARY_CLOUD_NAME = 'dioirlnnn';

export default function ManagerPage() {
  const [selectedAction, setSelectedAction] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState({ type: null, text: '' });
  const [cryptographicDid, setCryptographicDid] = useState(null);
  const [badgeImage, setBadgeImage] = useState(null);
  const [privateKey, setPrivateKey] = useState(null);
  const [redirectCountdown, setRedirectCountdown] = useState(5);
  const [showRedirectMessage, setShowRedirectMessage] = useState(false);
  
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Check if user already has a DID on component load
  useEffect(() => {
    const checkExistingDID = async () => {
      if (isLoaded && user) {
        try {
          const token = await getToken();
          const response = await fetch('/api/did-service/profile', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.ok) {
            const data = await response.json();
            if (data.did) {
              setCryptographicDid(data.did);
              setBadgeImage(data.badgeImage);
              setMessage({ 
                type: 'info', 
                text: 'You already have a digital identity. You can manage it here or go to dashboard.' 
              });
            }
          }
        } catch (error) {
          console.error('Error checking existing DID:', error);
        }
      }
    };

    checkExistingDID();
  }, [isLoaded, user, getToken]);

  // Handle redirect countdown
  useEffect(() => {
    if (showRedirectMessage && redirectCountdown > 0) {
      const timer = setTimeout(() => {
        setRedirectCountdown(redirectCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (showRedirectMessage && redirectCountdown === 0) {
      router.push('/dashboard');
    }
  }, [showRedirectMessage, redirectCountdown, router]);

  const MessageBox = () => {
    if (!message.text) return null;
    const baseStyle = "p-4 rounded-xl shadow-lg font-semibold mb-6 text-center";
    const styleMap = {
      success: "bg-green-100 text-green-800 border-2 border-green-500",
      error: "bg-red-100 text-red-800 border-2 border-red-500",
      info: "bg-yellow-100 text-yellow-800 border-2 border-yellow-500",
    };
    return (
      <div className={`${baseStyle} ${styleMap[message.type]}`}>
        {message.text}
        {showRedirectMessage && (
          <div className="mt-2 text-sm">
            Redirecting to dashboard in {redirectCountdown} seconds...
            <button 
              onClick={() => setShowRedirectMessage(false)}
              className="ml-2 text-blue-600 hover:text-blue-800 underline"
            >
              Stay here
            </button>
          </div>
        )}
      </div>
    );
  };

  // Upload image to Cloudinary with better error handling
    const uploadToCloudinary = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', 'badge_verification');
    
    // Add these parameters to prevent compression
    formData.append('quality', '100'); // Maximum quality
    formData.append('flags', 'lossless'); // Lossless compression
    
    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error('Cloudinary upload failed');
    }

    const result = await response.json();
    return result.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload image to Cloudinary');
  }
};


  const handleCreateCryptographicDID = async () => {
    setIsProcessing(true);
    setSelectedAction('create');
    setMessage({ type: 'info', text: 'Generating your cryptographic identity...' });

    try {
      const token = await getToken();
      if (!token) {
        throw new Error('Authentication token not found.');
      }

      const response = await fetch(DID_SERVICE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          studentEmail: user.primaryEmailAddress?.emailAddress 
        }),
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('❌ Non-JSON response:', text.substring(0, 200));
        throw new Error('Server returned an invalid response. Please try again.');
      }

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `HTTP error! status: ${response.status}`);
      }

      if (result.success) {
        setCryptographicDid(result.did);
        setBadgeImage(result.badgeImage);
        setPrivateKey(result.security.privateKey);
        
        setMessage({ 
          type: 'success', 
          text: `🎉 Cryptographic DID created successfully! Your decentralized identity is now active.` 
        });
        
        // Start redirect countdown
        setShowRedirectMessage(true);
        setRedirectCountdown(5);
      } else {
        throw new Error(result.message || 'Creation failed');
      }

    } catch (error) {
      console.error('❌ Cryptographic DID creation failed:', error);
      setMessage({ 
        type: 'error', 
        text: `Creation failed: ${error.message}` 
      });
    } finally {
      setIsProcessing(false);
      setSelectedAction(null);
    }
  };

  const handleGoToDashboard = () => {
    router.push('/dashboard');
  };

  const handleStayOnManager = () => {
    setShowRedirectMessage(false);
    setRedirectCountdown(5);
  };

  const handleLoginWithBadge = async (event) => {
    event.preventDefault();
    setIsProcessing(true);
    setSelectedAction('login');

    try {
      const file = event.target.elements.badgeUpload.files[0];
      if (!file) {
        throw new Error('Please select a badge image');
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('Image size too large. Please select an image under 10MB.');
      }

      setMessage({ type: 'info', text: '📤 Uploading badge to Cloudinary...' });

      // Upload to Cloudinary first
      const cloudinaryUrl = await uploadToCloudinary(file);
      
      setMessage({ type: 'info', text: '🔐 Verifying badge identity...' });

      // Send Cloudinary URL to backend for verification
      const token = await getToken();
      const response = await fetch('/api/did-service/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          cloudinaryUrl: cloudinaryUrl,
          clerkUserId: user.id
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Login failed');
      }

      if (result.success) {
        setMessage({ 
          type: 'success', 
          text: '✅ Login successful! Redirecting to dashboard...' 
        });
        
        // Store the verified badge image
        setBadgeImage({ url: cloudinaryUrl });
        
        setTimeout(() => router.push('/dashboard'), 2000);
      }

    } catch (error) {
      setMessage({ type: 'error', text: `Login failed: ${error.message}` });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#154D71] via-[#1C6EA4] to-[#33A1E0]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <>
      <SignedIn>
        <div className="w-full bg-gradient-to-br from-[#154D71] via-[#1C6EA4] to-[#33A1E0] min-h-screen">
          <div className="container mx-auto px-6 py-8">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                ProoFLY Identity Manager
              </h1>
              <p className="text-xl text-blue-100 max-w-3xl mx-auto">
                <strong className='text-[#d9a34c]'>{user?.firstName ? `Hello ${user.firstName}!` : 'Welcome!'}</strong>
                {' '}Create or login to your decentralized student identity.
              </p>
            </div>
            
            <div className="max-w-6xl mx-auto">
              <MessageBox />

              {/* Action Buttons for existing DID */}
              {cryptographicDid && (
                <div className="flex justify-center space-x-4 mb-6">
                  <button 
                    onClick={handleGoToDashboard}
                    className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                  >
                     Go to Dashboard
                  </button>
                  <button 
                    onClick={() => window.location.reload()}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Refresh Status
                  </button>
                </div>
              )}

              {/* Flex container for both cards */}
              <div className="flex flex-col md:flex-row gap-8 justify-center">
                
                {/* Create Student DID Card */}
                <div className="flex-1 bg-white rounded-xl p-8 shadow-xl hover:shadow-2xl transition-shadow border-2 border-purple-200">
                  <div className="flex items-center mb-6">
                    <div className="w-16 h-16 bg-purple-600 rounded-xl flex items-center justify-center mr-4">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">Create Student DID</h3>
                      <p className="text-gray-600">Your decentralized identity</p>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-8 leading-relaxed">
                    Create your <strong>Decentralized Identifier (DID)</strong> to access RWA fractionalization and student benefits.
                  </p>
                  <button
                    onClick={handleCreateCryptographicDID}
                    disabled={isProcessing || cryptographicDid}
                    className={`w-full font-semibold py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 ${
                      isProcessing && selectedAction === 'create'
                        ? 'bg-gray-400 cursor-not-allowed'
                        : cryptographicDid
                        ? 'bg-green-800 text-white cursor-default'
                        : 'bg-purple-600 hover:bg-purple-700 text-white hover:shadow-lg'
                    }`}
                  >
                    {cryptographicDid ? 'DID Created' : isProcessing && selectedAction === 'create' ? 'Creating DID...' : 'Create Student DID'}
                  </button>
                </div>

                {/* Login with Badge Card */}
                <div className="flex-1 bg-white rounded-xl p-8 shadow-xl hover:shadow-2xl transition-shadow border-2 border-green-200">
                  <div className="flex items-center mb-6">
                    <div className="w-16 h-16 bg-green-600 rounded-xl flex items-center justify-center mr-4">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">Login with Badge</h3>
                      <p className="text-gray-600">Use your steganographic badge</p>
                    </div>
                  </div>
                  <form onSubmit={handleLoginWithBadge} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Upload Your Badge Image
                      </label>
                      <input
                        type="file"
                        name="badgeUpload"
                        accept="image/png,image/jpeg,image/jpg"
                        className="w-full p-2 border border-gray-300 rounded-lg"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">Max file size: 10MB</p>
                    </div>
                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                    >
                      {isProcessing && selectedAction === 'login' ? ' Verifying...' : 'Login with Badge'}
                    </button>
                  </form>
                </div>

              </div>
            </div>
          </div>
        </div>
      </SignedIn>
      
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}