import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import {
  Settings as SettingsIcon,
  Sun,
  Moon,
  Monitor,
  Languages,
  User,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  Sparkles,
} from "lucide-react";

const Settings = () => {
  const { language, toggleLanguage } = useLanguage();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const translations = {
    english: {
      pageTitle: "Settings",
      pageSubtitle:
        "Manage your application preferences, display theme, and account profile.",
      // Theme Section
      themeTitle: "Appearance & Theme",
      themeDescription:
        "Choose how ArthNiti appears on your device. The system option automatically follows your browser preference.",
      systemTitle: "System Default",
      systemDesc: "Sync with your device and browser settings",
      systemCurrent: "Currently",
      lightTitle: "Light",
      lightDesc: "Crisp and clear high-contrast appearance",
      darkTitle: "Dark",
      darkDesc: "Sleek and easy on the eyes in low light",
      activeBadge: "Active",
      autoBadge: "Auto-sync",
      // Language Section
      languageTitle: "Language Preference",
      languageDescription:
        "Choose your preferred language for the interface, reports, and AI advisory.",
      englishLabel: "English",
      hindiLabel: "Hindi (हिंदी)",
      bengaliLabel: "Bengali (বাংলা)",
      // Profile Section
      profileTitle: "Update Profile",
      profileDescription:
        "View and update your personal information, contact details, business location, and profile picture.",
      editProfileBtn: "Edit Profile Details",
      notLoggedIn: "You are currently browsing as a guest.",
      loginPrompt:
        "Sign in to your account to update personal and business profile details.",
      loginBtn: "Sign In to Update Profile",
      roleLabel: "Account Role",
    },
    hindi: {
      pageTitle: "सेटिंग्स",
      pageSubtitle:
        "अपनी एप्लिकेशन प्राथमिकताएं, प्रदर्शन थीम और खाता प्रोफ़ाइल प्रबंधित करें।",
      themeTitle: "दिखावट और थीम",
      themeDescription:
        "चुनें कि अर्थनीति आपके डिवाइस पर कैसे दिखाई दे। सिस्टम विकल्प स्वचालित रूप से आपके ब्राउज़र की पसंद का पालन करता है।",
      systemTitle: "सिस्टम डिफ़ॉल्ट",
      systemDesc: "अपने डिवाइस और ब्राउज़र सेटिंग्स के साथ सिंक करें",
      systemCurrent: "वर्तमान में",
      lightTitle: "लाइट",
      lightDesc: "स्पष्ट और उच्च-कंट्रास्ट रूप",
      darkTitle: "डार्क",
      darkDesc: "कम रोशनी में आंखों के लिए आरामदायक",
      activeBadge: "सक्रिय",
      autoBadge: "ऑटो-सिंक",
      languageTitle: "भाषा प्राथमिकता",
      languageDescription:
        "इंटरफ़ेस, रिपोर्ट और एआई सलाह के लिए अपनी पसंदीदा भाषा चुनें।",
      englishLabel: "अंग्रेज़ी (English)",
      hindiLabel: "हिंदी (हिंदी)",
      bengaliLabel: "बंगाली (বাংলা)",
      profileTitle: "प्रोफ़ाइल अपडेट करें",
      profileDescription:
        "अपनी व्यक्तिगत जानकारी, संपर्क विवरण, व्यावसायिक स्थान और प्रोफ़ाइल फ़ोटो अपडेट करें।",
      editProfileBtn: "प्रोफ़ाइल विवरण संपादित करें",
      notLoggedIn: "आप वर्तमान में अतिथि के रूप में ब्राउज़ कर रहे हैं।",
      loginPrompt:
        "व्यक्तिगत और व्यावसायिक प्रोफ़ाइल विवरण अपडेट करने के लिए लॉग इन करें।",
      loginBtn: "अपडेट करने के लिए लॉग इन करें",
      roleLabel: "खाता भूमिका",
    },
    bengali: {
      pageTitle: "সেটিংস",
      pageSubtitle:
        "আপনার অ্যাপ্লিকেশন পছন্দ, থিম এবং অ্যাকাউন্ট প্রোফাইল পরিচালনা করুন।",
      themeTitle: "চেহারা এবং থিম",
      themeDescription:
        "আপনার ডিভাইসে অর্থনীতি কীভাবে প্রদর্শিত হবে তা চয়ন করুন। সিস্টেম বিকল্পটি স্বয়ংক্রিয়ভাবে আপনার ব্রাউজারের পছন্দ অনুসরণ করে।",
      systemTitle: "সিস্টেম ডিফল্ট",
      systemDesc: "আপনার ডিভাইস এবং ব্রাউজার সেটিংসের সাথে সিঙ্ক করুন",
      systemCurrent: "বর্তমানে",
      lightTitle: "লাইট",
      lightDesc: "উজ্জ্বল এবং স্পষ্ট উচ্চ-কন্ট্রাস্ট ডিসপ্লে",
      darkTitle: "ডার্ক",
      darkDesc: "চোখের পক্ষে আরামদায়ক মসৃণ ডার্ক ইন্টারফেস",
      activeBadge: "সক্রিয়",
      autoBadge: "অটো-সিঙ্ক",
      languageTitle: "ভাষা পছন্দ",
      languageDescription:
        "ইন্টারফেস, রিপোর্ট এবং এআই পরামর্শের জন্য আপনার পছন্দের ভাষা বেছে নিন।",
      englishLabel: "ইংরেজি (English)",
      hindiLabel: "হিন্দি (हिंदी)",
      bengaliLabel: "বাংলা (বাংলা)",
      profileTitle: "প্রোফাইল আপডেট করুন",
      profileDescription:
        "আপনার ব্যক্তিগত তথ্য, যোগাযোগের বিবরণ, ব্যবসার অবস্থান এবং প্রোফাইল ছবি আপডেট করুন।",
      editProfileBtn: "প্রোফাইল সম্পাদনা করুন",
      notLoggedIn: "আপনি বর্তমানে অতিথি হিসাবে ব্রাউজ করছেন।",
      loginPrompt:
        "ব্যক্তিগত এবং ব্যবসায়িক বিবরণ আপডেট করতে আপনার অ্যাকাউন্টে সাইন ইন করুন।",
      loginBtn: "আপডেট করতে সাইন ইন করুন",
      roleLabel: "অ্যাকাউন্টের ভূমিকা",
    },
  };

  const t = translations[language] || translations.english;

  const getLocalizedName = (value) => {
    if (!value) return "";
    if (typeof value === "string") return value;
    if (typeof value === "object") {
      const langKeyMap = {
        english: ["en", "english"],
        hindi: ["hi", "hindi"],
        bengali: ["bn", "bengali"],
      };
      const keys = langKeyMap[language] || ["en", "english"];
      for (const k of keys) {
        if (value[k]) return value[k];
      }
      return value.en || value.english || Object.values(value)[0] || "";
    }
    return String(value);
  };

  const getUserDisplayName = () => {
    if (!user) return "";
    const first = getLocalizedName(user.first_name);
    const last = getLocalizedName(user.last_name);
    return `${first} ${last}`.trim() || getLocalizedName(user.name) || user.username || "User";
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-slate-900 dark:text-white">
      {/* Header */}
      <div className="mb-10 pb-6 border-b border-slate-200 dark:border-gray-800">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 p-2.5 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <SettingsIcon size={24} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {t.pageTitle}
            </h1>
            <p className="text-sm text-slate-600 dark:text-gray-400 mt-1">{t.pageSubtitle}</p>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {/* 1. THEME SELECTION */}
        <section className="rounded-3xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900/60 p-6 sm:p-8 backdrop-blur-xl shadow-lg dark:shadow-xl transition-all">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-1">
                <Sun size={20} className="hidden dark:inline" />
                <Moon size={20} className="inline dark:hidden" />
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t.themeTitle}</h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-gray-400">
                {t.themeDescription}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* System Theme Card */}
            <button
              type="button"
              onClick={() => setTheme("system")}
              className={`relative flex flex-col items-start p-5 rounded-2xl border text-left transition-all duration-300 transform ${
                theme === "system"
                  ? "bg-gradient-to-b from-blue-600/15 to-indigo-600/10 border-blue-500 shadow-[0_0_25px_rgba(59,130,246,0.2)] scale-[1.02]"
                  : "bg-slate-50 dark:bg-gray-950/50 border-slate-200 dark:border-gray-800 hover:border-slate-300 dark:hover:border-gray-700 hover:bg-slate-100 dark:hover:bg-gray-950/80"
              }`}
            >
              {theme === "system" && (
                <div className="absolute top-4 right-4 flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                  <span className="text-[10px] uppercase font-bold tracking-wider bg-blue-500/15 dark:bg-blue-500/20 px-2 py-0.5 rounded-full border border-blue-500/30">
                    {t.autoBadge}
                  </span>
                  <CheckCircle2 size={18} />
                </div>
              )}
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-colors ${
                  theme === "system"
                    ? "bg-blue-600 !text-white shadow-md shadow-blue-500/30"
                    : "bg-slate-200 dark:bg-gray-800 text-slate-600 dark:text-gray-400"
                }`}
              >
                <Monitor size={22} />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1">
                {t.systemTitle}
              </h3>
              <p className="text-xs text-slate-600 dark:text-gray-400 leading-relaxed mb-3">
                {t.systemDesc}
              </p>
              <span className="text-[11px] text-slate-500 dark:text-gray-500 mt-auto font-medium">
                {t.systemCurrent}:{" "}
                <span className="text-blue-600 dark:text-blue-400 capitalize font-bold">
                  {resolvedTheme}
                </span>
              </span>
            </button>

            {/* Light Theme Card */}
            <button
              type="button"
              onClick={() => setTheme("light")}
              className={`relative flex flex-col items-start p-5 rounded-2xl border text-left transition-all duration-300 transform ${
                theme === "light"
                  ? "bg-gradient-to-b from-blue-600/15 to-indigo-600/10 border-blue-500 shadow-[0_0_25px_rgba(59,130,246,0.2)] scale-[1.02]"
                  : "bg-slate-50 dark:bg-gray-950/50 border-slate-200 dark:border-gray-800 hover:border-slate-300 dark:hover:border-gray-700 hover:bg-slate-100 dark:hover:bg-gray-950/80"
              }`}
            >
              {theme === "light" && (
                <div className="absolute top-4 right-4 flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                  <span className="text-[10px] uppercase font-bold tracking-wider bg-blue-500/15 dark:bg-blue-500/20 px-2 py-0.5 rounded-full border border-blue-500/30">
                    {t.activeBadge}
                  </span>
                  <CheckCircle2 size={18} />
                </div>
              )}
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-colors ${
                  theme === "light"
                    ? "bg-amber-500 !text-white shadow-md shadow-amber-500/30"
                    : "bg-slate-200 dark:bg-gray-800 text-slate-600 dark:text-gray-400"
                }`}
              >
                <Sun size={22} />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1">
                {t.lightTitle}
              </h3>
              <p className="text-xs text-slate-600 dark:text-gray-400 leading-relaxed">
                {t.lightDesc}
              </p>
            </button>

            {/* Dark Theme Card */}
            <button
              type="button"
              onClick={() => setTheme("dark")}
              className={`relative flex flex-col items-start p-5 rounded-2xl border text-left transition-all duration-300 transform ${
                theme === "dark"
                  ? "bg-gradient-to-b from-blue-600/15 to-indigo-600/10 border-blue-500 shadow-[0_0_25px_rgba(59,130,246,0.2)] scale-[1.02]"
                  : "bg-slate-50 dark:bg-gray-950/50 border-slate-200 dark:border-gray-800 hover:border-slate-300 dark:hover:border-gray-700 hover:bg-slate-100 dark:hover:bg-gray-950/80"
              }`}
            >
              {theme === "dark" && (
                <div className="absolute top-4 right-4 flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                  <span className="text-[10px] uppercase font-bold tracking-wider bg-blue-500/15 dark:bg-blue-500/20 px-2 py-0.5 rounded-full border border-blue-500/30">
                    {t.activeBadge}
                  </span>
                  <CheckCircle2 size={18} />
                </div>
              )}
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-colors ${
                  theme === "dark"
                    ? "bg-indigo-600 !text-white shadow-md shadow-indigo-500/30"
                    : "bg-slate-200 dark:bg-gray-800 text-slate-600 dark:text-gray-400"
                }`}
              >
                <Moon size={22} />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1">
                {t.darkTitle}
              </h3>
              <p className="text-xs text-slate-600 dark:text-gray-400 leading-relaxed">
                {t.darkDesc}
              </p>
            </button>
          </div>
        </section>

        {/* 2. LANGUAGE SELECTION */}
        <section className="rounded-3xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900/60 p-6 sm:p-8 backdrop-blur-xl shadow-lg dark:shadow-xl transition-all">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 mb-1">
            <Languages size={20} />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t.languageTitle}</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-gray-400 mb-6">
            {t.languageDescription}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* English */}
            <button
              type="button"
              onClick={() => toggleLanguage("english")}
              className={`relative flex items-center justify-between p-4 rounded-2xl border text-left transition-all duration-300 ${
                language === "english"
                  ? "bg-gradient-to-r from-blue-600/15 to-indigo-600/10 border-blue-500 shadow-md shadow-blue-500/10 scale-[1.01]"
                  : "bg-slate-50 dark:bg-gray-950/50 border-slate-200 dark:border-gray-800 hover:border-slate-300 dark:hover:border-gray-700 hover:bg-slate-100 dark:hover:bg-gray-950/80"
              }`}
            >
              <div>
                <span className="font-bold text-slate-900 dark:text-white text-base block">
                  {t.englishLabel}
                </span>
                <span className="text-xs text-slate-500 dark:text-gray-400">EN</span>
              </div>
              {language === "english" && (
                <CheckCircle2 size={20} className="text-blue-600 dark:text-blue-400" />
              )}
            </button>

            {/* Hindi */}
            <button
              type="button"
              onClick={() => toggleLanguage("hindi")}
              className={`relative flex items-center justify-between p-4 rounded-2xl border text-left transition-all duration-300 ${
                language === "hindi"
                  ? "bg-gradient-to-r from-blue-600/15 to-indigo-600/10 border-blue-500 shadow-md shadow-blue-500/10 scale-[1.01]"
                  : "bg-slate-50 dark:bg-gray-950/50 border-slate-200 dark:border-gray-800 hover:border-slate-300 dark:hover:border-gray-700 hover:bg-slate-100 dark:hover:bg-gray-950/80"
              }`}
            >
              <div>
                <span className="font-bold text-slate-900 dark:text-white text-base block">
                  {t.hindiLabel}
                </span>
                <span className="text-xs text-slate-500 dark:text-gray-400">HI</span>
              </div>
              {language === "hindi" && (
                <CheckCircle2 size={20} className="text-blue-600 dark:text-blue-400" />
              )}
            </button>

            {/* Bengali */}
            <button
              type="button"
              onClick={() => toggleLanguage("bengali")}
              className={`relative flex items-center justify-between p-4 rounded-2xl border text-left transition-all duration-300 ${
                language === "bengali"
                  ? "bg-gradient-to-r from-blue-600/15 to-indigo-600/10 border-blue-500 shadow-md shadow-blue-500/10 scale-[1.01]"
                  : "bg-slate-50 dark:bg-gray-950/50 border-slate-200 dark:border-gray-800 hover:border-slate-300 dark:hover:border-gray-700 hover:bg-slate-100 dark:hover:bg-gray-950/80"
              }`}
            >
              <div>
                <span className="font-bold text-slate-900 dark:text-white text-base block">
                  {t.bengaliLabel}
                </span>
                <span className="text-xs text-slate-500 dark:text-gray-400">BN</span>
              </div>
              {language === "bengali" && (
                <CheckCircle2 size={20} className="text-blue-600 dark:text-blue-400" />
              )}
            </button>
          </div>
        </section>

        {/* 3. UPDATE PROFILE OPTION ONLY */}
        <section className="rounded-3xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900/60 p-6 sm:p-8 backdrop-blur-xl shadow-lg dark:shadow-xl transition-all">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-1">
            <UserCheck size={20} />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t.profileTitle}</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-gray-400 mb-6">
            {t.profileDescription}
          </p>

          {isAuthenticated && user ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-5 rounded-2xl border border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-950/60">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white overflow-hidden shadow-lg shadow-blue-500/20 shrink-0">
                  {user.profile_image || user.profile_pic ? (
                    <img
                      src={user.profile_image || user.profile_pic}
                      alt={getUserDisplayName()}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User size={26} />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    {getUserDisplayName()}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-gray-400">
                    {user.email || user.username}
                  </p>
                  {user.role && (
                    <span className="inline-block mt-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                      {String(user.role)}
                    </span>
                  )}
                </div>
              </div>

              <Link
                to="/profile"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 !text-white font-bold text-sm shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all"
              >
                <span>{t.editProfileBtn}</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-5 rounded-2xl border border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-950/60">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  {t.notLoggedIn}
                </h3>
                <p className="text-xs text-slate-600 dark:text-gray-400 mt-1 max-w-md">
                  {t.loginPrompt}
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate("/login")}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 !text-white font-bold text-sm shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all shrink-0"
              >
                <span>{t.loginBtn}</span>
                <ArrowRight size={16} />
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Settings;
