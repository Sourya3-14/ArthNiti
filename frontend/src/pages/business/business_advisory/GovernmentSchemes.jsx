import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  Landmark,
  Loader2,
  RefreshCw,
  Search,
  Sparkles,
  UserRound,
} from "lucide-react";

import { api, aiApi } from "../../../utils/api";
import { useLanguage } from "../../../context/LanguageContext";
import BusinessScopeBadge from "./components/BusinessScopeBadge";

const normalizeLanguage = (value) => {
  const normalized = String(value || "").toLowerCase();

  if (normalized === "hi" || normalized === "hindi") return "hindi";
  if (normalized === "bn" || normalized === "bengali") return "bengali";

  return "english";
};

const getApiLanguage = (value) => {
  const normalized = normalizeLanguage(value);

  if (normalized === "hindi") return "hi";
  if (normalized === "bengali") return "bn";

  return "en";
};

const translations = {
  english: {
    back: "Back to Workspace",
    aiRecommendations: "AI Recommendations",
    title: "Government Schemes",
    subtitle:
      "Find government schemes that may match your business and eligibility.",
    eligibilityTitle: "Eligibility Information",
    eligibilitySubtitle:
      "Provide your details to improve scheme matching. Business information is automatically taken from your business profile.",
    required: "Required",
    recommended: "Recommended",
    optional: "Optional",
    generate: "Find Matching Schemes",
    regenerate: "Regenerate Recommendations",
    generating: "Finding Schemes...",
    loading: "Loading government schemes...",
    age: "Age",
    gender: "Gender",
    ownershipType: "Ownership Type",
    socialCategory: "Social Category",
    annualIncome: "Annual Income",
    annualTurnover: "Annual Turnover",
    investmentAmount: "Investment Amount",
    businessRegistration: "Business Registered",
    farmerStatus: "Farmer Status",
    landOwnership: "Land Ownership",
    select: "Select",
    male: "Male",
    female: "Female",
    other: "Other",
    individual: "Individual",
    partnership: "Partnership",
    proprietorship: "Proprietorship",
    company: "Company",
    cooperative: "Cooperative",
    otherOwnership: "Other",
    general: "General",
    sc: "SC",
    st: "ST",
    obc: "OBC",
    minority: "Minority",
    yes: "Yes",
    no: "No",
    schemesFound: "Recommended Schemes",
    schemesDescription:
      "Schemes are ranked using your eligibility information and the business analysis.",
    noSchemes: "No matching schemes were found.",
    noSchemesDescription:
      "Try providing more eligibility information and generate recommendations again.",
    viewScheme: "View Scheme",
    myScheme: "Search on MyScheme",
    match: "Match",
    benefits: "Benefits",
    description: "Description",
    eligibility: "Eligibility Criteria",
    schemeId: "Scheme ID",
    fallbackNotice:
      "The direct scheme page was not available. You will be redirected to MyScheme.",
    generated: "Recommendations generated",
    cached: "Saved recommendations",
    errorTitle: "Unable to load recommendations",
    completeFirst:
      "Please complete your Business Analysis before generating government scheme recommendations.",
    businessAnalysis: "Complete Business Analysis",
    backToEligibility: "Back to Eligibility",
    informationNote:
      "All eligibility fields are optional in the backend. Providing more information generally improves recommendation quality.",
  },
  hindi: {
    back: "वर्कस्पेस पर वापस जाएं",
    aiRecommendations: "AI सिफारिशें",
    title: "सरकारी योजनाएं",
    subtitle: "अपने व्यवसाय और पात्रता के अनुसार सरकारी योजनाएं खोजें।",
    eligibilityTitle: "पात्रता जानकारी",
    eligibilitySubtitle:
      "बेहतर योजना मिलान के लिए अपनी जानकारी दें। व्यवसाय की जानकारी आपके बिज़नेस प्रोफाइल से ली जाएगी।",
    required: "आवश्यक",
    recommended: "अनुशंसित",
    optional: "वैकल्पिक",
    generate: "मिलती-जुलती योजनाएं खोजें",
    regenerate: "सिफारिशें दोबारा बनाएं",
    generating: "योजनाएं खोजी जा रही हैं...",
    loading: "सरकारी योजनाएं लोड हो रही हैं...",
    age: "आयु",
    gender: "लिंग",
    ownershipType: "स्वामित्व प्रकार",
    socialCategory: "सामाजिक श्रेणी",
    annualIncome: "वार्षिक आय",
    annualTurnover: "वार्षिक टर्नओवर",
    investmentAmount: "निवेश राशि",
    businessRegistration: "व्यवसाय पंजीकृत है",
    farmerStatus: "किसान स्थिति",
    landOwnership: "भूमि स्वामित्व",
    select: "चुनें",
    male: "पुरुष",
    female: "महिला",
    other: "अन्य",
    individual: "व्यक्तिगत",
    partnership: "साझेदारी",
    proprietorship: "एकल स्वामित्व",
    company: "कंपनी",
    cooperative: "सहकारी",
    otherOwnership: "अन्य",
    general: "सामान्य",
    sc: "SC",
    st: "ST",
    obc: "OBC",
    minority: "अल्पसंख्यक",
    yes: "हां",
    no: "नहीं",
    schemesFound: "अनुशंसित योजनाएं",
    schemesDescription:
      "योजनाओं को आपकी पात्रता और व्यवसाय विश्लेषण के आधार पर रैंक किया गया है।",
    noSchemes: "कोई मिलती-जुलती योजना नहीं मिली।",
    noSchemesDescription: "अधिक पात्रता जानकारी दें और दोबारा सिफारिशें बनाएं।",
    viewScheme: "योजना देखें",
    myScheme: "MyScheme पर खोजें",
    match: "मिलान",
    benefits: "लाभ",
    description: "विवरण",
    eligibility: "पात्रता मानदंड",
    schemeId: "योजना ID",
    fallbackNotice:
      "योजना का सीधा पेज उपलब्ध नहीं था। आपको MyScheme पर भेजा जाएगा।",
    generated: "सिफारिशें तैयार की गईं",
    cached: "सहेजी गई सिफारिशें",
    errorTitle: "सिफारिशें लोड नहीं हो सकीं",
    completeFirst:
      "सरकारी योजना सिफारिशें बनाने से पहले Business Analysis पूरा करें।",
    businessAnalysis: "Business Analysis पूरा करें",
    backToEligibility: "पात्रता पर वापस जाएं",
    informationNote:
      "Backend में सभी पात्रता फ़ील्ड वैकल्पिक हैं। अधिक जानकारी देने से सिफारिशें बेहतर हो सकती हैं।",
  },
  bengali: {
    back: "ওয়ার্কস্পেসে ফিরে যান",
    aiRecommendations: "AI সুপারিশ",
    title: "সরকারি প্রকল্প",
    subtitle: "আপনার ব্যবসা ও যোগ্যতার সঙ্গে মিল থাকা সরকারি প্রকল্প খুঁজুন।",
    eligibilityTitle: "যোগ্যতার তথ্য",
    eligibilitySubtitle:
      "ভালো প্রকল্প ম্যাচিংয়ের জন্য আপনার তথ্য দিন। ব্যবসার তথ্য আপনার Business Profile থেকে নেওয়া হবে।",
    required: "আবশ্যিক",
    recommended: "প্রস্তাবিত",
    optional: "ঐচ্ছিক",
    generate: "মিল থাকা প্রকল্প খুঁজুন",
    regenerate: "সুপারিশ পুনরায় তৈরি করুন",
    generating: "প্রকল্প খোঁজা হচ্ছে...",
    loading: "সরকারি প্রকল্প লোড হচ্ছে...",
    age: "বয়স",
    gender: "লিঙ্গ",
    ownershipType: "মালিকানার ধরন",
    socialCategory: "সামাজিক শ্রেণি",
    annualIncome: "বার্ষিক আয়",
    annualTurnover: "বার্ষিক টার্নওভার",
    investmentAmount: "বিনিয়োগের পরিমাণ",
    businessRegistration: "ব্যবসা নিবন্ধিত",
    farmerStatus: "কৃষক অবস্থা",
    landOwnership: "জমির মালিকানা",
    select: "নির্বাচন করুন",
    male: "পুরুষ",
    female: "মহিলা",
    other: "অন্যান্য",
    individual: "ব্যক্তিগত",
    partnership: "অংশীদারিত্ব",
    proprietorship: "একক মালিকানা",
    company: "কোম্পানি",
    cooperative: "সমবায়",
    otherOwnership: "অন্যান্য",
    general: "সাধারণ",
    sc: "SC",
    st: "ST",
    obc: "OBC",
    minority: "সংখ্যালঘু",
    yes: "হ্যাঁ",
    no: "না",
    schemesFound: "প্রস্তাবিত প্রকল্প",
    schemesDescription:
      "আপনার যোগ্যতা ও ব্যবসা বিশ্লেষণের ভিত্তিতে প্রকল্পগুলো সাজানো হয়েছে।",
    noSchemes: "কোনও মিল থাকা প্রকল্প পাওয়া যায়নি।",
    noSchemesDescription: "আরও যোগ্যতার তথ্য দিয়ে আবার সুপারিশ তৈরি করুন।",
    viewScheme: "প্রকল্প দেখুন",
    myScheme: "MyScheme-এ খুঁজুন",
    match: "মিল",
    benefits: "সুবিধা",
    description: "বিবরণ",
    eligibility: "যোগ্যতার মানদণ্ড",
    schemeId: "প্রকল্প ID",
    fallbackNotice:
      "প্রকল্পের সরাসরি পেজ পাওয়া যায়নি। আপনাকে MyScheme-এ পাঠানো হবে।",
    generated: "সুপারিশ তৈরি হয়েছে",
    cached: "সংরক্ষিত সুপারিশ",
    errorTitle: "সুপারিশ লোড করা যায়নি",
    completeFirst:
      "সরকারি প্রকল্পের সুপারিশ তৈরি করার আগে Business Analysis সম্পূর্ণ করুন।",
    businessAnalysis: "Business Analysis সম্পূর্ণ করুন",
    backToEligibility: "যোগ্যতায় ফিরে যান",
    informationNote:
      "Backend-এ সমস্ত যোগ্যতার ফিল্ড ঐচ্ছিক। বেশি তথ্য দিলে সাধারণত আরও ভালো সুপারিশ পাওয়া যায়।",
  },
};

const initialForm = {
  ownership_type: "",
  gender: "",
  age: "",
  social_category: "",
  annual_income: "",
  annual_turnover: "",
  investment_amount: "",
  business_registration: "",
  farmer_status: "",
  land_ownership: "",
};

// Formatter to split running paragraphs into structured bullet points, badges, and headers
const renderFormattedContent = (
  content,
  defaultTextColor = "text-gray-400",
) => {
  if (!content) return <span className="text-gray-600">—</span>;

  let cleaned = String(content)
    .replace(/\t/g, " ")
    .replace(/\r\n/g, "\n")
    .replace(/\uFEFF/g, "")
    .trim();

  // Break lines before numbered lists (e.g. 1. or 1)) or Notes
  cleaned = cleaned.replace(/([.?!])\s+(\d+[\.\)]\s+)/g, "$1\n$2");
  cleaned = cleaned.replace(/([.?!])\s+(Note\s*\d*:)/gi, "$1\n$2");

  const lines = cleaned
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  return (
    <div className="space-y-2">
      {lines.map((line, idx) => {
        // Match numbered points: "1.", "1)", "10+1" handled carefully
        const numberedMatch = line.match(/^(\d+[\.\)])\s*(.+)$/);
        // Match Note prefixes: "Note 1:", "Note:"
        const noteMatch = line.match(/^(Note(?:\s*\d*)?:?)\s*(.+)$/i);
        // Match bullet markers: "*", "-", "•"
        const bulletMatch = line.match(/^[\*\-•]\s*(.+)$/);
        // Match ALL CAPS headings (e.g., CAPITAL SUBSIDY STRUCTURE)
        const isHeader =
          line.length < 55 &&
          /^[A-Z0-9\s/&()-]+$/.test(line) &&
          !line.includes("₹") &&
          line.split(" ").length <= 7;

        if (isHeader) {
          return (
            <div
              key={idx}
              className="mt-3 pt-1 text-xs font-bold uppercase tracking-wider text-blue-400"
            >
              {line}
            </div>
          );
        }

        if (numberedMatch) {
          return (
            <div key={idx} className="flex items-start gap-2.5">
              <span className="shrink-0 rounded bg-gray-800 px-1.5 py-0.5 text-xs font-mono font-medium text-gray-300">
                {numberedMatch[1]}
              </span>
              <span
                className={`text-xs leading-5 sm:text-sm ${defaultTextColor}`}
              >
                {numberedMatch[2]}
              </span>
            </div>
          );
        }

        if (noteMatch) {
          return (
            <div
              key={idx}
              className="my-1 rounded-lg border border-amber-500/20 bg-amber-500/5 px-2.5 py-1.5 text-xs text-amber-300/90 leading-relaxed"
            >
              <span className="font-semibold text-amber-400">
                {noteMatch[1]}{" "}
              </span>
              {noteMatch[2]}
            </div>
          );
        }

        if (bulletMatch) {
          return (
            <div key={idx} className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400/80" />
              <span
                className={`text-xs leading-5 sm:text-sm ${defaultTextColor}`}
              >
                {bulletMatch[1]}
              </span>
            </div>
          );
        }

        return (
          <p
            key={idx}
            className={`text-xs leading-relaxed sm:text-sm ${defaultTextColor}`}
          >
            {line}
          </p>
        );
      })}
    </div>
  );
};

const GovernmentSchemes = () => {
  const { businessId } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();

  const currentLanguage = normalizeLanguage(language);
  const languageCode = getApiLanguage(language);
  const t = translations[currentLanguage];

  const [form, setForm] = useState(initialForm);
  const [schemes, setSchemes] = useState([]);
  const [urls, setUrls] = useState({});
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [hasRecommendations, setHasRecommendations] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const updateField = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const buildPayload = () => {
    const payload = {};

    if (form.ownership_type) payload.ownership_type = form.ownership_type;
    if (form.gender) payload.gender = form.gender;
    if (form.age !== "") payload.age = Number(form.age);
    if (form.social_category) payload.social_category = form.social_category;
    if (form.annual_income !== "")
      payload.annual_income = Number(form.annual_income);
    if (form.annual_turnover !== "")
      payload.annual_turnover = Number(form.annual_turnover);
    if (form.investment_amount !== "")
      payload.investment_amount = Number(form.investment_amount);

    if (form.business_registration !== "") {
      payload.business_registration = form.business_registration === "true";
    }

    if (form.farmer_status !== "") {
      payload.farmer_status = form.farmer_status === "true";
    }

    if (form.land_ownership !== "") {
      payload.land_ownership = form.land_ownership === "true";
    }

    return payload;
  };

  const loadSchemeUrls = async (schemeList) => {
    const entries = await Promise.all(
      schemeList.map(async (scheme) => {
        try {
          const response = await api.get(`/schemes/${scheme.scheme_id}/url`);
          return [scheme.scheme_id, response?.data || response];
        } catch {
          return [
            scheme.scheme_id,
            {
              scheme_id: scheme.scheme_id,
              url: null,
              is_fallback: true,
            },
          ];
        }
      }),
    );

    setUrls(Object.fromEntries(entries));
  };

  const applySchemeResponse = async (data) => {
    const recommendedSchemes =
      data?.recommended_schemes ||
      data?.translated_schemes ||
      data?.original_english_schemes ||
      [];

    setSchemes(recommendedSchemes);
    setHasRecommendations(true);
    setShowForm(false);

    if (recommendedSchemes.length > 0) {
      await loadSchemeUrls(recommendedSchemes);
    } else {
      setUrls({});
    }
  };

  const loadExistingRecommendations = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await aiApi.get(
        `api/v1/businesses/${businessId}/government-schemes?language=${languageCode}`,
      );

      await applySchemeResponse(response?.data || response);
    } catch (requestError) {
      if (requestError?.response?.status === 404) {
        setHasRecommendations(false);
        setShowForm(true);
      } else {
        setError(
          requestError?.response?.data?.detail ||
          requestError?.message ||
          t.errorTitle,
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!businessId) return;

    loadExistingRecommendations();
  }, [businessId, languageCode]);

  const handleGenerate = async (force = false) => {
    try {
      setGenerating(true);
      setError("");

      const payload = buildPayload();

      const response = await aiApi.post(
        `api/v1/government-schemes/${businessId}?language=${languageCode}&force=${force}&limit=10`,
        payload,
      );

      await applySchemeResponse(response?.data || response);
    } catch (requestError) {
      const detail = requestError?.response?.data?.detail;

      if (
        requestError?.response?.status === 404 &&
        String(detail || "")
          .toLowerCase()
          .includes("business analysis")
      ) {
        setError(t.completeFirst);
      } else {
        setError(detail || requestError?.message || t.errorTitle);
      }
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await handleGenerate(hasRecommendations);
  };

  const openScheme = (scheme) => {
    const schemeUrl = urls[scheme.scheme_id];

    if (schemeUrl?.url && !schemeUrl.is_fallback) {
      window.open(schemeUrl.url, "_blank", "noopener,noreferrer");
      return;
    }

    window.open(
      `https://www.myscheme.gov.in/search?keyword=${encodeURIComponent(
        scheme.name || "",
      )}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  const inputClass =
    "mt-2 w-full rounded-xl border border-slate-300 dark:border-gray-800 bg-white dark:bg-gray-950 px-4 py-3 text-sm text-slate-900 dark:text-white outline-none transition placeholder:text-slate-400 dark:placeholder:text-gray-600 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30";

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-gray-950 px-4 py-8 text-slate-900 dark:text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl animate-pulse space-y-6">
          {/* Back button */}
          <div className="h-5 w-36 rounded-md bg-slate-200 dark:bg-gray-800" />

          {/* Header Banner */}
          <div className="rounded-3xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900/80 p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-2">
                <div className="h-8 w-60 rounded-xl bg-slate-200 dark:bg-gray-800" />
                <div className="h-4 w-44 rounded bg-slate-200 dark:bg-gray-800/60" />
              </div>
              <div className="flex gap-3">
                <div className="h-10 w-28 rounded-xl bg-slate-200 dark:bg-gray-800" />
                <div className="h-10 w-32 rounded-xl bg-slate-200 dark:bg-gray-800" />
              </div>
            </div>
          </div>

          {/* Schemes Grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="flex flex-col justify-between rounded-3xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900/80 p-6 shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="h-6 w-20 rounded-full bg-slate-200 dark:bg-gray-800" />
                    <div className="h-6 w-16 rounded-full bg-slate-200 dark:bg-gray-800/60" />
                  </div>
                  <div className="h-5 w-4/5 rounded-lg bg-slate-200 dark:bg-gray-800 mb-2" />
                  <div className="h-4 w-3/5 rounded bg-slate-200 dark:bg-gray-800/60 mb-5" />

                  <div className="rounded-2xl bg-slate-50 dark:bg-gray-950/60 p-4 border border-slate-100 dark:border-gray-800/80 space-y-2 mb-5">
                    <div className="h-3.5 w-full rounded bg-slate-200 dark:bg-gray-800/60" />
                    <div className="h-3.5 w-4/5 rounded bg-slate-200 dark:bg-gray-800/60" />
                  </div>
                </div>

                <div className="h-10 w-full rounded-xl bg-slate-200 dark:bg-gray-800 mt-4" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (showForm || !hasRecommendations) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-gray-950 px-4 py-8 text-slate-900 dark:text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <button
            type="button"
            onClick={() => navigate(`/businesses/${businessId}`)}
            className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-gray-400 transition hover:text-slate-900 dark:hover:text-white"
          >
            <ArrowLeft size={16} />
            {t.back}
          </button>

          <div className="mb-8 flex items-center justify-between gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10">
              <Landmark size={27} className="text-blue-600 dark:text-blue-400" />
            </div>

            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400">
                <Sparkles size={15} />
                {t.aiRecommendations}
              </div>
              <h1 className="mt-1 text-3xl font-extrabold text-slate-900 dark:text-white">{t.title}</h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-gray-500">{t.subtitle}</p>
            </div>

            <BusinessScopeBadge businessId={businessId} className="shrink-0" />
          </div>

          <div className="mb-6 rounded-2xl border border-blue-500/20 bg-blue-500/5 p-5">
            <div className="flex items-start gap-3">
              <UserRound size={19} className="mt-0.5 shrink-0 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="text-sm font-semibold text-blue-600 dark:text-blue-300">
                  {t.eligibilityTitle}
                </p>
                <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-gray-400">
                  {t.eligibilitySubtitle}
                </p>
                <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-gray-500">
                  {t.informationNote}
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/5 p-5">
              <div className="flex items-start gap-3">
                <AlertCircle
                  size={20}
                  className="mt-0.5 shrink-0 text-red-500 dark:text-red-400"
                />
                <div className="flex-1">
                  <p className="font-semibold text-red-600 dark:text-red-300">{t.errorTitle}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-gray-400">
                    {error}
                  </p>

                  {error === t.completeFirst && (
                    <button
                      type="button"
                      onClick={() =>
                        navigate(`/businesses/${businessId}/analysis`)
                      }
                      className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold !text-white transition hover:bg-blue-500 shadow-sm"
                    >
                      {t.businessAnalysis}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="rounded-2xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900/60 p-6 shadow-sm dark:shadow-none backdrop-blur-xl">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t.eligibilityTitle}</h2>
                  <p className="mt-1 text-xs text-slate-500 dark:text-gray-500">
                    {t.informationNote}
                  </p>
                </div>

                <span className="rounded-full border border-slate-200 dark:border-gray-700 bg-slate-100 dark:bg-gray-950 px-3 py-1 text-xs text-slate-600 dark:text-gray-500">
                  {t.optional}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className="text-sm font-semibold text-gray-300">
                    {t.age}
                    <span className="ml-2 text-xs font-medium text-blue-400">
                      {t.recommended}
                    </span>
                  </label>
                  <input
                    type="number"
                    min="18"
                    max="100"
                    value={form.age}
                    onChange={(e) => updateField("age", e.target.value)}
                    placeholder="18"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-300">
                    {t.gender}
                    <span className="ml-2 text-xs font-medium text-blue-400">
                      {t.recommended}
                    </span>
                  </label>
                  <select
                    value={form.gender}
                    onChange={(e) => updateField("gender", e.target.value)}
                    className={inputClass}
                  >
                    <option value="">{t.select}</option>
                    <option value="Male">{t.male}</option>
                    <option value="Female">{t.female}</option>
                    <option value="Other">{t.other}</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-300">
                    {t.ownershipType}
                  </label>
                  <select
                    value={form.ownership_type}
                    onChange={(e) =>
                      updateField("ownership_type", e.target.value)
                    }
                    className={inputClass}
                  >
                    <option value="">{t.select}</option>
                    <option value="Individual">{t.individual}</option>
                    <option value="Proprietorship">{t.proprietorship}</option>
                    <option value="Partnership">{t.partnership}</option>
                    <option value="Company">{t.company}</option>
                    <option value="Cooperative">{t.cooperative}</option>
                    <option value="Other">{t.otherOwnership}</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-300">
                    {t.socialCategory}
                    <span className="ml-2 text-xs font-medium text-blue-400">
                      {t.recommended}
                    </span>
                  </label>
                  <select
                    value={form.social_category}
                    onChange={(e) =>
                      updateField("social_category", e.target.value)
                    }
                    className={inputClass}
                  >
                    <option value="">{t.select}</option>
                    <option value="General">{t.general}</option>
                    <option value="SC">{t.sc}</option>
                    <option value="ST">{t.st}</option>
                    <option value="OBC">{t.obc}</option>
                    <option value="Minority">{t.minority}</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-300">
                    {t.annualIncome}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.annual_income}
                    onChange={(e) =>
                      updateField("annual_income", e.target.value)
                    }
                    placeholder="₹ 0"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-300">
                    {t.annualTurnover}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.annual_turnover}
                    onChange={(e) =>
                      updateField("annual_turnover", e.target.value)
                    }
                    placeholder="₹ 0"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-300">
                    {t.investmentAmount}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.investment_amount}
                    onChange={(e) =>
                      updateField("investment_amount", e.target.value)
                    }
                    placeholder="₹ 0"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-300">
                    {t.businessRegistration}
                  </label>
                  <select
                    value={form.business_registration}
                    onChange={(e) =>
                      updateField("business_registration", e.target.value)
                    }
                    className={inputClass}
                  >
                    <option value="">{t.select}</option>
                    <option value="true">{t.yes}</option>
                    <option value="false">{t.no}</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-300">
                    {t.farmerStatus}
                  </label>
                  <select
                    value={form.farmer_status}
                    onChange={(e) =>
                      updateField("farmer_status", e.target.value)
                    }
                    className={inputClass}
                  >
                    <option value="">{t.select}</option>
                    <option value="true">{t.yes}</option>
                    <option value="false">{t.no}</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-300">
                    {t.landOwnership}
                  </label>
                  <select
                    value={form.land_ownership}
                    onChange={(e) =>
                      updateField("land_ownership", e.target.value)
                    }
                    className={inputClass}
                  >
                    <option value="">{t.select}</option>
                    <option value="true">{t.yes}</option>
                    <option value="false">{t.no}</option>
                  </select>
                </div>
              </div>

              <div className="mt-7 flex flex-col-reverse gap-3 border-t border-gray-800 pt-6 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => navigate(`/businesses/${businessId}`)}
                  className="rounded-xl border border-gray-800 px-5 py-3 text-sm font-semibold text-gray-400 transition hover:border-gray-700 hover:text-white"
                >
                  {t.back}
                </button>

                <button
                  type="submit"
                  disabled={generating}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {generating ? (
                    <>
                      <Loader2 size={17} className="animate-spin" />
                      {t.generating}
                    </>
                  ) : (
                    <>
                      <Sparkles size={17} />
                      {t.generate}
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950 px-4 py-8 text-slate-900 dark:text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <button
          type="button"
          onClick={() => navigate(`/businesses/${businessId}`)}
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-gray-400 transition hover:text-slate-900 dark:hover:text-white"
        >
          <ArrowLeft size={16} />
          {t.back}
        </button>

        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10">
              <Landmark size={27} className="text-blue-600 dark:text-blue-400" />
            </div>

            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400">
                <Sparkles size={15} />
                {t.aiRecommendations}
              </div>

              <h1 className="mt-1 text-3xl font-extrabold text-slate-900 dark:text-white">{t.title}</h1>

              <p className="mt-1 text-sm text-slate-500 dark:text-gray-500">
                {t.schemesDescription}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <BusinessScopeBadge
              businessId={businessId}
              className="self-end lg:self-auto"
            />

            <button
              type="button"
              onClick={() => {
                setError("");
                setShowForm(true);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-3 text-sm font-semibold text-slate-700 dark:text-gray-300 transition hover:border-slate-300 dark:hover:border-gray-700 hover:text-slate-900 dark:hover:text-white shadow-sm"
            >
              <RefreshCw size={16} />
              {t.regenerate}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/5 p-5">
            <div className="flex items-start gap-3">
              <AlertCircle size={20} className="mt-0.5 shrink-0 text-red-500 dark:text-red-400" />
              <div>
                <p className="font-semibold text-red-600 dark:text-red-300">{t.errorTitle}</p>
                <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-gray-400">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="mb-6 flex items-center justify-between rounded-2xl border border-blue-500/20 bg-blue-500/5 px-5 py-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 size={19} className="text-emerald-500 dark:text-emerald-400" />
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-gray-200">
                {t.generated}
              </p>
              <p className="text-xs text-slate-500 dark:text-gray-500">
                {schemes.length} {t.schemesFound.toLowerCase()}
              </p>
            </div>
          </div>

          <span className="hidden rounded-full border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-1 text-xs text-slate-600 dark:text-gray-500 sm:block">
            {t.schemesFound}
          </span>
        </div>

        {schemes.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900/60 p-10 text-center shadow-sm dark:shadow-none">
            <Search size={32} className="mx-auto text-slate-400 dark:text-gray-600" />
            <h2 className="mt-4 text-lg font-bold text-slate-800 dark:text-gray-300">
              {t.noSchemes}
            </h2>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-600 dark:text-gray-500">
              {t.noSchemesDescription}
            </p>

            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold !text-white transition hover:bg-blue-500 shadow-md shadow-blue-500/20"
            >
              <RefreshCw size={16} />
              {t.regenerate}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {schemes.map((scheme, index) => {
              const schemeUrl = urls[scheme.scheme_id];
              const similarity = Number(scheme.similarity_score);

              return (
                <div
                  key={`${scheme.scheme_id}-${index}`}
                  className="flex h-[620px] flex-col rounded-2xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900/60 shadow-sm hover:shadow-md dark:shadow-lg backdrop-blur-xl transition hover:border-blue-400 dark:hover:border-gray-700/80"
                >
                  {/* Fixed Card Header */}
                  <div className="border-b border-slate-200 dark:border-gray-800/80 p-5 sm:p-6">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10">
                          <Landmark size={20} className="text-blue-600 dark:text-blue-400" />
                        </div>

                        <div className="min-w-0">
                          <h2 className="line-clamp-2 text-base font-bold leading-6 text-slate-900 dark:text-white sm:text-lg">
                            {scheme.name}
                          </h2>
                          <p className="mt-0.5 text-xs text-slate-500 dark:text-gray-500">
                            {t.schemeId}:{" "}
                            <span className="font-mono text-slate-600 dark:text-gray-400">
                              {scheme.scheme_id}
                            </span>
                          </p>
                        </div>
                      </div>

                      {Number.isFinite(similarity) && (
                        <span className="shrink-0 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          {Math.round(similarity * 100)}% {t.match}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Scrollable Structured Content Body */}
                  <div className="flex-1 space-y-5 overflow-y-auto p-5 sm:p-6 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-200 dark:scrollbar-thumb-gray-800 hover:scrollbar-thumb-slate-300 dark:hover:scrollbar-thumb-gray-700">
                    {scheme.benefits && (
                      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                        <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                          {t.benefits}
                        </h3>
                        {renderFormattedContent(
                          scheme.benefits,
                          "text-slate-700 dark:text-gray-300",
                        )}
                      </div>
                    )}

                    {scheme.description && (
                      <div className="rounded-xl border border-slate-200 dark:border-gray-800/60 bg-slate-50 dark:bg-gray-950/40 p-4">
                        <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-gray-400">
                          {t.description}
                        </h3>
                        {renderFormattedContent(
                          scheme.description,
                          "text-slate-600 dark:text-gray-400",
                        )}
                      </div>
                    )}

                    {scheme.eligibility_criteria && (
                      <div className="rounded-xl border border-slate-200 dark:border-gray-800/60 bg-slate-50 dark:bg-gray-950/40 p-4">
                        <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-gray-400">
                          {t.eligibility}
                        </h3>
                        {renderFormattedContent(
                          scheme.eligibility_criteria,
                          "text-slate-600 dark:text-gray-400",
                        )}
                      </div>
                    )}
                  </div>

                  {/* Card Action Footer */}
                  <div className="border-t border-slate-200 dark:border-gray-800/80 bg-slate-50/50 dark:bg-gray-950/30 p-4 sm:px-6">
                    {schemeUrl?.is_fallback || !schemeUrl?.url ? (
                      <p className="mb-2.5 text-center text-xs leading-5 text-slate-500 dark:text-gray-500">
                        {t.fallbackNotice}
                      </p>
                    ) : null}

                    <button
                      type="button"
                      onClick={() => openScheme(scheme)}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold !text-white shadow-sm transition hover:bg-blue-500 active:scale-[0.99]"
                    >
                      <ExternalLink size={16} />
                      {schemeUrl?.is_fallback || !schemeUrl?.url
                        ? t.myScheme
                        : t.viewScheme}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default GovernmentSchemes;
