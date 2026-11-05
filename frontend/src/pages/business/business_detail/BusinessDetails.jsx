import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  MapPin,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { api } from "../../../utils/api";
import { useLanguage } from "../../../context/LanguageContext";
import BusinessImageGallery from "../BusinessImageGallery";
import BusinessDetailsModal from "./BusinessDetailsModal";

const translations = {
  english: {
    title: "Business Directory",
    subtitle:
      "Discover active businesses and connect with local entrepreneurs.",
    search: "Search",
    searchBusinesses: "Search businesses",
    searchDescription: "Use one or more filters to find businesses.",
    businessName: "Business name",
    category: "Category",
    village: "Village",
    district: "District",
    city: "City",
    state: "State",
    country: "Country",
    pincode: "Pincode",
    clear: "Clear",
    apply: "Search businesses",
    close: "Close",
    activeFilters: "active filters",
    noBusinesses: "No businesses found.",
    noBusinessesDescription: "Try changing your search filters.",
    loading: "Loading businesses...",
    failed: "Unable to load businesses.",
    retry: "Retry",
    viewDetails: "View details",
    businessDetails: "Business details",
    description: "Description",
    location: "Location",
    financial: "Financial information",
    capital: "Margin capital",
    status: "Status",
    owner: "Owner",
    contactOwner: "Owner Information & Contact",
    email: "Email",
    phone: "Phone",
    whatsapp: "WhatsApp",
    visitProfile: "Visit Profile",
    contactUnavailable: "Owner details are currently unavailable.",
    signInToContact:
      "Sign in to view owner details, visit their profile, and contact them.",
    created: "Created",
    updated: "Updated",
    businessId: "Business ID",
    notAvailable: "Not available",
    active: "Active",
    searchResults: "Search results",
    allBusinesses: "Active businesses",
    reset: "Reset",
    businessImages: "Business images",
    noImages: "No images uploaded yet.",
    imagesLoadFailed: "Unable to load business images.",
  },
  hindi: {
    title: "व्यवसाय निर्देशिका",
    subtitle: "सक्रिय व्यवसाय खोजें और स्थानीय उद्यमियों से जुड़ें।",
    search: "खोजें",
    searchBusinesses: "व्यवसाय खोजें",
    searchDescription: "व्यवसाय खोजने के लिए एक या अधिक फ़िल्टर का उपयोग करें।",
    businessName: "व्यवसाय का नाम",
    category: "श्रेणी",
    village: "गाँव",
    district: "जिला",
    city: "शहर",
    state: "राज्य",
    country: "देश",
    pincode: "पिनकोड",
    clear: "साफ़ करें",
    apply: "व्यवसाय खोजें",
    close: "बंद करें",
    activeFilters: "सक्रिय फ़िल्टर",
    noBusinesses: "कोई व्यवसाय नहीं मिला।",
    noBusinessesDescription: "अपने खोज फ़िल्टर बदलकर देखें।",
    loading: "व्यवसाय लोड हो रहे हैं...",
    failed: "व्यवसाय लोड नहीं हो सके।",
    retry: "पुनः प्रयास करें",
    viewDetails: "विवरण देखें",
    businessDetails: "व्यवसाय का विवरण",
    description: "विवरण",
    location: "स्थान",
    financial: "वित्तीय जानकारी",
    capital: "मार्जिन पूंजी",
    status: "स्थिति",
    owner: "मालिक",
    contactOwner: "मालिक की जानकारी और संपर्क",
    email: "ईमेल",
    phone: "फ़ोन",
    whatsapp: "व्हाट्सऐप",
    visitProfile: "प्रोफ़ाइल देखें",
    contactUnavailable: "मालिक की जानकारी उपलब्ध नहीं है।",
    signInToContact:
      "मालिक की जानकारी देखने, प्रोफ़ाइल देखने और संपर्क करने के लिए साइन इन करें।",
    created: "बनाया गया",
    updated: "अपडेट किया गया",
    businessId: "व्यवसाय आईडी",
    notAvailable: "उपलब्ध नहीं",
    active: "सक्रिय",
    searchResults: "खोज परिणाम",
    allBusinesses: "सक्रिय व्यवसाय",
    reset: "रीसेट",
    businessImages: "व्यवसाय की तस्वीरें",
    noImages: "अभी तक कोई तस्वीर अपलोड नहीं हुई है।",
    imagesLoadFailed: "व्यवसाय की तस्वीरें लोड नहीं हो सकीं।",
  },
  bengali: {
    title: "ব্যবসা ডিরেক্টরি",
    subtitle:
      "সক্রিয় ব্যবসা খুঁজুন এবং স্থানীয় উদ্যোক্তাদের সঙ্গে যোগাযোগ করুন।",
    search: "খুঁজুন",
    searchBusinesses: "ব্যবসা খুঁজুন",
    searchDescription: "ব্যবসা খুঁজতে এক বা একাধিক ফিল্টার ব্যবহার করুন।",
    businessName: "ব্যবসার নাম",
    category: "বিভাগ",
    village: "গ্রাম",
    district: "জেলা",
    city: "শহর",
    state: "রাজ্য",
    country: "দেশ",
    pincode: "পিনকোড",
    clear: "পরিষ্কার করুন",
    apply: "ব্যবসা খুঁজুন",
    close: "বন্ধ করুন",
    activeFilters: "সক্রিয় ফিল্টার",
    noBusinesses: "কোনও ব্যবসা পাওয়া যায়নি।",
    noBusinessesDescription: "আপনার সার্চ ফিল্টার পরিবর্তন করে দেখুন।",
    loading: "ব্যবসা লোড হচ্ছে...",
    failed: "ব্যবসা লোড করা যায়নি।",
    retry: "আবার চেষ্টা করুন",
    viewDetails: "বিস্তারিত দেখুন",
    businessDetails: "ব্যবসার বিবরণ",
    description: "বিবরণ",
    location: "অবস্থান",
    financial: "আর্থিক তথ্য",
    capital: "মার্জিন মূলধন",
    status: "স্থিতি",
    owner: "মালিক",
    contactOwner: "মালিকের তথ্য ও যোগাযোগ",
    email: "ইমেল",
    phone: "ফোন",
    whatsapp: "হোয়াটসঅ্যাপ",
    visitProfile: "প্রোফাইল দেখুন",
    contactUnavailable: "মালিকের তথ্য পাওয়া যায়নি।",
    signInToContact:
      "মালিকের বিবরণ দেখতে, প্রোফাইল দেখতে এবং যোগাযোগ করতে সাইন ইন করুন।",
    created: "তৈরি হয়েছে",
    updated: "আপডেট হয়েছে",
    businessId: "ব্যবসা আইডি",
    notAvailable: "পাওয়া যায়নি",
    active: "সক্রিয়",
    searchResults: "সার্চ ফলাফল",
    allBusinesses: "সক্রিয় ব্যবসা",
    reset: "রিসেট",
    businessImages: "ব্যবসার ছবি",
    noImages: "এখনও কোনো ছবি আপলোড হয়নি।",
    imagesLoadFailed: "ব্যবসার ছবি লোড করা যায়নি।",
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
};

const languageMap = {
  english: "en",
  en: "en",
  hindi: "hi",
  hi: "hi",
  bengali: "bn",
  bn: "bn",
};

const getLanguageKey = (language) => {
  const normalized = String(language || "english")
    .toLowerCase()
    .trim();
  if (["hindi", "hi", "hin"].includes(normalized)) return "hindi";
  if (["bengali", "bn", "bng"].includes(normalized)) return "bengali";
  return "english";
};

const getText = (value, languageCode) => {
  if (value === null || value === undefined || value === "") return "";
  if (typeof value === "string" || typeof value === "number")
    return String(value);

  if (Array.isArray(value)) {
    return value
      .map((item) => getText(item, languageCode))
      .filter(Boolean)
      .join(", ");
  }

  if (typeof value === "object") {
    const localizedValue =
      value[languageCode] ??
      value.en ??
      value.english ??
      value.hi ??
      value.hindi ??
      value.bn ??
      value.bengali;

    if (
      localizedValue !== undefined &&
      localizedValue !== null &&
      localizedValue !== ""
    ) {
      return getText(localizedValue, languageCode);
    }

    const fallback = Object.values(value).find(
      (item) =>
        item !== null &&
        item !== undefined &&
        item !== "" &&
        typeof item !== "object",
    );
    return fallback !== undefined ? String(fallback) : "";
  }
  return String(value);
};

const formatCapital = (value) => {
  if (value === null || value === undefined || value === "") return "-";
  const number = Number(value);
  if (Number.isNaN(number)) return String(value);
  return `₹${number.toLocaleString("en-IN")}`;
};

const BusinessDirectory = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();

  const languageKey = getLanguageKey(language);
  const languageCode = languageMap[languageKey] || "en";
  const t = translations[languageKey] || translations.english;

  const [businesses, setBusinesses] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [ownerContact, setOwnerContact] = useState(null);
  const [filters, setFilters] = useState(emptyFilters);
  const [appliedFilters, setAppliedFilters] = useState({});
  const [searchOpen, setSearchOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [contactLoading, setContactLoading] = useState(false);
  const [error, setError] = useState("");

  const isAuthenticated = useMemo(
    () => Boolean(localStorage.getItem("token")),
    [],
  );

  const activeFilterCount = useMemo(
    () => Object.values(appliedFilters).filter((value) => value !== "").length,
    [appliedFilters],
  );

  const visibleBusinesses = useMemo(() => {
    if (!currentUser?.user_id) return businesses;
    return businesses.filter(
      (business) => business.owner_id !== currentUser.user_id,
    );
  }, [businesses, currentUser]);

  const fetchCurrentUser = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setCurrentUser(null);
      return null;
    }

    try {
      const response = await api.get("/auth/me", {
        params: { language: languageCode },
      });
      const user = response.data;
      setCurrentUser(user);
      return user;
    } catch {
      setCurrentUser(null);
      return null;
    }
  };

  const fetchActiveBusinesses = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/businesses/public/active", {
        params: {
          language: languageCode,
          limit: 100,
          offset: 0,
        },
      });

      setBusinesses(Array.isArray(response.data) ? response.data : []);
      setAppliedFilters({});
    } catch (err) {
      console.error("Failed to load businesses:", err);
      setError(
        getText(err?.response?.data?.detail, languageCode) ||
          err?.message ||
          t.failed,
      );
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

      const response = await api.get("/businesses/search/others", {
        params: {
          language: languageCode,
          ...cleanFilters,
          status: "active",
        },
      });

      setBusinesses(Array.isArray(response.data) ? response.data : []);
      setAppliedFilters(cleanFilters);
      setSearchOpen(false);
    } catch (err) {
      console.error("Business search failed:", err);
      setError(
        getText(err?.response?.data?.detail, languageCode) ||
          err?.message ||
          t.failed,
      );
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
    setFilters({ ...emptyFilters });
    setAppliedFilters({});
    setSearchOpen(false);
    await fetchActiveBusinesses();
  };

  const handleOpenBusiness = async (business) => {
    setSelectedBusiness(business);
    setOwnerContact(null);

    if (!isAuthenticated) return;

    try {
      setContactLoading(true);
      const response = await api.get(`/businesses/${business.id}/contact`);
      setOwnerContact(response.data);
    } catch (err) {
      console.error("Failed to load owner contact:", err);
      setOwnerContact(null);
    } finally {
      setContactLoading(false);
    }
  };

  const handleCloseModal = () => {
    setSelectedBusiness(null);
    setOwnerContact(null);
  };

  const handleVisitProfile = (ownerId) => {
    if (!ownerId) return;
    handleCloseModal();
    navigate(`/profile/${ownerId}`);
  };

  useEffect(() => {
    const initialize = async () => {
      await fetchCurrentUser();
      await fetchActiveBusinesses();
    };

    initialize();
  }, [languageCode]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/40 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 px-4 py-8 text-slate-900 dark:text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1.5 text-sm text-indigo-600 dark:text-indigo-300">
              <Building2 size={16} />
              {t.allBusinesses}
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              {t.title}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400 sm:text-base">
              {t.subtitle}
            </p>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setSearchOpen((previous) => !previous)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/10 px-5 py-3 font-medium text-slate-800 dark:text-white shadow-md dark:shadow-lg backdrop-blur-xl transition hover:border-indigo-400 hover:bg-slate-50 dark:hover:bg-white/15"
            >
              <Search size={18} />
              {t.search}

              {activeFilterCount > 0 && (
                <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-xs font-semibold text-white">
                  {activeFilterCount}
                </span>
              )}

              <ChevronDown
                size={16}
                className={`transition-transform ${searchOpen ? "rotate-180" : ""}`}
              />
            </button>

            {searchOpen && (
              <div className="absolute right-0 top-14 z-40 w-[min(92vw,680px)] rounded-2xl border border-slate-200 dark:border-white/10 bg-white/95 dark:bg-slate-900/95 p-5 shadow-2xl backdrop-blur-2xl text-slate-900 dark:text-white">
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <SlidersHorizontal
                        size={18}
                        className="text-indigo-600 dark:text-indigo-400"
                      />
                      <h2 className="font-semibold text-slate-900 dark:text-white">{t.searchBusinesses}</h2>
                    </div>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                      {t.searchDescription}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSearchOpen(false)}
                    className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-800 dark:hover:text-white"
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
                    <SearchField
                      label={t.village}
                      value={filters.village}
                      onChange={(value) => handleFilterChange("village", value)}
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
                      onChange={(value) => handleFilterChange("country", value)}
                    />
                    <SearchField
                      label={t.pincode}
                      value={filters.pincode}
                      onChange={(value) => handleFilterChange("pincode", value)}
                    />
                  </div>

                  <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={handleClearSearch}
                      className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
                    >
                      {t.clear}
                    </button>

                    <button
                      type="submit"
                      disabled={searching}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Search size={17} />
                      {searching ? t.loading : t.apply}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>

        {activeFilterCount > 0 && (
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <span className="text-sm text-slate-400">{t.searchResults}:</span>
            {Object.entries(appliedFilters).map(([key, value]) => (
              <span
                key={key}
                className="rounded-full border border-indigo-400/20 bg-indigo-500/10 px-3 py-1 text-xs text-indigo-300"
              >
                {value}
              </span>
            ))}
            <button
              type="button"
              onClick={handleClearSearch}
              className="ml-1 text-xs font-medium text-slate-400 underline underline-offset-2 transition hover:text-white"
            >
              {t.reset}
            </button>
          </div>
        )}

        {error && (
          <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-red-400/20 bg-red-500/10 p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-red-300">{error}</p>
            <button
              type="button"
              onClick={() =>
                activeFilterCount > 0
                  ? searchBusinesses(filters)
                  : fetchActiveBusinesses()
              }
              className="rounded-lg border border-red-400/20 px-4 py-2 text-sm font-medium text-red-200 transition hover:bg-red-500/10"
            >
              {t.retry}
            </button>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="flex min-h-64 flex-col justify-between rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.06] p-5 shadow-md dark:shadow-xl backdrop-blur-xl animate-pulse"
              >
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="h-11 w-11 shrink-0 rounded-xl bg-slate-200 dark:bg-gray-800" />
                      <div className="space-y-2">
                        <div className="h-5 w-36 rounded-lg bg-slate-200 dark:bg-gray-800" />
                        <div className="h-4 w-24 rounded bg-slate-200 dark:bg-gray-800/60" />
                      </div>
                    </div>
                    <div className="h-6 w-16 rounded-full bg-slate-200 dark:bg-gray-800" />
                  </div>

                  <div className="mt-5 space-y-2">
                    <div className="h-3.5 w-full rounded bg-slate-200 dark:bg-gray-800/60" />
                    <div className="h-3.5 w-5/6 rounded bg-slate-200 dark:bg-gray-800/60" />
                    <div className="h-3.5 w-2/3 rounded bg-slate-200 dark:bg-gray-800/60" />
                  </div>
                </div>

                <div className="mt-5 space-y-3 border-t border-slate-100 dark:border-white/10 pt-4">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full bg-slate-200 dark:bg-gray-800" />
                    <div className="h-4 w-1/2 rounded bg-slate-200 dark:bg-gray-800/60" />
                  </div>
                  <div className="h-9 w-full rounded-xl bg-slate-200 dark:bg-gray-800/80" />
                </div>
              </div>
            ))}
          </div>
        ) : visibleBusinesses.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-16 text-center backdrop-blur-xl">
            <Building2 size={42} className="mx-auto mb-4 text-slate-500" />
            <h2 className="text-xl font-semibold">{t.noBusinesses}</h2>
            <p className="mt-2 text-sm text-slate-400">
              {t.noBusinessesDescription}
            </p>
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="mt-5 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold transition hover:bg-indigo-500"
              >
                {t.clear}
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {visibleBusinesses.map((business) => (
              <BusinessCard
                key={business.id}
                business={business}
                languageCode={languageCode}
                t={t}
                onClick={() => handleOpenBusiness(business)}
              />
            ))}
          </div>
        )}
      </div>

      {selectedBusiness && (
        <BusinessDetailsModal
          business={selectedBusiness}
          ownerContact={ownerContact}
          contactLoading={contactLoading}
          authenticated={isAuthenticated}
          languageCode={languageCode}
          t={t}
          onClose={handleCloseModal}
          onVisitProfile={handleVisitProfile}
        />
      )}
    </div>
  );
};

const SearchField = ({ label, value, onChange }) => (
  <label className="block">
    <span className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400">
      {label}
    </span>
    <input
      type="text"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={label}
      className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white outline-none transition placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:border-indigo-500 focus:bg-white dark:focus:bg-white/10"
    />
  </label>
);

const BusinessCard = ({ business, languageCode, t, onClick }) => {
  const businessName =
    getText(business.business_name, languageCode) || t.notAvailable;
  const category = getText(business.category, languageCode) || t.notAvailable;
  const description =
    getText(business.description, languageCode) || t.notAvailable;

  const locationParts = [
    getText(business.village, languageCode),
    getText(business.city, languageCode),
    getText(business.district, languageCode),
    getText(business.state, languageCode),
  ].filter(Boolean);

  return (
    <div className="group flex min-h-64 flex-col rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.06] p-5 text-left shadow-md hover:shadow-xl dark:shadow-xl backdrop-blur-xl transition duration-200 hover:-translate-y-1 hover:border-indigo-400/40 hover:bg-slate-50/80 dark:hover:bg-white/[0.09]">
      <button
        type="button"
        onClick={onClick}
        className="flex w-full flex-1 flex-col text-left"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-300">
              <Building2 size={21} />
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-lg font-semibold text-slate-900 dark:text-white">
                {businessName}
              </h2>
              <p className="mt-0.5 truncate text-sm text-indigo-600 dark:text-indigo-300 font-medium">
                {category}
              </p>
            </div>
          </div>

          <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-300">
            <CheckCircle2 size={13} />
            {t.active}
          </span>
        </div>

        <div className="mt-5 flex-1">
          <p className="line-clamp-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
            {description}
          </p>
        </div>

        <div className="mt-5 space-y-3 border-t border-slate-100 dark:border-white/10 pt-4">
          {locationParts.length > 0 && (
            <div className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
              <MapPin size={16} className="mt-0.5 shrink-0 text-slate-400 dark:text-slate-500" />
              <span className="line-clamp-2">{locationParts.join(", ")}</span>
            </div>
          )}

          {business.margin_capital !== null &&
            business.margin_capital !== undefined && (
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <CircleDollarSign
                  size={16}
                  className="shrink-0 text-slate-400 dark:text-slate-500"
                />
                <span className="font-medium text-slate-800 dark:text-slate-300">{formatCapital(business.margin_capital)}</span>
              </div>
            )}
        </div>

        <div className="mt-5 text-sm font-semibold text-indigo-600 dark:text-indigo-300 transition group-hover:text-indigo-500 dark:group-hover:text-indigo-200">
          {t.viewDetails} →
        </div>
      </button>

      <BusinessImageGallery
        businessId={business.id}
        title={t.businessImages}
        emptyLabel={t.noImages}
        errorLabel={t.imagesLoadFailed}
      />
    </div>
  );
};

export default BusinessDirectory;
