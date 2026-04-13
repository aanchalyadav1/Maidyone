import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setCredentials } from '../features/auth/authSlice';
import { Mail, Lock, Phone } from 'lucide-react';
// import { signInWithEmailAndPassword, signInWithPhoneNumber } from 'firebase/auth';
// import { auth } from '../config/firebase'; // Placeholder config

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authType, setAuthType] = useState('email'); // 'email' | 'phone'
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Dummy validation for demo. In production:
      // const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // const token = await userCredential.user.getIdToken();
      
      const token = "dummy-production-firebase-token-123";

      dispatch(setCredentials({
        user: { uid: 'admin-1', role: 'admin', email },
        token
      }));
      navigate('/');
    } catch (err) {
      alert("Failed to authenticate.");
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#F8FAFC] overflow-hidden font-sans">
      <div className="absolute top-8 left-10">
        <h1 className="text-[28px] font-extrabold text-[#0EA5A4] tracking-wide">Maidyone</h1>
      </div>

      <div className="relative z-10 p-10 rounded-[32px] w-full max-w-[480px] bg-white/20 backdrop-blur-2xl border border-white/40 shadow-2xl flex flex-col items-center">
        
        <div className="w-full mb-8 text-left">
          <h2 className="text-[26px] font-bold text-white mb-1.5 drop-shadow-md">Welcome ! 👋</h2>
          <p className="text-white/90 font-medium text-[15px] drop-shadow-sm">Please enter login details</p>
        </div>

        <form onSubmit={handleLogin} className="w-full space-y-5">
          <div className="w-full">
             <label className="block text-white font-semibold text-[13px] mb-1.5 ml-1 drop-shadow-sm">Email</label>
             <div className="relative w-full">
               <input 
                 type="email" 
                 placeholder="Email Address" 
                 className="w-full px-5 py-[14px] bg-white text-gray-800 rounded-xl border-none outline-none focus:ring-2 focus:ring-[#0EA5A4] transition-all text-[15px] placeholder-gray-400 font-medium"
                 value={email}
                 onChange={(e) => setEmail(e.target.value)}
                 required
               />
             </div>
          </div>

          <div className="w-full">
             <label className="block text-white font-semibold text-[13px] mb-1.5 ml-1 drop-shadow-sm">Password</label>
             <div className="relative w-full">
               <input 
                 type="password" 
                 placeholder="Password" 
                 className="w-full px-5 py-[14px] bg-white text-gray-800 rounded-xl border-none outline-none focus:ring-2 focus:ring-[#0EA5A4] transition-all text-[15px] placeholder-gray-400 font-medium"
                 value={password}
                 onChange={(e) => setPassword(e.target.value)}
                 required
               />
             </div>
          </div>

          <div className="flex justify-between items-center w-full pt-1 pb-2">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#0EA5A4] focus:ring-[#0EA5A4] cursor-pointer" />
              <span className="text-white text-[13px] font-medium drop-shadow-sm group-hover:text-white/90 transition-colors">Remember me</span>
            </label>
            <a href="#" className="text-white text-[13px] font-medium drop-shadow-sm hover:underline">Forget password?</a>
          </div>

          <button 
            type="submit" 
            className="w-full bg-[#1A73E8] text-white py-[14px] rounded-xl hover:bg-blue-700 transition-colors font-bold text-[15px]"
          >
            Login
          </button>
          
          <div className="flex items-center gap-4 my-6">
            <div className="h-[1px] flex-1 bg-white/30"></div>
            <span className="text-white/90 text-[12px] font-medium uppercase tracking-wide">Or sign in with</span>
            <div className="h-[1px] flex-1 bg-white/30"></div>
          </div>

          <button 
            type="button" 
            className="w-full bg-[#E5E7EB] text-gray-800 py-[14px] rounded-xl hover:bg-gray-300 flex justify-center items-center gap-3 transition-colors font-bold text-[15px]"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-red-500" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Google
          </button>
          
          <div className="text-center mt-6">
            <p className="text-white drop-shadow-sm text-[13px] font-medium">
              Need an account? <a href="#" className="font-bold underline hover:text-white/90">Sign In</a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
