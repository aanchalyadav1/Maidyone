import React, { useState, useEffect } from 'react';
import { Lock, Mail, AlertCircle } from 'lucide-react';
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  browserPopupRedirectResolver,
} from 'firebase/auth';

import { auth, googleProvider } from '../config/firebase';
import { isAdminEmail } from '../config/adminEmails';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Handle redirect result
  useEffect(() => {
    getRedirectResult(auth)
      .then((result) => {
        if (!result) return;

        if (!isAdminEmail(result.user.email)) {
          auth.signOut();
          setError('Access denied. This email is not authorized as an admin.');
        }
      })
      .catch((err: any) => {
        if (err.code !== 'auth/no-auth-event') {
          setError(err.message || 'Google sign-in failed.');
        }
      });
  }, []);

  // Email login
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError('Email and password are required.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const credential = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      if (!isAdminEmail(credential.user.email)) {
        await auth.signOut();
        setError('Access denied. This email is not authorized as an admin.');
        return;
      }
    } catch (err: any) {
      const code = err.code as string | undefined;

      if (
        code === 'auth/user-not-found' ||
        code === 'auth/wrong-password' ||
        code === 'auth/invalid-credential' ||
        code === 'auth/invalid-email'
      ) {
        setError('Invalid email or password.');
      } else if (code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please try again later.');
      } else if (code === 'auth/user-disabled') {
        setError('This account has been disabled.');
      } else {
        setError(err.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Google login
  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError(null);

      let result: Awaited<ReturnType<typeof signInWithPopup>>;

      try {
        result = await signInWithPopup(
          auth,
          googleProvider,
          browserPopupRedirectResolver
        );
      } catch (popupErr: any) {
        if (
          popupErr.code === 'auth/popup-closed-by-user' ||
          popupErr.code === 'auth/cancelled-popup-request'
        ) {
          return;
        }

        if (popupErr.code === 'auth/popup-blocked') {
          await signInWithRedirect(auth, googleProvider);
          return;
        }

        throw popupErr;
      }

      if (!isAdminEmail(result.user.email)) {
        await auth.signOut();
        setError('Access denied. This email is not authorized as an admin.');
        return;
      }
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(err.message || 'Google sign-in failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#F3F4F6] flex items-center justify-center">

      {/* TEAL CIRCLE */}
      <div
        className="absolute bg-[#0EA5A4] rounded-full"
        style={{
          width: '900px',
          height: '900px',
          left: '-420px',
          top: '-420px',
        }}
      />

      {/* YELLOW CIRCLE */}
      <div
        className="absolute bg-[#FACC15] rounded-full"
        style={{
          width: '1300px',
          height: '1300px',
          left: '-180px',
          bottom: '-850px',
        }}
      />

      {/* LOGIN CARD */}
      <div className="relative z-10 w-[420px] rounded-[30px] px-8 py-10 flex flex-col items-center justify-center bg-white/20 backdrop-blur-2xl border border-white/30 shadow-[0_10px_40px_rgba(0,0,0,0.15)]">

        {/* LOGO */}
        <h1 className="text-white text-5xl font-semibold mb-8 tracking-wide">
          Maidyone
        </h1>

        {/* TITLE */}
        <h2 className="text-black text-2xl font-semibold mb-2">
          Sign in
        </h2>

        <p className="text-gray-700 text-sm mb-6 text-center">
          Hi, Welcome Back, you've been missed
        </p>

        {/* ERROR */}
        {error && (
          <div className="w-full mb-4 flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleEmailLogin} className="w-full space-y-4">

          {/* EMAIL */}
          <div className="relative">
            <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />

            <input
              type="email"
              placeholder="Enter your email..."
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError(null);
              }}
              disabled={loading}
              autoComplete="email"
              required
              className="w-full pl-12 py-3 rounded-xl bg-white/60 backdrop-blur-sm border border-white/40 outline-none focus:ring-2 focus:ring-teal-400 text-gray-800 placeholder:text-gray-500"
            />
          </div>

          {/* PASSWORD */}
          <div className="relative">
            <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />

            <input
              type="password"
              placeholder="Enter your password..."
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(null);
              }}
              disabled={loading}
              autoComplete="current-password"
              required
              className="w-full pl-12 py-3 rounded-xl bg-white/60 backdrop-blur-sm border border-white/40 outline-none focus:ring-2 focus:ring-teal-400 text-gray-800 placeholder:text-gray-500"
            />
          </div>

          {/* FORGOT PASSWORD */}
          <div className="text-right">
            <button
              type="button"
              className="text-sm text-gray-700 hover:text-black transition"
            >
              Forgot Password
            </button>
          </div>

          {/* LOGIN BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-xl hover:bg-gray-900 transition duration-200 shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in…' : 'Login with Email'}
          </button>

          {/* DIVIDER */}
          <div className="flex items-center my-4">
            <div className="flex-1 border-t border-gray-400/50" />
            <span className="px-3 text-sm text-gray-600">OR</span>
            <div className="flex-1 border-t border-gray-400/50" />
          </div>

          {/* GOOGLE BUTTON */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full bg-white text-gray-800 py-3 rounded-xl hover:bg-gray-50 transition duration-200 shadow-md flex items-center justify-center font-medium disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 
                1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 
                3.28-4.74 3.28-8.09z"
              />

              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 
                7.28-2.66l-3.57-2.77c-.98.66-2.23 
                1.06-3.71 1.06-2.86 
                0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 
                20.53 7.7 23 12 23z"
              />

              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 
                8.55 1 10.22 1 12s.43 3.45 
                1.18 4.93l2.85-2.22.81-.62z"
              />

              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 
                4.21 1.64l3.15-3.15C17.45 
                2.09 14.97 1 12 1 7.7 1 
                3.99 3.47 2.18 7.07l3.66 
                2.84c.87-2.6 3.3-4.53 
                6.16-4.53z"
              />
            </svg>

            {loading ? 'Signing in…' : 'Sign in with Google'}
          </button>

        </form>
      </div>
    </div>
  );
};
