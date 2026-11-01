import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { api } from "../utils/api";
import {
  Home,
  LogIn,
  UserPlus,
  LogOut,
  LayoutDashboard,
  Settings,
  Building2,
  User,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  FileText,
} from "lucide-react";

const Sidebar = () => {
  const { language } = useLanguage();
  const { user, logout, updateUser } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(true);

  const isActive = (path) => location.pathname === path;

  const translations = {
    english: {
      brand: "ArthNiti",
      home: "Home",
      login: "Login",
      signup: "Sign Up",
      dashboard: "Dashboard",
      myBusinesses: "My Businesses",
      businessDetails: "Business Directory",
      settings: "Settings",
      profile: "Profile",
      logout: "Log Out",
      logoAlt: "ArthNiti Logo",
      openNavigation: "Open Navigation",
      collapseNavigation: "Collapse Navigation",
      userFallback: "User",
    },
    hindi: {
      brand: "अर्थनीति",
      home: "होम",
      login: "लॉग इन",
      signup: "साइन अप",
      dashboard: "डैशबोर्ड",
      myBusinesses: "मेरे व्यवसाय",
      businessDetails: "व्यवसाय निर्देशिका",
      settings: "सेटिंग्स",
      profile: "प्रोफ़ाइल",
      logout: "लॉग आउट",
      logoAlt: "अर्थनीति लोगो",
      openNavigation: "नेविगेशन खोलें",
      collapseNavigation: "नेविगेशन संक्षिप्त करें",
      userFallback: "उपयोगकर्ता",
    },
    bengali: {
      brand: "অর্থনীতি",
      home: "হোম",
      login: "লগইন",
      signup: "সাইন আপ",
      dashboard: "ড্যাশবোর্ড",
      myBusinesses: "আমার ব্যবসা",
      businessDetails: "ব্যবসা ডিরেক্টরি",
      settings: "সেটিংস",
      profile: "প্রোফাইল",
      logout: "লগ আউট",
      logoAlt: "অর্থনীতি লোগো",
      openNavigation: "নেভিগেশন খুলুন",
      collapseNavigation: "নেভিগেশন বন্ধ করুন",
      userFallback: "ব্যবহারকারী",
    },
  };

  const t = translations[language] || translations.english;

  // Whenever language changes and user is authenticated, refresh profile to sync translated name
  useEffect(() => {
    if (!user) return;
    let isMounted = true;

    const fetchLocalizedUser = async () => {
      try {
        const res = await api.get("/auth/me", {
          params: { language },
        });
        if (isMounted && res.data && updateUser) {
          updateUser({
            first_name: res.data.first_name,
            last_name: res.data.last_name,
            profile_image: res.data.profile_image || res.data.profile_pic,
            role: res.data.role,
          });
        }
      } catch {
        // Silently preserve existing name if offline or error
      }
    };

    fetchLocalizedUser();

    return () => {
      isMounted = false;
    };
  }, [language, user?.user_id, user?.id]);

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

  const getLinkClasses = (path) => {
    return `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 transform preserve-3d ${
      isActive(path)
        ? "bg-gradient-to-r from-blue-600 to-indigo-600 !text-white shadow-[0_10px_20px_rgba(37,99,235,0.3)] translate-z-10 scale-105"
        : "text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-800/80 hover:text-slate-900 dark:hover:text-white hover:translate-x-2 hover:shadow-lg"
    }`;
  };

  const getUserName = () => {
    if (!user) return "";
    const firstName = getLocalizedName(user.first_name);
    const lastName = getLocalizedName(user.last_name);
    const fullName = `${firstName} ${lastName}`.trim();
    return fullName || getLocalizedName(user.name) || t.userFallback;
  };

  const getUsername = () => {
    if (!user) return "";
    return user.username || user.email || "";
  };

  return (
    <>
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed top-5 left-5 z-50 flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900/90 text-slate-700 dark:text-gray-400 shadow-xl backdrop-blur-md transition-all hover:border-blue-500/40 hover:bg-slate-100 dark:hover:bg-gray-800 hover:text-slate-900 dark:hover:text-white"
          title={t.openNavigation}
        >
          <PanelLeftOpen size={20} />
        </button>
      )}

      <aside
        className={`h-screen bg-white dark:bg-gray-950/95 backdrop-blur-md border-r border-slate-200 dark:border-gray-800 flex flex-col justify-between flex-shrink-0 sticky top-0 shadow-[20px_0_50px_rgba(0,0,0,0.05)] dark:shadow-[20px_0_50px_rgba(0,0,0,0.5)] z-40 transition-all duration-300 ease-in-out ${
          isOpen
            ? "w-64 opacity-100"
            : "w-0 opacity-0 pointer-events-none border-none p-0 overflow-hidden"
        }`}
      >
        <div className="w-64 h-full flex flex-col justify-between">
          <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-black/5 via-black/2 to-transparent dark:from-white/10 dark:via-white/5 dark:to-transparent pointer-events-none" />

          <div className="p-6 relative z-10 overflow-y-auto">
            <div className="flex items-center justify-between mb-8">
              <Link
                to="/"
                className="flex items-center space-x-3 transform preserve-3d hover:rotate-y-12 transition-transform duration-500"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-600/20 p-2 flex items-center justify-center shadow-[0_10px_20px_rgba(37,99,235,0.25)] translate-z-10 border border-blue-500/30">
                  <img
                    src="/icon.svg"
                    alt={t.logoAlt}
                    className="w-full h-full object-contain drop-shadow-md"
                  />
                </div>

                <h1 className="text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-800 dark:from-white dark:via-blue-100 dark:to-gray-400 drop-shadow-sm translate-z-6">
                  {t.brand}
                </h1>
              </Link>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-gray-800 bg-slate-100 dark:bg-gray-900/60 text-slate-500 dark:text-gray-400 transition hover:border-slate-300 dark:hover:border-gray-700 hover:bg-slate-200 dark:hover:bg-gray-800 hover:text-slate-900 dark:hover:text-white"
                title={t.collapseNavigation}
              >
                <PanelLeftClose size={16} />
              </button>
            </div>

            <nav className="space-y-3 perspective-[1000px]">
              <Link to="/" className={getLinkClasses("/")}>
                <Home
                  size={20}
                  className={isActive("/") ? "drop-shadow-md" : ""}
                />
                <span className="font-semibold">{t.home}</span>
              </Link>

              {!user ? (
                <>
                  <Link to="/login" className={getLinkClasses("/login")}>
                    <LogIn
                      size={20}
                      className={isActive("/login") ? "drop-shadow-md" : ""}
                    />
                    <span className="font-semibold">{t.login}</span>
                  </Link>

                  <Link to="/signup" className={getLinkClasses("/signup")}>
                    <UserPlus
                      size={20}
                      className={isActive("/signup") ? "drop-shadow-md" : ""}
                    />
                    <span className="font-semibold">{t.signup}</span>
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/dashboard"
                    className={getLinkClasses("/dashboard")}
                  >
                    <LayoutDashboard
                      size={20}
                      className={isActive("/dashboard") ? "drop-shadow-md" : ""}
                    />
                    <span className="font-semibold">{t.dashboard}</span>
                  </Link>

                  {["enterpreneur", "entrepreneur"].includes(
                    String(user.role || "").toLowerCase(),
                  ) && (
                    <Link
                      to="/businesses"
                      className={getLinkClasses("/businesses")}
                    >
                      <Building2
                        size={20}
                        className={
                          isActive("/businesses") ? "drop-shadow-md" : ""
                        }
                      />
                      <span className="font-semibold">{t.myBusinesses}</span>
                    </Link>
                  )}
                </>
              )}

              {/* Public Business Details */}
              <Link
                to="/businesses/details"
                className={getLinkClasses("/businesses/details")}
              >
                <FileText
                  size={20}
                  className={
                    isActive("/businesses/details") ? "drop-shadow-md" : ""
                  }
                />
                <span className="font-semibold">{t.businessDetails}</span>
              </Link>

              {/* Dedicated Settings link */}
              <Link to="/settings" className={getLinkClasses("/settings")}>
                <Settings
                  size={20}
                  className={isActive("/settings") ? "drop-shadow-md" : ""}
                />
                <span className="font-semibold">{t.settings}</span>
              </Link>
            </nav>
          </div>

          <div className="p-6 space-y-4 relative z-10 perspective-[1000px]">
            {user && (
              <Link
                to="/profile"
                className={`group flex items-center gap-3 w-full p-3 rounded-2xl border transition-all duration-300 transform ${
                  isActive("/profile")
                    ? "bg-gradient-to-r from-blue-600/20 to-indigo-600/20 border-blue-500/40 shadow-[0_8px_20px_rgba(37,99,235,0.15)]"
                    : "bg-slate-50 dark:bg-gray-900/80 border-slate-200 dark:border-gray-800 hover:bg-slate-100 dark:hover:bg-gray-800/80 hover:border-slate-300 dark:hover:border-gray-700 hover:-translate-y-1 hover:shadow-lg"
                }`}
              >
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 overflow-hidden shadow-[0_5px_15px_rgba(37,99,235,0.25)]">
                  {user.profile_image || user.profile_pic ? (
                    <img
                      src={user.profile_image || user.profile_pic}
                      alt={getUserName()}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User size={22} className="text-white" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-slate-900 dark:text-white font-bold text-sm truncate">
                    {getUserName()}
                  </p>
                  <p className="text-slate-500 dark:text-gray-500 text-xs truncate mt-0.5">
                    {getUsername()}
                  </p>
                </div>

                <ChevronRight
                  size={18}
                  className={`flex-shrink-0 transition-all duration-300 ${
                    isActive("/profile")
                      ? "text-blue-500 dark:text-blue-400"
                      : "text-slate-400 dark:text-gray-600 group-hover:text-slate-700 dark:group-hover:text-gray-300 group-hover:translate-x-1"
                  }`}
                />
              </Link>
            )}

            {user && (
              <button
                onClick={logout}
                className="flex items-center justify-center w-full space-x-2 px-4 py-3 rounded-xl bg-red-500/10 text-red-500 hover:bg-gradient-to-r hover:from-red-500 hover:to-red-600 hover:text-white transition-all duration-300 font-bold border border-red-500/20 hover:border-transparent hover:shadow-[0_10px_20px_rgba(239,68,68,0.3)] hover:-translate-y-1 transform"
              >
                <LogOut size={20} />
                <span>{t.logout}</span>
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
