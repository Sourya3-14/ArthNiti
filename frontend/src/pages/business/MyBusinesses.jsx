import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  Building2,
  ChevronDown,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";

import { api } from "../../utils/api";
import { useLanguage } from "../../context/LanguageContext";
import BusinessCard from "./BusinessCard";
import CreateBusinessModal from "./CreateBusinessModal";

const translations = {
  english: {
    title: "My Businesses",
    subtitle: "Manage your businesses and access their AI-powered insights.",
    addBusiness: "Add Business",
    loading: "Loading your businesses...",
    unableToLoad: "Unable to load businesses",
    tryAgain: "Try Again",
    noBusinesses: "No businesses yet",
    emptyDescription:
      "Create your first business to start exploring business analysis, financial insights, government schemes, and your AI business assistant.",
    createFirst: "Create Your First Business",
    openWorkspace: "Open Workspace",
    unnamedBusiness: "Unnamed Business",
    approved: "Approved",
    rejected: "Rejected",
    pending: "Pending",
    underReview: "Under Review",
    active: "Active",
    cancelled: "Cancelled",
    businessCount: "business",
    businessesCount: "businesses",
    locationUnavailable: "Location unavailable",
    errorDefault: "Unable to load your businesses. Please try again.",
    poweredBy: "AI-powered business workspace",
    manageBusiness: "Manage Business",
    markActive: "Mark Active",
    markCancelled: "Mark Cancelled",
    updatingStatus: "Updating status...",
    statusUpdated: "Business status updated successfully.",
    statusUpdateFailed: "Unable to update business status. Please try again.",
    confirmCancelled:
      "Are you sure you want to mark this business as cancelled?",
    confirmActive: "Are you sure you want to mark this business as active?",

    search: "Search",
    searchBusinesses: "Search your businesses",
    searchDescription: "Use one or more filters to find your businesses.",
    businessName: "Business name",
    category: "Category",
    village: "Village",
    district: "District",
    city: "City",
    state: "State",
    country: "Country",
    pincode: "Pincode",
    status: "Status",
    selectStatus: "Select status",
    clear: "Clear",
    apply: "Search businesses",
    close: "Close",
    activeFilters: "active filters",
    searchResults: "Search results",
    reset: "Reset",

    createBusiness: "Create Business",
    createBusinessDescription:
      "Tell us about your business and where it is located.",
    businessLocationQuestion:
      "Is your business location the same as your profile address?",
    yesUseProfile: "Yes, use my profile address",
    noDifferentLocation: "No, use a different location",
    profileLocationLoading: "Fetching your profile address...",
    profileLocationLoaded: "Profile address loaded",
    profileLocationFailed:
      "Unable to fetch your profile address. Please enter the location manually.",
    businessInformation: "Business Information",
    locationInformation: "Business Location",
    businessNamePlaceholder: "Enter your business name",
    categoryPlaceholder: "e.g. Grocery, Restaurant, Manufacturing",
    description: "Description",
    descriptionPlaceholder: "Briefly describe your business",
    marginCapital: "Capital / Investment",
    marginCapitalPlaceholder: "Enter amount",
    villagePlaceholder: "Enter village",
    districtPlaceholder: "Enter district",
    cityPlaceholder: "Enter city",
    statePlaceholder: "Enter state",
    countryPlaceholder: "Enter country",
    pincodePlaceholder: "Enter pincode",
    latitude: "Latitude",
    latitudePlaceholder: "Optional",
    longitude: "Longitude",
    longitudePlaceholder: "Optional",
    cancel: "Cancel",
    create: "Create Business",
    creating: "Creating Business...",
    requiredBusinessName: "Business name is required.",
    requiredCategory: "Business category is required.",
    createFailed: "Unable to create business. Please try again.",
    businessImages: "Business images",
    addImages: "Add images",
    noImages: "No images uploaded yet.",
    uploadingImages: "Uploading...",
    imagesLoadFailed: "Unable to load business images.",
    editBusinessDetails: "Edit Business Details",
    editBusinessDescription:
      "Update information and physical location for this business.",
    updateLocationFromProfile: "Update location from profile address?",
    customLocation: "Keep or enter custom location",
    customLocationDescription: "Edit individual location fields below",
    categoryNotEditable: "Cannot be changed",
    manualLocation: "Enter the business location manually",
    editDetails: "Edit Details",
  },

  hindi: {
    title: "मेरे व्यवसाय",
    subtitle:
      "अपने व्यवसायों को प्रबंधित करें और AI द्वारा संचालित जानकारी प्राप्त करें।",
    addBusiness: "व्यवसाय जोड़ें",
    loading: "आपके व्यवसाय लोड हो रहे हैं...",
    unableToLoad: "व्यवसाय लोड नहीं हो सके",
    tryAgain: "पुनः प्रयास करें",
    noBusinesses: "अभी कोई व्यवसाय नहीं है",
    emptyDescription:
      "अपना पहला व्यवसाय बनाएं और व्यवसाय विश्लेषण, वित्तीय जानकारी, सरकारी योजनाओं और अपने AI बिज़नेस असिस्टेंट का उपयोग शुरू करें।",
    createFirst: "अपना पहला व्यवसाय बनाएं",
    openWorkspace: "वर्कस्पेस खोलें",
    unnamedBusiness: "बिना नाम का व्यवसाय",
    approved: "स्वीकृत",
    rejected: "अस्वीकृत",
    pending: "लंबित",
    underReview: "समीक्षा में",
    active: "सक्रिय",
    cancelled: "रद्द",
    businessCount: "व्यवसाय",
    businessesCount: "व्यवसाय",
    locationUnavailable: "स्थान उपलब्ध नहीं है",
    errorDefault: "आपके व्यवसाय लोड नहीं हो सके। कृपया फिर से प्रयास करें।",
    poweredBy: "AI-संचालित बिज़नेस वर्कस्पेस",
    manageBusiness: "व्यवसाय प्रबंधित करें",
    markActive: "सक्रिय करें",
    markCancelled: "रद्द करें",
    updatingStatus: "स्थिति अपडेट हो रही है...",
    statusUpdated: "व्यवसाय की स्थिति सफलतापूर्वक अपडेट हो गई।",
    statusUpdateFailed:
      "व्यवसाय की स्थिति अपडेट नहीं हो सकी। कृपया फिर से प्रयास करें।",
    confirmCancelled: "क्या आप वाकई इस व्यवसाय को रद्द करना चाहते हैं?",
    confirmActive: "क्या आप वाकई इस व्यवसाय को सक्रिय करना चाहते हैं?",

    search: "खोजें",
    searchBusinesses: "अपने व्यवसाय खोजें",
    searchDescription:
      "अपने व्यवसाय खोजने के लिए एक या अधिक फ़िल्टर का उपयोग करें।",
    businessName: "व्यवसाय का नाम",
    category: "श्रेणी",
    village: "गाँव",
    district: "जिला",
    city: "शहर",
    state: "राज्य",
    country: "देश",
    pincode: "पिनकोड",
    status: "स्थिति",
    selectStatus: "स्थिति चुनें",
    clear: "साफ़ करें",
    apply: "व्यवसाय खोजें",
    close: "बंद करें",
    activeFilters: "सक्रिय फ़िल्टर",
    searchResults: "खोज परिणाम",
    reset: "रीसेट",

    createBusiness: "व्यवसाय बनाएं",
    createBusinessDescription:
      "अपने व्यवसाय और उसके स्थान के बारे में जानकारी दें।",
    businessLocationQuestion:
      "क्या आपके व्यवसाय का स्थान आपके प्रोफ़ाइल पते के समान है?",
    yesUseProfile: "हाँ, मेरा प्रोफ़ाइल पता उपयोग करें",
    noDifferentLocation: "नहीं, अलग स्थान उपयोग करें",
    profileLocationLoading: "आपका प्रोफ़ाइल पता प्राप्त किया जा रहा है...",
    profileLocationLoaded: "प्रोफ़ाइल पता लोड हो गया",
    profileLocationFailed:
      "प्रोफ़ाइल पता प्राप्त नहीं हो सका। कृपया स्थान मैन्युअली भरें।",
    businessInformation: "व्यवसाय की जानकारी",
    locationInformation: "व्यवसाय का स्थान",
    businessNamePlaceholder: "व्यवसाय का नाम दर्ज करें",
    categoryPlaceholder: "जैसे किराना, रेस्तरां, निर्माण",
    description: "विवरण",
    descriptionPlaceholder: "अपने व्यवसाय का संक्षिप्त विवरण दें",
    marginCapital: "पूंजी / निवेश",
    marginCapitalPlaceholder: "राशि दर्ज करें",
    villagePlaceholder: "गाँव दर्ज करें",
    districtPlaceholder: "जिला दर्ज करें",
    cityPlaceholder: "शहर दर्ज करें",
    statePlaceholder: "राज्य दर्ज करें",
    countryPlaceholder: "देश दर्ज करें",
    pincodePlaceholder: "पिनकोड दर्ज करें",
    latitude: "अक्षांश",
    latitudePlaceholder: "वैकल्पिक",
    longitude: "देशांतर",
    longitudePlaceholder: "वैकल्पिक",
    cancel: "रद्द करें",
    create: "व्यवसाय बनाएं",
    creating: "व्यवसाय बनाया जा रहा है...",
    requiredBusinessName: "व्यवसाय का नाम आवश्यक है।",
    requiredCategory: "व्यवसाय की श्रेणी आवश्यक है।",
    createFailed: "व्यवसाय बनाने में असमर्थ। कृपया फिर से प्रयास करें।",
    businessImages: "व्यवसाय की तस्वीरें",
    addImages: "तस्वीरें जोड़ें",
    noImages: "अभी तक कोई तस्वीर अपलोड नहीं हुई है।",
    uploadingImages: "अपलोड हो रहा है...",
    imagesLoadFailed: "व्यवसाय की तस्वीरें लोड नहीं हो सकीं।",
    editBusinessDetails: "व्यवसाय विवरण संपादित करें",
    editBusinessDescription: "इस व्यवसाय की जानकारी और भौतिक स्थान अपडेट करें।",
    updateLocationFromProfile: "प्रोफ़ाइल पते से स्थान अपडेट करें?",
    customLocation: "कस्टम स्थान रखें या दर्ज करें",
    customLocationDescription: "नीचे स्थान के फ़ील्ड अलग-अलग संपादित करें",
    categoryNotEditable: "बदला नहीं जा सकता",
    manualLocation: "व्यवसाय का स्थान मैन्युअली दर्ज करें",
    editDetails: "विवरण संपादित करें",
  },

  bengali: {
    title: "আমার ব্যবসা",
    subtitle:
      "আপনার ব্যবসাগুলি পরিচালনা করুন এবং AI-চালিত তথ্য ও বিশ্লেষণ পান।",
    addBusiness: "ব্যবসা যোগ করুন",
    loading: "আপনার ব্যবসাগুলি লোড হচ্ছে...",
    unableToLoad: "ব্যবসাগুলি লোড করা যায়নি",
    tryAgain: "আবার চেষ্টা করুন",
    noBusinesses: "এখনও কোনো ব্যবসা নেই",
    emptyDescription:
      "আপনার প্রথম ব্যবসা তৈরি করুন এবং ব্যবসায়িক বিশ্লেষণ, আর্থিক তথ্য, সরকারি প্রকল্প এবং AI বিজনেস অ্যাসিস্ট্যান্ট ব্যবহার শুরু করুন।",
    createFirst: "প্রথম ব্যবসা তৈরি করুন",
    openWorkspace: "ওয়ার্কস্পেস খুলুন",
    unnamedBusiness: "নামহীন ব্যবসা",
    approved: "অনুমোদিত",
    rejected: "প্রত্যাখ্যাত",
    pending: "অপেক্ষমাণ",
    underReview: "পর্যালোচনাধীন",
    active: "সক্রিয়",
    cancelled: "বাতিল",
    businessCount: "ব্যবসা",
    businessesCount: "ব্যবসা",
    locationUnavailable: "অবস্থান উপলব্ধ নয়",
    errorDefault:
      "আপনার ব্যবসাগুলি লোড করা যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।",
    poweredBy: "AI-চালিত বিজনেস ওয়ার্কস্পেস",
    manageBusiness: "ব্যবসা পরিচালনা করুন",
    markActive: "সক্রিয় করুন",
    markCancelled: "বাতিল করুন",
    updatingStatus: "স্থিতি আপডেট হচ্ছে...",
    statusUpdated: "ব্যবসার স্থিতি সফলভাবে আপডেট হয়েছে।",
    statusUpdateFailed:
      "ব্যবসার স্থিতি আপডেট করা যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।",
    confirmCancelled: "আপনি কি নিশ্চিত যে এই ব্যবসাটি বাতিল করতে চান?",
    confirmActive: "আপনি কি নিশ্চিত যে এই ব্যবসাটি সক্রিয় করতে চান?",

    search: "খুঁজুন",
    searchBusinesses: "আপনার ব্যবসা খুঁজুন",
    searchDescription: "আপনার ব্যবসা খুঁজতে এক বা একাধিক ফিল্টার ব্যবহার করুন।",
    businessName: "ব্যবসার নাম",
    category: "বিভাগ",
    village: "গ্রাম",
    district: "জেলা",
    city: "শহর",
    state: "রাজ্য",
    country: "দেশ",
    pincode: "পিনকোড",
    status: "স্থিতি",
    selectStatus: "স্থিতি নির্বাচন করুন",
    clear: "পরিষ্কার করুন",
    apply: "ব্যবসা খুঁজুন",
    close: "বন্দ করুন",
    activeFilters: "সক্রিয় ফিল্টার",
    searchResults: "সার্চ ফলাফল",
    reset: "রিসেট",

    createBusiness: "ব্যবসা তৈরি করুন",
    createBusinessDescription:
      "আপনার ব্যবসা এবং তার অবস্থান সম্পর্কে তথ্য দিন।",
    businessLocationQuestion:
      "আপনার ব্যবসার অবস্থান কি আপনার প্রোফাইলের ঠিকানার মতো?",
    yesUseProfile: "হ্যাঁ, আমার প্রোফাইলের ঠিকানা ব্যবহার করুন",
    noDifferentLocation: "না, অন্য অবস্থান ব্যবহার করুন",
    profileLocationLoading: "আপনার প্রোফাইলের ঠিকানা আনা হচ্ছে...",
    profileLocationLoaded: "প্রোফাইলের ঠিকানা লোড হয়েছে",
    profileLocationFailed:
      "প্রোফাইলের ঠিকানা আনা যায়নি। অনুগ্রহ করে অবস্থান ম্যানুয়ালি পূরণ করুন।",
    businessInformation: "ব্যবসার তথ্য",
    locationInformation: "ব্যবসার অবস্থান",
    businessNamePlaceholder: "ব্যবসার নাম লিখুন",
    categoryPlaceholder: "যেমন: মুদি দোকান, রেস্তোরাঁ, উৎপাদন",
    description: "বিবরণ",
    descriptionPlaceholder: "আপনার ব্যবসার সংক্ষিপ্ত বিবরণ দিন",
    marginCapital: "মূলধন / বিনিয়োগ",
    marginCapitalPlaceholder: "পরিমাণ লিখুন",
    villagePlaceholder: "গ্রাম লিখুন",
    districtPlaceholder: "জেলা লিখুন",
    cityPlaceholder: "শহর লিখুন",
    statePlaceholder: "রাজ্য লিখুন",
    countryPlaceholder: "দেশ লিখুন",
    pincodePlaceholder: "পিনকোড লিখুন",
    latitude: "অক্ষাংশ",
    latitudePlaceholder: "ঐচ্ছিক",
    longitude: "দ্রাঘিমাংশ",
    longitudePlaceholder: "ঐচ্ছিক",
    cancel: "বাতিল",
    create: "ব্যবসা তৈরি করুন",
    creating: "ব্যবসা তৈরি হচ্ছে...",
    requiredBusinessName: "ব্যবসার নাম আবশ্যক।",
    requiredCategory: "ব্যবসার ক্যাটাগরি আবশ্যক।",
    createFailed: "ব্যবসা তৈরি করা যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।",
    businessImages: "ব্যবসার ছবি",
    addImages: "ছবি যোগ করুন",
    noImages: "এখনও কোনো ছবি আপলোড হয়নি।",
    uploadingImages: "আপলোড হচ্ছে...",
    imagesLoadFailed: "ব্যবসার ছবি লোড করা যায়নি।",
    editBusinessDetails: "ব্যবসার বিবরণ সম্পাদনা করুন",
    editBusinessDescription: "এই ব্যবসার তথ্য ও অবস্থান আপডেট করুন।",
    updateLocationFromProfile: "প্রোফাইলের ঠিকানা থেকে অবস্থান আপডেট করবেন?",
    customLocation: "নিজস্ব অবস্থান রাখুন বা লিখুন",
    customLocationDescription:
      "নিচে অবস্থানের ফিল্ডগুলি আলাদাভাবে সম্পাদনা করুন",
    categoryNotEditable: "পরিবর্তন করা যাবে না",
    manualLocation: "ব্যবসার অবস্থান ম্যানুয়ালি লিখুন",
    editDetails: "বিবরণ সম্পাদনা করুন",
  },
};

const emptyFilters = {
  business_name: "",
  category: "",
  village: "",
  district: "",
  city: "",
  state: "",
  country: "",
  pincode: "",
  status: "",
};

const languageMap = {
  english: "en",
  en: "en",
  eng: "en",
  hindi: "hi",
  hi: "hi",
  hin: "hi",
  bengali: "bn",
  bn: "bn",
  bng: "bn",
};

const getLanguageCode = (language) => {
  const normalized = String(language || "english")
    .toLowerCase()
    .trim();

  return languageMap[normalized] || "en";
};

const MyBusinesses = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();

  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filters, setFilters] = useState(emptyFilters);
  const [appliedFilters, setAppliedFilters] = useState({});
  const [searchOpen, setSearchOpen] = useState(false);

  const t = translations[language] || translations.english;
  const languageCode = getLanguageCode(language);

  const activeFilterCount = Object.values(appliedFilters).filter(
    (value) => String(value || "").trim() !== "",
  ).length;

  const fetchBusinesses = async () => {
    try {
      setLoading(true);
      setError("");

      const idsResponse = await api.get("/businesses/my");
      const businessIds = idsResponse.data || [];

      if (businessIds.length === 0) {
        setBusinesses([]);
        setAppliedFilters({});
        return;
      }

      const businessResponses = await Promise.all(
        businessIds.map((businessId) =>
          api.get(`/businesses/${businessId}`, {
            params: {
              language: language || "english",
            },
          }),
        ),
      );

      setBusinesses(businessResponses.map((response) => response.data));
      setAppliedFilters({});
    } catch (err) {
      console.error("Failed to fetch businesses:", err);
      setError(err.response?.data?.detail || t.errorDefault);
    } finally {
      setLoading(false);
    }
  };

  const searchBusinesses = async (searchValues) => {
    const cleanFilters = Object.fromEntries(
      Object.entries(searchValues).filter(
        ([, value]) => String(value || "").trim() !== "",
      ),
    );

    try {
      setSearching(true);
      setError("");

      const response = await api.get("/businesses/search", {
        params: {
          language: languageCode,
          ...cleanFilters,
        },
      });

      setBusinesses(Array.isArray(response.data) ? response.data : []);
      setAppliedFilters(cleanFilters);
      setSearchOpen(false);
    } catch (err) {
      console.error("Business search failed:", err);
      setError(err.response?.data?.detail || t.errorDefault);
    } finally {
      setSearching(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleSearchSubmit = async (event) => {
    event.preventDefault();
    await searchBusinesses(filters);
  };

  const handleClearSearch = async () => {
    setFilters(emptyFilters);
    setAppliedFilters({});
    setSearchOpen(false);
    await fetchBusinesses();
  };

  useEffect(() => {
    fetchBusinesses();
  }, [language]);

  const handleOpenBusiness = (businessId) => {
    navigate(`/businesses/${businessId}`);
  };

  const handleUpdateBusinessStatus = async (businessId, status) => {
    try {
      const backendState = status === "cancelled" ? "closed" : status;

      const response = await api.patch(
        `/businesses/${businessId}/status`,
        null,
        {
          params: {
            state: backendState,
            language: language || "english",
          },
        },
      );

      const updatedBusiness = response.data;

      if (updatedBusiness) {
        setBusinesses((previous) =>
          previous.map((business) =>
            business.id === businessId ? updatedBusiness : business,
          ),
        );
      } else {
        await fetchBusinesses();
      }

      return true;
    } catch (err) {
      console.error("Failed to update business status:", err);
      throw err;
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 dark:bg-gray-950 text-slate-900 dark:text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl" />
        <div className="absolute -left-40 top-1/3 h-96 w-96 rounded-full bg-indigo-600/10 blur-3xl" />
        <div className="absolute -bottom-40 right-1/3 h-96 w-96 rounded-full bg-purple-600/5 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400">
              <Sparkles size={16} />
              <span>{t.poweredBy}</span>
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              {t.title}
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-gray-400 sm:text-base">
              {t.subtitle}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative">
              <button
                type="button"
                onClick={() => setSearchOpen((previous) => !previous)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-medium text-white shadow-lg backdrop-blur-xl transition hover:border-blue-400/40 hover:bg-white/15 sm:w-auto"
              >
                <Search size={18} />
                {t.search}

                {activeFilterCount > 0 && (
                  <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs font-semibold">
                    {activeFilterCount}
                  </span>
                )}

                <ChevronDown
                  size={16}
                  className={`transition-transform ${
                    searchOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {searchOpen && (
                <div className="absolute right-0 top-14 z-40 w-[min(92vw,680px)] rounded-2xl border border-slate-200 dark:border-white/10 bg-white/95 dark:bg-gray-900/95 p-5 shadow-2xl backdrop-blur-2xl">
                  <div className="mb-5 flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <SlidersHorizontal
                          size={18}
                          className="text-blue-600 dark:text-blue-400"
                        />
                        <h2 className="font-semibold text-slate-900 dark:text-white">
                          {t.searchBusinesses}
                        </h2>
                      </div>

                      <p className="mt-1 text-sm text-slate-600 dark:text-gray-400">
                        {t.searchDescription}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSearchOpen(false)}
                      className="rounded-lg p-2 text-slate-400 dark:text-gray-400 transition hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white"
                      aria-label={t.close}
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <form onSubmit={handleSearchSubmit}>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <SearchField
                        label={t.businessName}
                        value={filters.name}
                        onChange={(value) =>
                          handleFilterChange("name", value)
                        }
                      />

                      <SearchField
                        label={t.category}
                        value={filters.category}
                        onChange={(value) =>
                          handleFilterChange("category", value)
                        }
                      />

                      <SearchSelect
                        label={t.status}
                        value={filters.status}
                        onChange={(value) =>
                          handleFilterChange("status", value)
                        }
                        placeholder={t.selectStatus}
                        options={[
                          {
                            value: "pending",
                            label: t.pending,
                          },
                          {
                            value: "active",
                            label: t.active,
                          },
                          {
                            value: "closed",
                            label: t.cancelled,
                          },
                        ]}
                      />

                      <SearchField
                        label={t.village}
                        value={filters.village}
                        onChange={(value) =>
                          handleFilterChange("village", value)
                        }
                      />

                      <SearchField
                        label={t.district}
                        value={filters.district}
                        onChange={(value) =>
                          handleFilterChange("district", value)
                        }
                      />

                      <SearchField
                        label={t.city}
                        value={filters.city}
                        onChange={(value) => handleFilterChange("city", value)}
                      />

                      <SearchField
                        label={t.state}
                        value={filters.state}
                        onChange={(value) => handleFilterChange("state", value)}
                      />

                      <SearchField
                        label={t.country}
                        value={filters.country}
                        onChange={(value) =>
                          handleFilterChange("country", value)
                        }
                      />

                      <SearchField
                        label={t.pincode}
                        value={filters.pincode}
                        onChange={(value) =>
                          handleFilterChange("pincode", value)
                        }
                      />
                    </div>

                    <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                      <button
                        type="button"
                        onClick={handleClearSearch}
                        className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-gray-300 transition hover:bg-white/10 hover:text-white"
                      >
                        {t.clear}
                      </button>

                      <button
                        type="submit"
                        disabled={searching}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {searching ? (
                          <Loader2 size={17} className="animate-spin" />
                        ) : (
                          <Search size={17} />
                        )}
                        {searching ? t.loading : t.apply}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="group inline-flex items-center justify-center gap-2 rounded-xl border border-blue-400/20 bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-[0_10px_30px_rgba(37,99,235,0.25)] transition-all duration-300 hover:-translate-y-1 hover:from-blue-500 hover:to-indigo-500 hover:shadow-[0_15px_35px_rgba(37,99,235,0.35)]"
            >
              <Plus
                size={18}
                className="transition-transform duration-300 group-hover:rotate-90"
              />
              {t.addBusiness}
            </button>
          </div>
        </div>

        {activeFilterCount > 0 && (
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-400">{t.searchResults}:</span>

            {Object.entries(appliedFilters).map(([key, value]) => (
              <span
                key={key}
                className="rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1 text-xs text-blue-300"
              >
                {key === "status"
                  ? value === "active"
                    ? t.active
                    : value === "closed"
                      ? t.cancelled
                      : value === "pending"
                        ? t.pending
                        : value
                  : value}
              </span>
            ))}

            <button
              type="button"
              onClick={handleClearSearch}
              className="ml-1 text-xs font-medium text-gray-400 underline underline-offset-2 transition hover:text-white"
            >
              {t.reset}
            </button>
          </div>
        )}

        {loading && (
          <div className="flex min-h-[420px] items-center justify-center rounded-3xl border border-slate-200 dark:border-gray-800 bg-white/60 dark:bg-gray-900/50 backdrop-blur-xl shadow-sm">
            <div className="flex flex-col items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-50 dark:bg-blue-500/10">
                <Loader2 size={30} className="animate-spin text-blue-600 dark:text-blue-400" />
              </div>

              <p className="text-sm font-medium text-slate-600 dark:text-gray-400">{t.loading}</p>
            </div>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-3xl border border-red-500/20 bg-red-500/5 p-8 backdrop-blur-xl">
            <div className="flex flex-col items-start gap-5 sm:flex-row">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-500/10">
                <AlertCircle size={24} className="text-red-500 dark:text-red-400" />
              </div>

              <div className="flex-1">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {t.unableToLoad}
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-gray-400">{error}</p>

                <button
                  type="button"
                  onClick={() =>
                    activeFilterCount > 0
                      ? searchBusinesses(filters)
                      : fetchBusinesses()
                  }
                  className="mt-5 inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800/80 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-white transition hover:bg-slate-100 dark:hover:bg-gray-700 shadow-sm"
                >
                  <RefreshCw size={16} />
                  {t.tryAgain}
                </button>
              </div>
            </div>
          </div>
        )}

        {!loading && !error && businesses.length === 0 && (
          <div className="relative flex min-h-[460px] items-center justify-center overflow-hidden rounded-3xl border border-slate-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/50 p-8 shadow-sm dark:shadow-none backdrop-blur-xl">
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/10 blur-3xl" />

            <div className="relative z-10 max-w-lg text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 shadow-[0_10px_40px_rgba(37,99,235,0.1)]">
                <Building2 size={34} className="text-blue-600 dark:text-blue-400" />
              </div>

              <h2 className="mt-6 text-2xl font-bold text-slate-900 dark:text-white">
                {t.noBusinesses}
              </h2>

              <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-gray-400">
                {activeFilterCount > 0
                  ? t.searchDescription
                  : t.emptyDescription}
              </p>

              {activeFilterCount > 0 ? (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="mt-7 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-bold !text-white shadow-[0_10px_25px_rgba(37,99,235,0.25)] transition-all duration-300 hover:-translate-y-1 hover:from-blue-500 hover:to-indigo-500"
                >
                  {t.reset}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowCreateModal(true)}
                  className="mt-7 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-bold !text-white shadow-[0_10px_25px_rgba(37,99,235,0.25)] transition-all duration-300 hover:-translate-y-1 hover:from-blue-500 hover:to-indigo-500"
                >
                  <Plus size={18} />
                  {t.createFirst}
                </button>
              )}
            </div>
          </div>
        )}

        {!loading && !error && businesses.length > 0 && (
          <>
            <div className="mb-5 flex items-center gap-2 text-sm text-gray-500">
              <Building2 size={16} />

              <span>
                {businesses.length}{" "}
                {businesses.length === 1 ? t.businessCount : t.businessesCount}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {businesses.map((business) => (
                <BusinessCard
                  key={business.id}
                  business={business}
                  t={t}
                  onOpen={handleOpenBusiness}
                  onUpdateStatus={handleUpdateBusinessStatus}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <CreateBusinessModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={fetchBusinesses}
        language={language}
        t={t}
      />
    </div>
  );
};

const SearchField = ({ label, value, onChange }) => {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-gray-400">
        {label}
      </span>

      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={label}
        className="w-full rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white outline-none transition placeholder:text-slate-400 dark:placeholder:text-gray-600 focus:border-blue-500 dark:focus:border-blue-400/50 focus:bg-white dark:focus:bg-white/10"
      />
    </label>
  );
};

const SearchSelect = ({ label, value, onChange, placeholder, options }) => {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-gray-400">
        {label}
      </span>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-gray-900 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white outline-none transition focus:border-blue-500 dark:focus:border-blue-400/50"
      >
        <option value="" className="bg-white dark:bg-gray-900 text-slate-900 dark:text-white">
          {placeholder}
        </option>

        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            className="bg-white dark:bg-gray-900 text-slate-900 dark:text-white"
          >
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
};

export default MyBusinesses;
