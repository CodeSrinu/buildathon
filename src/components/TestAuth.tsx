// Test page to verify email authentication
'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

export default function TestAuth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLogin, setIsLogin] = useState(true);

  const handleAuth = async () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      setMessage('Missing Supabase configuration');
      return;
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    if (isLogin) {
      // Sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        setMessage(`Login error: ${error.message}`);
      } else {
        setMessage(`Login successful! User: ${data.user?.email}`);
      }
    } else {
      // Sign up
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) {
        setMessage(`Signup error: ${error.message}`);
      } else {
        setMessage(`Signup successful! Please check your email for confirmation: ${data.user?.email}`);
      }
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
      <h1 className="text-2xl font-bold text-[#333333] mb-6">Test Authentication</h1>
      
      <div className="w-full max-w-md space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-[#333333] mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-[#e0e0e0] rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#3fe44a] focus:border-transparent"
            placeholder="your.email@example.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-[#333333] mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-[#e0e0e0] rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#3fe44a] focus:border-transparent"
            placeholder="••••••••"
          />
        </div>

        <button
          onClick={handleAuth}
          className="w-full bg-[#3fe44a] text-white font-bold py-2 px-4 rounded-lg hover:bg-[#34c741]"
        >
          {isLogin ? 'Sign In' : 'Sign Up'}
        </button>

        <div className="mt-4 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-[#3fe44a] font-medium text-sm underline"
          >
            {isLogin 
              ? "Don't have an account? Sign up" 
              : "Already have an account? Sign in"}
          </button>
        </div>
      </div>

      {message && (
        <div className="mt-6 p-4 bg-gray-100 rounded-lg w-full max-w-md">
          <p className="text-sm text-[#333333]">{message}</p>
        </div>
      )}
    </div>
  );
}