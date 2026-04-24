import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setCredentials } from "../features/auth/authSlice";
import { Lock, Phone } from "lucide-react";
import api from "../services/api";

export const Login = () => {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password })
      });

      const data = await response.json();

      if (!response.ok || !data || !data.data) {
        alert(data?.message || "Login failed");
        return;
      }

      // Save token in localStorage
      localStorage.setItem("token", data.data.token);
      localStorage.setItem("user", JSON.stringify(data.data.user));

      // ✅ IMPORTANT: your backend uses sendResponse → data.data
      dispatch(
        setCredentials({
          user: data.data.user,
          token: data.data.token,
        })
      );

      navigate("/");
    } catch (error) {
      alert("Server error");
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
        className="relative z-10 w-[420px] h-[520px] rounded-[28px] px-8 
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

        <form onSubmit={handleLogin} className="w-full space-y-4">

          {/* PHONE */}
          <div className="relative">
            <Phone className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Enter your phone..."
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
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
            Login
          </button>

        </form>
      </div>
    </div>
  );
};