import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  FileText,
  Loader2,
  RefreshCw,
  Sparkles,
  WalletCards,
} from "lucide-react";

import { api, aiApi } from "../../../utils/api";
import { useLanguage } from "../../../context/LanguageContext";
import BusinessScopeBadge from "./components/BusinessScopeBadge";

import FinanceOverview from "./components/finance/FinanceOverview";
import FinanceScenarios from "./components/finance/FinanceScenarios";
import FinanceReport from "./components/finance/FinanceReport";
import FinanceGeneration from "./components/finance/FinanceGeneration";

const translations = {
  english: {
    loading: "Loading financial analysis...",
    backWorkspace: "Back to Workspace",
    aiPlanning: "AI Financial Planning",
    financialAnalysis: "Financial Analysis",
    businessId: "Business ID",
    generate: "Generate Financial Analysis",
    regenerate: "Regenerate Financial Analysis",
    regenerating: "Regenerating...",
    generating: "Generating Financial Analysis...",
    operationFailed: "Financial analysis operation failed",
    tryAgain: "Try Again",
    noAnalysis:
      "No financial analysis has been generated for this business yet.",
    businessAnalysisRequired: "Business Analysis Required",
    businessAnalysisRequiredText:
      "Complete the Business Analysis first. The financial engine uses the business feasibility analysis and its evidence to produce more reliable revenue, cost, working-capital and financing estimates.",
    completeBusinessAnalysis: "Complete Business Analysis",
    generationReady: "Ready to generate",
    generationReadyText:
      "Your Business Analysis is available. You can now generate the financial plan using the latest business evidence.",
    cached: "Cached result",
    generated: "Newly generated",
    needsRegeneration: "Needs regeneration",
    translated: "Translated",
    english: "English",
    version: "Version",
    report: "AI Financial Report",
    financialPlan: "Financial Plan",
    scenarios: "Financial Scenarios",
    workingCapital: "Working Capital",
    inputWarnings: "Input Validation & Adjustments",
    assumptions: "Financial Assumptions",
    usedValues: "Values Used",
    loan: "Loan",
    investment: "Investment & Capital",
    revenue: "Revenue",
    expenses: "Expenses",
    profitability: "Profitability",
    debtCapacity: "Debt Capacity",
    breakEven: "Break-even Revenue",
    monthlyRevenue: "Monthly Revenue",
    monthlyExpenses: "Monthly Expenses",
    monthlyDirectCosts: "Direct Costs",
    monthlyFixedCosts: "Fixed Costs",
    netProfit: "Net Profit",
    grossProfit: "Gross Profit",
    profitMargin: "Profit Margin",
    marginCapital: "Margin Capital",
    projectCost: "Project Cost",
    loanAmount: "Loan Amount",
    emi: "Monthly EMI",
    tenure: "Loan Tenure",
    interestRate: "Interest Rate",
    moratorium: "Moratorium",
    dscr: "DSCR",
    assessment: "Assessment",
    recommended: "Recommended",
    months: "Months",
    best: "Best Case",
    expected: "Expected Case",
    worst: "Worst Case",
    revenueShort: "Revenue",
    expensesShort: "Expenses",
    surplus: "Operating Surplus",
    risk: "Risk",
    confidence: "Confidence",
    assumptionsTitle: "AI Financial Estimation Assumptions",
    validationRejected: "The supplied value was not accepted",
    validationAccepted: "The supplied value was accepted",
    proceed: "Generate",
    cancel: "Cancel",
    longRunningTitle: "Financial analysis is being generated",
    longRunningText:
      "The financial engine is using your Business Analysis data to calculate financial projections, scenarios, debt capacity and repayment feasibility. This may take a little while.",
    completeFirst:
      "You need a completed Business Analysis before generating a financial analysis.",
    generatedSuccessfully: "Financial analysis generated successfully.",
    staleBannerTitle: "Business details have changed",
    staleBannerDesc:
      "This financial analysis was generated with older business information. Review your inputs and regenerate for current projections.",
    reviewAndRegenerate: "Review & Regenerate",
  },
  hindi: {
    loading: "वित्तीय विश्लेषण लोड हो रहा है...",
    backWorkspace: "वर्कस्पेस पर वापस जाएँ",
    aiPlanning: "AI वित्तीय योजना",
    financialAnalysis: "वित्तीय विश्लेषण",
    businessId: "व्यवसाय ID",
    generate: "वित्तीय विश्लेषण बनाएँ",
    regenerate: "वित्तीय विश्लेषण दोबारा बनाएँ",
    regenerating: "दोबारा बनाया जा रहा है...",
    generating: "वित्तीय विश्लेषण बनाया जा रहा है...",
    operationFailed: "वित्तीय विश्लेषण प्रक्रिया विफल रही",
    tryAgain: "फिर से प्रयास करें",
    noAnalysis:
      "इस व्यवसाय के लिए अभी वित्तीय विश्लेषण तैयार नहीं किया गया है।",
    businessAnalysisRequired: "व्यवसाय विश्लेषण आवश्यक है",
    businessAnalysisRequiredText:
      "पहले व्यवसाय विश्लेषण पूरा करें। वित्तीय प्रणाली बेहतर राजस्व, लागत, कार्यशील पूंजी और वित्तपोषण अनुमान तैयार करने के लिए व्यवसाय व्यवहार्यता विश्लेषण का उपयोग करती है।",
    completeBusinessAnalysis: "व्यवसाय विश्लेषण पूरा करें",
    generationReady: "विश्लेषण तैयार है",
    generationReadyText:
      "आपका व्यवसाय विश्लेषण उपलब्ध है। अब नवीनतम व्यावसायिक जानकारी के आधार पर वित्तीय योजना बनाई जा सकती है।",
    cached: "कैश किया गया परिणाम",
    generated: "नया तैयार किया गया",
    needsRegeneration: "दोबारा बनाने की आवश्यकता",
    translated: "अनुवादित",
    english: "अंग्रेज़ी",
    version: "संस्करण",
    report: "AI वित्तीय रिपोर्ट",
    financialPlan: "वित्तीय योजना",
    scenarios: "वित्तीय परिदृश्य",
    workingCapital: "कार्यशील पूंजी",
    inputWarnings: "इनपुट सत्यापन और समायोजन",
    assumptions: "वित्तीय धारणाएँ",
    usedValues: "उपयोग किए गए मान",
    loan: "ऋण",
    investment: "निवेश और पूंजी",
    revenue: "राजस्व",
    expenses: "खर्च",
    profitability: "लाभप्रदता",
    debtCapacity: "ऋण क्षमता",
    breakEven: "ब्रेक-ईवन राजस्व",
    monthlyRevenue: "मासिक राजस्व",
    monthlyExpenses: "मासिक खर्च",
    monthlyDirectCosts: "प्रत्यक्ष लागत",
    monthlyFixedCosts: "स्थिर लागत",
    netProfit: "शुद्ध लाभ",
    grossProfit: "सकल लाभ",
    profitMargin: "लाभ मार्जिन",
    marginCapital: "मार्जिन पूंजी",
    projectCost: "परियोजना लागत",
    loanAmount: "ऋण राशि",
    emi: "मासिक EMI",
    tenure: "ऋण अवधि",
    interestRate: "ब्याज दर",
    moratorium: "मोराटोरियम",
    dscr: "DSCR",
    assessment: "मूल्यांकन",
    recommended: "अनुशंसित",
    months: "महीने",
    best: "सर्वोत्तम स्थिति",
    expected: "अपेक्षित स्थिति",
    worst: "सबसे खराब स्थिति",
    revenueShort: "राजस्व",
    expensesShort: "खर्च",
    surplus: "परिचालन अधिशेष",
    risk: "जोखिम",
    confidence: "विश्वसनीयता",
    assumptionsTitle: "AI वित्तीय अनुमान की धारणाएँ",
    validationRejected: "दिया गया मान स्वीकार नहीं किया गया",
    validationAccepted: "दिया गया मान स्वीकार किया गया",
    proceed: "बनाएँ",
    cancel: "रद्द करें",
    longRunningTitle: "वित्तीय विश्लेषण तैयार किया जा रहा है",
    longRunningText:
      "वित्तीय प्रणाली आपके व्यवसाय विश्लेषण के आधार पर वित्तीय अनुमान, परिदृश्य, ऋण क्षमता और पुनर्भुगतान व्यवहार्यता की गणना कर रही है। इसमें थोड़ा समय लग सकता है।",
    completeFirst:
      "वित्तीय विश्लेषण बनाने से पहले व्यवसाय विश्लेषण पूरा करना आवश्यक है।",
    generatedSuccessfully: "वित्तीय विश्लेषण सफलतापूर्वक तैयार किया गया।",
    staleBannerTitle: "व्यवसाय विवरण बदल गए हैं",
    staleBannerDesc:
      "यह वित्तीय विश्लेषण पुराने व्यवसाय विवरण के आधार पर तैयार किया गया था। वर्तमान अनुमान के लिए इनपुट की समीक्षा करें और दोबारा बनाएँ।",
    reviewAndRegenerate: "समीक्षा करें और दोबारा बनाएँ",
  },
  bengali: {
    loading: "আর্থিক বিশ্লেষণ লোড হচ্ছে...",
    backWorkspace: "ওয়ার্কস্পেসে ফিরে যান",
    aiPlanning: "AI আর্থিক পরিকল্পনা",
    financialAnalysis: "আর্থিক বিশ্লেষণ",
    businessId: "ব্যবসার ID",
    generate: "আর্থিক বিশ্লেষণ তৈরি করুন",
    regenerate: "আর্থিক বিশ্লেষণ পুনরায় তৈরি করুন",
    regenerating: "পুনরায় তৈরি হচ্ছে...",
    generating: "আর্থিক বিশ্লেষণ তৈরি হচ্ছে...",
    operationFailed: "আর্থিক বিশ্লেষণ প্রক্রিয়া ব্যর্থ হয়েছে",
    tryAgain: "আবার চেষ্টা করুন",
    noAnalysis: "এই ব্যবসার জন্য এখনও কোনো আর্থিক বিশ্লেষণ তৈরি হয়নি।",
    businessAnalysisRequired: "ব্যবসায়িক বিশ্লেষণ প্রয়োজন",
    businessAnalysisRequiredText:
      "প্রথমে ব্যবসায়িক বিশ্লেষণ সম্পূর্ণ করুন। আর্থিক ব্যবস্থা আরও নির্ভরযোগ্য রাজস্ব, খরচ, কার্যকরী মূলধন এবং অর্থায়নের অনুমান তৈরি করতে ব্যবসায়িক সম্ভাব্যতা বিশ্লেষণ ব্যবহার করে।",
    completeBusinessAnalysis: "ব্যবসায়িক বিশ্লেষণ সম্পূর্ণ করুন",
    generationReady: "তৈরি করার জন্য প্রস্তুত",
    generationReadyText:
      "আপনার ব্যবসায়িক বিশ্লেষণ উপলব্ধ। এখন সর্বশেষ ব্যবসায়িক তথ্য ব্যবহার করে আর্থিক পরিকল্পনা তৈরি করা যাবে।",
    cached: "ক্যাশ করা ফলাফল",
    generated: "নতুন তৈরি",
    needsRegeneration: "পুনরায় তৈরি করা প্রয়োজন",
    translated: "অনূদিত",
    english: "ইংরেজি",
    version: "সংস্করণ",
    report: "AI আর্থিক রিপোর্ট",
    financialPlan: "আর্থিক পরিকল্পনা",
    scenarios: "আর্থিক পরিস্থিতি",
    workingCapital: "কার্যকরী মূলধন",
    inputWarnings: "ইনপুট যাচাই ও সমন্বয়",
    assumptions: "আর্থিক অনুমান",
    usedValues: "ব্যবহৃত মান",
    loan: "ঋণ",
    investment: "বিনিয়োগ ও মূলধন",
    revenue: "রাজস্ব",
    expenses: "খরচ",
    profitability: "লাভজনকতা",
    debtCapacity: "ঋণ সক্ষমতা",
    breakEven: "ব্রেক-ইভেন রাজস্ব",
    monthlyRevenue: "মাসিক রাজস্ব",
    monthlyExpenses: "মাসিক খরচ",
    monthlyDirectCosts: "সরাসরি খরচ",
    monthlyFixedCosts: "স্থির খরচ",
    netProfit: "নিট লাভ",
    grossProfit: "মোট লাভ",
    profitMargin: "লাভের মার্জিন",
    marginCapital: "মার্জিন মূলধন",
    projectCost: "প্রকল্পের খরচ",
    loanAmount: "ঋণের পরিমাণ",
    emi: "মাসিক EMI",
    tenure: "ঋণের মেয়াদ",
    interestRate: "সুদের হার",
    moratorium: "মরাটোরিয়াম",
    dscr: "DSCR",
    assessment: "মূল্যায়ন",
    recommended: "প্রস্তাবিত",
    months: "মাস",
    best: "সেরা পরিস্থিতি",
    expected: "প্রত্যাশিত পরিস্থিতি",
    worst: "সবচেয়ে খারাপ পরিস্থিতি",
    revenueShort: "রাজস্ব",
    expensesShort: "খরচ",
    surplus: "অপারেটিং উদ্বৃত্ত",
    risk: "ঝুঁকি",
    confidence: "বিশ্বাসযোগ্যতা",
    assumptionsTitle: "AI আর্থিক অনুমানের ভিত্তি",
    validationRejected: "প্রদত্ত মান গ্রহণ করা হয়নি",
    validationAccepted: "প্রদত্ত মান গ্রহণ করা হয়েছে",
    proceed: "তৈরি করুন",
    cancel: "বাতিল",
    longRunningTitle: "আর্থিক বিশ্লেষণ তৈরি হচ্ছে",
    longRunningText:
      "আর্থিক ব্যবস্থা আপনার ব্যবসায়িক বিশ্লেষণের ভিত্তিতে আর্থিক পূর্বাভাস, পরিস্থিতি, ঋণ সক্ষমতা এবং ঋণ পরিশোধের সম্ভাব্যতা গণনা করছে। এতে কিছুটা সময় লাগতে পারে।",
    completeFirst:
      "আর্থিক বিশ্লেষণ তৈরি করার আগে ব্যবসায়িক বিশ্লেষণ সম্পূর্ণ করতে হবে।",
    generatedSuccessfully: "আর্থিক বিশ্লেষণ সফলভাবে তৈরি হয়েছে।",
    staleBannerTitle: "ব্যবসার বিবরণ পরিবর্তিত হয়েছে",
    staleBannerDesc:
      "এই আর্থিক বিশ্লেষণটি পুরোনো ব্যবসার তথ্য দিয়ে তৈরি হয়েছিল। বর্তমান পূর্বাভাসে জন্য ইনপুট পর্যালোচনা করে আবার তৈরি করুন।",
    reviewAndRegenerate: "পর্যালোচনা করুন ও আবার তৈরি করুন",
  },
};

const normalizeLanguage = (value) => {
  const normalized = String(value || "").toLowerCase();
  if (normalized === "hi" || normalized === "hindi") return "hindi";
  if (normalized === "bn" || normalized === "bengali") return "bengali";
  return "english";
};

const apiLanguage = (language) => {
  if (language === "hindi") return "hi";
  if (language === "bengali") return "bn";
  return "en";
};

const FinancialAnalysis = () => {
  const { businessId } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();

  const currentLanguage = normalizeLanguage(language);
  const languageCode = apiLanguage(currentLanguage);
  const t = translations[currentLanguage];

  const [analysis, setAnalysis] = useState(null);
  const [business, setBusiness] = useState(null);
  const [businessAnalysisAvailable, setBusinessAnalysisAvailable] =
    useState(null);

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [showGeneration, setShowGeneration] = useState(false);
  const [isRegeneration, setIsRegeneration] = useState(false);
  const [needsRegeneration, setNeedsRegeneration] = useState(false);

  const fetchBusiness = async () => {
    const response = await api.get(`/businesses/${businessId}`);
    return response?.data?.business || response?.data || response;
  };

  const checkBusinessAnalysis = async () => {
    try {
      const response = await aiApi.get(
        `api/v1/businesses/${businessId}/report?language=${languageCode}`,
      );
      return Boolean(response?.data || response);
    } catch (err) {
      if (err?.response?.status === 404) return false;
      throw err;
    }
  };

  const checkFinanceStatus = async () => {
    try {
      const response = await aiApi.get(
        `api/v1/businesses/${businessId}/finance/status`,
      );
      const data = response?.data || response;
      const isStale = Boolean(data?.needs_regeneration);
      setNeedsRegeneration(isStale);
      return isStale;
    } catch (statusError) {
      console.warn(
        "Could not check financial analysis staleness status:",
        statusError,
      );
      return false;
    }
  };

  const loadFinance = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      setError("");

      const response = await aiApi.get(
        `api/v1/businesses/${businessId}/finance?language=${languageCode}`,
      );

      const result = response.data || response;
      setAnalysis(result);
      setShowGeneration(false);
      setIsRegeneration(false);

      // Check status API and fall back to analysis object if provided
      const isStale = await checkFinanceStatus();
      if (!isStale && Boolean(result?.needs_regeneration)) {
        setNeedsRegeneration(true);
      }
    } catch (err) {
      if (err?.response?.status === 404) {
        const businessData = await fetchBusiness();
        setBusiness(businessData);

        const completed = await checkBusinessAnalysis();
        setBusinessAnalysisAvailable(completed);

        setShowGeneration(true);
        setIsRegeneration(false);
        setAnalysis(null);
        return;
      }

      setError(
        err?.response?.data?.detail || err?.message || t.operationFailed,
      );
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  useEffect(() => {
    if (!businessId) return;

    loadFinance();

    return () => {
      setAnalysis(null);
      setNeedsRegeneration(false);
    };
  }, [businessId, languageCode]);

  const handleGenerate = async ({ method, inputs }) => {
    if (generating) return;

    try {
      setGenerating(true);
      setError("");

      const businessData = business || (await fetchBusiness());
      setBusiness(businessData);

      const requestBody = {
        business_id: businessId,
        margin: Number(inputs?.margin ?? businessData?.margin_capital ?? 0),
        monthly_revenue:
          method === "ai" ? 0 : Number(inputs?.monthly_revenue ?? 0),
        monthly_direct_costs:
          method === "ai" ? 0 : Number(inputs?.monthly_direct_costs ?? 0),
        monthly_fixed_costs:
          method === "ai" ? 0 : Number(inputs?.monthly_fixed_costs ?? 0),
      };

      const forceParam = isRegeneration ? "&force=true" : "";
      const response = await aiApi.post(
        `api/v1/finance/analyze-plan?language=${languageCode}${forceParam}`,
        requestBody,
      );

      setAnalysis(response.data || response);
      setShowGeneration(false);
      setIsRegeneration(false);
      setNeedsRegeneration(false);
    } catch (err) {
      setError(
        err?.response?.data?.detail || err?.message || t.operationFailed,
      );
    } finally {
      setGenerating(false);
    }
  };

  const handleStartRegenerate = async () => {
    try {
      setError("");
      const businessData = business || (await fetchBusiness());
      setBusiness(businessData);

      const completed =
        businessAnalysisAvailable ?? (await checkBusinessAnalysis());
      setBusinessAnalysisAvailable(completed);

      setIsRegeneration(true);
      setShowGeneration(true);
    } catch (err) {
      setError(
        err?.response?.data?.detail || err?.message || t.operationFailed,
      );
    }
  };

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
                <div className="h-8 w-64 rounded-xl bg-slate-200 dark:bg-gray-800" />
                <div className="h-4 w-40 rounded bg-slate-200 dark:bg-gray-800/60" />
              </div>
              <div className="h-10 w-36 rounded-xl bg-slate-200 dark:bg-gray-800" />
            </div>
          </div>

          {/* 4 KPI Metric Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900/80 p-5 shadow-sm"
              >
                <div className="h-4 w-28 rounded bg-slate-200 dark:bg-gray-800/60 mb-3" />
                <div className="h-8 w-36 rounded-lg bg-slate-200 dark:bg-gray-800 mb-2" />
                <div className="h-3.5 w-20 rounded bg-slate-200 dark:bg-gray-800/50" />
              </div>
            ))}
          </div>

          {/* Tabs Navigation Bar */}
          <div className="flex gap-2 border-b border-slate-200 dark:border-gray-800 pb-3">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="h-9 w-28 rounded-xl bg-slate-200 dark:bg-gray-800" />
            ))}
          </div>

          {/* Financial Breakdown Table Skeleton */}
          <div className="rounded-3xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900/80 p-6 shadow-sm">
            <div className="h-6 w-48 rounded bg-slate-200 dark:bg-gray-800 mb-6" />
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between border-b border-slate-100 dark:border-gray-800/60 py-3"
                >
                  <div className="h-4 w-1/3 rounded bg-slate-200 dark:bg-gray-800/60" />
                  <div className="h-4 w-24 rounded bg-slate-200 dark:bg-gray-800" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const plan =
    analysis?.financial_plan_payload || analysis?.raw_financial_plan || {};

  const isStaleReport = Boolean(
    needsRegeneration || analysis?.needs_regeneration,
  );

  const initialInputs = {
    margin: plan?.used_values?.margin_capital ?? business?.margin_capital ?? 0,
    monthly_revenue:
      plan?.used_values?.monthly_revenue ?? business?.monthly_revenue ?? 0,
    monthly_direct_costs:
      plan?.used_values?.monthly_direct_costs ??
      business?.monthly_direct_costs ??
      0,
    monthly_fixed_costs:
      plan?.used_values?.monthly_fixed_costs ??
      business?.monthly_fixed_costs ??
      0,
  };

  if (showGeneration) {
    return (
      <FinanceGeneration
        business={business}
        loading={generating}
        error={error}
        onGenerate={handleGenerate}
        onBack={() => {
          if (analysis) {
            setShowGeneration(false);
            setIsRegeneration(false);
          } else {
            navigate(`/businesses/${businessId}`);
          }
        }}
        onCompleteBusinessAnalysis={() =>
          navigate(`/businesses/${businessId}/analysis`)
        }
        businessAnalysisAvailable={businessAnalysisAvailable}
        language={language}
        isRegeneration={isRegeneration}
        initialInputs={initialInputs}
      />
    );
  }

  if (error && !analysis) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-gray-950 px-4 py-8 text-slate-900 dark:text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <button
            type="button"
            onClick={() => navigate(`/businesses/${businessId}`)}
            className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-gray-400 transition hover:text-slate-900 dark:hover:text-white"
          >
            <ArrowLeft size={16} />
            {t.backWorkspace}
          </button>

          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center">
            <AlertCircle className="mx-auto mb-4 h-10 w-10 text-red-500 dark:text-red-400" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t.operationFailed}</h2>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-600 dark:text-gray-400">
              {error}
            </p>
            <button
              type="button"
              onClick={() => loadFinance()}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 !text-white px-5 py-3 text-sm font-bold transition hover:bg-blue-500 shadow-md shadow-blue-500/20"
            >
              <RefreshCw size={16} />
              {t.tryAgain}
            </button>
          </div>
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
          {t.backWorkspace}
        </button>

        {isStaleReport && !generating && (
          <div className="mb-6 flex flex-col items-start justify-between gap-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 shadow-lg backdrop-blur-md sm:flex-row sm:items-center">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500 dark:text-amber-400" />
              <div>
                <h3 className="text-sm font-bold text-amber-700 dark:text-amber-300">
                  {t.staleBannerTitle}
                </h3>
                <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-gray-300">
                  {t.staleBannerDesc}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleStartRegenerate}
              className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold !text-slate-950 transition hover:bg-amber-400 shadow-sm"
            >
              <RefreshCw size={14} />
              {t.reviewAndRegenerate}
            </button>
          </div>
        )}

        <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-50 dark:bg-blue-500/10">
              <WalletCards size={27} className="text-blue-600 dark:text-blue-400" />
            </div>

            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400">
                <Sparkles size={15} />
                {t.aiPlanning}
              </div>
              <h1 className="mt-1 text-3xl font-extrabold text-slate-900 dark:text-white">
                {t.financialAnalysis}
              </h1>
            </div>
          </div>

          <BusinessScopeBadge
            businessId={businessId}
            className="self-end lg:self-auto"
          />

          <button
            type="button"
            onClick={handleStartRegenerate}
            disabled={generating}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-3 text-sm font-bold text-slate-700 dark:text-gray-300 transition hover:border-slate-300 dark:hover:border-gray-700 hover:bg-slate-50 dark:hover:bg-gray-800 shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw size={16} />
            {t.regenerate}
          </button>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-4">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
            <div>
              <p className="font-semibold text-red-300">{t.operationFailed}</p>
              <p className="mt-1 text-sm text-gray-500">{error}</p>
            </div>
          </div>
        )}

        <div className="mb-6 flex flex-wrap items-center gap-2">
          <StatusBadge
            icon={
              isStaleReport
                ? AlertCircle
                : analysis?.cached
                  ? Clock
                  : CheckCircle2
            }
            className={
              isStaleReport
                ? "border-amber-500/30 bg-amber-500/10 text-amber-300"
                : undefined
            }
            label={
              isStaleReport
                ? t.needsRegeneration
                : analysis?.cached
                  ? t.cached
                  : t.generated
            }
          />

          {analysis?.translated && (
            <StatusBadge
              icon={FileText}
              label={`${t.translated}: ${languageCode}`}
            />
          )}

          <span className="rounded-lg border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-1.5 text-xs font-semibold text-slate-500 dark:text-gray-500">
            {t.version} {analysis?.version ?? "—"}
          </span>
        </div>

        <FinanceOverview plan={plan} t={t} />

        <FinanceScenarios scenarios={plan?.scenarios} t={t} />

        <div className="mt-6">
          <FinanceReport markdown={analysis?.ai_analysis} t={t} />
        </div>

        <FinanceValidation plan={plan} t={t} />
      </div>
    </div>
  );
};

const StatusBadge = ({ icon: Icon, label, className }) => (
  <div
    className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold ${
      className || "border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-slate-600 dark:text-gray-400"
    }`}
  >
    <Icon size={13} />
    {label}
  </div>
);

const FinanceValidation = ({ plan, t }) => {
  const validation = plan?.input_validation;
  const estimation = plan?.financial_estimation;
  const usedValues = plan?.used_values;

  if (!validation && !estimation && !usedValues) return null;

  return (
    <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
      {validation && (
        <div className="rounded-2xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900/60 p-6 shadow-sm dark:shadow-none backdrop-blur-xl">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10">
              <AlertCircle size={19} className="text-amber-500 dark:text-amber-400" />
            </div>

            <div>
              <p className="text-sm font-semibold text-amber-500 dark:text-amber-400">
                {t.inputWarnings}
              </p>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t.usedValues}</h2>
            </div>
          </div>

          <div className="space-y-3">
            {Object.entries(validation).map(([key, value]) => {
              if (!value) return null;

              return (
                <div
                  key={key}
                  className="rounded-xl border border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-950/60 p-4"
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm font-bold capitalize text-slate-800 dark:text-gray-200">
                      {key.replaceAll("_", " ")}
                    </span>

                    <span
                      className={`text-xs font-bold ${
                        value.accepted ? "text-emerald-500 dark:text-emerald-400" : "text-amber-500 dark:text-amber-400"
                      }`}
                    >
                      {value.accepted
                        ? t.validationAccepted
                        : t.validationRejected}
                    </span>
                  </div>

                  {value.provided != null && (
                    <p className="mt-2 text-xs text-slate-500 dark:text-gray-500">
                      Provided: ₹
                      {Number(value.provided).toLocaleString("en-IN")}
                    </p>
                  )}

                  {value.reason && (
                    <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-gray-400">
                      {value.reason}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {estimation && (
        <div className="rounded-2xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900/60 p-6 shadow-sm dark:shadow-none backdrop-blur-xl">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-500/20 bg-violet-500/10">
              <Sparkles size={19} className="text-violet-500 dark:text-violet-400" />
            </div>

            <div>
              <p className="text-sm font-semibold text-violet-500 dark:text-violet-400">
                {t.assumptionsTitle}
              </p>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t.assumptions}</h2>
            </div>
          </div>

          <div className="mb-5 rounded-xl border border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-950/60 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500 dark:text-gray-500">{t.confidence}</span>

              <span className="font-bold capitalize text-violet-600 dark:text-violet-300">
                {estimation.confidence || "—"}
              </span>
            </div>
          </div>

          {Array.isArray(estimation.assumptions) && (
            <div className="space-y-3">
              {estimation.assumptions.map((assumption, index) => (
                <div
                  key={index}
                  className="flex gap-3 text-sm leading-6 text-gray-400"
                >
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-400" />
                  <span>{assumption}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FinancialAnalysis;
