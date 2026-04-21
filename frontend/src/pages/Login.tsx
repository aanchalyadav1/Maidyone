import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setCredentials } from "../features/auth/authSlice";
import { Lock, Phone } from "lucide-react";

export const Login = () => {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    const token = "dummy-production-firebase-token-123";

    dispatch(
      setCredentials({
        user: {
          uid: "admin-1",
          role: "admin",
          phoneNumber: phone,
          email: null,
        },
        token,
      })
    );

    navigate("/");
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#F4F6F8] flex items-center justify-center">

      {/* TEAL CIRCLE */}
      <div
        className="absolute bg-[#0EA5A4] rounded-full"
        style={{
          width: "1200px",
          height: "1200px",
          left: "-450px",
          top: "-200px",
        }}
      />

      {/* YELLOW CIRCLE */}
      <div
        className="absolute bg-[#FACC15] rounded-full"
        style={{
          width: "1800px",
          height: "1800px",
          left: "-300px",
          bottom: "-1200px",
        }}
      />

      {/* CARD */}
      <div className="relative z-10 w-[420px] h-[520px] rounded-[28px] 
      bg-gradient-to-br from-[#6EC6BD]/90 to-[#DDEFEF]/90 backdrop-blur-xs
      shadow-xl flex flex-col items-center justify-center px-8">

        <h1 className="text-white text-3xl font-semibold mb-6">
          Maidyone
        </h1>

        <h2 className="text-gray-800 text-lg font-semibold mb-1">
          Sign in
        </h2>

        <p className="text-gray-600 text-sm mb-6 text-center">
          Welcome back, you've been missed
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
              className="w-full pl-12 py-3 rounded-lg bg-gray-200 outline-none"
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
              className="w-full pl-12 py-3 rounded-lg bg-gray-200 outline-none"
              required
            />
          </div>

          <div className="text-right">
            <button type="button" className="text-sm text-gray-600">
              Forgot Password
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-black text-white py-3 rounded-lg"
          >
            Login
          </button>

        </form>
      </div>
    </div>
  );
};
