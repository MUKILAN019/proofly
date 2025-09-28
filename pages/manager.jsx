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
  const [selectedFile, setSelectedFile] = useState(null);
  const [hasValidBadgeAccess, setHasValidBadgeAccess] = useState(false);
  
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
            setHasValidBadgeAccess(data.hasValidBadgeAccess || false);
            
            if (data.did) {
              setCryptographicDid(data.did);
              setBadgeSVG(data.badgeSVG);
              
              if (data.badgeDownloaded) {
                setMessage({ 
                  type: 'info', 
                  text: 'Your badge has been downloaded. You can login with it.' 
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

  // Utility function to check if user has valid badge access
  const checkBadgeAccess = () => {
    return sessionStorage.getItem('hasValidBadgeAccess') === 'true' || hasValidBadgeAccess;
  };

  // Add navigation guard for protected routes
  const handleProtectedNavigation = (route) => {
    if (!checkBadgeAccess()) {
      setMessage({ 
        type: 'error', 
        text: 'Please login with your SVG badge first to access protected areas.' 
      });
      return false;
    }
    router.push(route);
    return true;
  };

  const MessageBox = () => {
    if (!message.text) return null;
    const baseStyle = "relative overflow-hidden rounded-2xl p-6 mb-8 border backdrop-blur-sm w-1/2 mx-auto text-xl font-medium border shadow-lg";
    const styleMap = {
      success: "bg-emerald-50/90 text-emerald-900 border-emerald-200 shadow-emerald-100/50",
      error: "bg-red-50/90 text-red-900 border-red-200 shadow-red-100/50",
      info: "bg-blue-50/90 text-blue-900 border-blue-200 shadow-blue-100/50",
    };
    return (
      <div className={`${baseStyle} ${styleMap[message.type]} shadow-xl`}>
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            {message.type === 'success' && (
              <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
            {message.type === 'error' && (
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            )}
            {message.type === 'info' && (
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            )}
          </div>
          <p className="font-semibold text-lg">{message.text}</p>
        </div>
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
          text: `Cryptographic DID created successfully! Redirecting to dashboard...` 
        });
        
        // Redirect to dashboard after creation
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      } else {
        throw new Error(result.message || 'Creation failed');
      }

    } catch (error) {
      console.error('Cryptographic DID creation failed:', error);
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

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
  };

  const handleLoginWithSVG = async () => {
    if (!selectedFile) {
      setMessage({ type: 'error', text: 'Please select an SVG badge file' });
      return;
    }

    setIsProcessing(true);
    setSelectedAction('login');

    try {
      if (!selectedFile.type.includes('svg') && !selectedFile.name.endsWith('.svg')) {
        throw new Error('Please select a valid SVG file');
      }

      setMessage({ type: 'info', text: 'Reading SVG badge...' });

      const reader = new FileReader();
      
      return new Promise((resolve, reject) => {
        reader.onload = async (e) => {
          try {
            const svgContent = e.target.result;
            
            setMessage({ type: 'info', text: 'Verifying badge identity...' });

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
              setMessage({ type: 'error', text: `Login failed: ${result.message || 'Unknown error'}` });
              return;
            }

            if (result.success) {
              // Set badge access flag in sessionStorage for route protection
              sessionStorage.setItem('hasValidBadgeAccess', 'true');
              setHasValidBadgeAccess(true);
              
              setMessage({ 
                type: 'success', 
                text: 'Login successful! Redirecting to main offers...' 
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
        reader.readAsText(selectedFile);
      });

    } catch (error) {
      setMessage({ type: 'error', text: `Login failed: ${error.message}` });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isLoaded || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-blue-400 rounded-full animate-spin animate-reverse"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <SignedIn>
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
            <div className="text-center mb-16">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mb-6 shadow-2xl">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.5-2A11.95 11.95 0 0012 2.5a11.95 11.95 0 00-8.5 3.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent mb-6 tracking-tight">
                Identity Manager
              </h1>
              <div className="max-w-3xl mx-auto">
                <p className="text-xl text-slate-300 leading-relaxed">
                  <span className="text-blue-400 font-semibold">
                    {user?.firstName ? `Welcome back, ${user.firstName}` : 'Welcome'}
                  </span>
                </p>
                <p className="text-lg text-slate-400 mt-2">
                  Create or access your decentralized student identity
                </p>
              </div>
            </div>
            
            <div className="max-w-7xl mx-auto">
              <MessageBox />

              {/* Quick Action for Dashboard */}
              {cryptographicDid && !badgeDownloaded && (
                <div className="flex justify-center mb-12">
                  <button 
                    onClick={handleGoToDashboard}
                    className="group relative px-8 py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-2xl font-semibold shadow-2xl hover:shadow-emerald-500/25 transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <span className="relative z-10">Access Dashboard to Download Badge</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </button>
                </div>
              )}

              {/* Main Action Cards */}
              <div className={`grid gap-8 max-w-6xl mx-auto ${
                !cryptographicDid ? 'lg:grid-cols-2' : 'lg:grid-cols-1'
              }`}>
                
                {/* Create Student DID Card */}
                {!cryptographicDid && (
                  <div className="group relative bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 hover:-translate-y-2">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-600/10 rounded-3xl"></div>
                    <div className="relative z-10">
                      <div className="flex items-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mr-6 shadow-xl">
                          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-white mb-1">Create Student DID</h3>
                          <p className="text-blue-200">Initialize your digital identity</p>
                        </div>
                      </div>
                      <div className="space-y-4 mb-8">
                        <p className="text-slate-300 leading-relaxed">
                          Generate your unique Decentralized Identifier to access exclusive student benefits and RWA opportunities.
                        </p>
                        <ul className="space-y-2">
                          <li className="flex items-center text-slate-300">
                            <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                            Secure cryptographic identity
                          </li>
                          <li className="flex items-center text-slate-300">
                            <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                            Blockchain-verified credentials
                          </li>
                          <li className="flex items-center text-slate-300">
                            <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                            Access to exclusive benefits
                          </li>
                        </ul>
                      </div>
                      <button
                        onClick={handleCreateCryptographicDID}
                        disabled={isProcessing}
                        className={`w-full font-semibold py-4 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center space-x-3 shadow-xl ${
                          isProcessing 
                            ? 'bg-slate-600 cursor-not-allowed text-slate-300' 
                            : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/25'
                        }`}
                      >
                        {isProcessing ? (
                          <>
                            <div className="w-5 h-5 border-2 border-slate-300 border-t-transparent rounded-full animate-spin"></div>
                            <span>Creating DID...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            <span>Create Student DID</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Login with SVG Badge Card */}
                <div className={`group relative bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl hover:shadow-emerald-500/10 transition-all duration-500 hover:-translate-y-2 ${
                  cryptographicDid ? 'max-w-2xl mx-auto' : ''
                }`}>
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-green-600/10 rounded-3xl"></div>
                  <div className="relative z-10">
                    <div className="flex items-center mb-8">
                      <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mr-6 shadow-xl">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <div className="flex items-center space-x-3">
                          <h3 className="text-2xl font-bold text-white mb-1">Login with Badge</h3>
                          {checkBadgeAccess() && (
                            <div className="px-3 py-1 bg-emerald-500/30 border border-emerald-400/50 rounded-full">
                              <span className="text-emerald-200 text-xs font-semibold">AUTHENTICATED</span>
                            </div>
                          )}
                        </div>
                        <p className="text-emerald-200">Use your downloaded credentials</p>
                      </div>
                    </div>
                    
                    {checkBadgeAccess() ? (
                      // Authenticated state - show access options
                      <div className="space-y-6">
                        <div className="p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl">
                          <div className="flex items-center space-x-3 mb-4">
                            <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                            <h4 className="text-lg font-semibold text-emerald-200">Badge Verified Successfully</h4>
                          </div>
                          <p className="text-emerald-300/80 mb-6">You now have access to exclusive student benefits and RWA opportunities.</p>
                          <button
                            onClick={() => router.push('/mainoffer')}
                            className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-500/25 flex items-center justify-center space-x-3"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                            <span>Access Main Offers</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      // Unauthenticated state - show upload form
                      <div className="space-y-6">
                        <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                          <div className="flex items-center space-x-2 mb-2">
                            <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                            <span className="text-yellow-400 text-sm font-semibold">Authentication Required</span>
                          </div>
                          <p className="text-yellow-300/80 text-sm">Please upload and verify your SVG badge to access protected features.</p>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-300 mb-3">
                            Upload Your SVG Badge File
                          </label>
                          <div className="relative">
                            <input
                              type="file"
                              accept=".svg,image/svg+xml"
                              onChange={handleFileSelect}
                              className="w-full p-4 bg-white/10 border border-white/30 rounded-xl text-white placeholder-slate-400 backdrop-blur-sm focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 focus:outline-none transition-all duration-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-emerald-600 file:text-white file:font-semibold hover:file:bg-emerald-700"
                            />
                          </div>
                          <div className="flex items-center mt-2">
                            <svg className="w-4 h-4 text-slate-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-xs text-slate-400">Only SVG format accepted</p>
                          </div>
                          {selectedFile && (
                            <div className="mt-3 p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-lg">
                              <p className="text-emerald-200 text-sm">Selected: {selectedFile.name}</p>
                            </div>
                          )}
                        </div>
                        <button
                          onClick={handleLoginWithSVG}
                          disabled={isProcessing || !selectedFile}
                          className={`w-full font-semibold py-4 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center space-x-3 shadow-xl ${
                            isProcessing && selectedAction === 'login'
                              ? 'bg-slate-600 cursor-not-allowed text-slate-300'
                              : !selectedFile
                              ? 'bg-slate-600 cursor-not-allowed text-slate-400'
                              : 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-500/25'
                          }`}
                        >
                          {isProcessing && selectedAction === 'login' ? (
                            <>
                              <div className="w-5 h-5 border-2 border-slate-300 border-t-transparent rounded-full animate-spin"></div>
                              <span>Verifying Badge...</span>
                            </>
                          ) : (
                            <>
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                              </svg>
                              <span>Login with Badge</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
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