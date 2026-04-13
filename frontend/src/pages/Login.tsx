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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-[24px] shadow-sm max-w-md w-full border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-[#A6FFCB] text-transparent bg-clip-text">Maidyone Admin</h1>
          <p className="text-gray-500 mt-2 text-sm">Secure Portal Login</p>
        </div>

        <div className="flex gap-2 mb-6">
          <button 
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${authType === 'email' ? 'bg-primary/10 text-primary' : 'bg-gray-50 text-gray-400'}`}
            onClick={() => setAuthType('email')}
          >
            Email
          </button>
          <button 
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${authType === 'phone' ? 'bg-primary/10 text-primary' : 'bg-gray-50 text-gray-400'}`}
            onClick={() => setAuthType('phone')}
          >
            Phone
          </button>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {authType === 'email' ? (
            <>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="email" 
                  placeholder="Admin Email" 
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-primary transition-colors text-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="password" 
                  placeholder="Password" 
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-primary transition-colors text-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </>
          ) : (
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="tel" 
                placeholder="Phone Number (+91...)" 
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-primary transition-colors text-sm"
                required
              />
            </div>
          )}

          <button 
            type="submit" 
            className="w-full bg-black text-white py-3 rounded-xl hover:bg-gray-800 transition-colors font-semibold"
          >
            Secure Login
          </button>
        </form>
      </div>
    </div>
  );
};
