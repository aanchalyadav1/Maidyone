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

    try {
      const token = "dummy-production-firebase-token-123";

      // ✅ FIXED: phoneNumber instead of phone
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
    } catch (err) {
      alert("Failed to authenticate.");
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#F4F6F8] flex items-center justify-center">

      {/* 🟢 GREEN CIRCLE */}
      <div
        className="absolute bg-[#0EA5A4] rounded-full"
        style={{
          width: "950px",
          height: "950px",
          left: "-400px",
          top: "-350px",
          zIndex: 1,
        }}
      />

      {/* 🟡 YELLOW CIRCLE */}
      <div
        className="absolute bg-[#FACC15] rounded-full"
        style={{
          width: "1100px",
          height: "1100px",
          left: "-350px",
          bottom: "-550px",
          zIndex: 0,
        }}
      />

      {/* LOGIN CARD */}
      <div
        className="relative z-10 w-[420px] h-[520px] rounded-[28px] 
        bg-gradient-to-br from-[#6EC6BD] to-[#DDEFEF] 
        shadow-[0_25px_50px_rgba(0,0,0,0.15)]
        flex flex-col items-center justify-center px-8"
      >

        {/* LEFT GLOSS STRIP */}
        <div
          className="absolute top-0 left-0 h-full w-28 rounded-[28px]"
          style={{
            background:
              "linear-gradient(to right, rgba(255,255,255,0.35), transparent)",
          }}
        />

        {/* CONTENT */}
        <div className="relative w-full flex flex-col items-center">

          <h1 className="text-white text-3xl font-semibold mb-6">
            Maidyone
          </h1>

          <h2 className="text-gray-800 text-lg font-semibold mb-1">
            Sign in
          </h2>

          <p className="text-gray-600 text-sm mb-6 text-center">
            Hii, Welcome Back, you've been missed
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
                className="w-full pl-12 pr-4 py-3 rounded-lg 
                bg-[#E5E7EB] text-gray-800 outline-none"
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
                className="w-full pl-12 pr-4 py-3 rounded-lg 
                bg-[#E5E7EB] text-gray-800 outline-none"
                required
              />
            </div>

            {/* FORGOT */}
            <div className="text-right">
              <button
                type="button"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Forgot Password
              </button>
            </div>

            {/* LOGIN BUTTON */}
            <button
              type="submit"
              className="w-full bg-black text-white py-3 rounded-lg 
              shadow-lg hover:bg-gray-900 transition"
            >
              Login
            </button>

          </form>
        </div>
      </div>
    </div>
  );
};            <div className="relative">
              <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
              <input
                type="password"
                placeholder="Enter your password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-lg 
                bg-[#E5E7EB] text-gray-800 outline-none"
                required
              />
            </div>

            {/* FORGOT PASSWORD */}
            <div className="text-right">
              <button
                type="button"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Forgot Password
              </button>
            </div>

            {/* LOGIN BUTTON */}
            <button
              type="submit"
              className="w-full bg-black text-white py-3 rounded-lg 
              shadow-lg hover:bg-gray-900 transition"
            >
              Login
            </button>

          </form>
        </div>
      </div>
    </div>
  );
};
