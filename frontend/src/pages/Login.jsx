import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { api } from "../utils/api";
import { Mail, Lock, ArrowRight, Loader2, Eye, EyeOff } from "lucide-react";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { language } = useLanguage();
  const { login } = useAuth();
  const navigate = useNavigate();

  const translations = {
    english: {
      welcome: "Welcome Back",
      subtitle: "Sign in to continue to Finance Assistant",
      networkErr:
        "Unable to reach the backend. Start the API on port 8000 and try again.",
      invalidErr: "Invalid email or password",
      email: "Email Address",
      password: "Password",
      remember: "Remember me",
      forgot: "Forgot your password?",
      signIn: "Sign In",
      noAccount: "Don't have an account? ",
      signUp: "Sign Up",
      showPassword: "Show password",
      hidePassword: "Hide password",
    },
    hindi: {
      welcome: "वापसी पर स्वागत है",
      subtitle: "फाइनेंस असिस्टेंट में जारी रखने के लिए साइन इन करें",
      networkErr:
        "बैकएंड तक पहुँचने में असमर्थ। पोर्ट 8000 पर API शुरू करें और पुनः प्रयास करें।",
      invalidErr: "अमान्य ईमेल या पासवर्ड",
      email: "ईमेल पता",
      password: "पासवर्ड",
      remember: "मुझे याद रखें",
      forgot: "क्या आप अपना पासवर्ड भूल गए?",
      signIn: "साइन इन करें",
      noAccount: "क्या आपके पास खाता नहीं है? ",
      signUp: "साइन अप करें",
      showPassword: "पासवर्ड दिखाएं",
      hidePassword: "पासवर्ड छिपाएं",
    },
    bengali: {
      welcome: "স্বাগতম",
      subtitle: "ফাইন্যান্স অ্যাসিস্ট্যান্ট-এ চালিয়ে যেতে সাইন ইন করুন",
      networkErr:
        "ব্যাকএন্ডে পৌঁছাতে অক্ষম। পোর্ট 8000-এ API চালু করুন এবং আবার চেষ্টা করুন।",
      invalidErr: "ভুল ইমেল বা পাসওয়ার্ড",
      email: "ইমেল ঠিকানা",
      password: "পাসওয়ার্ড",
      remember: "আমাকে মনে রাখুন",
      forgot: "আপনার পাসওয়ার্ড ভুলে গেছেন?",
      signIn: "সাইন ইন করুন",
      noAccount: "কোনো অ্যাকাউন্ট নেই? ",
      signUp: "সাইন আপ করুন",
      showPassword: "পাসওয়ার্ড দেখান",
      hidePassword: "পাসওয়ার্ড লুকান",
    },
  };

  const t = translations[language] || translations.english;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await api.post(
        `/auth/login?language=${encodeURIComponent(language)}`,
        formData,
      );
      if (res.data.access_token) {
        login(res.data.access_token, res.data.user);
        navigate(res.data.user ? "/dashboard" : "/");
      }
    } catch (err) {
      if (!err.response) {
        setError(t.networkErr);
      } else if (Array.isArray(err.response.data?.detail)) {
        setError(err.response.data.detail.map((item) => item.msg).join(", "));
      } else {
        setError(err.response.data?.detail || t.invalidErr);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 perspective-[1000px]">
      <div className="w-full max-w-md relative group">
        {/* 3D Glow Effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur-md opacity-30 group-hover:opacity-60 transition duration-500"></div>

        {/* 3D Card Container */}
        <div className="relative transform transition-all duration-500 hover:rotate-y-6 hover:-rotate-x-6 hover:scale-105 preserve-3d bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700/50 p-8 rounded-3xl shadow-xl dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl">
          {/* Top light reflection */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-3xl pointer-events-none border-t border-l border-white/10"></div>

          <div className="mb-8 text-center transform translate-z-10">
            <h2 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-800 dark:from-white dark:via-blue-100 dark:to-gray-400 drop-shadow-sm mb-2">
              {t.welcome}
            </h2>
            <p className="text-slate-600 dark:text-gray-400 text-sm">{t.subtitle}</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm text-center transform translate-z-6 shadow-[inset_0_2px_10px_rgba(0,0,0,0.2)]">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-5 transform translate-z-6"
          >
            <div className="relative group/input">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-slate-400 dark:text-gray-500 group-focus-within/input:text-blue-500 transition-colors" />
              </div>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-gray-950/80 border border-slate-200 dark:border-gray-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]"
                placeholder={t.email}
              />
            </div>

            <div className="relative group/input">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-400 dark:text-gray-500 group-focus-within/input:text-blue-500 transition-colors" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-12 pr-12 py-3 bg-slate-50 dark:bg-gray-950/80 border border-slate-200 dark:border-gray-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]"
                placeholder={t.password}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 dark:text-gray-500 hover:text-blue-500 dark:hover:text-blue-400 transition-colors focus:outline-none"
                tabIndex={-1}
                aria-label={showPassword ? t.hidePassword : t.showPassword}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 !text-white py-3 rounded-xl font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_10px_20px_rgba(37,99,235,0.3)] hover:shadow-[0_15px_30px_rgba(37,99,235,0.4)] hover:-translate-y-1 transform active:translate-y-0 active:shadow-inner"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <span>{t.signIn}</span>
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-gray-400 transform translate-z-6">
            {t.noAccount}
            <Link
              to="/signup"
              className="text-blue-400 hover:text-blue-300 font-bold transition-colors"
            >
              {t.signUp}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
