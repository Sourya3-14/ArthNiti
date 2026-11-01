import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { api } from "../utils/api";

import {
  Mail,
  Lock,
  User,
  ArrowRight,
  Loader2,
  Phone,
  MapPin,
  Building2,
  Globe2,
  Map,
  Home,
  BriefcaseBusiness,
  ChevronDown,
  CheckCircle2,
  ShieldCheck,
  Eye,
  EyeOff,
} from "lucide-react";

import { Country, State, City } from "country-state-city";

// ============================================================
// REUSABLE INPUT FIELD
// ============================================================

const InputField = ({
  name,
  label,
  placeholder,
  type = "text",
  icon: Icon,
  required = true,
  value,
  onChange,
  disabled = false,
  isPassword = false,
  showPassword = false,
  onTogglePassword,
}) => {
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div>
      <label
        htmlFor={name}
        className="block text-sm font-medium text-gray-300 mb-2"
      >
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>

      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-gray-500" />
          </div>
        )}

        <input
          id={name}
          type={inputType}
          name={name}
          required={required}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full
            ${Icon ? "pl-12" : "pl-4"}
            ${isPassword ? "pr-12" : "pr-4"}
            py-3
            bg-gray-950/70
            border
            border-gray-700
            rounded-xl
            text-white
            placeholder-gray-500
            outline-none
            transition-all
            duration-200
            hover:border-gray-600
            focus:border-blue-500
            focus:ring-2
            focus:ring-blue-500/20
            disabled:opacity-60
            disabled:cursor-not-allowed
          `}
        />

        {isPassword && (
          <button
            type="button"
            onClick={onTogglePassword}
            tabIndex={-1}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-blue-400 transition-colors focus:outline-none"
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        )}
      </div>
    </div>
  );
};

// ============================================================
// REUSABLE SELECT FIELD
// ============================================================

const SelectField = ({
  name,
  label,
  options,
  value,
  onChange,
  icon: Icon,
  required = true,
  disabled = false,
}) => {
  return (
    <div>
      <label
        htmlFor={name}
        className="block text-sm font-medium text-gray-300 mb-2"
      >
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>

      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
            <Icon className="h-5 w-5 text-gray-500" />
          </div>
        )}

        <select
          id={name}
          name={name}
          required={required}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`
            appearance-none
            w-full
            ${Icon ? "pl-12" : "pl-4"}
            pr-10
            py-3
            bg-gray-950/70
            border
            border-gray-700
            rounded-xl
            text-white
            outline-none
            transition-all
            duration-200
            hover:border-gray-600
            focus:border-blue-500
            focus:ring-2
            focus:ring-blue-500/20
            disabled:opacity-50
            disabled:cursor-not-allowed
          `}
        >
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              className="bg-gray-900 text-white"
            >
              {option.label}
            </option>
          ))}
        </select>

        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 pointer-events-none" />
      </div>
    </div>
  );
};

// ============================================================
// SECTION HEADER
// ============================================================

const SectionHeader = ({ icon: Icon, title, description }) => {
  return (
    <div className="flex items-start gap-3 mb-6">
      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
        <Icon className="w-5 h-5 text-blue-400" />
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white">{title}</h3>

        {description && (
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        )}
      </div>
    </div>
  );
};

// ============================================================
// SIGNUP
// ============================================================

const Signup = () => {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirm_password: "",
    role: "enterpreneur",

    phone_number: "",
    country_code: "+91",

    address: "",
    village: "",
    district: "",
    city: "",
    state: "",
    country: "India",
    pincode: "",

    designation: "",
    agency_type: "sca",
    agency_name: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // OTP / email verification state
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");

  const { language } = useLanguage();
  const { login } = useAuth();
  const navigate = useNavigate();

  // TRANSLATIONS
  const translations = {
    english: {
      title: "Create Account",
      subtitle: "Join us and start your journey",
      networkErr:
        "Unable to reach the backend. Start the API on port 8000 and try again.",
      signupErr: "Something went wrong during signup",
      passwordMismatch: "Passwords do not match",
      creatingBtn: "Creating Account...",
      createBtn: "Create Account",
      terms: "By creating an account, you agree to our terms and conditions.",
      haveAccount: "Already have an account? ",
      signIn: "Sign In",
      sec1Title: "Personal Information",
      sec1Desc: "Enter your basic account details",
      firstName: "First Name",
      firstPlaceholder: "Enter your first name",
      lastName: "Last Name",
      lastPlaceholder: "Enter your last name",
      email: "Email Address",
      emailPlaceholder: "you@example.com",
      password: "Password",
      passPlaceholder: "Create a strong password",
      confirmPassword: "Re-enter Password",
      confirmPassPlaceholder: "Confirm your password",
      sec2Title: "Account Type",
      sec2Desc: "Select how you will use the platform",
      roleEnt: "Entrepreneur",
      roleEntDesc: "Start and manage businesses",
      roleBuyer: "Buyer",
      roleBuyerDesc: "Explore and purchase opportunities",
      roleGov: "Government",
      roleGovDesc: "Manage government activities",
      sec3Title: "Contact Information",
      sec3Desc: "Provide a phone number where you can be reached",
      countryCode: "Country Code",
      phone: "Phone Number",
      phonePlaceholder: "Enter your phone number",
      sec4Title: "Government Information",
      sec4Desc: "Provide your official organization details",
      designation: "Designation",
      desigPlaceholder: "e.g. District Officer",
      agencyName: "Agency Name",
      agencyPlaceholder: "Enter agency / department name",
      agencyType: "Agency Type",
      sec5Title: "Location & Address",
      sec5Desc: "Tell us where you are located",
      country: "Country",
      selectCountry: "Select country",
      state: "State / Province",
      statePlace1: "Select or type state",
      statePlace2: "Enter state / province",
      district: "District",
      distPlaceholder: "Enter district",
      city: "City",
      cityPlace1: "Select or type city",
      cityPlace2: "Enter city",
      village: "Village / Locality",
      villPlaceholder: "Enter village or locality",
      pincode: "Postal / ZIP Code",
      pinPlaceholder: "Enter postal / ZIP code",
      address: "Full Address",
      addrPlaceholder: "House number, street, area, landmark...",
      sendOtpBtn: "Verify Email",
      sendingOtpBtn: "Sending...",
      otpSentMsg: "OTP sent to your email",
      otpLabel: "Enter OTP",
      otpPlaceholder: "6-digit code",
      verifyOtpBtn: "Confirm",
      verifyingOtpBtn: "Verifying...",
      emailVerifiedMsg: "Email verified",
      resendOtpBtn: "Resend OTP",
      enterEmailFirst: "Enter a valid email first",
    },
    hindi: {
      title: "खाता बनाएं",
      subtitle: "हमसे जुड़ें और अपनी यात्रा शुरू करें",
      networkErr:
        "बैकएंड तक पहुँचने में असमर्थ। पोर्ट 8000 पर API शुरू करें और पुनः प्रयास करें।",
      signupErr: "साइनअप के दौरान कुछ गलत हो गया",
      passwordMismatch: "पासवर्ड मेल नहीं खाते हैं",
      creatingBtn: "खाता बनाया जा रहा है...",
      createBtn: "खाता बनाएं",
      terms: "खाता बनाकर, आप हमारी नियमों और शर्तों से सहमत होते हैं।",
      haveAccount: "क्या आपके पास पहले से खाता है? ",
      signIn: "साइन इन करें",
      sec1Title: "व्यक्तिगत जानकारी",
      sec1Desc: "अपना मूल खाता विवरण दर्ज करें",
      firstName: "पहला नाम",
      firstPlaceholder: "अपना पहला नाम दर्ज करें",
      lastName: "अंतिम नाम",
      lastPlaceholder: "अपना अंतिम नाम दर्ज करें",
      email: "ईमेल पता",
      emailPlaceholder: "you@example.com",
      password: "पासवर्ड",
      passPlaceholder: "एक मजबूत पासवर्ड बनाएं",
      confirmPassword: "पासवर्ड पुनः दर्ज करें",
      confirmPassPlaceholder: "अपने पासवर्ड की पुष्टि करें",
      sec2Title: "खाता प्रकार",
      sec2Desc: "चुनें कि आप प्लेटफ़ॉर्म का उपयोग कैसे करेंगे",
      roleEnt: "उद्यमी",
      roleEntDesc: "व्यवसाय शुरू करें और प्रबंधित करें",
      roleBuyer: "खरीदार",
      roleBuyerDesc: "अवसर खोजें और खरीदें",
      roleGov: "सरकार",
      roleGovDesc: "सरकारी गतिविधियों का प्रबंधन करें",
      sec3Title: "संपर्क जानकारी",
      sec3Desc: "एक फ़ोन नंबर प्रदान करें जहाँ आपसे संपर्क किया जा सके",
      countryCode: "कंट्री कोड",
      phone: "फ़ोन नंबर",
      phonePlaceholder: "अपना फ़ोन नंबर दर्ज करें",
      sec4Title: "सरकारी जानकारी",
      sec4Desc: "अपने आधिकारिक संगठन का विवरण प्रदान करें",
      designation: "पदनाम",
      desigPlaceholder: "उदा. जिला अधिकारी",
      agencyName: "एजेंसी का नाम",
      agencyPlaceholder: "एजेंसी / विभाग का नाम दर्ज करें",
      agencyType: "एजेंसी का प्रकार",
      sec5Title: "स्थान और पता",
      sec5Desc: "हमें बताएं कि आप कहां स्थित हैं",
      country: "देश",
      selectCountry: "देश चुनें",
      state: "राज्य / प्रांत",
      statePlace1: "राज्य चुनें या टाइप करें",
      statePlace2: "राज्य / प्रांत दर्ज करें",
      district: "ज़िला",
      distPlaceholder: "ज़िला दर्ज करें",
      city: "शहर",
      cityPlace1: "शहर चुनें या टाइप करें",
      cityPlace2: "शहर दर्ज करें",
      village: "गांव / मोहल्ला",
      villPlaceholder: "गांव या मोहल्ला दर्ज करें",
      pincode: "पिन कोड",
      pinPlaceholder: "पिन कोड दर्ज करें",
      address: "पूरा पता",
      addrPlaceholder: "मकान नंबर, सड़क, क्षेत्र, लैंडमार्क...",
      sendOtpBtn: "ईमेल सत्यापित करें",
      sendingOtpBtn: "भेजा जा रहा है...",
      otpSentMsg: "आपके ईमेल पर OTP भेजा गया",
      otpLabel: "OTP दर्ज करें",
      otpPlaceholder: "6-अंकीय कोड",
      verifyOtpBtn: "पुष्टि करें",
      verifyingOtpBtn: "सत्यापित किया जा रहा है...",
      emailVerifiedMsg: "ईमेल सत्यापित",
      resendOtpBtn: "OTP पुनः भेजें",
      enterEmailFirst: "पहले एक सही ईमेल दर्ज करें",
    },
    bengali: {
      title: "অ্যাকাউন্ট তৈরি করুন",
      subtitle: "আমাদের সাথে যোগ দিন এবং আপনার যাত্রা শুরু করুন",
      networkErr:
        "ব্যাকএন্ডে পৌঁছাতে অক্ষম। পোর্ট 8000-এ API চালু করুন এবং আবার চেষ্টা করুন।",
      signupErr: "সাইনআপের সময় কিছু ভুল হয়েছে",
      passwordMismatch: "পাসওয়ার্ড দুটি মেলেনি",
      creatingBtn: "অ্যাকাউন্ট তৈরি করা হচ্ছে...",
      createBtn: "অ্যাকাউন্ট তৈরি করুন",
      terms: "অ্যাকাউন্ট তৈরি করে, আপনি আমাদের শর্তাবলীতে সম্মত হচ্ছেন।",
      haveAccount: "ইতোমধ্যে একটি অ্যাকাউন্ট আছে? ",
      signIn: "সাইন ইন করুন",
      sec1Title: "ব্যক্তিগত তথ্য",
      sec1Desc: "আপনার সাধারণ অ্যাকাউন্টের বিবরণ লিখুন",
      firstName: "নামের প্রথমাংশ",
      firstPlaceholder: "আপনার নামের প্রথমাংশ লিখুন",
      lastName: "নামের শেষাংশ",
      lastPlaceholder: "আপনার নামের শেষাংশ লিখুন",
      email: "ইমেল ঠিকানা",
      emailPlaceholder: "you@example.com",
      password: "পাসওয়ার্ড",
      passPlaceholder: "একটি শক্তিশালী পাসওয়ার্ড তৈরি করুন",
      confirmPassword: "পাসওয়ার্ড পুনরায় লিখুন",
      confirmPassPlaceholder: "আপনার পাসওয়ার্ড নিশ্চিত করুন",
      sec2Title: "অ্যাকাউন্টের ধরন",
      sec2Desc: "আপনি কীভাবে প্ল্যাটফর্মটি ব্যবহার করবেন তা নির্বাচন করুন",
      roleEnt: "উদ্যোক্তা",
      roleEntDesc: "ব্যবসা শুরু এবং পরিচালনা করুন",
      roleBuyer: "ক্রেতা",
      roleBuyerDesc: "সুযোগ অন্বেষণ করুন এবং কিনুন",
      roleGov: "সরকার",
      roleGovDesc: "সরকারি কার্যক্রম পরিচালনা করুন",
      sec3Title: "যোগাযোগের তথ্য",
      sec3Desc: "একটি ফোন নম্বর দিন যেখানে আপনার সাথে যোগাযোগ করা যেতে পারে",
      countryCode: "কান্ট্রি কোড",
      phone: "ফোন নম্বর",
      phonePlaceholder: "আপনার ফোন নম্বর লিখুন",
      sec4Title: "সরকারি তথ্য",
      sec4Desc: "আপনার অফিসিয়াল প্রতিষ্ঠানের বিবরণ প্রদান করুন",
      designation: "পদবী",
      desigPlaceholder: "উদাঃ জেলা কর্মকর্তা",
      agencyName: "সংস্থার নাম",
      agencyPlaceholder: "সংস্থা / বিভাগের নাম লিখুন",
      agencyType: "সংস্থার ধরন",
      sec5Title: "অবস্থান ও ঠিকানা",
      sec5Desc: "আপনি কোথায় অবস্থিত তা আমাদের জানান",
      country: "দেশ",
      selectCountry: "দেশ নির্বাচন করুন",
      state: "রাজ্য / প্রদেশ",
      statePlace1: "রাজ্য নির্বাচন করুন বা টাইপ করুন",
      statePlace2: "রাজ্য / প্রদেশ লিখুন",
      district: "জেলা",
      distPlaceholder: "জেলা লিখুন",
      city: "শহর",
      cityPlace1: "শহর নির্বাচন করুন বা টাইপ করুন",
      cityPlace2: "শহর লিখুন",
      village: "গ্রাম / এলাকা",
      villPlaceholder: "গ্রাম বা এলাকা লিখুন",
      pincode: "পিন কোড",
      pinPlaceholder: "পিন কোড লিখুন",
      address: "সম্পূর্ণ ঠিকানা",
      addrPlaceholder: "বাড়ি নম্বর, রাস্তা, এলাকা, ল্যান্ডমার্ক...",
      sendOtpBtn: "ইমেল যাচাই করুন",
      sendingOtpBtn: "পাঠানো হচ্ছে...",
      otpSentMsg: "আপনার ইমেলে OTP পাঠানো হয়েছে",
      otpLabel: "OTP লিখুন",
      otpPlaceholder: "৬-সংখ্যার কোড",
      verifyOtpBtn: "নিশ্চিত করুন",
      verifyingOtpBtn: "যাচাই করা হচ্ছে...",
      emailVerifiedMsg: "ইমেল যাচাইকৃত",
      resendOtpBtn: "OTP পুনরায় পাঠান",
      enterEmailFirst: "প্রথমে একটি সঠিক ইমেল লিখুন",
    },
  };

  const t = translations[language] || translations.english;

  const countries = useMemo(() => {
    return Country.getAllCountries();
  }, []);

  const selectedCountry = useMemo(() => {
    return countries.find((country) => country.name === formData.country);
  }, [countries, formData.country]);

  const states = useMemo(() => {
    if (!selectedCountry?.isoCode) {
      return [];
    }
    return State.getStatesOfCountry(selectedCountry.isoCode);
  }, [selectedCountry]);

  const selectedState = useMemo(() => {
    return states.find((state) => state.name === formData.state);
  }, [states, formData.state]);

  const cities = useMemo(() => {
    if (!selectedCountry?.isoCode || !selectedState?.isoCode) {
      return [];
    }
    return City.getCitiesOfState(
      selectedCountry.isoCode,
      selectedState.isoCode,
    );
  }, [selectedCountry, selectedState]);

  // ============================================================
  // CHANGE HANDLER
  // ============================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ============================================================
  // COUNTRY CHANGE
  // ============================================================

  const handleCountryChange = (e) => {
    const countryName = e.target.value;
    const country = countries.find((item) => item.name === countryName);

    setFormData((prev) => ({
      ...prev,
      country: countryName,
      state: "",
      city: "",
      country_code: country ? `+${country.phonecode}` : prev.country_code,
    }));
  };

  // ============================================================
  // STATE CHANGE
  // ============================================================

  const handleStateChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      state: e.target.value,
      city: "",
    }));
  };

  // ============================================================
  // OTP: SEND
  // ============================================================

  const handleSendOtp = async () => {
    setOtpError("");

    if (!formData.email || !formData.email.includes("@")) {
      setOtpError(t.enterEmailFirst);
      return;
    }

    setOtpLoading(true);

    try {
      await api.post("/auth/send-otp", { email: formData.email });
      setOtpSent(true);
    } catch (err) {
      setOtpError(
        err.response?.data?.detail || "Failed to send OTP. Try again.",
      );
    } finally {
      setOtpLoading(false);
    }
  };

  // ============================================================
  // OTP: VERIFY
  // ============================================================

  const handleVerifyOtp = async () => {
    setOtpError("");
    setOtpLoading(true);

    try {
      await api.post("/auth/verify-otp", {
        email: formData.email,
        otp,
      });
      setEmailVerified(true);
    } catch (err) {
      setOtpError(err.response?.data?.detail || "Invalid OTP. Try again.");
    } finally {
      setOtpLoading(false);
    }
  };

  // ============================================================
  // SUBMIT
  // ============================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!emailVerified) {
      setError("Please verify your email before creating an account.");
      return;
    }

    if (formData.password !== formData.confirm_password) {
      setError(t.passwordMismatch);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const payload = {
        ...formData,
        phone_number: `${formData.country_code}${formData.phone_number}`,
      };

      delete payload.country_code;
      delete payload.confirm_password;

      const res = await api.post(
        `/auth/signup?language=${encodeURIComponent(language)}`,
        payload,
      );

      if (res.data.access_token) {
        login(res.data.access_token, res.data.user);
        navigate("/dashboard");
      }
    } catch (err) {
      if (!err.response) {
        setError(t.networkErr);
      } else if (Array.isArray(err.response.data?.detail)) {
        setError(err.response.data.detail.map((item) => item.msg).join(", "));
      } else {
        setError(err.response.data?.detail || t.signupErr);
      }
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950 text-slate-900 dark:text-white py-10 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/20 mb-4 text-white">
            <User className="w-7 h-7 text-white" />
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
            {t.title}
          </h1>

          <p className="text-slate-600 dark:text-gray-400 mt-2">{t.subtitle}</p>
        </div>

        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/10 via-indigo-600/5 to-purple-600/10 rounded-3xl blur-xl" />

          <div className="relative bg-white dark:bg-gray-900/95 border border-slate-200 dark:border-gray-800 rounded-3xl shadow-xl dark:shadow-2xl overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600" />

            <div className="p-6 sm:p-8 lg:p-10">
              {error && (
                <div className="mb-8 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* ====================================================== */}
                {/* PERSONAL INFORMATION                                   */}
                {/* ====================================================== */}

                <section className="pb-8 border-b border-gray-800">
                  <SectionHeader
                    icon={User}
                    title={t.sec1Title}
                    description={t.sec1Desc}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <InputField
                      name="first_name"
                      label={t.firstName}
                      placeholder={t.firstPlaceholder}
                      icon={User}
                      value={formData.first_name}
                      onChange={handleChange}
                    />

                    <InputField
                      name="last_name"
                      label={t.lastName}
                      placeholder={t.lastPlaceholder}
                      icon={User}
                      value={formData.last_name}
                      onChange={handleChange}
                    />

                    <div className="md:col-span-2">
                      <InputField
                        name="email"
                        label={t.email}
                        placeholder={t.emailPlaceholder}
                        type="email"
                        icon={Mail}
                        value={formData.email}
                        onChange={handleChange}
                        disabled={emailVerified}
                      />

                      {/* EMAIL VERIFICATION BLOCK */}
                      <div className="mt-3">
                        {emailVerified ? (
                          <div className="flex items-center gap-2 text-sm text-green-400">
                            <CheckCircle2 size={16} />
                            <span>{t.emailVerifiedMsg}</span>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {!otpSent ? (
                              <button
                                type="button"
                                onClick={handleSendOtp}
                                disabled={otpLoading || !formData.email}
                                className="
                                  inline-flex items-center gap-2
                                  px-4 py-2
                                  rounded-lg
                                  border border-blue-500/30
                                  bg-blue-500/10
                                  text-blue-400
                                  text-sm font-semibold
                                  hover:bg-blue-500/20
                                  disabled:opacity-50
                                  disabled:cursor-not-allowed
                                  transition-colors
                                "
                              >
                                {otpLoading ? (
                                  <>
                                    <Loader2
                                      size={14}
                                      className="animate-spin"
                                    />
                                    {t.sendingOtpBtn}
                                  </>
                                ) : (
                                  <>
                                    <ShieldCheck size={14} />
                                    {t.sendOtpBtn}
                                  </>
                                )}
                              </button>
                            ) : (
                              <div className="flex flex-col sm:flex-row gap-3">
                                <input
                                  type="text"
                                  value={otp}
                                  onChange={(e) => setOtp(e.target.value)}
                                  placeholder={t.otpPlaceholder}
                                  maxLength={6}
                                  className="
                                    flex-1
                                    px-4 py-2.5
                                    bg-gray-950/70
                                    border border-gray-700
                                    rounded-lg
                                    text-white
                                    placeholder-gray-500
                                    outline-none
                                    focus:border-blue-500
                                    focus:ring-2
                                    focus:ring-blue-500/20
                                  "
                                />

                                <button
                                  type="button"
                                  onClick={handleVerifyOtp}
                                  disabled={otpLoading || !otp}
                                  className="
                                    inline-flex items-center justify-center gap-2
                                    px-5 py-2.5
                                    rounded-lg
                                    bg-blue-600
                                    text-white
                                    text-sm font-semibold
                                    hover:bg-blue-500
                                    disabled:opacity-50
                                    disabled:cursor-not-allowed
                                    transition-colors
                                  "
                                >
                                  {otpLoading ? (
                                    <Loader2
                                      size={14}
                                      className="animate-spin"
                                    />
                                  ) : (
                                    t.verifyOtpBtn
                                  )}
                                </button>

                                <button
                                  type="button"
                                  onClick={handleSendOtp}
                                  disabled={otpLoading}
                                  className="
                                    text-xs text-gray-500
                                    hover:text-gray-300
                                    underline
                                    disabled:opacity-50
                                    self-center
                                  "
                                >
                                  {t.resendOtpBtn}
                                </button>
                              </div>
                            )}

                            {otpSent && !otpError && (
                              <p className="text-xs text-gray-500">
                                {t.otpSentMsg}
                              </p>
                            )}

                            {otpError && (
                              <p className="text-xs text-red-400">{otpError}</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <InputField
                      name="password"
                      label={t.password}
                      placeholder={t.passPlaceholder}
                      icon={Lock}
                      value={formData.password}
                      onChange={handleChange}
                      isPassword={true}
                      showPassword={showPassword}
                      onTogglePassword={() => setShowPassword(!showPassword)}
                    />

                    <InputField
                      name="confirm_password"
                      label={t.confirmPassword}
                      placeholder={t.confirmPassPlaceholder}
                      icon={Lock}
                      value={formData.confirm_password}
                      onChange={handleChange}
                      isPassword={true}
                      showPassword={showConfirmPassword}
                      onTogglePassword={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    />
                  </div>
                </section>

                {/* ====================================================== */}
                {/* ACCOUNT TYPE                                           */}
                {/* ====================================================== */}

                <section className="py-8 border-b border-gray-800">
                  <SectionHeader
                    icon={BriefcaseBusiness}
                    title={t.sec2Title}
                    description={t.sec2Desc}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      {
                        value: "enterpreneur",
                        title: t.roleEnt,
                        description: t.roleEntDesc,
                      },
                      {
                        value: "buyer",
                        title: t.roleBuyer,
                        description: t.roleBuyerDesc,
                      },
                      // {
                      //   value: "government",
                      //   title: t.roleGov,
                      //   description: t.roleGovDesc,
                      // },
                    ].map((role) => (
                      <label
                        key={role.value}
                        className={`
                          relative
                          cursor-pointer
                          rounded-2xl
                          border
                          p-5
                          transition-all
                          duration-200
                          ${
                            formData.role === role.value
                              ? "border-blue-500 bg-blue-500/10 ring-2 ring-blue-500/20"
                              : "border-gray-700 bg-gray-950/50 hover:border-gray-600"
                          }
                        `}
                      >
                        <input
                          type="radio"
                          name="role"
                          value={role.value}
                          checked={formData.role === role.value}
                          onChange={handleChange}
                          className="sr-only"
                        />

                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-white">
                              {role.title}
                            </p>

                            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                              {role.description}
                            </p>
                          </div>

                          <div
                            className={`
                              w-5 h-5 rounded-full border flex items-center justify-center
                              ${
                                formData.role === role.value
                                  ? "border-blue-500"
                                  : "border-gray-600"
                              }
                            `}
                          >
                            {formData.role === role.value && (
                              <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                            )}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </section>

                {/* ====================================================== */}
                {/* CONTACT INFORMATION                                    */}
                {/* ====================================================== */}

                <section className="py-8 border-b border-gray-800">
                  <SectionHeader
                    icon={Phone}
                    title={t.sec3Title}
                    description={t.sec3Desc}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                    <div className="md:col-span-1">
                      <label
                        htmlFor="country_code"
                        className="block text-sm font-medium text-gray-300 mb-2"
                      >
                        {t.countryCode}
                        <span className="text-red-400 ml-1">*</span>
                      </label>

                      <div className="relative">
                        <select
                          id="country_code"
                          name="country_code"
                          value={formData.country_code}
                          onChange={handleChange}
                          className="
                            appearance-none
                            w-full
                            px-4
                            pr-9
                            py-3
                            bg-gray-950/70
                            border
                            border-gray-700
                            rounded-xl
                            text-white
                            outline-none
                            focus:border-blue-500
                            focus:ring-2
                            focus:ring-blue-500/20
                          "
                        >
                          {countries.map((country) => (
                            <option
                              key={`${country.isoCode}-${country.phonecode}`}
                              value={`+${country.phonecode}`}
                              className="bg-gray-900"
                            >
                              {country.flag} +{country.phonecode}
                            </option>
                          ))}
                        </select>

                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                      </div>
                    </div>

                    <div className="md:col-span-3">
                      <InputField
                        name="phone_number"
                        label={t.phone}
                        placeholder={t.phonePlaceholder}
                        type="tel"
                        icon={Phone}
                        value={formData.phone_number}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </section>

                {/* ====================================================== */}
                {/* GOVERNMENT INFORMATION                                 */}
                {/* ====================================================== */}

                {formData.role === "government" && (
                  <section className="py-8 border-b border-gray-800">
                    <SectionHeader
                      icon={Building2}
                      title={t.sec4Title}
                      description={t.sec4Desc}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <InputField
                        name="designation"
                        label={t.designation}
                        placeholder={t.desigPlaceholder}
                        icon={BriefcaseBusiness}
                        value={formData.designation}
                        onChange={handleChange}
                      />

                      <InputField
                        name="agency_name"
                        label={t.agencyName}
                        placeholder={t.agencyPlaceholder}
                        icon={Building2}
                        value={formData.agency_name}
                        onChange={handleChange}
                      />

                      <SelectField
                        name="agency_type"
                        label={t.agencyType}
                        value={formData.agency_type}
                        onChange={handleChange}
                        icon={Building2}
                        options={[
                          {
                            value: "sca",
                            label: "SCA",
                          },
                          {
                            value: "ca",
                            label: "CA",
                          },
                        ]}
                      />
                    </div>
                  </section>
                )}

                {/* ====================================================== */}
                {/* LOCATION                                               */}
                {/* ====================================================== */}

                <section className="py-8">
                  <SectionHeader
                    icon={MapPin}
                    title={t.sec5Title}
                    description={t.sec5Desc}
                  />

                  <div className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <SelectField
                        name="country"
                        label={t.country}
                        value={formData.country}
                        onChange={handleCountryChange}
                        icon={Globe2}
                        options={[
                          {
                            value: "",
                            label: t.selectCountry,
                          },
                          ...countries.map((country) => ({
                            value: country.name,
                            label: `${country.flag} ${country.name}`,
                          })),
                        ]}
                      />

                      <div>
                        <label
                          htmlFor="state"
                          className="block text-sm font-medium text-gray-300 mb-2"
                        >
                          {t.state}
                          <span className="text-red-400 ml-1">*</span>
                        </label>

                        <div className="relative">
                          <Map className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none z-10" />

                          <input
                            id="state"
                            name="state"
                            list="state-options"
                            required
                            value={formData.state}
                            onChange={handleStateChange}
                            placeholder={
                              states.length ? t.statePlace1 : t.statePlace2
                            }
                            className="
                              w-full
                              pl-12
                              pr-4
                              py-3
                              bg-gray-950/70
                              border
                              border-gray-700
                              rounded-xl
                              text-white
                              placeholder-gray-500
                              outline-none
                              focus:border-blue-500
                              focus:ring-2
                              focus:ring-blue-500/20
                            "
                          />

                          <datalist id="state-options">
                            {states.map((state) => (
                              <option
                                key={`${state.isoCode}-${state.name}`}
                                value={state.name}
                              />
                            ))}
                          </datalist>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <InputField
                        name="district"
                        label={t.district}
                        placeholder={t.distPlaceholder}
                        icon={MapPin}
                        value={formData.district}
                        onChange={handleChange}
                      />

                      <div>
                        <label
                          htmlFor="city"
                          className="block text-sm font-medium text-gray-300 mb-2"
                        >
                          {t.city}
                          <span className="text-red-400 ml-1">*</span>
                        </label>

                        <div className="relative">
                          <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none z-10" />

                          <input
                            id="city"
                            name="city"
                            list="city-options"
                            required
                            value={formData.city}
                            onChange={handleChange}
                            placeholder={
                              cities.length ? t.cityPlace1 : t.cityPlace2
                            }
                            className="
                              w-full
                              pl-12
                              pr-4
                              py-3
                              bg-gray-950/70
                              border
                              border-gray-700
                              rounded-xl
                              text-white
                              placeholder-gray-500
                              outline-none
                              focus:border-blue-500
                              focus:ring-2
                              focus:ring-blue-500/20
                            "
                          />

                          <datalist id="city-options">
                            {cities.map((city, index) => (
                              <option
                                key={`${city.name}-${index}`}
                                value={city.name}
                              />
                            ))}
                          </datalist>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <InputField
                        name="village"
                        label={t.village}
                        placeholder={t.villPlaceholder}
                        icon={Home}
                        value={formData.village}
                        onChange={handleChange}
                      />

                      <InputField
                        name="pincode"
                        label={t.pincode}
                        placeholder={t.pinPlaceholder}
                        type="text"
                        icon={MapPin}
                        value={formData.pincode}
                        onChange={handleChange}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="address"
                        className="block text-sm font-medium text-gray-300 mb-2"
                      >
                        {t.address}
                        <span className="text-red-400 ml-1">*</span>
                      </label>

                      <div className="relative">
                        <MapPin className="absolute left-4 top-4 w-5 h-5 text-gray-500 pointer-events-none" />

                        <textarea
                          id="address"
                          name="address"
                          required
                          rows={3}
                          value={formData.address}
                          onChange={handleChange}
                          placeholder={t.addrPlaceholder}
                          className="
                            w-full
                            pl-12
                            pr-4
                            py-3
                            bg-gray-950/70
                            border
                            border-gray-700
                            rounded-xl
                            text-white
                            placeholder-gray-500
                            outline-none
                            resize-none
                            focus:border-blue-500
                            focus:ring-2
                            focus:ring-blue-500/20
                          "
                        />
                      </div>
                    </div>
                  </div>
                </section>

                {/* ====================================================== */}
                {/* SUBMIT                                                 */}
                {/* ====================================================== */}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading || !emailVerified}
                    className="
                      w-full
                      flex
                      items-center
                      justify-center
                      gap-2
                      bg-gradient-to-r
                      from-blue-600
                      to-indigo-600
                      hover:from-blue-500
                      hover:to-indigo-500
                      disabled:opacity-50
                      disabled:cursor-not-allowed
                      text-white
                      py-3.5
                      rounded-xl
                      font-semibold
                      transition-all
                      duration-300
                      shadow-lg
                      shadow-blue-600/20
                      hover:shadow-blue-600/30
                      hover:-translate-y-0.5
                    "
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>{t.creatingBtn}</span>
                      </>
                    ) : (
                      <>
                        <span>{t.createBtn}</span>
                        <ArrowRight className="h-5 w-5" />
                      </>
                    )}
                  </button>

                  {!emailVerified && (
                    <p className="text-center text-xs text-amber-400 mt-3">
                      Verify your email to enable account creation.
                    </p>
                  )}

                  <p className="text-center text-sm text-gray-500 mt-5">
                    {t.terms}
                  </p>

                  <div className="text-center text-sm text-gray-400 mt-4">
                    {t.haveAccount}
                    <Link
                      to="/login"
                      className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
                    >
                      {t.signIn}
                    </Link>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
