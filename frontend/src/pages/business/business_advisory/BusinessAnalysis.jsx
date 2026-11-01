import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BarChart3,
  Sparkles,
  Users,
  ShoppingCart,
  Boxes,
  Truck,
  CloudSun,
  FileText,
  MapPin,
  TrendingUp,
  AlertCircle,
  Loader2,
  RefreshCw,
  LocateFixed,
  Play,
  Clock,
  CheckCircle2,
  Pencil,
  X,
} from "lucide-react";

import { api, aiApi } from "../../../utils/api";
import { useLanguage } from "../../../context/LanguageContext";
import BusinessScopeBadge from "./components/BusinessScopeBadge";

const translations = {
  english: {
    loading: "Loading business analysis...",
    backWorkspace: "Back to Workspace",
    aiAnalysis: "AI Analysis",
    businessAnalysis: "Business Analysis",
    regenerate: "Regenerate Analysis",
    regenerating: "Regenerating...",
    operationFailed: "Analysis operation failed",
    report: "Feasibility Report",
    generatedAssessment: "AI-Generated Business Assessment",
    evidenceInsights: "Evidence & Insights",
    exploreData: "Explore Analysis Data",
    selectSection: "Select a section to view detailed evidence",
    viewDetails: "View details →",
    dataAvailable: "Analysis data available",
    noData: "No data available",
    population: "Population Analysis",
    populationDescription:
      "Understand the population, household base, density and market reach around your business.",
    competition: "Competition Analysis",
    competitionDescription:
      "Explore nearby competitors, competitor density and the local competitive landscape.",
    marketPrices: "Market Prices",
    marketPricesDescription:
      "Review commodity pricing statistics, market data and available price intelligence.",
    supplyChain: "Supply Chain",
    supplyChainDescription:
      "Inspect sourcing, processing, cold-chain infrastructure and supply-chain scores.",
    transportation: "Transportation",
    transportationDescription:
      "Review modeled routes, travel distances, vehicles and estimated logistics costs.",
    seasonality: "Seasonality",
    seasonalityDescription:
      "Analyze monthly demand, production, pricing, rainfall and seasonal business risks.",
    populationStat: "Population",
    radius: "Market Radius",
    competitors: "Competitors",
    supplyScore: "Supply Chain Score",
    logisticsCost: "Modeled Logistics Cost",
    monthlyFreight: "Estimated monthly freight OPEX:",
    generationFailed: "Generation failed",
    generateBusinessAnalysis: "Configure Business Analysis",
    aiBusinessIntelligence: "AI Business Intelligence",
    generationDescription:
      "Review and modify business parameters and your market radius before initiating AI analysis.",
    businessInformation: "Business Details",
    analysisParameters: "Analysis Parameters",
    analysisRadius: "Analysis Radius",
    radiusDescription:
      "Geographic radius used for population and competitor analysis.",
    cancel: "Cancel",
    generate: "Generate Analysis",
    generating: "Generating Analysis...",
    noReport: "No feasibility report is available yet.",
    businessId: "Business ID",
    noAnalysisError: "Failed to load business analysis.",
    tryAgain: "Try Again",
    longRunningNoticeTitle: "Analysis is running in the background (5–10 mins)",
    longRunningNoticeText:
      "Comprehensive market research (population demographics, competitor mapping, supply chain & freight simulation) takes about 5 to 10 minutes. You can safely close this modal, leave this page, or navigate to other workspaces. Your report will be saved automatically.",
    continueWorkspace: "Continue with other tasks",
    dismissModalNotice: "Close & continue in background",
    staleBannerTitle: "Business details have changed",
    staleBannerDesc:
      "This feasibility report was generated with older business information. Update parameters and regenerate for current insights.",
    reviewAndRegenerate: "Review & Regenerate",
    cached: "Cached result",
    generated: "Newly generated",
    needsRegeneration: "Needs regeneration",
    version: "Version",
  },
  hindi: {
    loading: "व्यवसाय विश्लेषण लोड हो रहा है...",
    backWorkspace: "वर्कस्पेस पर वापस जाएँ",
    aiAnalysis: "AI विश्लेषण",
    businessAnalysis: "व्यवसाय विश्लेषण",
    regenerate: "विश्लेषण दोबारा बनाएँ",
    regenerating: "दोबारा बनाया जा रहा है...",
    operationFailed: "विश्लेषण प्रक्रिया विफल रही",
    report: "व्यवहार्यता रिपोर्ट",
    generatedAssessment: "AI द्वारा तैयार व्यवसाय मूल्यांकन",
    evidenceInsights: "साक्ष्य और जानकारी",
    exploreData: "विश्लेषण डेटा देखें",
    selectSection: "विस्तृत जानकारी देखने के लिए एक अनुभाग चुनें",
    viewDetails: "विवरण देखें →",
    dataAvailable: "विश्लेषण डेटा उपलब्ध है",
    noData: "डेटा उपलब्ध नहीं है",
    population: "जनसंख्या विश्लेषण",
    populationDescription:
      "अपने व्यवसाय के आसपास की जनसंख्या, परिवारों, घनत्व और बाजार पहुँच को समझें।",
    competition: "प्रतिस्पर्धा विश्लेषण",
    competitionDescription:
      "आसपास के प्रतिस्पर्धियों, प्रतिस्पर्धी घनत्व और स्थानीय बाजार की स्थिति देखें।",
    marketPrices: "बाजार मूल्य",
    marketPricesDescription:
      "वस्तुओं के मूल्य आँकड़े, बाजार डेटा और उपलब्ध मूल्य जानकारी देखें।",
    supplyChain: "आपूर्ति श्रृंखला",
    supplyChainDescription:
      "स्रोत, प्रसंस्करण, कोल्ड-चेन और आपूर्ति श्रृंखला स्कोर का निरीक्षण करें।",
    transportation: "परिवहन",
    transportationDescription:
      "मार्ग, दूरी, वाहन और अनुमानित लॉजिस्टिक्स लागत देखें।",
    seasonality: "मौसमी विश्लेषण",
    seasonalityDescription:
      "मासिक मांग, उत्पादन, मूल्य, वर्षा और मौसमी व्यावसायिक जोखिमों का विश्लेषण करें।",
    populationStat: "जनसंख्या",
    radius: "बाजार त्रिज्या",
    competitors: "प्रतिस्पर्धी",
    supplyScore: "आपूर्ति श्रृंखला स्कोर",
    logisticsCost: "अनुमानित लॉजिस्टिक्स लागत",
    monthlyFreight: "अनुमानित मासिक फ्रेट OPEX:",
    generationFailed: "विश्लेषण निर्माण विफल रहा",
    generateBusinessAnalysis: "व्यवसाय विश्लेषण कॉन्फ़िगर करें",
    aiBusinessIntelligence: "AI बिज़नेस इंटेलिजेंस",
    generationDescription:
      "विश्लेषण शुरू करने से पहले व्यवसाय विवरण और बाजार त्रिज्या की समीक्षा या संपादन करें।",
    businessInformation: "व्यवसाय विवरण",
    analysisParameters: "विश्लेषण पैरामीटर",
    analysisRadius: "विश्लेषण त्रिज्या",
    radiusDescription:
      "जनसंख्या और प्रतिस्पर्धा विश्लेषण के लिए उपयोग की जाने वाली भौगोलिक सीमा।",
    cancel: "रद्द करें",
    generate: "विश्लेषण बनाएँ",
    generating: "विश्लेषण बनाया जा रहा है...",
    noReport: "अभी तक कोई व्यवहार्यता रिपोर्ट उपलब्ध नहीं है।",
    businessId: "व्यवसाय ID",
    noAnalysisError: "व्यवसाय विश्लेषण लोड नहीं हो सका।",
    tryAgain: "फिर से प्रयास करें",
    longRunningNoticeTitle: "विश्लेषण बैकग्राउंड में चल रहा है (5–10 मिनट)",
    longRunningNoticeText:
      "विस्तृत डेटा विश्लेषण में 5 से 10 मिनट का समय लगता है। आप इस विंडो को बंद कर सकते हैं और दूसरे पेज पर जा सकते हैं। आपकी रिपोर्ट तैयार होने पर अपने आप सुरक्षित हो जाएगी।",
    continueWorkspace: "अन्य काम जारी रखें",
    dismissModalNotice: "बंद करें और बैकग्राउंड में चलने दें",
    staleBannerTitle: "व्यवसाय विवरण बदल गए हैं",
    staleBannerDesc:
      "यह रिपोर्ट पुराने विवरणों के आधार पर तैयार की गई थी। सटीक विश्लेषण के लिए इसे अपडेट करके दोबारा बनाएं।",
    reviewAndRegenerate: "समीक्षा और दोबारा बनाएं",
    cached: "कैश किया गया परिणाम",
    generated: "नया तैयार किया गया",
    needsRegeneration: "दोबारा बनाने की आवश्यकता",
    version: "संस्करण",
  },
  bengali: {
    loading: "ব্যবসায়িক বিশ্লেষণ লোড হচ্ছে...",
    backWorkspace: "ওয়ার্কস্পেসে ফিরে যান",
    aiAnalysis: "AI বিশ্লেষণ",
    businessAnalysis: "ব্যবসায়িক বিশ্লেষণ",
    regenerate: "বিশ্লেষণ পুনরায় তৈরি করুন",
    regenerating: "পুনরায় তৈরি হচ্ছে...",
    operationFailed: "বিশ্লেষণ প্রক্রিয়া ব্যর্থ হয়েছে",
    report: "ব্যবসায়িক সম্ভাব্যতা রিপোর্ট",
    generatedAssessment: "AI-তৈরি ব্যবসায়িক মূল্যায়ন",
    evidenceInsights: "প্রমাণ ও অন্তর্দৃষ্টি",
    exploreData: "বিশ্লেষণের তথ্য দেখুন",
    selectSection: "বিস্তারিত তথ্য দেখতে একটি বিভাগ নির্বাচন করুন",
    viewDetails: "বিস্তারিত দেখুন →",
    dataAvailable: "বিশ্লেষণের তথ্য উপলব্ধ",
    noData: "কোনো তথ্য উপলব্ধ নেই",
    population: "জনসংখ্যা বিশ্লেষণ",
    populationDescription:
      "আপনার ব্যবসার আশেপাশের জনসংখ্যা, পরিবার, ঘনত্ব এবং বাজারের পরিধি বুঝুন।",
    competition: "প্রতিযোগিতা বিশ্লেষণ",
    competitionDescription:
      "কাছাকাছি প্রতিযোগী, প্রতিযোগিতার ঘনত্ব এবং স্থানীয় বাজারের পরিস্থিতি দেখুন।",
    marketPrices: "বাজার মূল্য",
    marketPricesDescription:
      "পণ্যের মূল্য পরিসংখ্যান, বাজার তথ্য এবং উপলব্ধ মূল্য সংক্রান্ত তথ্য দেখুন।",
    supplyChain: "সরবরাহ ব্যবস্থা",
    supplyChainDescription:
      "উৎস, প্রক্রিয়াকরণ, কোল্ড-চেইন এবং সরবরাহ ব্যবস্থার স্কোর দেখুন।",
    transportation: "পরিবহন",
    transportationDescription:
      "রুট, দূরত্ব, যানবাহন এবং আনুমানিক লজিস্টিক খরচ দেখুন।",
    seasonality: "মৌসুমি বিশ্লেষণ",
    seasonalityDescription:
      "মাসিক চাহিদা, উৎপাদন, মূল্য, বৃষ্টিপাত এবং মৌসুমি ব্যবসায়িক ঝুঁকি বিশ্লেষণ করুন।",
    populationStat: "জনসংখ্যা",
    radius: "বাজারের পরিধি",
    competitors: "প্রতিযোগী",
    supplyScore: "সরবরাহ ব্যবস্থার স্কোর",
    logisticsCost: "আনুমানিক লজিস্টিক খরচ",
    monthlyFreight: "আনুমানিক মাসিক ফ্রেট OPEX:",
    generationFailed: "বিশ্লেষণ তৈরি ব্যর্থ হয়েছে",
    generateBusinessAnalysis: "ব্যবসায়িক বিশ্লেষণ কনফিগার করুন",
    aiBusinessIntelligence: "AI বিজনেস ইন্টেলিজেন্স",
    generationDescription:
      "বিশ্লেষণ শুরু করার আগে ব্যবসায়ের তথ্য ও পরিধি পর্যালোচনা ও আপডেট করুন।",
    businessInformation: "ব্যবসায়ের তথ্য",
    analysisParameters: "বিশ্লেষণের প্যারামিটার",
    analysisRadius: "বিশ্লেষণের পরিধি",
    radiusDescription:
      "জনসংখ্যা এবং প্রতিযোগিতা বিশ্লেষণের জন্য ব্যবহৃত ভৌগোলিক পরিধি।",
    cancel: "বাতিল",
    generate: "বিশ্লেষণ তৈরি করুন",
    generating: "বিশ্লেষণ তৈরি হচ্ছে...",
    noReport: "এখনও কোনো সম্ভাব্যতা রিপোর্ট পাওয়া যায়নি।",
    businessId: "ব্যবসার ID",
    noAnalysisError: "ব্যবসায়িক বিশ্লেষণ লোড করা যায়নি।",
    tryAgain: "আবার চেষ্টা করুন",
    longRunningNoticeTitle: "বিশ্লেষণ ব্যাকগ্রাউন্ডে চলছে (৫–১০ মিনিট)",
    longRunningNoticeText:
      "সম্পূর্ণ গবেষণা ও লজিস্টিক সিমুলেশন শেষ হতে প্রায় ৫ থেকে ১০ মিনিট সময় লাগতে পারে। আপনি নিশ্চিন্তে এই মোডাল বা পেজ বন্ধ করে অন্য কাজ করতে পারেন।",
    continueWorkspace: "অন্যান্য কাজ চালিয়ে যান",
    dismissModalNotice: "বন্ধ করে ব্যাকগ্রাউন্ডে চালু রাখুন",
    staleBannerTitle: "ব্যবসায়ের বিবরণ পরিবর্তিত হয়েছে",
    staleBannerDesc:
      "এই রিপোর্টটি পূর্বের তথ্যের ভিত্তিতে তৈরি। নতুন ফলাফলের জন্য তথ্য আপডেট করে পুনরায় তৈরি করুন।",
    reviewAndRegenerate: "পর্যালোচনা ও পুনরায় তৈরি",
    cached: "ক্যাশ করা ফলাফল",
    generated: "নতুন তৈরি",
    needsRegeneration: "পুনরায় তৈরি করা প্রয়োজন",
    version: "সংস্করণ",
  },
};

const normalizeLanguage = (value) => {
  const normalized = String(value || "").toLowerCase();
  if (normalized === "hi" || normalized === "hindi") return "hindi";
  if (normalized === "bn" || normalized === "bengali") return "bengali";
  return "english";
};

const GENERATING_STORAGE_PREFIX = "business_analysis_generating_";

const getGeneratingState = (id) => {
  if (!id) return null;
  try {
    const raw = sessionStorage.getItem(`${GENERATING_STORAGE_PREFIX}${id}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Date.now() - parsed.timestamp > 15 * 60 * 1000) {
      sessionStorage.removeItem(`${GENERATING_STORAGE_PREFIX}${id}`);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
};

const setGeneratingState = (id, data = {}) => {
  if (!id) return;
  try {
    sessionStorage.setItem(
      `${GENERATING_STORAGE_PREFIX}${id}`,
      JSON.stringify({ ...data, timestamp: Date.now() }),
    );
  } catch (e) {
    console.warn("Could not set generating state in sessionStorage:", e);
  }
};

const clearGeneratingState = (id) => {
  if (!id) return;
  try {
    sessionStorage.removeItem(`${GENERATING_STORAGE_PREFIX}${id}`);
  } catch (e) {
    console.warn("Could not clear generating state in sessionStorage:", e);
  }
};

const BusinessAnalysis = () => {
  const { businessId } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();

  const currentLanguage = normalizeLanguage(language);
  const t = translations[currentLanguage];

  const [report, setReport] = useState(null);
  const [businessData, setBusinessData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [needsRegeneration, setNeedsRegeneration] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [generating, setGenerating] = useState(false);

  const pollIntervalRef = useRef(null);

  const getApiLanguage = () => currentLanguage;

  const fetchBusinessProfile = async () => {
    const res = await api.get(`/businesses/${businessId}`, {
      params: { language: getApiLanguage() },
    });
    return res?.data?.business || res?.data || res;
  };

  const checkReportStatus = async () => {
    try {
      const res = await aiApi.get(
        `api/v1/businesses/${businessId}/report/status`,
      );
      const data = res?.data || res;
      const exists = Boolean(data?.exists);
      const isStale = Boolean(data?.needs_regeneration);
      setNeedsRegeneration(isStale);
      return {
        exists,
        needsRegeneration: isStale,
        analysisId: data?.analysis_id,
        version: data?.version,
        analysisUpdatedAt: data?.analysis_updated_at,
        businessUpdatedAt: data?.business_updated_at,
        data,
      };
    } catch (e) {
      console.warn("Could not check report staleness status:", e);
      return null;
    }
  };

  const stopBackgroundPolling = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  };

  const startBackgroundPolling = (prevAnalysisId = null) => {
    stopBackgroundPolling();

    const startTime = Date.now();
    const maxPollTimeMs = 15 * 60 * 1000;

    pollIntervalRef.current = setInterval(async () => {
      if (Date.now() - startTime > maxPollTimeMs) {
        stopBackgroundPolling();
        clearGeneratingState(businessId);
        setGenerating(false);
        setError(t.generationFailed);
        return;
      }

      try {
        const status = await checkReportStatus();
        if (!status) return;

        const isFinished =
          status.exists &&
          (!prevAnalysisId || status.analysisId !== prevAnalysisId);

        if (isFinished) {
          stopBackgroundPolling();
          clearGeneratingState(businessId);

          try {
            const response = await aiApi.get(
              `api/v1/businesses/${businessId}/report?language=${getApiLanguage()}`,
            );
            const reportData = response.data || response;
            setReport(reportData);
            setNeedsRegeneration(
              Boolean(
                status.needsRegeneration || reportData?.needs_regeneration,
              ),
            );
            setGenerating(false);
            setShowConfigModal(false);
            setError("");
          } catch (fetchErr) {
            console.error("Failed to load completed report after polling:", fetchErr);
          }
        }
      } catch (pollErr) {
        console.warn("Polling error checking report status:", pollErr);
      }
    }, 5000);
  };

  const loadReport = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setError("");

      const status = await checkReportStatus();
      const generatingInfo = getGeneratingState(businessId);

      if (status?.exists) {
        if (
          generatingInfo?.prevAnalysisId &&
          status.analysisId === generatingInfo.prevAnalysisId
        ) {
          setGenerating(true);
          setShowConfigModal(false);
          startBackgroundPolling(generatingInfo.prevAnalysisId);
          return null;
        }

        const response = await aiApi.get(
          `api/v1/businesses/${businessId}/report?language=${getApiLanguage()}`,
        );
        const reportData = response.data || response;
        setReport(reportData);
        setNeedsRegeneration(
          Boolean(status.needsRegeneration || reportData?.needs_regeneration),
        );
        setShowConfigModal(false);
        setGenerating(false);
        clearGeneratingState(businessId);
        stopBackgroundPolling();
        return reportData;
      }

      setReport(null);

      if (generatingInfo) {
        setGenerating(true);
        setShowConfigModal(false);
        startBackgroundPolling(generatingInfo.prevAnalysisId);
      } else {
        setGenerating(false);
        stopBackgroundPolling();
        if (!silent) {
          try {
            const business = await fetchBusinessProfile();
            setBusinessData(business);
            setShowConfigModal(true);
          } catch (fetchErr) {
            setError(
              fetchErr?.response?.data?.detail ||
                fetchErr.message ||
                t.noAnalysisError,
            );
          }
        }
      }
      return null;
    } catch (err) {
      if (err?.response?.status === 404) {
        setReport(null);
        const generatingInfo = getGeneratingState(businessId);
        if (generatingInfo) {
          setGenerating(true);
          setShowConfigModal(false);
          startBackgroundPolling(generatingInfo.prevAnalysisId);
        } else if (!silent) {
          try {
            const business = await fetchBusinessProfile();
            setBusinessData(business);
            setShowConfigModal(true);
          } catch (fetchErr) {
            setError(
              fetchErr?.response?.data?.detail ||
                fetchErr.message ||
                t.noAnalysisError,
            );
          }
        }
      } else {
        if (!silent) {
          setError(
            err?.response?.data?.detail || err?.message || t.noAnalysisError,
          );
        }
      }
      return null;
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    if (businessId) {
      loadReport();
    }
    return () => {
      stopBackgroundPolling();
    };
  }, [businessId, language]);

  const handleOpenConfig = async () => {
    try {
      const business = businessData || (await fetchBusinessProfile());
      setBusinessData(business);
      setShowConfigModal(true);
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          err.message ||
          "Failed to fetch business details.",
      );
    }
  };

  const handleExecuteAnalysis = async ({ updatedFields, radiusKm }) => {
    try {
      setGenerating(true);
      setError("");

      if (Object.keys(updatedFields).length > 0) {
        await api.patch(`/businesses/${businessId}/update`, updatedFields, {
          headers: {
            "Accept-Language": getApiLanguage(),
          },
        });
      }

      const latestBusiness = await fetchBusinessProfile();
      setBusinessData(latestBusiness);

      const requestBody = {
        business_id: businessId,
        business_name: latestBusiness.business_name,
        business_type: latestBusiness.category,
        business_description: latestBusiness.description || null,
        country: latestBusiness.country || "India",
        state: latestBusiness.state,
        district: latestBusiness.district,
        city: latestBusiness.city || null,
        village: latestBusiness.village || null,
        pincode: latestBusiness.pincode || null,
        margin_capital: Number(latestBusiness.margin_capital || 0),
        radius_km: Number(radiusKm),
        language: getApiLanguage(),
      };

      const prevId = report?.analysis_id || null;
      setGeneratingState(businessId, { prevAnalysisId: prevId });
      startBackgroundPolling(prevId);

      const endpoint = report
        ? "api/v1/report/generate?force=true"
        : "api/v1/report/generate";

      aiApi
        .post(endpoint, requestBody)
        .then((response) => {
          const generatedReport = response?.data || response;
          if (generatedReport) {
            setReport(generatedReport);
            setShowConfigModal(false);
            setGenerating(false);
            setNeedsRegeneration(false);
            stopBackgroundPolling();
            clearGeneratingState(businessId);
          }
        })
        .catch((postErr) => {
          console.warn(
            "POST generate request ended (status polling active):",
            postErr?.message,
          );
          if (
            postErr?.response?.status >= 400 &&
            postErr?.response?.status < 500
          ) {
            setError(
              postErr?.response?.data?.detail ||
                postErr.message ||
                t.generationFailed,
            );
            setGenerating(false);
            stopBackgroundPolling();
            clearGeneratingState(businessId);
          }
        });
    } catch (err) {
      setError(
        err?.response?.data?.detail || err?.message || t.generationFailed,
      );
      setGenerating(false);
      stopBackgroundPolling();
      clearGeneratingState(businessId);
    }
  };

  const isStaleReport = Boolean(
    needsRegeneration || report?.needs_regeneration,
  );

  const evidenceCards = [
    {
      title: t.population,
      description: t.populationDescription,
      icon: Users,
      path: "population",
      color: "blue",
      key: "population",
    },
    {
      title: t.competition,
      description: t.competitionDescription,
      icon: ShoppingCart,
      path: "competitors",
      color: "violet",
      key: "competitors",
    },
    {
      title: t.marketPrices,
      description: t.marketPricesDescription,
      icon: TrendingUp,
      path: "market-prices",
      color: "emerald",
      key: "market_price",
    },
    {
      title: t.supplyChain,
      description: t.supplyChainDescription,
      icon: Boxes,
      path: "supply-chain",
      color: "amber",
      key: "supply_chain",
    },
    {
      title: t.transportation,
      description: t.transportationDescription,
      icon: Truck,
      path: "transportation",
      color: "cyan",
      key: "transportation",
    },
    {
      title: t.seasonality,
      description: t.seasonalityDescription,
      icon: CloudSun,
      path: "seasonality",
      color: "rose",
      key: "seasonality",
    },
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: {
        icon: "border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400",
        hover: "hover:border-blue-500/40",
      },
      violet: {
        icon: "border-violet-500/20 bg-violet-500/10 text-violet-600 dark:text-violet-400",
        hover: "hover:border-violet-500/40",
      },
      emerald: {
        icon: "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
        hover: "hover:border-emerald-500/40",
      },
      amber: {
        icon: "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400",
        hover: "hover:border-amber-500/40",
      },
      cyan: {
        icon: "border-cyan-500/20 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
        hover: "hover:border-cyan-500/40",
      },
      rose: {
        icon: "border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400",
        hover: "hover:border-rose-500/40",
      },
    };
    return colors[color] || colors.blue;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-gray-950 px-4 py-8 text-slate-900 dark:text-white sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-[70vh] max-w-7xl items-center justify-center">
          <div className="flex flex-col items-center">
            <Loader2 className="mb-4 h-8 w-8 animate-spin text-blue-500" />
            <p className="text-sm text-slate-600 dark:text-gray-400">{t.loading}</p>
          </div>
        </div>
      </div>
    );
  }

  const population = report?.raw_evidence?.population?.data;
  const competitors = report?.raw_evidence?.competitors?.data;
  const supplyChain = report?.raw_evidence?.supply_chain?.data;
  const transportation = report?.raw_evidence?.transportation?.data;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950 px-4 py-8 text-slate-900 dark:text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <button
          type="button"
          onClick={() => navigate(`/businesses/${businessId}`)}
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-gray-400 transition hover:text-slate-900 dark:hover:text-white"
        >
          <ArrowLeft size={16} />
          {t.backWorkspace}
        </button>

        {/* Stale Analysis Alert Banner */}
        {isStaleReport && !generating && (
          <div className="mb-6 flex flex-col items-start justify-between gap-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 shadow-lg backdrop-blur-md sm:flex-row sm:items-center">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
              <div>
                <h3 className="text-sm font-bold text-amber-300">
                  {t.staleBannerTitle}
                </h3>
                <p className="mt-1 text-xs leading-5 text-gray-300">
                  {t.staleBannerDesc}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleOpenConfig}
              className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-gray-950 transition hover:bg-amber-400"
            >
              <RefreshCw size={14} />
              {t.reviewAndRegenerate}
            </button>
          </div>
        )}

        {/* Global In-Progress Banner */}
        {generating && (
          <div className="mb-6 rounded-2xl border border-blue-500/30 bg-blue-500/10 p-5 shadow-lg backdrop-blur-md">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <Loader2 className="mt-1 h-5 w-5 shrink-0 animate-spin text-blue-400" />
                <div>
                  <h3 className="text-sm font-bold text-blue-300">
                    {t.longRunningNoticeTitle}
                  </h3>
                  <p className="mt-1 max-w-2xl text-xs leading-5 text-gray-300">
                    {t.longRunningNoticeText}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate(`/businesses/${businessId}`)}
                className="whitespace-nowrap rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-blue-500"
              >
                {t.continueWorkspace}
              </button>
            </div>
          </div>
        )}

        <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10">
              <BarChart3 size={27} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400">
                <Sparkles size={15} />
                {t.aiAnalysis}
              </div>
              <h1 className="mt-1 text-3xl font-extrabold text-slate-900 dark:text-white">
                {t.businessAnalysis}
              </h1>
              <p className="mt-1 flex items-center gap-1 text-sm text-slate-500 dark:text-gray-500">
                <MapPin size={13} />
                {population?.location || `${t.businessId}: ${businessId}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            <BusinessScopeBadge businessId={businessId} />

            <button
              type="button"
              onClick={handleOpenConfig}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-3 text-sm font-bold text-slate-700 dark:text-gray-300 transition hover:bg-slate-100 dark:hover:bg-gray-800"
            >
              {generating ? (
                <>
                  <Loader2 size={16} className="animate-spin text-blue-500" />
                  <span>{t.generating}</span>
                </>
              ) : (
                <>
                  <Pencil size={16} />
                  <span>{report ? t.regenerate : t.generate}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-4">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
            <div>
              <p className="font-semibold text-red-700 dark:text-red-300">{t.operationFailed}</p>
              <p className="mt-1 text-sm text-slate-600 dark:text-gray-500">{error}</p>
            </div>
          </div>
        )}

        {/* Status Indicators */}
        {report && (
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <StatusBadge
              icon={
                isStaleReport
                  ? AlertCircle
                  : report?.cached
                    ? Clock
                    : CheckCircle2
              }
              className={
                isStaleReport
                  ? "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300"
                  : undefined
              }
              label={
                isStaleReport
                  ? t.needsRegeneration
                  : report?.cached
                    ? t.cached
                    : t.generated
              }
            />

            <span className="rounded-lg border border-slate-200 dark:border-gray-800 bg-slate-100 dark:bg-gray-900 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-gray-500">
              {t.version} {report?.version ?? "1"}
            </span>
          </div>
        )}

        <div className="mb-8 rounded-2xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900/60 p-6 shadow-sm backdrop-blur-xl">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400">
                <FileText size={15} />
                {t.report}
              </div>
              <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
                {t.generatedAssessment}
              </h2>
            </div>
            <div className="hidden rounded-lg border border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-950 px-3 py-2 text-xs text-slate-500 dark:text-gray-500 sm:block">
              Version {report?.version || "1"}
            </div>
          </div>
          <div className="max-h-[600px] overflow-y-auto rounded-xl border border-slate-200 dark:border-gray-800 bg-slate-50/70 dark:bg-gray-950/70 p-5">
            <MarkdownReport
              markdown={report?.report_markdown || ""}
              noReport={t.noReport}
            />
          </div>
        </div>

        <div className="mb-5">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                {t.evidenceInsights}
              </p>
              <h2 className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-white">{t.exploreData}</h2>
            </div>
            <span className="hidden text-xs text-slate-500 dark:text-gray-600 sm:block">
              {t.selectSection}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {evidenceCards.map((card) => {
            const Icon = card.icon;
            const colors = getColorClasses(card.color);
            const available = Boolean(report?.raw_evidence?.[card.key]?.data);

            return (
              <button
                key={card.title}
                type="button"
                disabled={!available}
                onClick={() =>
                  navigate(`/businesses/${businessId}/analysis/${card.path}`)
                }
                className={`group min-h-[210px] rounded-2xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900/60 p-6 text-left shadow-sm backdrop-blur-xl transition ${colors.hover} hover:-translate-y-0.5 hover:bg-slate-50 dark:hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-50`}
              >
                <div className="flex items-start justify-between">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl border ${colors.icon}`}
                  >
                    <Icon size={21} />
                  </div>
                  <span className="text-xs font-semibold text-slate-500 dark:text-gray-600 transition group-hover:text-slate-800 dark:group-hover:text-gray-400">
                    {t.viewDetails}
                  </span>
                </div>
                <h3 className="mt-5 text-lg font-bold text-slate-900 dark:text-white">{card.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-gray-500">
                  {card.description}
                </p>
                <div className="mt-5 rounded-lg border border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-950/60 px-3 py-2 text-xs text-slate-500 dark:text-gray-600">
                  {available ? t.dataAvailable : t.noData}
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            label={t.populationStat}
            value={
              population?.population
                ? population.population.toLocaleString("en-IN")
                : "—"
            }
          />
          <StatCard
            label={t.radius}
            value={population?.radius_km ? `${population.radius_km} km` : "—"}
          />
          <StatCard
            label={t.competitors}
            value={
              competitors?.competitor_summary?.total_unique_competitors ?? "—"
            }
          />
          <StatCard
            label={t.supplyScore}
            value={
              supplyChain?.overall_supply_chain_score != null
                ? `${supplyChain.overall_supply_chain_score}/100`
                : "—"
            }
          />
        </div>

        {transportation?.summary?.total_monthly_freight_opex_inr != null && (
          <div className="mt-5 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
            <div className="flex items-start gap-3">
              <Truck className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
              <div>
                <h3 className="font-bold text-amber-300">{t.logisticsCost}</h3>
                <p className="mt-1 text-sm leading-6 text-gray-400">
                  {t.monthlyFreight}
                  <span className="ml-1 font-bold text-gray-200">
                    ₹
                    {transportation.summary.total_monthly_freight_opex_inr.toLocaleString(
                      "en-IN",
                      { maximumFractionDigits: 2 },
                    )}
                  </span>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Configuration Modal */}
      {showConfigModal && (
        <AnalysisConfigModal
          business={businessData}
          initialRadius={
            report?.raw_evidence?.population?.data?.radius_km || 10
          }
          onClose={() => setShowConfigModal(false)}
          onSubmit={handleExecuteAnalysis}
          loading={generating}
          isRegenerate={Boolean(report)}
          t={t}
        />
      )}
    </div>
  );
};

const StatusBadge = ({ icon: Icon, label, className }) => (
  <div
    className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold ${
      className || "border-slate-200 dark:border-gray-800 bg-slate-100 dark:bg-gray-900 text-slate-700 dark:text-gray-400"
    }`}
  >
    <Icon size={13} />
    {label}
  </div>
);

const AnalysisConfigModal = ({
  business,
  initialRadius = 10,
  onClose,
  onSubmit,
  loading,
  isRegenerate,
  t,
}) => {
  const [radiusKm, setRadiusKm] = useState(String(initialRadius));
  const [form, setForm] = useState({
    name: business?.business_name || "",
    description: business?.description || "",
    village: business?.village || "",
    district: business?.district || "",
    city: business?.city || "",
    state: business?.state || "",
    country: business?.country || "",
    pincode: business?.pincode || "",
    margin_capital:
      business?.margin_capital != null ? String(business?.margin_capital) : "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const updatedFields = {};
    if (form.name.trim() !== (business?.business_name || "")) {
      updatedFields.name = form.name.trim();
    }
    if (form.description.trim() !== (business?.description || "")) {
      updatedFields.description = form.description.trim();
    }
    if (form.village.trim() !== (business?.village || "")) {
      updatedFields.village = form.village.trim();
    }
    if (form.district.trim() !== (business?.district || "")) {
      updatedFields.district = form.district.trim();
    }
    if (form.city.trim() !== (business?.city || "")) {
      updatedFields.city = form.city.trim();
    }
    if (form.state.trim() !== (business?.state || "")) {
      updatedFields.state = form.state.trim();
    }
    if (form.country.trim() !== (business?.country || "")) {
      updatedFields.country = form.country.trim();
    }
    if (form.pincode.trim() !== (business?.pincode || "")) {
      updatedFields.pincode = form.pincode.trim();
    }
    if (
      Number(form.margin_capital || 0) !== Number(business?.margin_capital || 0)
    ) {
      updatedFields.margin_capital = Number(form.margin_capital || 0);
    }

    onSubmit({
      updatedFields,
      radiusKm: Number(radiusKm) || 10,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative max-h-[92vh] w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-200 dark:border-gray-800 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10">
              <Sparkles className="text-blue-600 dark:text-blue-400" size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {isRegenerate ? t.regenerate : t.generateBusinessAnalysis}
              </h2>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-gray-400">
                {t.generationDescription}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 dark:text-gray-400 transition hover:bg-slate-100 dark:hover:bg-gray-800 hover:text-slate-900 dark:hover:text-white"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="max-h-[calc(92vh-140px)] space-y-6 overflow-y-auto p-6"
        >
          {loading && (
            <div className="rounded-2xl border border-blue-500/40 bg-blue-500/10 p-4">
              <div className="flex items-start gap-3">
                <Clock className="mt-0.5 h-5 w-5 shrink-0 text-blue-500 dark:text-blue-400" />
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-blue-700 dark:text-blue-300">
                    {t.longRunningNoticeTitle}
                  </h4>
                  <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-gray-300">
                    {t.longRunningNoticeText}
                  </p>
                  <button
                    type="button"
                    onClick={onClose}
                    className="mt-3 inline-flex items-center gap-1.5 rounded-xl border border-blue-500/40 bg-blue-600/30 px-3.5 py-1.5 text-xs font-semibold !text-white transition hover:bg-blue-600"
                  >
                    <X size={14} />
                    {t.dismissModalNotice}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-blue-500/30 bg-blue-500/5 p-4">
            <label className="mb-2 block text-sm font-semibold text-blue-700 dark:text-blue-300">
              {t.analysisRadius}
            </label>
            <div className="relative">
              <LocateFixed
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-500"
              />
              <input
                type="number"
                value={radiusKm}
                onChange={(e) => setRadiusKm(e.target.value)}
                min="0.5"
                step="0.5"
                disabled={loading}
                required
                className="w-full rounded-xl border border-slate-300 dark:border-gray-700 bg-slate-50 dark:bg-gray-950 py-2.5 pl-10 pr-12 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500 disabled:opacity-60"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 dark:text-gray-500">
                km
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-500 dark:text-gray-400">{t.radiusDescription}</p>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400">
              {t.businessInformation}
            </h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-gray-400">
                  Business Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="w-full rounded-xl border border-slate-300 dark:border-gray-800 bg-slate-50 dark:bg-gray-950 px-3.5 py-2 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500 disabled:opacity-60"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-gray-400">
                  Category (Locked)
                </label>
                <input
                  type="text"
                  value={business?.category || ""}
                  disabled
                  className="w-full cursor-not-allowed rounded-xl border border-slate-200 dark:border-gray-800 bg-slate-100 dark:bg-gray-950/40 px-3.5 py-2 text-sm text-slate-500 dark:text-gray-600"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-gray-400">
                  Margin Capital (₹)
                </label>
                <input
                  type="number"
                  name="margin_capital"
                  value={form.margin_capital}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full rounded-xl border border-slate-300 dark:border-gray-800 bg-slate-50 dark:bg-gray-950 px-3.5 py-2 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500 disabled:opacity-60"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-gray-400">
                  Description
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                  disabled={loading}
                  className="w-full resize-none rounded-xl border border-slate-300 dark:border-gray-800 bg-slate-50 dark:bg-gray-950 px-3.5 py-2 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500 disabled:opacity-60"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-gray-400">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full rounded-xl border border-slate-300 dark:border-gray-800 bg-slate-50 dark:bg-gray-950 px-3.5 py-2 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500 disabled:opacity-60"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-gray-400">
                  District
                </label>
                <input
                  type="text"
                  name="district"
                  value={form.district}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full rounded-xl border border-slate-300 dark:border-gray-800 bg-slate-50 dark:bg-gray-950 px-3.5 py-2 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500 disabled:opacity-60"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-gray-400">
                  State
                </label>
                <input
                  type="text"
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full rounded-xl border border-slate-300 dark:border-gray-800 bg-slate-50 dark:bg-gray-950 px-3.5 py-2 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500 disabled:opacity-60"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-gray-400">
                  Pincode
                </label>
                <input
                  type="text"
                  name="pincode"
                  value={form.pincode}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full rounded-xl border border-slate-300 dark:border-gray-800 bg-slate-50 dark:bg-gray-950 px-3.5 py-2 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500 disabled:opacity-60"
                />
              </div>
            </div>
          </div>

          <div className="sticky bottom-0 -mx-6 -mb-6 flex justify-end gap-3 border-t border-slate-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 px-6 py-4 backdrop-blur-xl">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-300 dark:border-gray-800 px-5 py-2.5 text-sm font-semibold text-slate-700 dark:text-gray-400 transition hover:bg-slate-100 dark:hover:bg-gray-800 hover:text-slate-900 dark:hover:text-white"
            >
              {loading ? t.continueWorkspace : t.cancel}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold !text-white shadow-lg transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  {t.generating}
                </>
              ) : (
                <>
                  <Play size={16} />
                  {isRegenerate ? t.regenerate : t.generate}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const StatCard = ({ label, value }) => (
  <div className="rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-4 shadow-sm">
    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-gray-600">
      {label}
    </p>
    <p className="mt-2 text-xl font-extrabold text-slate-900 dark:text-gray-200">{value}</p>
  </div>
);

const MarkdownReport = ({ markdown, noReport }) => {
  if (!markdown) return <p className="text-sm text-slate-500 dark:text-gray-500">{noReport}</p>;

  const lines = markdown.split("\n");
  return (
    <div className="space-y-2 text-sm leading-7 text-slate-700 dark:text-gray-400">
      {lines.map((line, index) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={index} className="h-2" />;
        if (trimmed === "---")
          return <hr key={index} className="my-5 border-slate-200 dark:border-gray-800" />;
        if (trimmed.startsWith("### ")) {
          return (
            <h4 key={index} className="mt-5 text-base font-bold text-slate-900 dark:text-gray-200">
              {formatInlineMarkdown(trimmed.slice(4))}
            </h4>
          );
        }
        if (trimmed.startsWith("## ")) {
          return (
            <h3 key={index} className="mt-7 text-xl font-extrabold text-slate-900 dark:text-white">
              {formatInlineMarkdown(trimmed.slice(3))}
            </h3>
          );
        }
        if (trimmed.startsWith("# ")) {
          return (
            <h2 key={index} className="mb-5 text-2xl font-extrabold text-slate-900 dark:text-white">
              {formatInlineMarkdown(trimmed.slice(2))}
            </h2>
          );
        }
        if (trimmed.startsWith("- ")) {
          return (
            <div key={index} className="flex gap-3 pl-2">
              <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600 dark:bg-blue-400" />
              <p>{formatInlineMarkdown(trimmed.slice(2))}</p>
            </div>
          );
        }
        return <p key={index}>{formatInlineMarkdown(trimmed)}</p>;
      })}
    </div>
  );
};

const formatInlineMarkdown = (text) => {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} className="font-bold text-slate-900 dark:text-gray-200">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={index}>{part}</span>;
  });
};

export default BusinessAnalysis;
