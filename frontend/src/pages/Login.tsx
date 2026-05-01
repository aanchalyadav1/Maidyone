import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setCredentials } from "../features/auth/authSlice";
import { Lock, Mail } from "lucide-react";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../config/firebase";

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const syncWithBackend = async (token: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok || !data || !data.data) {
        alert(data?.message || "Login failed on backend");
        return;
      }

      // Save token in localStorage
      localStorage.setItem("token", data.data.token);
      localStorage.setItem("user", JSON.stringify(data.data.user));

      dispatch(
        setCredentials({
          user: data.data.user,
          token: data.data.token,
        })
      );

      navigate("/");
    } catch (error) {
      alert("Server error during sync");
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const token = await userCredential.user.getIdToken();
      await syncWithBackend(token);
    } catch (error: any) {
      alert(error.message || "Email login failed");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const token = await userCredential.user.getIdToken();
      await syncWithBackend(token);
    } catch (error: any) {
      alert(error.message || "Google login failed");
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#F4F6F8] flex items-center justify-center">

      {/* TEAL SHAPE */}
      <div
        className="absolute bg-[#0EA5A4] rounded-full"
        style={{
          width: "1200px",
          height: "1200px",
          left: "-450px",
          top: "-200px",
        }}
      />

      {/* YELLOW SHAPE */}
      <div
        className="absolute bg-[#FACC15] rounded-full"
        style={{
          width: "1800px",
          height: "1800px",
          left: "-300px",
          bottom: "-1200px",
        }}
      />

      {/* LOGIN CARD */}
      <div
        className="relative z-10 w-[420px] rounded-[28px] px-8 py-10
        flex flex-col items-center justify-center
        bg-white/20
        backdrop-blur-2xl border border-white/30
        shadow-[0_10px_40px_rgba(0,0,0,0.15)]"
      >

        <h1 className="text-white text-3xl font-semibold mb-6 tracking-wide">
          Maidyone
        </h1>

        <h2 className="text-gray-800 text-lg font-semibold mb-1">
          Sign in
        </h2>

        <p className="text-gray-600 text-sm mb-6 text-center">
          Hi, Welcome Back, you've been missed
        </p>

        <form onSubmit={handleEmailLogin} className="w-full space-y-4">

          {/* EMAIL */}
          <div className="relative">
            <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
            <input
              type="email"
              placeholder="Enter your email..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-12 py-3 rounded-lg 
              bg-white/60 backdrop-blur-sm
              border border-white/40
              outline-none focus:ring-2 focus:ring-teal-400"
              required
            />
          </div>

          {/* PASSWORD */}
          <div className="relative">
            <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
            <input
              type="password"
              placeholder="Enter your password..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-12 py-3 rounded-lg 
              bg-white/60 backdrop-blur-sm
              border border-white/40
              outline-none focus:ring-2 focus:ring-teal-400"
              required
            />
          </div>

          {/* FORGOT */}
          <div className="text-right">
            <button
              type="button"
              className="text-sm text-gray-600 hover:text-black transition"
            >
              Forgot Password
            </button>
          </div>

          {/* BUTTON */}
          <button
            type="submit"
            className="w-full bg-black text-white py-3 rounded-lg 
            hover:bg-gray-900 transition duration-200 shadow-md"
          >
            Login with Email
          </button>

          {/* OR DIVIDER */}
          <div className="flex items-center my-4">
            <div className="flex-1 border-t border-gray-400/50"></div>
            <span className="px-3 text-sm text-gray-600">OR</span>
            <div className="flex-1 border-t border-gray-400/50"></div>
          </div>

          {/* GOOGLE LOGIN */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full bg-white text-gray-800 py-3 rounded-lg 
            hover:bg-gray-50 transition duration-200 shadow-md flex items-center justify-center font-medium"
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Sign in with Google
          </button>

        </form>
      </div>
    </div>
  );
};