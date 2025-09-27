"use client";
import React, { useState, useEffect } from 'react';
import { SignedIn, SignedOut, useUser, RedirectToSignIn, useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/router';

const DID_SERVICE_URL = '/api/did-service/create';

export default function ManagerPage() {
  const [selectedAction, setSelectedAction] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState({ type: null, text: '' });
  const [cryptographicDid, setCryptographicDid] = useState(null);
  const [badgeSVG, setBadgeSVG] = useState(null);
  const [badgeDownloaded, setBadgeDownloaded] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Check if user has downloaded badge
  useEffect(() => {
    const checkDownloadStatus = async () => {
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
            setBadgeDownloaded(data.badgeDownloaded || false);
            
            if (data.did) {
              setCryptographicDid(data.did);
              setBadgeSVG(data.badgeSVG);
              
              if (data.badgeDownloaded) {
                setMessage({ 
                  type: 'info', 
                  text: 'Your badge has been downloaded. You can login with it below.' 
                });
              } else if (data.did) {
                setMessage({ 
                  type: 'info', 
                  text: 'Your DID is created. Please go to dashboard to download your badge.' 
                });
              }
            }
          }
        } catch (error) {
          console.error('Error checking download status:', error);
        } finally {
          setIsChecking(false);
        }
      }
    };

    checkDownloadStatus();
  }, [isLoaded, user, getToken]);

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
      </div>
    );
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

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `HTTP error! status: ${response.status}`);
      }

      if (result.success) {
        setCryptographicDid(result.did);
        setBadgeSVG(result.badgeSVG);
        
        setMessage({ 
          type: 'success', 
          text: `🎉 Cryptographic DID created successfully! Redirecting to dashboard...` 
        });
        
        // Redirect to dashboard after creation
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
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
    if (!badgeDownloaded) {
      router.push('/dashboard');
    }
  };

  const handleLoginWithSVG = async (event) => {
    event.preventDefault();
    setIsProcessing(true);
    setSelectedAction('login');

    try {
      const file = event.target.elements.svgUpload.files[0];
      if (!file) {
        throw new Error('Please select an SVG badge file');
      }

      if (!file.type.includes('svg') && !file.name.endsWith('.svg')) {
        throw new Error('Please select a valid SVG file');
      }

      setMessage({ type: 'info', text: '📤 Reading SVG badge...' });

      const reader = new FileReader();
      
      return new Promise((resolve, reject) => {
        reader.onload = async (e) => {
          try {
            const svgContent = e.target.result;
            
            setMessage({ type: 'info', text: '🔐 Verifying badge identity...' });

            const token = await getToken();
            const response = await fetch('/api/did-service/login', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
              body: JSON.stringify({
                svgData: svgContent,
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
                text: '✅ Login successful! Redirecting to main offers...' 
              });
              
              // Always go to mainoffer after SVG login
              setTimeout(() => {
                router.push('/mainoffer');
              }, 2000);
            }
            
            resolve();
          } catch (error) {
            reject(error);
          }
        };
        
        reader.onerror = () => reject(new Error('Failed to read SVG file'));
        reader.readAsText(file);
      });

    } catch (error) {
      setMessage({ type: 'error', text: `Login failed: ${error.message}` });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isLoaded || isChecking) {
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

              {/* Action Buttons */}
              {cryptographicDid && !badgeDownloaded && (
                <div className="flex justify-center space-x-4 mb-6">
                  <button 
                    onClick={handleGoToDashboard}
                    className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Go to Dashboard to Download Badge
                  </button>
                </div>
              )}

              {badgeDownloaded && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 text-center">
                  <p className="text-green-800 font-semibold">
                    ✅ Your badge has been downloaded. You can now login with it below.
                  </p>
                </div>
              )}

              {/* Flex container for both cards */}
              <div className="flex flex-col md:flex-row gap-8 justify-center">
                
                {/* Create Student DID Card - Only show if no DID exists */}
                {!cryptographicDid && (
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
                      disabled={isProcessing}
                      className={`w-full font-semibold py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 ${
                        isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700 text-white hover:shadow-lg'
                      }`}
                    >
                      {isProcessing ? 'Creating DID...' : 'Create Student DID'}
                    </button>
                  </div>
                )}

                {/* Login with SVG Badge Card - Always show */}
                <div className="flex-1 bg-white rounded-xl p-8 shadow-xl hover:shadow-2xl transition-shadow border-2 border-green-200">
                  <div className="flex items-center mb-6">
                    <div className="w-16 h-16 bg-green-600 rounded-xl flex items-center justify-center mr-4">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">Login with SVG Badge</h3>
                      <p className="text-gray-600">Use your downloaded badge</p>
                    </div>
                  </div>
                  <form onSubmit={handleLoginWithSVG} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Upload Your Downloaded SVG Badge
                      </label>
                      <input
                        type="file"
                        name="svgUpload"
                        accept=".svg,image/svg+xml"
                        className="w-full p-2 border border-gray-300 rounded-lg"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">SVG files only</p>
                    </div>
                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                    >
                      {isProcessing && selectedAction === 'login' ? ' Verifying...' : 'Login with SVG Badge'}
                    </button>
                  </form>
                </div>

              </div>

              {/* Show created badge preview */}
              {cryptographicDid && badgeSVG?.data && !badgeDownloaded && (
                <div className="mt-12 bg-white rounded-xl p-8 shadow-xl">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Your Created Badge</h3>
                  <div className="flex justify-center mb-6">
                    <div 
                      className="w-64 h-64 border-4 border-yellow-400 rounded-2xl shadow-2xl"
                      dangerouslySetInnerHTML={{ __html: badgeSVG.data }}
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-gray-600 mb-4">
                      Your badge is ready! Go to dashboard to download it.
                    </p>
                    <button 
                      onClick={handleGoToDashboard}
                      className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Go to Dashboard to Download
                    </button>
                  </div>
                </div>
              )}
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