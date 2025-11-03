// src/components/mobile/LoginScreen.tsx
'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import EmailAuthScreen from './EmailAuthScreen';

export default function LoginScreen() {
  const [useEmailAuth, setUseEmailAuth] = useState(false);
  const router = useRouter();

  const handleGoogleLogin = () => {
    // Use NextAuth for Google authentication
    signIn('google', { callbackUrl: '/' });
  };

  if (useEmailAuth) {
    return <EmailAuthScreen />;
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <main className="flex-grow flex flex-col px-6 pt-8">
        {/* Hero Graphic */}
        <div className="w-full h-64 rounded-xl overflow-hidden">
          <svg className="w-full h-full" fill="none" viewBox="0 0 375 256" xmlns="http://www.w3.org/2000/svg">
            <path d="M-154.5 137.957C-79.6667 87.7905 51 31.9571 133.5 137.957C216 243.957 325.5 289.457 419.5 208.457" stroke="#3fe44a" strokeLinecap="round" strokeWidth="80"></path>
            <path d="M-134 266.957C-59.1667 216.791 71.5 160.957 154 266.957C236.5 372.957 346 418.457 440 337.457" stroke="#e8f3e9" strokeLinecap="round" strokeWidth="60"></path>
          </svg>
        </div>

        {/* Logo and Title */}
        <div className="text-center mt-8">
          <h2 className="text-2xl font-bold text-[#333333]">Career Quest</h2>
        </div>

        <div className="text-center mt-8">
          <h1 className="text-4xl font-extrabold text-[#333333] tracking-tight">Find Your Path. <br/>Build Your Future.</h1>
          <h3 className="text-lg text-[#666666] mt-4">Your personalized AI career advisor.</h3>
        </div>

        {/* Email Login Button */}
        <div className="mt-12 w-full space-y-4">
          <button 
            onClick={() => setUseEmailAuth(true)}
            className="w-full bg-[#3fe44a] text-white font-bold py-3 px-4 rounded-lg shadow-sm hover:bg-[#34c741]"
          >
            Sign in with Email
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#e0e0e0]"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-[#666666]">OR</span>
            </div>
          </div>

          {/* Google Login Button */}
          <button 
            onClick={handleGoogleLogin}
            className="w-full bg-white border border-[#e0e0e0] rounded-lg shadow-sm py-3 px-4 flex items-center justify-center space-x-3"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
            </svg>
            <span className="text-[#333333] font-bold text-base">Sign in with Google</span>
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-8 text-center">
        <p className="text-xs text-[#666666]">
          By continuing, you agree to our
          <a className="underline" href="#"> Terms of Service</a> and
          <a className="underline" href="#"> Privacy Policy</a>.
        </p>
      </footer>
    </div>
  );
}